from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatroom',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.CreateModel(
            name='ChatAttachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='chat_attachments/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('original_name', models.CharField(blank=True, max_length=255)),
                ('size', models.PositiveIntegerField(default=0)),
                ('uploaded_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_attachments', to='users.customuser')),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='chat.chatroom')),
            ],
        ),
        migrations.CreateModel(
            name='ChatBid',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('currency', models.CharField(default='USD', max_length=8)),
                ('tier', models.CharField(blank=True, max_length=64)),
                ('notes', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined'), ('countered', 'Countered')], default='pending', max_length=20)),
                ('counter_amount', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('idempotency_key', models.CharField(max_length=64)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('organizer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bids_made', to='users.customuser')),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bids', to='chat.chatroom')),
                ('vendor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bids_received', to='users.customuser')),
            ],
        ),
        migrations.AddField(
            model_name='message',
            name='bid',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='messages', to='chat.chatbid'),
        ),
        migrations.AddField(
            model_name='message',
            name='delivered_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='message_type',
            field=models.CharField(choices=[('text', 'Text'), ('system', 'System'), ('bid', 'Bid')], default='text', max_length=16),
        ),
        migrations.AddField(
            model_name='message',
            name='read_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='attachments',
            field=models.ManyToManyField(blank=True, related_name='messages', to='chat.chatattachment'),
        ),
        migrations.AddConstraint(
            model_name='chatroom',
            constraint=models.UniqueConstraint(fields=('organizer', 'vendor'), name='unique_room_per_pair'),
        ),
        migrations.AddConstraint(
            model_name='chatbid',
            constraint=models.UniqueConstraint(fields=('organizer', 'vendor', 'idempotency_key'), name='unique_bid_idempotency'),
        ),
    ]