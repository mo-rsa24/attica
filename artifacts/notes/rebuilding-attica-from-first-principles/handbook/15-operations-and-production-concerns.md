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
- [Observability](../../../../../../Obsidian/Information%20Technology/DevOps/Observability.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=885 "AI engineering, chapter 10, Logs and traces, Works a debugging session: metrics say something broke five minutes ago, the logs from that moment say what happ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=877 "AI engineering, chapter 10, Monitoring and Observability, What monitoring is for, the three numbers that grade it (mean time to detection, mean time to respo..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=26 "System design interview, chapter 1, Logging, metrics, automation, Error logs aggregated in one place, and host, tier-level and business metrics, as the tools..."), [▶1](https://www.youtube.com/watch?v=f4W_eEJC-20&t=284s "KodeKloud, How Prometheus Monitoring Works: Explaining Prometheus Architecture, Prometheus Architecture, 4:44 to 10:50, Prometheus's parts, before the chapte..."), [▶2](https://www.youtube.com/watch?v=AZhIjNHzURQ&t=53s "Gaurav Sen, Google Dapper, a Large-Scale Distributed Systems Tracing Infrastructure, Request Tracing Requirements, 0:53 to 3:59, What tracing one request acr..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/23-one-order-one-trace.md "One order, one trace, system-design/foundations, plan 23. Every service instrumented with OpenTelemetry and one order's trace opened in Jaeger as a waterfall...")</sub> (can you see what's breaking?)
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
- ❌ Can't scale reads across [replicas](../../../../../../Obsidian/Information%20Technology/Database%20Systems/Database%20Replication.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=11 "System design interview, chapter 1, Database replication, Works the master and slave case: writes go to the master, reads to the more numerous slaves, and wh..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=94 "System design interview, chapter 6, Data replication and Consistency, Each key copied to N servers along the hash ring, then quorum consensus with numbers: w..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=220 "System design big archive, How MongoDB works?, A real replica set: one primary for writes, secondaries for reads and availability, and a secondary elected wh..."), [▶1](https://www.youtube.com/watch?v=jLEp1XI_L6Q&t=62s "Hayk Simonyan, Database Replication & Sharding Explained, Leader-Follower Replication, 1:02 to 1:28, One leader taking writes and followers copying it, befor..."), [▶2](https://www.youtube.com/watch?v=_1IKwnbscQU&t=360s "ByteByteGo, 7 Must-know Strategies to Scale Your Database, Database replication, 6:00 to 6:57, Replication as one of seven ways to scale a database, just bef..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/16-primary-replica-and-the-stale-read.md "Primary, replica, and the stale read, system-design/foundations, plan 16. A second PostgreSQL server streams a copy of the first and takes the reads, then is...")</sub>

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
- **PostgreSQL**: Full-featured [relational database](../../../../../../Obsidian/Information%20Technology/Database%20Systems/Relational%20Database.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=437 "Systems analysis and design, chapter 11, Relational databases, Works it on a Customer table and an Order table with real rows: each table has a primary key, ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=8 "System design interview, chapter 1, Which databases to use?, Relational against non-relational: tables, rows and joins on one side, four NoSQL families witho..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=19 "Grokking the system design interview, section 16, SQL and NoSQL, The differences point by point (storage, schema, querying, scalability, ACID) and when to ch..."), [▶1](https://www.youtube.com/watch?v=kkeFE6iRfMM&t=22s "ByteByteGo, How To Choose The Right Database?, Key Points To Consider, 0:22 to 1:12, What to weigh before picking a database. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=5coDJ2b4Xuo&t=38s "Hayk Simonyan, 7 Database Types Every Software Engineer Should Know, Relational databases, 0:38 to 7:45, Relational databases as the first of seven types, be..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/16-postgres-two-ways.md "Postgres in psql and in DBeaver, ai-engineering/product-data-validation-end-to-end, plan 16. Works it with counts: one database read in the terminal and in a...")</sub>, Django native support, mature, scales to millions of records
- **MySQL**: Simpler than PostgreSQL, still good, slightly less feature-rich
- **MongoDB**: Only if you have highly variable schemas. For Attica, you have fixed models (Booking, User, Event) → relational is better

**Recommendation**: Use **PostgreSQL**. If you were already using it in development, no code changes needed.

### Data Backups
**Development**: Not needed, you can rebuild from git.

**Production**: Your data is the product. [Loss](../../../../../../Obsidian/Artificial%20Intelligence/Machine%20Learning/Loss%20Function.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/understanding-deep-learning.pdf#page=33 "Understanding deep learning, section 2.2.2, Works the idea with numbers: each choice of intercept and slope for a line through twelve points gets one loss (7..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/pattern-recognition-and-machine-learning.pdf#page=60 "Pattern recognition and machine learning, section 1.5.2, A loss matrix for cancer diagnosis that charges 1000 for missing a cancer and 1 for a false alarm, a..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/understanding-deep-learning.pdf#page=70 "Understanding deep learning, sections 5.1 to 5.2, A recipe that builds a loss for any kind of output from maximum likelihood: choose a distribution over the ..."), [▶1](https://www.youtube.com/watch?v=pdqofxJeBN8&t=3230s "CS231n lecture 2, 53:50 to 57:30, Defines the loss as the average of per-example losses that optimisation will minimise, after showing data a line cannot sep..."), [▶2](https://www.youtube.com/watch?v=cmNIMjPYdgM&t=879s "CS229 lecture 2, 14:39 to 17:41, Chooses the line that minimises prediction errors on the training data, empirical risk minimisation, and contrasts it with a..."), [◆](../../../../../../goal-setting/learning/machine-learning/classical-ml-from-scratch/MASTER_PLAN.md "Classical ML from Scratch, machine-learning/classical-ml-from-scratch. Goal 1 derives linear and logistic regression from a loss function and gradient descen...")</sub> = business-ending.

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

**Solution**: Use **S3** (or Azure [Blob Storage](../../../../../../Obsidian/Information%20Technology/System%20Design/Object%20Storage.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=250 "System design interview, chapter 15, Design Google Drive, Works the move from one server's disk to Amazon S3: files stored in S3, replicated within a region ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=106 "System design big archive, How Amazon S3 Works?, Inside S3: over 350 trillion objects at eleven nines of durability, each object given a unique identifier an..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=223 "System design interview, chapter 14, Design YouTube, Blob storage holding the original uploaded videos, a cloud service the design uses instead of building, ..."), [▶1](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=0s "Hello Interview, Object Storage in System Design Interviews, Why Object Storage, 0:00 to 3:29, Why a design reaches for object storage, before chapters on ho..."), [▶2](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=209s "Hello Interview, Object Storage in System Design Interviews, How it works, 3:29 to 7:00, How an object store works underneath. Chapter-timed."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/18-minio-holds-the-receipt.md "MinIO holds the receipt, system-design/foundations, plan 18. Works it on the corner shop: a paid order's receipt PDF written by the notification service into...")</sub>).

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
- ❌ [Cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> files ([Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub>, not S3)
- ❌ Logs (CloudWatch, not S3)

### CDN (Content Delivery Network)
**What it is**: Caches your files globally so users near Paris get files from Paris, not from US.

**Implementation**: S3 + CloudFront (AWS) or S3 + Cloudflare
- First user downloads image → stored in edge location
- Next user in same region → instant download

**Cost impact**: ~$0.02 per GB transferred (vs $0.09 without [CDN](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Content%20Delivery%20Network.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=17 "System design interview, chapter 1, Content delivery network (CDN), Works one image request step by step (miss at the CDN, fetch from the origin, cache with ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=302 "System design big archive, Where do we cache data?, The CDN as the second caching layer after the browser, serving static resources from a nearby node."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=248 "System design big archive, 8 system design concepts explained in 1 diagram, A CDN named as the way to cut latency, the delay a user feels, by serving from se..."), [▶1](https://www.youtube.com/watch?v=RI9np1LWzqw&t=0s "ByteByteGo, What Is A CDN? How Does It Work?, 0:00 to 4:23, A short animated explainer of what a CDN is and how a request reaches the edge. Whole video."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=306s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Pull-based and Push-based CDNs, 5:06 to 5:51, The two ways files reach the edge: fetched on the first ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache standing in for the CDN answers the catalogue page itself on the second r...")</sub>). Pays for itself quickly.

## Caching in Production

### The Local Redis Problem
**Development**: Single [Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> instance on localhost. Fine for chat, sessions, etc.

**Production**: Single Redis is a single point of failure. If it dies, your chat dies.

**Solution**: **Managed Redis** (ElastiCache, Azure [Cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>, etc.)
- ✅ Automatic failover (if node dies, [replica](../../../../../../Obsidian/Information%20Technology/Database%20Systems/Database%20Replication.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=11 "System design interview, chapter 1, Database replication, Works the master and slave case: writes go to the master, reads to the more numerous slaves, and wh..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=94 "System design interview, chapter 6, Data replication and Consistency, Each key copied to N servers along the hash ring, then quorum consensus with numbers: w..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=220 "System design big archive, How MongoDB works?, A real replica set: one primary for writes, secondaries for reads and availability, and a secondary elected wh..."), [▶1](https://www.youtube.com/watch?v=jLEp1XI_L6Q&t=62s "Hayk Simonyan, Database Replication & Sharding Explained, Leader-Follower Replication, 1:02 to 1:28, One leader taking writes and followers copying it, befor..."), [▶2](https://www.youtube.com/watch?v=_1IKwnbscQU&t=360s "ByteByteGo, 7 Must-know Strategies to Scale Your Database, Database replication, 6:00 to 6:57, Replication as one of seven ways to scale a database, just bef..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/16-primary-replica-and-the-stale-read.md "Primary, replica, and the stale read, system-design/foundations, plan 16. A second PostgreSQL server streams a copy of the first and takes the reads, then is...")</sub> takes over)
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

**Solution**: **[Docker](../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub>**. Define everything in a `Dockerfile`, get the exact same environment everywhere.

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
2. **[Kubernetes](../../../../../../Obsidian/Software/Kubernetes.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=288 "System design big archive, The Lifecycle of a Kubernetes Pod, Works one pod from start to finish: the manifest stored in etcd, the scheduler binding it to a ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=61 "System design big archive, How Kubernetes Works?, Manifest files in, then the control plane (API server, scheduler, controller manager, etcd) and the worker ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=297 "System design big archive, Kubernetes Explained, The same parts with the pod named as the smallest deployable unit and the container runtime that runs it."), [▶1](https://www.youtube.com/watch?v=XuSQU5Grv1g&t=1720s "KodeKloud, Kubernetes Crash Course: Learn the Basics and Build a Microservice Application, Demo: Pods, 28:40 to 35:00, Pods created and inspected live, after..."), [▶2](https://www.youtube.com/watch?v=8C_SCDbUJTg&t=67s "KodeKloud, Kubernetes Architecture Simplified: K8s Explained in 10 Minutes, Kubernetes Architecture, 1:07 to 4:54, The cluster's parts, before the chapter on..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/18-kubernetes-from-zero.md "Kubernetes from zero: pod, deployment, service, system-design/devops-and-deployment, plan 18. A pod, a deployment that keeps three of them and a service in f...")</sub>** (self-hosted or managed) — more complex, but infinite scaling
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
- API response time ([p95](../../../../../../Obsidian/Information%20Technology/System%20Design/Scaling/Latency.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=784 "AI engineering, chapter 9, Inference performance metrics, Works latency as a distribution with numbers: ten time-to-first-token values whose mean of 390 ms i..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=36 "System design interview, chapter 2, Latency numbers every programmer should know, Jeff Dean's 2010 table of how long typical computer operations take, with i..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=358 "System design big archive, Latency vs. throughput, Latency as the delay per packet, what a user feels after clicking a button, set against throughput as the ..."), [▶1](https://www.youtube.com/watch?v=3JdQOExKtUY&t=129s "Hussein Nasser, Percentile Tail Latency Explained (95%, 99%), Calculating Percentile, 2:09 to 5:20, How a p95 or p99 is calculated from a set of request time..."), [▶2](https://www.youtube.com/watch?v=FqR5vESuKe0&t=63s "ByteByteGo, Latency Numbers Programmer Should Know: Crash Course System Design #1, Time Units, 1:03 to 2:50, The units the latency numbers are written in, be..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/22-prometheus-grafana-and-the-alert.md "Prometheus, Grafana, and the alert, system-design/foundations, plan 22. Every service gets a metrics endpoint and Grafana draws request rate, errors and p95 ...")</sub>, p99)
- Database query time
- [Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub> connection count
- [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub> error rate (4xx, 5xx)
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
- ✅ Sending emails, [webhook](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Webhook.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=-4Lid7tBr6Y&t=320s "Hussein Nasser, Webhooks Tutorial with Discord and Vanilla Javascript (fetch api), Example, 5:20 to 15:06, Sends messages to a Discord channel through its we..."), [▶2](https://www.youtube.com/watch?v=x_jjhcDrISk&t=90s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, How webhooks work, 1:30 to 2:00, The mechanism, straight after the chapter on polling and long poll..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/20-providers-webhook-and-one-key.md "The providers, the webhook, and one key, system-design/foundations, plan 20. The fake payment provider calls back to the corner shop's payment service by web...")</sub> retries, batch operations

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
- **[Docker](../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub> secrets** (if using Docker Swarm)
- **[Kubernetes](../../../../../../Obsidian/Software/Kubernetes.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=288 "System design big archive, The Lifecycle of a Kubernetes Pod, Works one pod from start to finish: the manifest stored in etcd, the scheduler binding it to a ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=61 "System design big archive, How Kubernetes Works?, Manifest files in, then the control plane (API server, scheduler, controller manager, etcd) and the worker ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=297 "System design big archive, Kubernetes Explained, The same parts with the pod named as the smallest deployable unit and the container runtime that runs it."), [▶1](https://www.youtube.com/watch?v=XuSQU5Grv1g&t=1720s "KodeKloud, Kubernetes Crash Course: Learn the Basics and Build a Microservice Application, Demo: Pods, 28:40 to 35:00, Pods created and inspected live, after..."), [▶2](https://www.youtube.com/watch?v=8C_SCDbUJTg&t=67s "KodeKloud, Kubernetes Architecture Simplified: K8s Explained in 10 Minutes, Kubernetes Architecture, 1:07 to 4:54, The cluster's parts, before the chapter on..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/18-kubernetes-from-zero.md "Kubernetes from zero: pod, deployment, service, system-design/devops-and-deployment, plan 18. A pod, a deployment that keeps three of them and a service in f...")</sub> secrets** (if using Kubernetes)

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
3. [CI/CD](../../../../../../Obsidian/Information%20Technology/DevOps/Continuous%20Integration%20And%20Delivery.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=184 "System design big archive, How Do Companies Ship Code to Production?, Works one feature through 11 steps: a Jira story, a push to GitHub, Jenkins building an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=308 "System design big archive, CI/CD Simplified Visual Guide, Continuous integration as frequent merges with automatic checks, and continuous deployment as movin..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=290 "System design big archive, CI/CD Pipeline Explained, The pipeline as one workflow that builds, tests and deploys, with the tools used at each stage."), [▶1](https://www.youtube.com/watch?v=IkglLTs5K6I&t=202s "KodeKloud, CI/CD Explained: Enhance Your GitHub Workflow Today!, Workflow in Continuous Integration, 3:22 to 6:19, The continuous integration workflow, befor..."), [▶2](https://www.youtube.com/watch?v=AlrImm1T8Wg&t=42s "KodeKloud, DevOps: CI/CD Introduction (Continuous Integration, Continuous Delivery, Continuous Deployment), CI: Continuous Integration, 0:42 to 2:12, Continu..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/08-pipeline-as-code-on-both-platforms.md "Pipeline as code on both platforms, system-design/devops-and-deployment, plan 08. `.github/workflows/ci.yml` and `azure-pipelines.yml` written from a blank e...")</sub> automatically runs migration on deploy
4. Rollback if migration fails (ECS, [Kubernetes](../../../../../../Obsidian/Software/Kubernetes.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=288 "System design big archive, The Lifecycle of a Kubernetes Pod, Works one pod from start to finish: the manifest stored in etcd, the scheduler binding it to a ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=61 "System design big archive, How Kubernetes Works?, Manifest files in, then the control plane (API server, scheduler, controller manager, etcd) and the worker ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=297 "System design big archive, Kubernetes Explained, The same parts with the pod named as the smallest deployable unit and the container runtime that runs it."), [▶1](https://www.youtube.com/watch?v=XuSQU5Grv1g&t=1720s "KodeKloud, Kubernetes Crash Course: Learn the Basics and Build a Microservice Application, Demo: Pods, 28:40 to 35:00, Pods created and inspected live, after..."), [▶2](https://www.youtube.com/watch?v=8C_SCDbUJTg&t=67s "KodeKloud, Kubernetes Architecture Simplified: K8s Explained in 10 Minutes, Kubernetes Architecture, 1:07 to 4:54, The cluster's parts, before the chapter on..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/18-kubernetes-from-zero.md "Kubernetes from zero: pod, deployment, service, system-design/devops-and-deployment, plan 18. A pod, a deployment that keeps three of them and a service in f...")</sub> handle this)

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
- [ ] **Files**: [S3](../../../../../../Obsidian/Information%20Technology/System%20Design/Object%20Storage.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=250 "System design interview, chapter 15, Design Google Drive, Works the move from one server's disk to Amazon S3: files stored in S3, replicated within a region ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=106 "System design big archive, How Amazon S3 Works?, Inside S3: over 350 trillion objects at eleven nines of durability, each object given a unique identifier an..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=223 "System design interview, chapter 14, Design YouTube, Blob storage holding the original uploaded videos, a cloud service the design uses instead of building, ..."), [▶1](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=0s "Hello Interview, Object Storage in System Design Interviews, Why Object Storage, 0:00 to 3:29, Why a design reaches for object storage, before chapters on ho..."), [▶2](https://www.youtube.com/watch?v=RvaMHMxHjp4&t=209s "Hello Interview, Object Storage in System Design Interviews, How it works, 3:29 to 7:00, How an object store works underneath. Chapter-timed."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/18-minio-holds-the-receipt.md "MinIO holds the receipt, system-design/foundations, plan 18. Works it on the corner shop: a paid order's receipt PDF written by the notification service into...")</sub> (or Azure Blob), not filesystem
- [ ] **[Cache](../../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub>**: Managed [Redis](../../../../../../Obsidian/Software/Redis.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=62 "System design interview, chapter 4, Design a rate limiter, High-level architecture, Works Redis as the counter store with its two commands: INCR adds one to ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=318 "System design big archive, The life of a Redis query, Why an in-memory store can lose data on a restart, and Redis's two ways to persist it: the append-only ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=97 "System design big archive, Redis vs Memcached, What Redis's data structures are good for: a hash to count clicks, a sorted set to rank and dedupe users, a bi..."), [▶1](https://www.youtube.com/watch?v=ZkwKyUZWkp4&t=0s "Hussein Nasser, Spin up Redis on Docker and learn basic commands, 0:00 to 9:47, Redis started in a Docker container and driven with its basic commands. Whole..."), [▶2](https://www.youtube.com/watch?v=z_NbVtbgBJw&t=0s "ByteByteGo, What Is Redis Really About? Why Is It So Popular?, Introduction to Redis, 0:00 to 2:36, What Redis is, before the chapters on persistence, scalin..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/17-redis-cache-aside-and-the-stale-price.md "Redis cache-aside, and the stale price, system-design/foundations, plan 17. Redis in Docker Compose holding a product price for 60 seconds, read with `redis-...")</sub>, not local
- [ ] **Containers**: [Docker images](../../../../../../Obsidian/Software/Docker.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=349 "System design big archive, Docker vs Kubernetes, Works the path one app takes: code and dependencies written into a Dockerfile, built into a portable image, ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=265 "System design big archive, How does Docker Work?, The three parts: the client you type into, the host whose daemon manages images, containers, networks and v..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=401 "System design big archive, Virtualization vs. Containerization, Why a container starts in milliseconds and a VM in minutes: containers share the host kernel ..."), [▶1](https://www.youtube.com/watch?v=zJ6WbK9zFpI&t=1200s "KodeKloud, Learn Docker in 2 Hours: A Full Tutorial (2025), An introduction to Docker Commands, 20:00 to 42:06, The everyday Docker commands, after the overv..."), [▶2](https://www.youtube.com/watch?v=ZWReEReO2xE&t=465s "KodeKloud, What are Containers? Containerization Explained, Containers vs Virtual Machines, 7:45 to 9:34, Containers set against virtual machines, after the ..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/10-docker-from-zero.md "Docker from zero: a container is a process, system-design/devops-and-deployment, plan 10. Pull and run an image, publish a port, read its logs, then find the...")</sub> built and tested
- [ ] **Secrets**: Environment variables, not hardcoded
- [ ] **Logs**: Shipped to CloudWatch (or similar), not just console
- [ ] **Errors**: Sentry configured, not hoping for the best
- [ ] **Backups**: Daily RDS backups enabled
- [ ] **[SSL/TLS](../../../../../../Obsidian/Information%20Technology/Networking/TLS.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=176 "System design big archive, How does HTTPS work?, Walks one connection in four steps: the TCP connection, client hello and server hello with the cipher suites..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=395 "System design big archive, HTTP vs. HTTPS, Plain HTTP's readable traffic set against HTTPS's TCP handshake, certificate check, key exchange and encrypted dat..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/systems-analysis-and-design.pdf#page=324 "Systems analysis and design, chapter 8, Architecture design, encryption and authentication requirements, The ideas a TLS certificate rests on: symmetric agai..."), [▶1](https://www.youtube.com/watch?v=64geP_LAZ5U&t=0s "Hussein Nasser, The TLS Handshake Explained with Example (the Math), 0:00 to 5:39, The handshake worked through as an example with its maths, in under six mi..."), [▶2](https://www.youtube.com/watch?v=AlE5X1NlHgg&t=515s "Hussein Nasser, Transport Layer Security, TLS 1.2 and 1.3 (Explained by Example), TLS 1.2, 8:35 to 14:30, The TLS 1.2 handshake worked by example, after chap..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/09-https-and-three-round-trips.md "HTTPS, and three round trips, system-design/foundations, plan 09. Puts the front nginx container on 443 with a certificate from the laptop's own mkcert autho...")</sub>**: HTTPS enforced, not [HTTP](../../../../../../Obsidian/Information%20Technology/Networking/HTTP.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=7 "System design interview, chapter 1, Scale from zero to millions of users, Works one request with real values: DNS returns 15.125.23.214, then an HTTP request..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=427 "System design big archive, Evolution of HTTP, Each version in one line: HTTP/0.9's single GET, HTTP/1.0's headers and status codes with a new connection per ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=79 "System design big archive, HTTP/1 -> HTTP/2 -> HTTP/3, The dates (1996, 1997, 2015, 2019) and what each version added: pipelining and headers, then stream pr..."), [▶1](https://www.youtube.com/watch?v=0OrmKCB0UrQ&t=720s "Hussein Nasser, Hyper Text Transfer Protocol Crash Course, Demo Request/Response, Build Web Server, 12:00 to 20:20, A request and its response shown on a web..."), [▶2](https://www.youtube.com/watch?v=SzwjnoPI--M&t=190s "Arpit Bhayani, What exactly is the HTTP protocol and how to write a new one from scratch?, Raw TCP HTTP request demo, 3:10 to 6:12, An HTTP request typed by ..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/textbook/04-the-shell-curl-and-status-codes.md "The shell, curl and status codes, system-design/foundations, chapter 04. Reads one `curl -v` transcript line by line against a Python server, then gets 200, ...")</sub>
- [ ] **Email**: SendGrid or SES configured, not console output
- [ ] **[Monitoring](../../../../../../Obsidian/Information%20Technology/DevOps/Observability.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=885 "AI engineering, chapter 10, Logs and traces, Works a debugging session: metrics say something broke five minutes ago, the logs from that moment say what happ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=877 "AI engineering, chapter 10, Monitoring and Observability, What monitoring is for, the three numbers that grade it (mean time to detection, mean time to respo..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=26 "System design interview, chapter 1, Logging, metrics, automation, Error logs aggregated in one place, and host, tier-level and business metrics, as the tools..."), [▶1](https://www.youtube.com/watch?v=f4W_eEJC-20&t=284s "KodeKloud, How Prometheus Monitoring Works: Explaining Prometheus Architecture, Prometheus Architecture, 4:44 to 10:50, Prometheus's parts, before the chapte..."), [▶2](https://www.youtube.com/watch?v=AZhIjNHzURQ&t=53s "Gaurav Sen, Google Dapper, a Large-Scale Distributed Systems Tracing Infrastructure, Request Tracing Requirements, 0:53 to 3:59, What tracing one request acr..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/23-one-order-one-trace.md "One order, one trace, system-design/foundations, plan 23. Every service instrumented with OpenTelemetry and one order's trace opened in Jaeger as a waterfall...")</sub>**: CloudWatch alerts on error rate, response time
- [ ] **Migrations**: Tested locally, auto-run on deploy
- [ ] **[Health checks](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Health%20Check.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=14 "Grokking the system design interview, section 12.2, Load balancing algorithms, Health checks that regularly try to connect to each backend, remove a server t..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=100 "System design interview, chapter 6, Design a key-value store, failure detection, The push form of a health check: each node increments a heartbeat counter an..."), [▶1](https://www.youtube.com/watch?v=C842vFY5kRo&t=1508s "freeCodeCamp, System Design Course: APIs, Databases, Caching, CDNs, Load Balancing and Production Infra, Health Checks, 25:08 to 28:00, Health checks as the ..."), [▶2](https://www.youtube.com/watch?v=oM5-knpFPw4&t=0s "KodeKloud, Kubernetes Liveness vs Readiness Probes, Done Right!, 0:00 to 2:47, The two health checks Kubernetes runs on a container: is it running, and can i..."), [◆](../../../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/74-health-check-and-alert.md "Health check and alert: /healthz polled every 60 s, downtime manufactured, one alert seen, ai-engineering/one-business-end-to-end, plan 74. Works one end to ...")</sub>**: `/health/` endpoint returns 200 when healthy
- [ ] **Graceful shutdown**: 30s [timeout](../../../../../../Obsidian/Information%20Technology/System%20Design/Reliability/Timeout.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=146 "System design interview, chapter 9, Design a web crawler, Short timeout, A crawler gives each web server a maximal wait time and, when a host does not answer..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=362 "System design big archive, How to Debug a Slow API?, Set aggressive timeouts and retries on third-party calls such as Stripe or Google Maps, so one slow prov..."), [▶1](https://www.youtube.com/watch?v=2GAQVXGT_Zw&t=150s "Hussein Nasser, Frontend and Backends Timeouts, Connection Timeout, 2:30 to 5:00, The first of the timeouts a backend sets, before read, wait, usage and resp..."), [▶2](https://www.youtube.com/watch?v=SHkbPm1Wrno&t=3349s "Hello Interview, Networking Essentials for System Design Interviews, Timeouts, Backoff, and Retries, 55:49 to 1:00:15, Timeouts set on calls between services..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/14-payment-notification-and-a-timeout.md "Payment, notification, and a timeout, system-design/foundations, plan 14. The order service calls payment with httpx and a 2-second timeout; a card ending 00...")</sub> to finish in-flight requests

## What You Don't Need (Yet)

- ❌ **[Kubernetes](../../../../../../Obsidian/Software/Kubernetes.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=288 "System design big archive, The Lifecycle of a Kubernetes Pod, Works one pod from start to finish: the manifest stored in etcd, the scheduler binding it to a ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=61 "System design big archive, How Kubernetes Works?, Manifest files in, then the control plane (API server, scheduler, controller manager, etcd) and the worker ..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=297 "System design big archive, Kubernetes Explained, The same parts with the pod named as the smallest deployable unit and the container runtime that runs it."), [▶1](https://www.youtube.com/watch?v=XuSQU5Grv1g&t=1720s "KodeKloud, Kubernetes Crash Course: Learn the Basics and Build a Microservice Application, Demo: Pods, 28:40 to 35:00, Pods created and inspected live, after..."), [▶2](https://www.youtube.com/watch?v=8C_SCDbUJTg&t=67s "KodeKloud, Kubernetes Architecture Simplified: K8s Explained in 10 Minutes, Kubernetes Architecture, 1:07 to 4:54, The cluster's parts, before the chapter on..."), [◆](../../../../../../goal-setting/learning/system-design/devops-and-deployment/plans/18-kubernetes-from-zero.md "Kubernetes from zero: pod, deployment, service, system-design/devops-and-deployment, plan 18. A pod, a deployment that keeps three of them and a service in f...")</sub>**: ECS Fargate is simpler for MVP
- ❌ **Spark/Hadoop**: Zero need for event platform
- ❌ **[Kafka](../../../../../../Obsidian/Software/Apache%20Kafka.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=310 "System design big archive, How Apache Kafka Works?, Follows one message through nine steps, from a producer's click or payment event through the serializer, ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=419 "System design big archive, Apache Kafka vs. RabbitMQ, Kafka as a distributed log whose messages stay until the retention policy removes them, set against Rab..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=330 "System design big archive, Apache Kafka Explained (At the high level), The parts named once each: producers, topics and partitions, the broker cluster, the K..."), [▶1](https://www.youtube.com/watch?v=DU8o-OTeoCc&t=113s "Hello Interview, Kafka System Design Deep Dive, Motivating Example, 1:53 to 8:09, A concrete case that needs Kafka, worked before the overview, by a former M..."), [▶2](https://www.youtube.com/watch?v=HZklgPkboro&t=32s "ByteByteGo, System Design: Apache Kafka In 3 Minutes, Kafka core architecture, 0:32 to 1:01, The architecture in half a minute, followed by use cases and lim..."), [◆](../../../../../../goal-setting/learning/data-engineering/many-sources-one-lakehouse/plans/18-c2-kafka-by-hand.md "Running Kafka: produce and consume by hand, data-engineering/many-sources-one-lakehouse, plan 18. A broker in Docker, a topic you create, and a producer and ...")</sub>**: No high-frequency event streaming
- ❌ **ElasticSearch**: PostgreSQL [full-text search](../../../../../../Obsidian/Information%20Technology/System%20Design/Full-Text%20Search.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=503 "AI engineering, chapter 6, Term-based retrieval, Works it with numbers: term frequency, then inverse document frequency (a term in 5 of 10 documents has IDF ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/natural-language-processing/hands-on-large-language-models.pdf#page=326 "Hands-on large language models, chapter 8, Dense retrieval, BM25 keyword search written in Python with `rank_bm25`, then run on the same question as dense re..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=241 "System design big archive, 5 Data Structures That Make DB Queries Super Fast, The inverted index in two sentences, beside the hash and bitmap indexes."), [▶1](https://www.youtube.com/watch?v=iHHqnyThrqE&t=213s "Arpit Bhayani, Inverted Index - The Data Structure Behind Search Engines, Building an inverted index, 3:33 to 6:23, Building the index, after chapters on why..."), [▶2](https://www.youtube.com/watch?v=PuZvF2EyfBM&t=1944s "Hello Interview, Elasticsearch Deep Dive, Inverted Indexes, 32:24 to 35:09, The inverted index inside Elasticsearch's Lucene segments, in a long walk through..."), [◆](../../../../../../goal-setting/learning/ai-engineering/one-business-end-to-end/plans/52-keyword-search-against-vector-search.md "Keyword search against vector search: BM25 beside embeddings on the same documents and twenty questions, ai-engineering/one-business-end-to-end, plan 52. Wor...")</sub> is fine for MVP
- ❌ **Service mesh**: Too complex without [microservices](../../../../../../Obsidian/Information%20Technology/System%20Design/Microservices.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=258 "System design big archive, The Evolution of Scaling at Netflix, Works one company's path: the monolithic NCCP application, its features extracted into micros..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=441 "System design big archive, A picture is worth a thousand words: 9 best practices for developing microservices, Nine rules, from a separate data store and a s..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=353 "System design big archive, What are Modular Monoliths?, The monolith as one deployment unit, microservices as many, and the modular monolith in between, with..."), [▶1](https://www.youtube.com/watch?v=T-m7ZFxeg1A&t=240s "Hussein Nasser, Microservices Explained and their Pros & Cons, Microservices Example, 4:00 to 8:00, A traditional service split into microservices on an exam..."), [▶2](https://www.youtube.com/watch?v=lTAcCNbJ7KE&t=42s "ByteByteGo, What Are Microservices Really All About? (And When Not To Use It), How microservices work, 0:42 to 1:27, The working parts, followed by independe..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/01-requirements-and-table-ownership.md "Requirements, and who owns which table, system-design/foundations, plan 01. Decides which of the corner shop's four services owns each of the seven tables in...")</sub>
- ❌ **[GraphQL](../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/GraphQL.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, The single endpoint and nested field selection, mutations and subscriptions, then the costs: complexity move..."), [▶1](https://www.youtube.com/watch?v=fVmQCnQ_EPs&t=1079s "Hussein Nasser, GraphQL Crash Course, GraphQL examples, 17:59 to 30:14, Queries worked as examples, after the chapters on core concepts and on schema and ope..."), [▶2](https://www.youtube.com/watch?v=yWzKJPw_VzM&t=52s "ByteByteGo, What Is GraphQL? REST vs. GraphQL, GraphQL vs REST, 0:52 to 2:27, GraphQL set against REST, before chapters on its benefits and its drawbacks. Ch..."), [◆](../../../../../../goal-setting/learning/system-design/api-design-and-contracts/MASTER_PLAN.md "System Design: API Design and Contracts, system-design/api-design-and-contracts. One resource built as a REST API, a gRPC service and a GraphQL schema, with ...")</sub>**: [REST](../../../../../../Obsidian/Information%20Technology/System%20Design/APIs/REST%20API.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=121 "System design interview, chapter 8, Design a URL shortener, Works two REST-style endpoints for one service, `POST api/v1/data/shorten` taking the long URL an..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=411 "System design big archive, What is a REST API?, The six constraints an API must follow to be RESTful: client-server, stateless, uniform interface, cacheable,..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=234 "System design big archive, REST API Vs. GraphQL, REST's HTTP methods for CRUD and its easy caching, against the several round trips it may need to assemble r..."), [▶1](https://www.youtube.com/watch?v=M3XQ6yEC51Q&t=1098s "Hussein Nasser, REST API Pros and Cons (Explained by Example), REST API github api, 18:18 to 25:45, A real REST API worked through, after the chapters on rep..."), [▶2](https://www.youtube.com/watch?v=-mN3VyJuCjM&t=47s "ByteByteGo, What Is REST API? Examples And How To Use It: Crash Course System Design #3, REST API Basics, 0:47 to 2:05, The basics, followed by a chapter on ..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/plans/19-curl-against-rest-mock.md "curl against a REST mock, ai-engineering/product-data-validation-end-to-end, plan 19. `curl` against two running mocks, reading the status line, headers and ...")</sub> works fine, no mobile app yet

## Key Takeaway

Production is all about durability, [observability](../../../../../../Obsidian/Information%20Technology/DevOps/Observability.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=885 "AI engineering, chapter 10, Logs and traces, Works a debugging session: metrics say something broke five minutes ago, the logs from that moment say what happ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=877 "AI engineering, chapter 10, Monitoring and Observability, What monitoring is for, the three numbers that grade it (mean time to detection, mean time to respo..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=26 "System design interview, chapter 1, Logging, metrics, automation, Error logs aggregated in one place, and host, tier-level and business metrics, as the tools..."), [▶1](https://www.youtube.com/watch?v=f4W_eEJC-20&t=284s "KodeKloud, How Prometheus Monitoring Works: Explaining Prometheus Architecture, Prometheus Architecture, 4:44 to 10:50, Prometheus's parts, before the chapte..."), [▶2](https://www.youtube.com/watch?v=AZhIjNHzURQ&t=53s "Gaurav Sen, Google Dapper, a Large-Scale Distributed Systems Tracing Infrastructure, Request Tracing Requirements, 0:53 to 3:59, What tracing one request acr..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/23-one-order-one-trace.md "One order, one trace, system-design/foundations, plan 23. Every service instrumented with OpenTelemetry and one order's trace opened in Jaeger as a waterfall...")</sub>, and automation. You're not adding features; you're adding safeguards. Start with the checklist above. Skip the rest until you have a real problem.
