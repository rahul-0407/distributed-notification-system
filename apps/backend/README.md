# ⚙️ Backend API Gateway (`apps/backend`)

The core RESTful API service for the **Distributed Notification System**. Built with **Express.js** running on **Bun**, managing multi-tenant authentication, API keys, Kafka message publishing, and telemetry analytics endpoints.

## 🚀 Features

- **Multi-Tenant Auth & RBAC**: Tenant signup, login, and JWT cookie management (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`).
- **Platform Admin Auth**: Dedicated Super Admin login and global oversight routes.
- **API Key Engine**: SHA-256 hashed live keys (`key_live_...`) with revocation and usage tracking.
- **Notification Event Ingestion**: `POST /api/v1/notifications` validates payload, resolves recipient, persists record to Postgres, and publishes to Apache Kafka.
- **Telemetry & Analytics**: Comprehensive delivery metrics, user notifications, date filters, and attempt audit logs.

## 🛠️ Run Locally

```bash
# Run in dev mode with hot reload
bun run dev

# Run in production mode
bun run start
```

## 🌐 Key Endpoints

- `GET /health` - Service health status
- `POST /api/v1/notifications` - Ingest & publish notification event
- `POST /api/v1/tenants/signup` - Register tenant organization & owner
- `POST /api/v1/tenants/auth/login` - Member authentication
- `GET /api/v1/analytics/notifications/tenant/:tenantId/stats` - Tenant telemetry
