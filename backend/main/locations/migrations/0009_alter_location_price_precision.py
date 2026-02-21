from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0008_sanitize_non_finite_decimals'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
    ]
