import csv
import requests
from requests.exceptions import RequestException
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from vendors.models import Vendor, VendorPost, Comment

class Command(BaseCommand):
    help = "Load additional vendor posts from a CSV file"

    def handle(self, *args, **options):
        path = "sample_data/realistic_posts_extra_dummy_data.csv"
        with open(path, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                vendor = Vendor.objects.get(id=row["vendor_id"])
                comment = None
                if row.get("comment_id"):
                    comment = Comment.objects.get(id=row["comment_id"])
                post = VendorPost.objects.create(
                    vendor=vendor,
                    comment=comment,
                    caption=row.get("caption", ""),
                )
                if row.get("image_url"):
                    try:
                        resp = requests.get(row["image_url"], timeout=5)
                        if resp.status_code == 200:
                            name = row["image_url"].split("/")[-1].split("?")[0]
                            post.image.save(name, ContentFile(resp.content), save=True)
                    except RequestException:
                        pass
        self.stdout.write(self.style.SUCCESS("Extra posts loaded successfully."))