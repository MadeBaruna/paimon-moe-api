# Paimon.moe API

An API for Paimon.moe

# Requirements
- Node.js 14
- PostgreSQL

# Deployment
You need a firebase service account saved as `./service_account/google-service-account.json` for the notification service
```
cp .env.example .env
vi .env
docker-compose up -d
```
