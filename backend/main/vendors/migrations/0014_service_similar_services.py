from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0013_seed_service_images'),
    ]

    operations = [
        migrations.AddField(
            model_name='service',
            name='similar_services',
            field=models.ManyToManyField(blank=True, related_name='similar_to', symmetrical=False, to='vendors.service'),
        ),
    ]