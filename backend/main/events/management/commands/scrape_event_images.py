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
from django.db.models import Q
from django.utils.text import slugify

from events.models import Event


DUCKDUCKGO_SEARCH_URL = "https://duckduckgo.com/"
DUCKDUCKGO_IMAGE_API_URL = "https://duckduckgo.com/i.js"
BING_IMAGE_SEARCH_URL = "https://www.bing.com/images/search"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)

EVENT_TYPE_QUERY_MAP = {
    "festival": [
        '"{name}" festival poster',
        '"{name}" lineup poster',
        '"{name}" festival crowd',
        '"{name}" live stage',
    ],
    "concert": [
        '"{name}" concert poster',
        '"{name}" live concert photo',
        '"{name}" stage performance',
        '"{name}" tour announcement',
    ],
    "conference": [
        '"{name}" conference event',
        '"{name}" summit stage',
        '"{name}" keynote event',
        '"{name}" conference venue',
    ],
    "club": [
        '"{name}" club event poster',
        '"{name}" nightclub event',
        '"{name}" DJ night flyer',
        '"{name}" dance floor event',
    ],
    "wedding": [
        '"{name}" wedding event setup',
        '"{name}" wedding celebration venue',
        '"{name}" wedding reception decor',
        '"{name}" wedding event inspiration',
    ],
    "default": [
        '"{name}" event poster',
        '"{name}" event photos',
        '"{name}" crowd photo',
        '"{name}" live event',
    ],
}


class Command(BaseCommand):
    help = (
        "Scrape event images for organizer events, store files under "
        "media/event_images/organizers/<organizer>/<event>/, and update "
        "Event.image_url + Event.banner_image."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--per-event",
            type=int,
            default=7,
            help="Number of images to download per event (must be between 5 and 10).",
        )
        parser.add_argument(
            "--event",
            action="append",
            dest="events",
            default=[],
            help='Event name filter (repeatable). Example: --event "Coachella"',
        )
        parser.add_argument(
            "--organizer",
            action="append",
            dest="organizers",
            default=[],
            help='Organizer username filter (repeatable). Example: --organizer "jane_doe"',
        )
        parser.add_argument(
            "--event-type",
            choices=["festival", "concert", "conference", "club", "wedding"],
            help="Force one event-type query profile for all selected events.",
        )
        parser.add_argument(
            "--clear-existing",
            action="store_true",
            help="Delete previously generated files for processed events before scraping.",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=0.8,
            help="Delay in seconds between image downloads (default: 0.8).",
        )
        parser.add_argument(
            "--include-non-organizer",
            action="store_true",
            help="Include events not owned by organizer user_type (default: organizer-only).",
        )

    def handle(self, *args, **options):
        per_event = options["per_event"]
        if per_event < 5 or per_event > 10:
            raise CommandError("--per-event must be between 5 and 10.")

        event_names = [value.strip() for value in options["events"] if value.strip()]
        organizer_usernames = [value.strip() for value in options["organizers"] if value.strip()]
        forced_event_type = options.get("event_type")
        clear_existing = options["clear_existing"]
        delay = max(0.0, options["delay"])
        include_non_organizer = options["include_non_organizer"]

        queryset = Event.objects.select_related("user", "organizer", "location").order_by("name")
        if not include_non_organizer:
            queryset = queryset.filter(
                Q(user__user_type="organizer") | Q(organizer__user_type="organizer")
            )
        if event_names:
            queryset = queryset.filter(name__in=event_names)
        if organizer_usernames:
            queryset = queryset.filter(
                Q(user__username__in=organizer_usernames)
                | Q(organizer__username__in=organizer_usernames)
            )

        if not queryset.exists():
            raise CommandError("No events found for the given filters.")

        total_saved = 0
        total_missing = 0

        for event in queryset:
            organizer = event.organizer or event.user
            organizer_slug = self._safe_slug(
                getattr(organizer, "username", f"user-{event.user_id}"),
                fallback=f"user-{event.user_id}",
            )
            event_slug = self._safe_slug(event.name, fallback=f"event-{event.id}")
            event_type = forced_event_type or self._infer_event_type(event)

            self.stdout.write(
                self.style.NOTICE(
                    f"Processing: {event.name} (organizer={organizer_slug}, type={event_type})"
                )
            )

            if clear_existing:
                deleted = self._clear_generated_event_files(organizer_slug, event_slug)
                if deleted:
                    self.stdout.write(f"  Cleared generated files: {deleted}")
                if self._is_generated_event_url(event.image_url):
                    event.image_url = None
                if self._is_generated_event_url(event.banner_image):
                    event.banner_image = None
                event.save(update_fields=["image_url", "banner_image", "updated_at"])

            existing_count = self._count_generated_event_files(organizer_slug, event_slug)
            remaining = per_event - existing_count
            if remaining <= 0:
                self.stdout.write(
                    self.style.WARNING(
                        f"  Skipping: already has {existing_count} downloaded event images."
                    )
                )
                continue

            candidate_urls = self._collect_candidate_image_urls(
                event=event,
                event_type=event_type,
                target=remaining * 8,
            )
            if not candidate_urls:
                self.stdout.write(self.style.WARNING("  No image results found."))
                total_missing += remaining
                continue

            saved_paths = []
            seen_domains = set()

            for image_url in candidate_urls:
                if len(saved_paths) >= remaining:
                    break

                file_bytes = self._download_and_prepare_image(image_url)
                if not file_bytes:
                    continue

                relative_path = self._save_event_image(
                    organizer_slug=organizer_slug,
                    event_slug=event_slug,
                    file_bytes=file_bytes,
                )
                saved_paths.append(relative_path)
                total_saved += 1

                domain = urlparse(image_url).netloc.lower()
                if domain:
                    seen_domains.add(domain)

                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Saved {len(saved_paths)}/{remaining}: {relative_path}"
                    )
                )

                if delay:
                    time.sleep(delay)

            if not saved_paths:
                total_missing += remaining
                self.stdout.write(self.style.WARNING("  No downloadable images were saved."))
                continue

            main_url = self._to_media_url(saved_paths[0])
            banner_url = self._to_media_url(saved_paths[1] if len(saved_paths) > 1 else saved_paths[0])
            event.image_url = main_url
            event.banner_image = banner_url
            event.save(update_fields=["image_url", "banner_image", "updated_at"])

            if len(saved_paths) < remaining:
                missing = remaining - len(saved_paths)
                total_missing += missing
                self.stdout.write(
                    self.style.WARNING(
                        f"  Completed with gaps: {len(saved_paths)}/{remaining} saved."
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Completed: {len(saved_paths)}/{remaining} saved from {len(seen_domains)} source domains."
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Total saved: {total_saved}. Total missing: {total_missing}."
            )
        )

    def _safe_slug(self, value, fallback):
        slug = slugify(value)[:60]
        return slug or fallback

    def _infer_event_type(self, event):
        text_parts = [
            event.name or "",
            event.category or "",
            event.venue or "",
            event.location.name if event.location else "",
        ]
        blob = " ".join(text_parts).lower()

        if any(token in blob for token in ["coachella", "camp flog gnaw", "festival"]):
            return "festival"
        if any(token in blob for token in ["concert", "tour", "arena", "stadium", "show"]):
            return "concert"
        if any(token in blob for token in ["conference", "summit", "expo"]):
            return "conference"
        if any(token in blob for token in ["club", "night", "dj", "lounge"]):
            return "club"
        if any(token in blob for token in ["wedding", "bridal", "reception"]):
            return "wedding"
        return "default"

    def _build_queries(self, event, event_type):
        templates = EVENT_TYPE_QUERY_MAP.get(event_type) or EVENT_TYPE_QUERY_MAP["default"]
        queries = [template.format(name=event.name) for template in templates]
        queries.append(f'"{event.name}" official photos')
        queries.append(f'"{event.name}" event')
        if event.venue:
            queries.append(f'"{event.name}" "{event.venue}"')
        if event.location:
            queries.append(f'"{event.name}" "{event.location.name}"')
        return queries

    def _collect_candidate_image_urls(self, event, event_type, target=40):
        queries = self._build_queries(event, event_type)
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

    def _base_event_dir(self, organizer_slug, event_slug):
        return f"event_images/organizers/{organizer_slug}/{event_slug}"

    def _count_generated_event_files(self, organizer_slug, event_slug):
        base_dir = self._base_event_dir(organizer_slug, event_slug)
        if not default_storage.exists(base_dir):
            return 0
        try:
            _, files = default_storage.listdir(base_dir)
        except OSError:
            return 0
        return len(files)

    def _clear_generated_event_files(self, organizer_slug, event_slug):
        base_dir = self._base_event_dir(organizer_slug, event_slug)
        if not default_storage.exists(base_dir):
            return 0
        try:
            _, files = default_storage.listdir(base_dir)
        except OSError:
            return 0

        deleted = 0
        for name in files:
            path = f"{base_dir}/{name}"
            if default_storage.exists(path):
                default_storage.delete(path)
                deleted += 1
        return deleted

    def _save_event_image(self, organizer_slug, event_slug, file_bytes):
        base_dir = self._base_event_dir(organizer_slug, event_slug)
        filename = f"{event_slug}-{uuid.uuid4().hex[:10]}.jpg"
        relative_path = f"{base_dir}/{filename}"
        default_storage.save(relative_path, ContentFile(file_bytes))
        return relative_path

    def _to_media_url(self, relative_path):
        return f"{settings.MEDIA_URL.rstrip('/')}/{relative_path}"

    def _is_generated_event_url(self, value):
        if not value:
            return False
        expected_prefix = f"{settings.MEDIA_URL.rstrip('/')}/event_images/organizers/"
        return str(value).startswith(expected_prefix)

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
            res = requests.get(BING_IMAGE_SEARCH_URL, params=params, headers=headers, timeout=15)
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
        try:
            res = requests.get(
                image_url,
                headers={"User-Agent": USER_AGENT, "Referer": DUCKDUCKGO_SEARCH_URL},
                timeout=20,
            )
        except requests.RequestException:
            return None

        if res.status_code != 200:
            return None
        if "image" not in res.headers.get("Content-Type", "").lower():
            return None

        try:
            with Image.open(io.BytesIO(res.content)) as image:
                image = image.convert("RGB")
                if image.width > 2200:
                    ratio = 2200 / float(image.width)
                    image = image.resize((2200, int(image.height * ratio)))
                output = io.BytesIO()
                image.save(output, format="JPEG", quality=88, optimize=True)
                return output.getvalue()
        except (UnidentifiedImageError, OSError):
            return None
