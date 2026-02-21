from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("scheduling", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="OutboxDeadLetter",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("event_type", models.CharField(max_length=128)),
                ("aggregate_type", models.CharField(max_length=64)),
                ("aggregate_id", models.CharField(max_length=64)),
                ("payload", models.JSONField(blank=True, default=dict)),
                ("attempts", models.PositiveIntegerField(default=0)),
                ("error_message", models.TextField(blank=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                (
                    "outbox_event",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="dead_letters",
                        to="scheduling.outboxevent",
                    ),
                ),
            ],
            options={
                "indexes": [
                    models.Index(fields=["event_type", "created_at"], name="scheduling__event_t_3e6e14_idx"),
                    models.Index(fields=["aggregate_type", "aggregate_id"], name="scheduling__aggrega_219a3b_idx"),
                ],
            },
        ),
        migrations.AlterField(
            model_name="outboxevent",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("processing", "Processing"),
                    ("sent", "Sent"),
                    ("failed", "Failed"),
                    ("dead_letter", "Dead Letter"),
                ],
                default="pending",
                max_length=16,
            ),
        ),
    ]
