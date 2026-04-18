import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0016_eventdraft"),
        ("scheduling", "0004_webhooktarget_bookingconflictincident"),
    ]

    operations = [
        # Make event nullable (was required in 0001_initial)
        migrations.AlterField(
            model_name="bookingrequest",
            name="event",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="scheduling_requests",
                to="events.event",
            ),
        ),
        # Add event_draft FK
        migrations.AddField(
            model_name="bookingrequest",
            name="event_draft",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="scheduling_requests",
                to="events.eventdraft",
            ),
        ),
        # Update status choices to include COUNTER_PROPOSED and extend max_length to 24
        migrations.AlterField(
            model_name="bookingrequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    ("pending", "Pending"),
                    ("approved", "Approved"),
                    ("declined", "Declined"),
                    ("counter_proposed", "Counter Proposed"),
                    ("withdrawn", "Withdrawn"),
                    ("expired", "Expired"),
                ],
                default="pending",
                max_length=24,
            ),
        ),
        # Counter-proposal fields
        migrations.AddField(
            model_name="bookingrequest",
            name="counter_start_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="bookingrequest",
            name="counter_end_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="bookingrequest",
            name="counter_rate",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name="bookingrequest",
            name="counter_message",
            field=models.TextField(blank=True, default=""),
            preserve_default=False,
        ),
        # Index for event_draft queries
        migrations.AddIndex(
            model_name="bookingrequest",
            index=models.Index(fields=["event_draft", "status"], name="scheduling__event_d_status_idx"),
        ),
    ]
