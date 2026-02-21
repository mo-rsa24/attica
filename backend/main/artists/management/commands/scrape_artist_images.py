import io
import json
import re
import time
import uuid
from pathlib import Path
from html import unescape
from urllib.parse import urlparse

import requests
from PIL import Image, UnidentifiedImageError
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.core.files.storage import default_storage
from django.conf import settings
from django.utils.text import slugify

from artists.models import Artist, ArtistPortfolioItem


DUCKDUCKGO_SEARCH_URL = "https://duckduckgo.com/"
DUCKDUCKGO_IMAGE_API_URL = "https://duckduckgo.com/i.js"
BING_IMAGE_SEARCH_URL = "https://www.bing.com/images/search"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)


class Command(BaseCommand):
    help = (
        "Scrape and download artist images (DuckDuckGo Images) and create "
        "ArtistPortfolioItem records or gig-guide image files grouped by artist folder."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--per-artist",
            type=int,
            default=7,
            help="Number of images to save per artist (must be between 5 and 10).",
        )
        parser.add_argument(
            "--artist",
            action="append",
            dest="artists",
            default=[],
            help=(
                "Artist name filter (repeatable). If omitted, all artists are processed. "
                'Example: --artist "Nasty C" --artist "Kabza De Small"'
            ),
        )
        parser.add_argument(
            "--clear-existing",
            action="store_true",
            help="Delete existing portfolio items for each processed artist before scraping.",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=0.8,
            help="Delay in seconds between downloads to reduce rate limiting (default: 0.8).",
        )
        parser.add_argument(
            "--collection",
            choices=["portfolio", "gigs"],
            default="portfolio",
            help=(
                "Where to save images: "
                "`portfolio` creates ArtistPortfolioItem, "
                "`gigs` saves files under media/artists/gigs/<artist-slug>/."
            ),
        )

    def handle(self, *args, **options):
        per_artist = options["per_artist"]
        if per_artist < 5 or per_artist > 10:
            raise CommandError("--per-artist must be between 5 and 10.")

        artist_names = [name.strip() for name in options["artists"] if name.strip()]
        clear_existing = options["clear_existing"]
        delay = max(0.0, options["delay"])
        collection = options["collection"]

        artists = Artist.objects.all().order_by("name")
        if artist_names:
            artists = artists.filter(name__in=artist_names)

        if not artists.exists():
            raise CommandError("No artists found for the given filters.")

        total_saved = 0
        total_failed = 0

        for artist in artists:
            self.stdout.write(self.style.NOTICE(f"Processing: {artist.name}"))
            artist_slug = slugify(artist.name) or f"artist-{artist.pk}"

            if collection == "portfolio" and clear_existing:
                deleted_count, _ = artist.portfolio_items.all().delete()
                self.stdout.write(f"  Cleared existing portfolio items: {deleted_count}")
            elif collection == "gigs" and clear_existing:
                deleted_count = self._clear_gig_images(artist_slug)
                self.stdout.write(f"  Cleared existing gig images: {deleted_count}")

            existing = (
                artist.portfolio_items.count()
                if collection == "portfolio"
                else self._count_gig_images(artist_slug)
            )
            remaining = per_artist - existing
            if remaining <= 0:
                self.stdout.write(
                    self.style.WARNING(
                        f"  Skipping: already has {existing} {collection} images."
                    )
                )
                continue

            candidate_urls = self._collect_candidate_image_urls(
                artist.name,
                target=remaining * 6,
                collection=collection,
            )
            if not candidate_urls:
                self.stdout.write(self.style.WARNING("  No image results found."))
                total_failed += remaining
                continue

            saved_for_artist = 0
            seen_domains = set()
            for image_url in candidate_urls:
                if saved_for_artist >= remaining:
                    break

                try:
                    file_bytes = self._download_and_prepare_image(image_url)
                    if not file_bytes:
                        continue
                except Exception as exc:
                    self.stdout.write(self.style.WARNING(f"  Download failed: {exc}"))
                    continue

                if collection == "portfolio":
                    item = ArtistPortfolioItem(
                        artist=artist,
                        caption=f"Scraped image for {artist.name}",
                    )
                    unique_name = f"{artist_slug}-{uuid.uuid4().hex[:10]}.jpg"
                    relative_name = f"{artist_slug}/{unique_name}"
                    item.image.save(relative_name, ContentFile(file_bytes), save=True)
                    saved_path = item.image.name
                else:
                    saved_path = self._save_gig_image(artist_slug, file_bytes)

                saved_for_artist += 1
                total_saved += 1

                domain = urlparse(image_url).netloc.lower()
                if domain:
                    seen_domains.add(domain)

                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Saved {saved_for_artist}/{remaining}: {saved_path}"
                    )
                )

                if delay:
                    time.sleep(delay)

            if saved_for_artist < remaining:
                failed = remaining - saved_for_artist
                total_failed += failed
                self.stdout.write(
                    self.style.WARNING(
                        f"  Completed with gaps: {saved_for_artist}/{remaining} saved."
                    )
                )
            else:
                domain_count = len(seen_domains)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  Completed: {saved_for_artist}/{remaining} saved from {domain_count} source domains."
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Total saved: {total_saved}. Total missing: {total_failed}."
            )
        )

    def _collect_candidate_image_urls(self, artist_name, target=30, collection="portfolio"):
        if collection == "gigs":
            queries = [
                f'"{artist_name}" live performance',
                f'"{artist_name}" concert photo',
                f'"{artist_name}" stage performance',
                f'"{artist_name}" press photo',
            ]
        else:
            queries = [
                f'"{artist_name}" South African artist live performance',
                f'"{artist_name}" concert photo',
                artist_name,
            ]

        urls = []
        seen = set()
        for query in queries:
            providers = [
                self._duckduckgo_image_search(query, max_results=max(20, target)),
                self._bing_image_search(query, max_results=max(20, target)),
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

    def _count_gig_images(self, artist_slug):
        gig_dir = Path(settings.MEDIA_ROOT) / "artists" / "gigs" / artist_slug
        if not gig_dir.exists():
            return 0
        return len([p for p in gig_dir.iterdir() if p.is_file()])

    def _clear_gig_images(self, artist_slug):
        gig_dir = Path(settings.MEDIA_ROOT) / "artists" / "gigs" / artist_slug
        if not gig_dir.exists():
            return 0

        deleted = 0
        for file_path in gig_dir.iterdir():
            if not file_path.is_file():
                continue
            try:
                file_path.unlink()
                deleted += 1
            except OSError:
                continue
        return deleted

    def _save_gig_image(self, artist_slug, file_bytes):
        relative_path = f"artists/gigs/{artist_slug}/{artist_slug}-{uuid.uuid4().hex[:10]}.jpg"
        default_storage.save(relative_path, ContentFile(file_bytes))
        return relative_path

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

            next_value = payload.get("next")
            if not next_value:
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

        # Fallback parser if `m="..."` format changes.
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
                # Keep files lightweight for gallery use.
                if image.width > 1800:
                    ratio = 1800 / float(image.width)
                    new_height = int(image.height * ratio)
                    image = image.resize((1800, new_height))

                output = io.BytesIO()
                image.save(output, format="JPEG", quality=88, optimize=True)
                return output.getvalue()
        except (UnidentifiedImageError, OSError):
            return None
