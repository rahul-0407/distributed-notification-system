# 🗄️ Database & Prisma ORM Package (`packages/db`)

Shared database package providing **Prisma ORM** models, database migrations, and pre-configured database client for the Distributed Notification System.

## 🗃️ Models Overview

- `PlatformAdmin`: Global platform administrators
- `Tenant`: Organization accounts and settings
- `TenantMember`: Organization members with role permissions
- `EndUser`: Recipients receiving notifications across tenants
- `ApiKey`: Hashed secret keys for API authentication
- `Notification`: Main notification logs and current statuses
- `NotificationAttempt`: Channel-level execution attempt audit logs
- `IdempotencyKey`: Event deduplication records

## 🛠️ Prisma Commands

```bash
# Generate Prisma Client
bun run prisma generate

# Push Schema to PostgreSQL database
bun run prisma db push

# Launch Prisma Studio (GUI)
bun run prisma studio
```
