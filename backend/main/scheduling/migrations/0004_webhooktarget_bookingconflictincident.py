from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0017_event_published_at_event_status_alter_event_is_draft"),
        ("scheduling", "0003_postgres_booking_overlap_constraint"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="BookingConflictIncident",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("operation", models.CharField(choices=[("create", "Create"), ("reschedule", "Reschedule")], max_length=16)),
                (
                    "conflict_source",
                    models.CharField(
                        choices=[("application_check", "Application Check"), ("db_constraint", "DB Constraint")],
                        max_length=24,
                    ),
                ),
                ("requested_start_at", models.DateTimeField()),
                ("requested_end_at", models.DateTimeField()),
                ("message", models.TextField()),
                ("details", models.JSONField(blank=True, default=dict)),
                (
                    "event",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="booking_conflict_incidents",
                        to="events.event",
                    ),
                ),
                (
                    "organizer",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="booking_conflict_incidents",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "resource",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="conflict_incidents",
                        to="scheduling.marketplaceresource",
                    ),
                ),
            ],
            options={
                "indexes": [
                    models.Index(fields=["created_at"], name="scheduling__created_3247b6_idx"),
                    models.Index(fields=["operation", "created_at"], name="scheduling__operati_543e62_idx"),
                    models.Index(fields=["conflict_source", "created_at"], name="scheduling__conflic_255d33_idx"),
                    models.Index(fields=["resource", "created_at"], name="scheduling__resourc_5f7d1a_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="WebhookTarget",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("url", models.URLField(unique=True)),
                ("description", models.CharField(blank=True, max_length=255)),
                ("is_active", models.BooleanField(default=True)),
                ("secret", models.CharField(blank=True, max_length=255)),
                ("timeout_seconds", models.PositiveIntegerField(default=5)),
                ("failure_threshold", models.PositiveIntegerField(default=5)),
                ("open_seconds", models.PositiveIntegerField(default=120)),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="scheduling_webhook_targets_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="scheduling_webhook_targets_updated",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "indexes": [
                    models.Index(fields=["is_active", "created_at"], name="scheduling__is_acti_51485b_idx"),
                ],
            },
        ),
    ]
