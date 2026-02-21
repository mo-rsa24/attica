import io
import json
import re
import time
import uuid
from html import unescape
from urllib.parse import urlparse

import requests
from PIL import Image, UnidentifiedImageError
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify

from locations.models import Location, LocationImage


DUCKDUCKGO_SEARCH_URL = "https://duckduckgo.com/"
DUCKDUCKGO_IMAGE_API_URL = "https://duckduckgo.com/i.js"
BING_IMAGE_SEARCH_URL = "https://www.bing.com/images/search"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)

EVENT_KEYWORD_MAP = {
    "concert": [
        '"{name}" concert venue',
        '"{name}" live performance crowd',
        '"{name}" music event stage',
    ],
    "club": [
        '"{name}" nightclub interior',
        '"{name}" club dance floor',
        '"{name}" club event lighting',
    ],
    "wedding": [
        '"{name}" wedding venue',
        '"{name}" wedding reception setup',
        '"{name}" wedding decor hall',
    ],
    "festival": [
        '"{name}" festival venue',
        '"{name}" outdoor festival stage',
        '"{name}" festival crowd',
    ],
    "corporate": [
        '"{name}" conference venue',
        '"{name}" corporate event hall',
        '"{name}" business event setup',
    ],
    "default": [
        '"{name}" event venue',
        '"{name}" venue interior',
        '"{name}" venue exterior',
    ],
}


class Command(BaseCommand):
    help = (
        "Scrape venue images for clubs/concert/wedding/corporate/festival use-cases, "
        "save them under media/location_images/venues/<venue-slug>/, and create LocationImage records."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--per-venue",
            type=int,
            default=7,
            help="Number of images to save per venue (must be between 5 and 10).",
        )
        parser.add_argument(
            "--venue",
            action="append",
            dest="venues",
            default=[],
            help='Venue name filter (repeatable). Example: --venue "FNB Stadium" --venue "DRAMA"',
        )
        parser.add_argument(
            "--event-type",
            choices=["concert", "club", "wedding", "festival", "corporate"],
            help="Force one event-type query profile for all selected venues.",
        )
        parser.add_argument(
            "--clear-existing",
            action="store_true",
            help="Delete previously generated venue images and generated LocationImage rows for each venue.",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=0.8,
            help="Delay in seconds between downloads to reduce rate limiting (default: 0.8).",
        )

    def handle(self, *args, **options):
        per_venue = options["per_venue"]
        if per_venue < 5 or per_venue > 10:
            raise CommandError("--per-venue must be between 5 and 10.")

        venue_names = [name.strip() for name in options["venues"] if name.strip()]
        forced_event_type = options.get("event_type")
        clear_existing = options["clear_existing"]
        delay = max(0.0, options["delay"])

        # Only fetch fields required by this command to avoid parsing unrelated
        # legacy/corrupted decimal columns on older sqlite data.
        venues = Location.objects.only("id", "name", "image", "image_url").order_by("name")
        if venue_names:
            venues = venues.filter(name__in=venue_names)
        if not venues.exists():
            raise CommandError("No venues found for the given filters.")

        total_saved = 0
        total_failed = 0

        for venue in venues:
            venue_slug = slugify(venue.name) or f"venue-{venue.pk}"
            inferred_type = forced_event_type or self._infer_event_type_from_name(venue.name)

            self.stdout.write(
                self.style.NOTICE(
                    f"Processing: {venue.name} (event-type={inferred_type})"
                )
            )

            if clear_existing:
                deleted_files = self._clear_generated_venue_files(venue_slug)
                deleted_rows = self._clear_generated_location_images(venue)
                if deleted_files:
                    self.stdout.write(f"  Removed generated files: {deleted_files}")
                if deleted_rows:
                    self.stdout.write(f"  Removed generated gallery rows: {deleted_rows}")

                if venue.image and str(venue.image.name).startswith("location_images/venues/"):
                    venue.image = None
                    venue.image_url = None
                    venue.save(update_fields=["image", "image_url", "updated_at"])

            existing = venue.images.count()
            remaining = per_venue - existing
            if remaining <= 0:
                self.stdout.write(
                    self.style.WARNING(f"  Skipping: already has {existing} gallery images.")
                )
                continue

            candidate_urls = self._collect_candidate_image_urls(
                venue_name=venue.name,
                event_type=inferred_type,
                target=remaining * 8,
            )
            if not candidate_urls:
                self.stdout.write(self.style.WARNING("  No image results found."))
                total_failed += remaining
                continue

            saved_for_venue = 0
            seen_domains = set()
            existing_types = set(venue.images.values_list("image_type", flat=True))

            for image_url in candidate_urls:
                if saved_for_venue >= remaining:
                    break

                try:
                    file_bytes = self._download_and_prepare_image(image_url)
                    if not file_bytes:
                        continue
                except Exception as exc:
                    self.stdout.write(self.style.WARNING(f"  Download failed: {exc}"))
                    continue

                relative_path = self._save_venue_image_file(venue_slug, file_bytes)
                public_url = self._to_media_url(relative_path)
                image_type = self._pick_image_type(existing_types, saved_for_venue)

                LocationImage.objects.create(
                    location=venue,
                    image_url=public_url,
                    image_type=image_type,
                )
                existing_types.add(image_type)

                if not venue.image:
                    venue.image = relative_path
                    venue.image_url = public_url
                    venue.save(update_fields=["image", "image_url", "updated_at"])

                saved_for_venue += 1
                total_saved += 1

                domain = urlparse(image_url).netloc.lower()
                if domain:
                    seen_domains.add(domain)

                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Saved {saved_for_venue}/{remaining}: {relative_path}"
                    )
                )

                if delay:
                    time.sleep(delay)

            if saved_for_venue < remaining:
                failed = remaining - saved_for_venue
                total_failed += failed
                self.stdout.write(
                    self.style.WARNING(
                        f"  Completed with gaps: {saved_for_venue}/{remaining} saved."
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Completed: {saved_for_venue}/{remaining} saved from {len(seen_domains)} source domains."
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Total saved: {total_saved}. Total missing: {total_failed}."
            )
        )

    def _infer_event_type_from_name(self, venue_name):
        value = venue_name.lower()

        if "stadium" in value or "arena" in value:
            return "concert"
        if "club" in value or "lounge" in value or "drama" in value:
            return "club"
        if "wedding" in value or "chapel" in value or "blossom" in value:
            return "wedding"
        if "conference" in value or "convention" in value or "center" in value:
            return "corporate"
        if "park" in value or "festival" in value or "grounds" in value:
            return "festival"
        return "default"

    def _build_queries(self, venue_name, event_type):
        templates = EVENT_KEYWORD_MAP.get(event_type) or EVENT_KEYWORD_MAP["default"]
        queries = [template.format(name=venue_name) for template in templates]
        queries.append(f'"{venue_name}" South Africa')
        queries.append(venue_name)
        return queries

    def _collect_candidate_image_urls(self, venue_name, event_type="default", target=40):
        queries = self._build_queries(venue_name, event_type)
        urls = []
        seen = set()

        for query in queries:
            providers = [
                self._duckduckgo_image_search(query, max_results=max(30, target)),
                self._bing_image_search(query, max_results=max(30, target)),
            ]
            for provider_urls in providers:
                for url in provider_urls:
                    if url in seen:
                        continue
                    seen.add(url)
                    urls.append(url)
                    if len(urls) >= target:
                        return urls
        return urls

    def _pick_image_type(self, existing_types, index):
        if "main" not in existing_types:
            return "main"
        if "thumbnail" not in existing_types and index > 0:
            return "thumbnail"
        return "gallery"

    def _save_venue_image_file(self, venue_slug, file_bytes):
        relative_path = (
            f"location_images/venues/{venue_slug}/{venue_slug}-{uuid.uuid4().hex[:10]}.jpg"
        )
        default_storage.save(relative_path, ContentFile(file_bytes))
        return relative_path

    def _to_media_url(self, relative_path):
        media_prefix = settings.MEDIA_URL.rstrip("/")
        return f"{media_prefix}/{relative_path}"

    def _clear_generated_location_images(self, venue):
        media_prefix = settings.MEDIA_URL.rstrip("/")
        generated_prefix = f"{media_prefix}/location_images/venues/"
        queryset = venue.images.filter(image_url__startswith=generated_prefix)
        deleted_count = queryset.count()
        queryset.delete()
        return deleted_count

    def _clear_generated_venue_files(self, venue_slug):
        base_dir = f"location_images/venues/{venue_slug}"
        _, files = default_storage.listdir(base_dir) if default_storage.exists(base_dir) else ([], [])
        deleted = 0
        for name in files:
            full_path = f"{base_dir}/{name}"
            if default_storage.exists(full_path):
                default_storage.delete(full_path)
                deleted += 1
        return deleted

    def _duckduckgo_image_search(self, query, max_results=30):
        session = requests.Session()
        headers = {
            "User-Agent": USER_AGENT,
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": DUCKDUCKGO_SEARCH_URL,
        }

        token_res = session.get(
            DUCKDUCKGO_SEARCH_URL,
            params={"q": query, "iax": "images", "ia": "images"},
            headers=headers,
            timeout=15,
        )
        token_res.raise_for_status()

        token_match = None
        token_patterns = [
            r"vqd='([^']+)'",
            r'vqd="([^"]+)"',
            r"vqd=([a-zA-Z0-9-]+)&",
            r'"vqd":"([^"]+)"',
        ]
        for pattern in token_patterns:
            token_match = re.search(pattern, token_res.text)
            if token_match:
                break
        if not token_match:
            return []
        vqd = token_match.group(1)

        results = []
        seen = set()
        offset = 0
        while len(results) < max_results:
            res = session.get(
                DUCKDUCKGO_IMAGE_API_URL,
                params={
                    "l": "us-en",
                    "o": "json",
                    "q": query,
                    "vqd": vqd,
                    "f": ",,,",
                    "p": "1",
                    "s": str(offset),
                },
                headers=headers,
                timeout=15,
            )
            if res.status_code != 200:
                break

            text = res.text.strip()
            if text.startswith(")]}'"):
                text = text[4:].strip()

            try:
                payload = json.loads(text)
            except json.JSONDecodeError:
                break

            batch = payload.get("results", [])
            if not batch:
                break

            for row in batch:
                image_url = row.get("image")
                if not image_url or image_url in seen:
                    continue
                seen.add(image_url)
                results.append(image_url)
                if len(results) >= max_results:
                    break

            if not payload.get("next"):
                break
            offset += len(batch)

        return results

    def _bing_image_search(self, query, max_results=30):
        headers = {
            "User-Agent": USER_AGENT,
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.bing.com/",
        }
        params = {"q": query, "form": "HDRSC2", "first": "1", "tsc": "ImageHoverTitle"}

        try:
            res = requests.get(
                BING_IMAGE_SEARCH_URL,
                params=params,
                headers=headers,
                timeout=15,
            )
        except requests.RequestException:
            return []

        if res.status_code != 200:
            return []

        html = res.text
        urls = []
        seen = set()

        for match in re.finditer(r'\bm="([^"]+)"', html):
            blob = unescape(match.group(1))
            try:
                data = json.loads(blob)
            except json.JSONDecodeError:
                continue
            image_url = data.get("murl")
            if not image_url or image_url in seen:
                continue
            if not image_url.startswith("http"):
                continue
            seen.add(image_url)
            urls.append(image_url)
            if len(urls) >= max_results:
                return urls

        patterns = [
            r'"murl":"(https?://[^"]+)"',
            r"murl&quot;:&quot;(https?://[^&]+?)&quot;",
        ]
        for pattern in patterns:
            for match in re.finditer(pattern, html):
                image_url = unescape(match.group(1))
                if image_url in seen:
                    continue
                seen.add(image_url)
                urls.append(image_url)
                if len(urls) >= max_results:
                    return urls

        return urls

    def _download_and_prepare_image(self, image_url):
        res = requests.get(
            image_url,
            headers={"User-Agent": USER_AGENT, "Referer": DUCKDUCKGO_SEARCH_URL},
            timeout=20,
        )
        if res.status_code != 200:
            return None
        content_type = res.headers.get("Content-Type", "").lower()
        if "image" not in content_type:
            return None

        try:
            with Image.open(io.BytesIO(res.content)) as image:
                image = image.convert("RGB")
                if image.width > 2000:
                    ratio = 2000 / float(image.width)
                    image = image.resize((2000, int(image.height * ratio)))

                output = io.BytesIO()
                image.save(output, format="JPEG", quality=88, optimize=True)
                return output.getvalue()
        except (UnidentifiedImageError, OSError):
            return None
