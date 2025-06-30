import csv
from django.core.management.base import BaseCommand
from vendors.models import Comment

class Command(BaseCommand):
    help = "Load comments from a CSV file"

    def handle(self, *args, **kwargs):
        path = "sample_data/realistic_comments_dummy_data.csv"
        with open(path, "r") as file:
            reader = csv.DictReader(file)
            for row in reader:
                Comment.objects.create(id=row["id"], comment=row["comment"], likes=int(row.get("likes", 0)))
        self.stdout.write(self.style.SUCCESS("Comments loaded successfully."))
