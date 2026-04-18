from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("scheduling", "0006_add_review_model"),
    ]

    operations = [
        migrations.AddField(
            model_name="bookingrequest",
            name="draft_hold_expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name="bookingrequest",
            index=models.Index(fields=["draft_hold_expires_at"], name="scheduling__draft_h_idx"),
        ),
    ]
