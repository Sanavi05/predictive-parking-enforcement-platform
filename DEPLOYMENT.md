# Deployment Guide

This project is easiest and most reliable to deploy as a single Docker Compose stack on an Ubuntu VPS.

The production stack contains:

- PostgreSQL/PostGIS database
- FastAPI backend
- React static frontend served by Nginx
- Nginx proxy from `/api` to the backend

Reviewers only need one public URL.

## Recommended Server

Use a small Ubuntu 22.04 or 24.04 VPS.

Minimum recommended size:

- 2 vCPU
- 4 GB RAM
- 40 GB disk

Good providers:

- DigitalOcean Droplet
- AWS Lightsail
- Hetzner Cloud
- Azure VM
- Any Ubuntu VPS with Docker support

## 1. Prepare The Repository

Commit and push the latest code to GitHub.

Do not include:

- `frontend/node_modules`
- `frontend/dist`
- `.env`
- `.git`
- `datasets/original_dataset.csv`

The production app needs:

- `datasets/parksight_processed.csv`
- `datasets/model1_hotspot_classifier.csv`
- `datasets/model2_volume_predictor.csv`
- `datasets/model3_congestion_scorer.csv`
- `models/volume/*`
- `models/hotspot/*`
- `models/congestion/*`

## 2. Create The Server

Create an Ubuntu VPS and connect with SSH:

```bash
ssh root@YOUR_SERVER_IP
```

Update packages:

```bash
apt update
apt upgrade -y
```

Install Docker:

```bash
apt install -y ca-certificates curl gnupg git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verify Docker:

```bash
docker --version
docker compose version
```

## 3. Clone The Project

```bash
git clone YOUR_REPOSITORY_URL parksight-ai
cd parksight-ai
```

## 4. Configure Production Environment

```bash
cp .env.production.example .env
nano .env
```

Set a strong database password:

```text
POSTGRES_DB=parksight
POSTGRES_USER=parksight
POSTGRES_PASSWORD=replace-with-a-strong-password
BACKEND_CORS_ORIGINS=http://YOUR_SERVER_IP
PUBLIC_PORT=80
```

If you use a domain, set:

```text
BACKEND_CORS_ORIGINS=https://your-domain.com
PUBLIC_PORT=80
```

## 5. Start The Production Stack

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Check containers:

```bash
docker compose -f docker-compose.prod.yml ps
```

View logs:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

The backend should log that it loaded:

- volume model
- hotspot model
- congestion model

It should also seed the `violations` table from `datasets/parksight_processed.csv`.

## 6. Open The Demo

Open:

```text
http://YOUR_SERVER_IP
```

Backend docs are available through the same frontend container proxy:

```text
http://YOUR_SERVER_IP/api/docs
```

Health check:

```text
http://YOUR_SERVER_IP/api/health
```

## 7. Reset And Reseed The Database

Only do this if you want to clear the database volume and reseed from the processed dataset.

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up --build -d
```

## 8. Update Deployment After Code Changes

```bash
git pull
docker compose -f docker-compose.prod.yml up --build -d
```

## Troubleshooting

If the frontend loads but API calls fail:

```bash
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs backend
```

If models fail to load, confirm these files exist on the server:

```bash
find models -maxdepth 3 -type f
```

If the database is unhealthy:

```bash
docker compose -f docker-compose.prod.yml logs db
```

If port 80 is already in use:

```bash
nano .env
```

Change:

```text
PUBLIC_PORT=8080
```

Then run:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Open:

```text
http://YOUR_SERVER_IP:8080
```
