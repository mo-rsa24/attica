from django.db import migrations, models
import django.db.models.deletion
import events.models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0017_event_published_at_event_status_alter_event_is_draft"),
    ]

    operations = [
        migrations.CreateModel(
            name="EventDraftAsset",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "asset_type",
                    models.CharField(
                        choices=[("media", "Media"), ("seating_chart", "Seating chart")],
                        max_length=32,
                    ),
                ),
                ("name", models.CharField(blank=True, max_length=255)),
                ("file", models.FileField(upload_to=events.models.event_draft_asset_upload_to)),
                ("mime_type", models.CharField(blank=True, max_length=255)),
                ("size", models.PositiveBigIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "draft",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="assets",
                        to="events.eventdraft",
                    ),
                ),
            ],
            options={
                "ordering": ["created_at", "id"],
            },
        ),
    ]
