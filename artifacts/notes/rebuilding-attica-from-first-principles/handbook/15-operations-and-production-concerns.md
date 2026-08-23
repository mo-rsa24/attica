# 15. Operations and Production Concerns

## Purpose
This chapter covers the operational and infrastructure patterns needed to move Attica from development to production. It explains why certain technologies appear in production systems and when they're actually necessary.

Prerequisites: [01 System Map](./01-system-map.md), general understanding of deployment and cloud concepts.

## Development vs Production Mindset

In development, you're optimizing for:
- Speed of iteration
- Ease of debugging
- Single-machine simplicity

In production, you're optimizing for:
- Uptime (99.9%+ availability)
- Observability (can you see what's breaking?)
- Data durability (nothing gets lost)
- Scaling (can you handle 10x traffic?)

This chapter explains what changes between the two.

## Data Storage in Production

### The SQLite Problem
**Development**: SQLite works great. Single file, no server, built-in to Python.

**Production**: SQLite breaks because:
- ❌ Only one process can write at a time
- ❌ No concurrent access (your backend will have multiple processes)
- ❌ No backups (data lives in one file)
- ❌ Can't scale reads across replicas

**Solution**: Move to **PostgreSQL**.

```python
# Django handles this automatically
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['DB_NAME'],
        'USER': os.environ['DB_USER'],
        'PASSWORD': os.environ['DB_PASSWORD'],
        'HOST': os.environ['DB_HOST'],  # RDS endpoint
        'PORT': '5432',
    }
}

# Your ORM queries don't change at all
```

### Why PostgreSQL (not MySQL, not MongoDB)?
- **PostgreSQL**: Full-featured relational database, Django native support, mature, scales to millions of records
- **MySQL**: Simpler than PostgreSQL, still good, slightly less feature-rich
- **MongoDB**: Only if you have highly variable schemas. For Attica, you have fixed models (Booking, User, Event) → relational is better

**Recommendation**: Use **PostgreSQL**. If you were already using it in development, no code changes needed.

### Data Backups
**Development**: Not needed, you can rebuild from git.

**Production**: Your data is the product. Loss = business-ending.

**Strategy**:
- **Automated daily backups** (RDS does this automatically)
- **Point-in-time recovery** (restore to any point in the last 7 days)
- **Test restores** (regularly verify backups work)

```bash
# Example: restore a backup in AWS
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier attica-db-restored \
  --db-snapshot-identifier attica-db-backup-2026-04-15
```

## File Storage in Production

### The Filesystem Problem
**Development**: `MEDIA_ROOT = '/app/media/'` stores files on your laptop.

**Production**: Files on the container are **ephemeral**. When you deploy a new version:
- Container is destroyed
- Old files are gone
- New container starts with empty `/app/media/`

**Solution**: Use **S3** (or Azure Blob Storage).

```python
# settings.py
if not DEBUG:
    # Production: use S3
    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
            'OPTIONS': {
                'AWS_STORAGE_BUCKET_NAME': 'attica-media',
                'AWS_S3_REGION_NAME': 'us-east-1',
                'AWS_S3_CUSTOM_DOMAIN': 'd123abc.cloudfront.net',
            }
        }
    }
else:
    # Development: use filesystem
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
            'OPTIONS': {
                'location': '/app/media',
            }
        }
    }

# Your model code doesn't change
class Artist(models.Model):
    profile_image = models.ImageField(upload_to='artists/')
    # In production, this stores to S3
    # In development, this stores to /app/media/
```

### What Goes to S3?
- ✅ Profile pictures
- ✅ Event posters
- ✅ Chat attachments
- ✅ Portfolio images
- ❌ Cache files (Redis, not S3)
- ❌ Logs (CloudWatch, not S3)

### CDN (Content Delivery Network)
**What it is**: Caches your files globally so users near Paris get files from Paris, not from US.

**Implementation**: S3 + CloudFront (AWS) or S3 + Cloudflare
- First user downloads image → stored in edge location
- Next user in same region → instant download

**Cost impact**: ~$0.02 per GB transferred (vs $0.09 without CDN). Pays for itself quickly.

## Caching in Production

### The Local Redis Problem
**Development**: Single Redis instance on localhost. Fine for chat, sessions, etc.

**Production**: Single Redis is a single point of failure. If it dies, your chat dies.

**Solution**: **Managed Redis** (ElastiCache, Azure Cache, etc.)
- ✅ Automatic failover (if node dies, replica takes over)
- ✅ Persistence (data survives restarts)
- ✅ Clustering (scale beyond one machine)
- ✅ Backups (automatic daily)

```python
# Django doesn't change — just point to managed Redis
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ['REDIS_URL'],  # ElastiCache endpoint
    }
}

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('elasticache-node.us-east-1.cache.amazonaws.com', 6379)],
        },
    }
}
```

### When to Cache
- ✅ API responses that don't change (artist profiles, event descriptions)
- ✅ Database query results (annotations, complex aggregations)
- ✅ Session state (user auth, current role)
- ❌ Business-critical state (booking status, payment status) — always go to database

## Containerization

### Why Docker?
**Development problem**: "Works on my machine."

**Production reality**: 
- Your laptop (macOS, Windows) is different from production (Linux)
- Dependencies installed differently
- Environment variables missing
- Python version might be different

**Solution**: **Docker**. Define everything in a `Dockerfile`, get the exact same environment everywhere.

```dockerfile
# Dockerfile for Attica backend
FROM python:3.12-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Application code
COPY backend/main .

# Run with Daphne for WebSockets
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "main.asgi:application"]
```

```dockerfile
# Dockerfile for Attica frontend
FROM node:20-alpine as build

WORKDIR /app
COPY frontend/package*.json .
RUN npm ci
COPY frontend .
RUN npm run build

# Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Running with Docker Compose (Local)
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:secretpassword@postgres:5432/attica
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"

volumes:
  postgres_data:
  redis_data:
```

### Running in Production
Options (in order of simplicity → power):

1. **ECS Fargate** (AWS) — managed containers, auto-scaling, minimal ops
2. **Kubernetes** (self-hosted or managed) — more complex, but infinite scaling
3. **EC2 + Docker** — manual, but full control
4. **Heroku / Railway** — easiest, but pricier

**Recommendation for MVP**: Use **ECS Fargate**. Define your containers, AWS handles the rest.

## Observability

### Logging in Production

**Development**: Print to console, read terminal.

**Production**: Logs on container are lost when container dies.

**Solution**: Ship logs to **CloudWatch** (AWS) or **Application Insights** (Azure).

```python
# settings.py
LOGGING = {
    'version': 1,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json'
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        }
    }
}

# CloudWatch automatically picks up stdout/stderr from containers
```

### Error Tracking

**Development**: Errors appear in console or email. You fix them immediately.

**Production**: Users encounter errors before you know about them.

**Solution**: **Sentry**. Every error is automatically reported, grouped, and alerted.

```python
# settings.py
import sentry_sdk

sentry_sdk.init(
    dsn=os.environ['SENTRY_DSN'],
    traces_sample_rate=0.1,  # Sample 10% of transactions for performance monitoring
    environment=os.environ['ENVIRONMENT'],
)

# That's it. Now all exceptions are sent to Sentry automatically
```

**What you see in Sentry**:
- Exception message and traceback
- Request context (user, URL, headers)
- Before/after release (regression detection)
- Alert when error rate spikes

### Metrics and Uptime

**What to monitor**:
- API response time (p95, p99)
- Database query time
- Redis connection count
- HTTP error rate (4xx, 5xx)
- CPU, memory, disk usage

**Options**:
- **Prometheus + Grafana** (self-hosted, free)
- **DataDog** (all-in-one, expensive)
- **CloudWatch** (AWS native, sufficient)

**Recommendation**: Start with **CloudWatch**. Costs ~$2-5/month per metric.

## Background Jobs

### When You Need Them
**Synchronous**: Request comes in, you process it, return response.
- ✅ Login, fetch user profile, list events
- ❌ Sending 1000 notification emails, processing video, generating report

**Asynchronous**: Request comes in, you queue work, return immediately.
- ✅ Sending emails, webhook retries, batch operations

### Implementation: Celery

```python
# tasks.py
from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_booking_confirmation(booking_id):
    """Send email async when booking is created"""
    booking = Booking.objects.get(id=booking_id)
    send_mail(
        f"Booking confirmed: {booking.event.name}",
        f"Your booking has been confirmed. Total: ${booking.total_cost}",
        'noreply@attica.com',
        [booking.organizer.email],
    )

# In your view
def approve_booking(request, booking_id):
    booking = Booking.objects.get(id=booking_id)
    booking.status = 'approved'
    booking.save()
    
    # Queue email task (returns immediately)
    send_booking_confirmation.delay(booking.id)
    
    return Response({'status': 'approved'})

# In production, run Celery worker:
# celery -A main worker --loglevel=info
```

**Why not just send email in the view?**
- If email service is slow (10s), your API response is slow
- If email service is down, your API fails
- With Celery, email failing doesn't break booking

**Other use cases**:
- Webhook retries (booking status updates to external system)
- Batch exports (generate monthly revenue report)
- Notifications (notify all followers when user posts)
- Cleanup (delete expired checkout holds)

## Secrets Management

### The Environment Variable Problem
**Development**: `DEBUG = True`, `SECRET_KEY = 'hardcoded'` in settings.py. Fine.

**Production**: Secrets can't be in git. Never.

**Solution**: Environment variables + secret manager.

```python
# settings.py
DEBUG = os.environ.get('DEBUG', False) == 'True'
SECRET_KEY = os.environ['SECRET_KEY']
DATABASE_URL = os.environ['DATABASE_URL']
AWS_ACCESS_KEY_ID = os.environ['AWS_ACCESS_KEY_ID']
STRIPE_API_KEY = os.environ['STRIPE_API_KEY']
```

**Where to store secrets**:
- **AWS Secrets Manager** (if using AWS)
- **Azure Key Vault** (if using Azure)
- **.env file** (development only, don't commit)
- **Docker secrets** (if using Docker Swarm)
- **Kubernetes secrets** (if using Kubernetes)

**Never**:
- ❌ Commit secrets to git
- ❌ Put secrets in Docker image
- ❌ Use the same secret in dev and prod

## Migrations in Production

### The Migration Problem
**Development**: `python manage.py migrate` in your terminal. Works fine.

**Production**: You have multiple backend instances, you can't manually run commands.

**Solution**: **Auto-run migrations on deployment**.

```bash
# In your deployment script (GitHub Actions, ECS, etc.)
python manage.py migrate --noinput

# Then start the server
daphne -b 0.0.0.0 -p 8000 main.asgi:application
```

**Best practice**:
1. Develop and test migration locally
2. Commit to git
3. CI/CD automatically runs migration on deploy
4. Rollback if migration fails (ECS, Kubernetes handle this)

**Dangerous migrations**:
- Removing a column (breaks old code still reading it)
- Changing column type without backfill (data corruption)
- Adding NOT NULL without default (blocks on large tables)

**Safe migration pattern**:
```python
# Step 1: Add new column with default
class Migration(migrations.Migration):
    operations = [
        migrations.AddField(
            model_name='booking',
            name='status_v2',
            field=models.CharField(default='pending'),
        ),
    ]

# Step 2: Deploy code to read/write new column
# Update view to use status_v2

# Step 3: Backfill old data
class Migration(migrations.Migration):
    operations = [
        migrations.RunPython(backfill_status_v2),
    ]

# Step 4: Drop old column
class Migration(migrations.Migration):
    operations = [
        migrations.RemoveField(model_name='booking', name='status'),
    ]
```

## Key Production Checklist

Before launching:

- [ ] **Database**: PostgreSQL, not SQLite
- [ ] **Files**: S3 (or Azure Blob), not filesystem
- [ ] **Cache**: Managed Redis, not local
- [ ] **Containers**: Docker images built and tested
- [ ] **Secrets**: Environment variables, not hardcoded
- [ ] **Logs**: Shipped to CloudWatch (or similar), not just console
- [ ] **Errors**: Sentry configured, not hoping for the best
- [ ] **Backups**: Daily RDS backups enabled
- [ ] **SSL/TLS**: HTTPS enforced, not HTTP
- [ ] **Email**: SendGrid or SES configured, not console output
- [ ] **Monitoring**: CloudWatch alerts on error rate, response time
- [ ] **Migrations**: Tested locally, auto-run on deploy
- [ ] **Health checks**: `/health/` endpoint returns 200 when healthy
- [ ] **Graceful shutdown**: 30s timeout to finish in-flight requests

## What You Don't Need (Yet)

- ❌ **Kubernetes**: ECS Fargate is simpler for MVP
- ❌ **Spark/Hadoop**: Zero need for event platform
- ❌ **Kafka**: No high-frequency event streaming
- ❌ **ElasticSearch**: PostgreSQL full-text search is fine for MVP
- ❌ **Service mesh**: Too complex without microservices
- ❌ **GraphQL**: REST works fine, no mobile app yet

## Key Takeaway

Production is all about durability, observability, and automation. You're not adding features; you're adding safeguards. Start with the checklist above. Skip the rest until you have a real problem.
