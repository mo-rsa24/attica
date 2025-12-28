from django.db import migrations

def load_service_images(apps, schema_editor):
    try:
        ServiceImage = apps.get_model('vendors', 'ServiceImage')
        Service = apps.get_model('vendors', 'Service')
    except LookupError:
        return
    images = [
        (15, 'service_gallery/300_ps88mmg.jpg', 9),
        (16, 'service_gallery/300_IIOHaib.jpg', 9),
        (17, 'service_gallery/300_HxqeOpL.jpg', 10),
        (18, 'service_gallery/300_riQOOOn.jpg', 10),
    ]
    for img_id, path, service_id in images:
        service = Service.objects.filter(id=service_id).first()
        if not service:
            continue
        ServiceImage.objects.update_or_create(
            id=img_id,
            defaults={'service': service, 'image': path},
        )

class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0008_service_price_alter_service_vendor'),
    ]

    operations = [
        migrations.RunPython(load_service_images),
    ]