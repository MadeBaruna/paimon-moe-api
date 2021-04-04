# Paimon.moe API

An API for Paimon.moe

# Requirements
- Node.js 14
- PostgreSQL

# Deployment
You need a firebase service account saved as `google-service-account.json` for the notification service.  
Then change the volumes path in `docker-compose.yml` and `.env` with the directory of your service account json.
```
cp .env.example .env
vi .env
docker-compose up -d
```
