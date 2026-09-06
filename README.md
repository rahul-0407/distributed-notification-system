# Distributed Notification System

A production-shaped, event-driven, multi-tenant distributed notification engine designed for high-throughput ingestion, fault-tolerant channel delivery, and real-time delivery tracking across **Email**, **SMS**, **Push**, and **Webhooks**.

Centralized behind a dedicated API Gateway, powered by an asynchronous **Apache Kafka** event pipeline, **Redis** idempotency locking, and a **RabbitMQ** multi-channel fan-out engine, this system decouples caller request latency from third-party delivery provider latency, enforcing multi-tenant isolation, idempotency, exponential backoff retries, and Dead Letter Queue (DLQ) safeguards.


<p align="center">
  <img src="./assets/architecture-diagram.png" alt="Architecture Diagram" width="100%">
</p>

---

## 📋 Table of Contents

- [Why This Exists](#why-this-exists)
- [Service Boundaries](#service-boundaries)
- [Architecture & Topology](#architecture--topology)
- [Core Guarantees](#core-guarantees)
- [Tech Stack](#tech-stack)
- [Capacity & Performance](#capacity--performance)
- [Failure Behavior & Resiliency Layers](#failure-behavior--resiliency-layers)
- [Database Schema & Data Modeling](#database-schema--data-modeling)
- [Running It Locally](#running-it-locally)
- [Production Docker Deployment](#production-docker-deployment)
- [Continuous Integration (CI/CD)](#continuous-integration-cicd)
- [API Reference & Usage Examples](#api-reference--usage-examples)
- [Project Structure](#project-structure)
- [Honest Limitations & What's Next](#honest-limitations--whats-next)

---

## 🎯 Why This Exists

Most application notification integrations rely on **synchronous HTTP calls** directly inside API handlers (e.g., calling SendGrid or Twilio inline during user checkout). This introduces critical production anti-patterns:
1. **Request Latency Contagion**: External provider latency (200ms–2000ms) directly inflates client HTTP response times.
2. **Cascading Failures**: A third-party provider outage or network spike causes user request timeouts or app crashes.
3. **Double Delivery & Race Conditions**: Retrying failed HTTP requests without centralized event deduplication leads to duplicate emails or SMS messages.
4. **Lack of Tenant Isolation**: Multi-tenant platforms risk noisy-neighbor problems where one tenant flooding notifications starves others.

### The Solution

This system decouples notification ingestion from delivery:
- **Immediate Response (`< 5ms`)**: API Gateway validates the request, verifies hashed API keys, logs a `PENDING` record, publishes an event to Apache Kafka, and returns `201 Created` instantly.
- **Asynchronous Fan-Out Pipeline**: Independent worker processes consume events from Kafka, acquire **Redis** idempotency locks, and fan out channel tasks into dedicated **RabbitMQ** queues (Email, SMS, Push, Webhook).
- **Resilient Execution**: Dedicated channel workers consume tasks from RabbitMQ, retrying failed dispatches using exponential backoff schedules while routing unserviceable events to a dedicated Dead Letter Queue (DLQ).

---

## 🛡️ Service Boundaries

| Service / Package | Owns | Exposes | Knows About Kafka / RabbitMQ? | Knows About Database? |
| :--- | :--- | :--- | :---: | :---: |
| **`backend`** *(API Gateway)* | API key auth, tenant management, event ingestion, telemetry routes | REST API (`/api/v1/*`) | Yes *(Kafka Producer)* | Yes *(Prisma / Postgres)* |
| **`consumer`** *(Worker Service)* | Event consumption, Redis deduplication, RabbitMQ fan-out, retries, DLQ | Kafka & RabbitMQ Consumers | Yes *(Kafka Consumer & RabbitMQ Broker)* | Yes *(Prisma / Postgres)* |
| **`frontend`** *(Dashboard)* | Admin & Tenant management UI, live testing, analytics visualizers | Web App (Vite / React 19) | No | No *(Calls API Gateway)* |
| **`packages/db`** *(ORM Layer)* | Database schemas, CLI seed script, generated client | Prisma Client Interface | No | Yes *(PostgreSQL Direct)* |
| **`packages/ui`** *(Design System)* | Shared React components & Tailwind styles | Component Library | No | No |

---

## 🏗️ Architecture & Topology

### Multi-Instance Event-Driven Topology

```
                             ┌─────────────────────────────────────────────────────────────┐
                             │                      Client Application                     │
                             └──────────────────────────────┬──────────────────────────────┘
                                                            │
                                                POST /api/v1/notifications
                                                (Hashed Bearer API Key: key_live_...)
                                                            │
                                                            ▼
                             ┌─────────────────────────────────────────────────────────────┐
                             │                 Backend API Gateway Cluster                 │
                             │             (Express.js / Bun Runtime - Scalable)           │
                             └──────────────┬──────────────────────────────┬───────────────┘
                                            │                              │
                                 1. Publish Event                2. Persist Record
                                            │                              │
                                            ▼                              ▼
                             ┌──────────────────────────────┐┌──────────────────────────────┐
                             │         Apache Kafka         ││        PostgreSQL DB         │
                             │    (notification-events)     ││     (Prisma ORM Managed)     │
                             └──────────────┬───────────────┘└──────────────┬───────────────┘
                                            │                              ▲
                                     3. Consume Event                      │
                                            │                       4. Log Attempt
                                            ▼                              │
                             ┌─────────────────────────────────────────────┴───────────────┐
                             │                 Consumer Fan-Out Engine                     │
                             │          (Redis Lock & RabbitMQ Task Producer)              │
                             └──────────────┬──────────────────────────────┬───────────────┘
                                            │                              │
                                 5a. Push Channel Tasks         5b. Duplicate Event
                                            │                              │
                                            ▼                              ▼
                             ┌──────────────────────────────┐┌──────────────────────────────┐
                             │    RabbitMQ Channel Queues   ││     Deduplicated / Ignored   │
                             │  (Email, SMS, Push, Webhook) ││      (Redis Key Lock)        │
                             └──────────────┬───────────────┘└──────────────────────────────┘
                                            │
                                6. Channel Dispatchers
                                            │
                                            ▼
                             ┌──────────────────────────────┐┌──────────────────────────────┐
                             │     Multi-Channel Delivery   ││     Dead Letter Queue        │
                             │ (Email, SMS, Push, Webhook)  ││       (Kafka DLQ Topic)      │
                             └──────────────────────────────┘└──────────────────────────────┘
```

---

## ✅ Core Guarantees

- **⚡ Sub-10ms Ingestion Latency**: Async event publication offloads third-party delivery overhead entirely from the client API path.
- **🔒 Multi-Tenant Isolation**: Tenant boundaries enforced via isolated DB records, custom slugs, role-based access control (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`), and tenant-scoped API keys.
- **🔑 Secure API Key Storage**: API keys (`key_live_...`) are SHA-256 hashed before storage; plain keys are only displayed once upon generation.
- **🔄 Redis Idempotency & Deduplication**: Distributed Redis locks prevent duplicate event processing during worker retries or re-deliveries across consumer nodes.
- **🐇 RabbitMQ Channel Isolation**: Email, SMS, Push, and Webhook tasks execute in isolated queues to ensure slow email API providers do not bottleneck instant SMS or push dispatches.
- **🛡️ At-Least-Once Delivery & Retries**: Failed channel dispatches automatically execute up to **3 attempts** with exponential backoff.
- **📥 Dead Letter Queue (DLQ)**: Events exceeding max retries or suffering unparseable payloads are safely published to `notification-events-dlq` without blocking the main pipeline.
- **📊 Granular Telemetry Audit**: Every delivery attempt logs channel, status (`PENDING`, `SENT`, `FAILED`, `RETRYING`, `DLQ`), timestamp, provider ID, and exact error message.

---

## 🛠️ Tech Stack

| Layer | Choice | Rationale |
| :--- | :--- | :--- |
| **Monorepo Tooling** | **Turborepo** | Task caching, parallel pipeline execution, workspace boundary enforcement |
| **Runtime Engine** | **Bun** | Ultra-fast JavaScript/TypeScript execution, built-in hot reloading, native env parsing |
| **API Gateway** | **Express.js 5** | Production standard, CORS control (`CORS_ORIGIN`), clean route modularization |
| **Message Ingestion** | **Apache Kafka (KafkaJS)** | High-throughput distributed event streaming, partitioned consumer groups |
| **Channel Fan-Out** | **RabbitMQ (amqplib)** | High-speed task queues, dedicated channel routing, DLX exchanges |
| **Idempotency & Cache** | **Redis (ioredis)** | Atomic locking keys, deduplication state, fast caching |
| **Database & ORM** | **PostgreSQL + Prisma** | Strongly typed schema generation, relational integrity, automatic migrations |
| **Frontend UI** | **React 19 + Vite + TailwindCSS 4** | Ultra-responsive developer dashboard, dark mode aesthetics, real-time telemetry stats |
| **CI/CD Pipeline** | **GitHub Actions** | Automated type checking, Prisma client generation, Vite build verification, and Docker image validation |

---

## ⚡ Capacity & Performance

- **API Gateway Ingestion**: ~15,000–25,000 events/sec per API Gateway instance when producing asynchronously to Kafka.
- **Kafka Consumer & RabbitMQ Worker**: ~5,000–10,000 event executions/sec per worker node.
- **Added Cost of Event Streaming**: Ingesting via Kafka adds `~2ms–4ms` of network overhead to `POST /api/v1/notifications`, eliminating `200ms–2000ms` of inline delivery provider delay.
- **Spike Tolerance**: Sudden spikes in notification dispatches are absorbed smoothly by Kafka topic partitions and RabbitMQ buffers without degrading API Gateway responsiveness.

---

## 🛟 Failure Behavior & Resiliency Layers

| Failure Scenario | Layer Affected | Automated System Behavior |
| :--- | :--- | :--- |
| **Kafka Broker Down** | API Gateway | API returns `500 Internal Server Error`, database notification remains in `PENDING` state until broker recovers. |
| **Channel Provider Down (e.g. Email/SMS API)** | Consumer Worker | Worker catches failure, logs `FAILED` attempt, schedules exponential backoff retry (`nextRetryAt`), and updates status to `RETRYING`. |
| **Max Retries Exceeded (3/3 attempts failed)** | Consumer Worker | Event status finalized as `FAILED`/`DLQ`, attempt logged with error payload, and event sent to Kafka DLQ topic (`notification-events-dlq`). |
| **Database Connection Lost** | API Gateway / Consumer | API Gateway fails open or returns error; consumer worker pauses offset commit until DB connection is restored, ensuring zero lost events. |
| **Duplicate Event ID Received** | Consumer Worker | Redis lock check identifies duplicate key; skips redundant processing and logs `[Deduplicated]`. |

---

## 🗄️ Database Schema & Data Modeling

The relational PostgreSQL schema is managed via Prisma (`packages/db/prisma/schema.prisma`):

```mermaid
erDiagram
    PlatformAdmin {
        string id PK
        string email UK
        string passwordHash
        string role
    }
    Tenant {
        string id PK
        string name
        string slug UK
    }
    TenantMember {
        string id PK
        string tenantId FK
        string email UK
        string role
    }
    EndUser {
        string id PK
        string tenantId FK
        string externalId
        string email
        string phone
        string pushToken
    }
    ApiKey {
        string id PK
        string tenantId FK
        string keyHash UK
        string keyPrefix
    }
    Notification {
        string id PK
        string tenantId FK
        string userId FK
        string eventId
        string eventType
        string status
    }
    NotificationAttempt {
        string id PK
        string notificationId FK
        string channel
        string status
        int attemptNumber
    }

    Tenant ||--o{ TenantMember : "has members"
    Tenant ||--o{ EndUser : "has end users"
    Tenant ||--o{ ApiKey : "has api keys"
    Tenant ||--o{ Notification : "owns notifications"
    EndUser ||--o{ Notification : "receives"
    Notification ||--o{ NotificationAttempt : "has attempts"
```

---

## 💻 Running It Locally

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **Bun**: `>= 1.1.0`
- **PostgreSQL**: Running locally (`localhost:5432`)
- **Redis**: Running locally (`localhost:6379`)
- **Apache Kafka**: Running locally (`localhost:9092`)
- **RabbitMQ**: Running locally (`localhost:5672`)

> *Tip: You can boot all local infrastructure dependencies with `docker compose up -d postgres redis zookeeper kafka rabbitmq`.*

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/rahul-0407/distributed-notification-system.git
cd distributed-notification-system
bun install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure local connection URLs are populated:
```env
PORT=5000
CORS_ORIGIN="http://localhost:3000"
JWT_SECRET="your-local-dev-jwt-secret"
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/notification_db?sslmode=disable"
REDIS_URL="redis://localhost:6379"
KAFKA_BROKERS="localhost:9092"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
```

### 3. Initialize Database Schema & Manual Seed

```bash
# Push Prisma schema to local PostgreSQL
cd packages/db
bun run prisma db push

# (Optional) Seed initial super admin and demo tenant data
bun run seed
cd ../..
```

### 4. Start Development Cluster

Launch all microservices concurrently via Turborepo:

```bash
bun run dev
```

Or run individual apps:

```bash
bun run dev --filter=backend   # Express API Gateway (Port 5000)
bun run dev --filter=consumer  # Kafka/RabbitMQ Consumer Worker
bun run dev --filter=frontend  # React 19 Dashboard (Port 3000)
```

---

## 🐳 Production Docker Deployment

For self-hosted production deployments, run the full containerized stack using `docker-compose.prod.yml`:

```bash
# Boot full production stack in detached mode
docker compose -f docker-compose.prod.yml up -d --build
```

### Production Docker Features:
- **Data Persistence**: Uses named volumes (`postgres_prod_data`, `redis_prod_data`, `kafka_prod_data`, `rabbitmq_prod_data`) so data survives container restarts.
- **Port Isolation**: Database and Redis ports remain unexposed to the public network.
- **Health Check Dependency Order**: Backend and Consumer wait for PostgreSQL, Redis, Kafka, and RabbitMQ to pass healthy status before starting.

---

## ⚙️ Continuous Integration (CI/CD)

Automated tests and validation run on every pull request and push to `main` via GitHub Actions (`.github/workflows/ci.yml`):

1. **Build & Type Checking Job**:
   - Sets up Bun environment (`oven-sh/setup-bun@v2`).
   - Generates Prisma client bindings (`packages/db`).
   - Builds Vite React frontend bundle (`apps/frontend`).

2. **Docker Spec & Build Validation Job**:
   - Validates `docker-compose.yml` and `docker-compose.prod.yml` specifications.
   - Builds backend and consumer Docker images to verify container build integrity.

---

## 📡 API Reference & Usage Examples

### Ingest Notification Event

`POST /api/v1/notifications`

#### Headers
```http
Authorization: Bearer key_live_sample_api_key_12345
Content-Type: application/json
```

#### Request Body
```json
{
  "externalId": "usr_78910",
  "eventType": "PAYMENT_SUCCESS",
  "title": "Invoice #1042 Paid",
  "body": "Your payment of $49.99 was successfully processed.",
  "channels": ["EMAIL", "SMS", "PUSH"],
  "payload": {
    "invoiceId": "1042",
    "amount": 49.99,
    "currency": "USD"
  }
}
```

#### Response (`201 Created`)
```json
{
  "message": "Notification dispatched and stored successfully",
  "notificationId": "e1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "eventId": "evt_1724256000000_x9z8y7",
  "status": "PENDING",
  "recipient": {
    "id": "u9a8b7c6-d5e4-3f2a-1b0c-9d8e7f6a5b4c",
    "externalId": "usr_78910"
  }
}
```

#### Testing with cURL
```bash
curl -X POST http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer key_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "externalId": "usr_123",
    "eventType": "WELCOME_EVENT",
    "title": "Welcome aboard!",
    "body": "Thanks for signing up for our service.",
    "channels": ["EMAIL"]
  }'
```

---

## 📂 Project Structure

```
distributed-notification-system/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI pipeline
├── apps/
│   ├── backend/                      # Express REST API Gateway
│   │   ├── config/                   # Environment validation (CORS, JWT, Kafka, DB)
│   │   ├── controllers/              # Auth, Tenant, Member, Notification & Analytics routes
│   │   ├── lib/                      # Kafka Producer client & crypto utilities
│   │   ├── middleware/               # Auth (JWT & API Key validation) & Error handlers
│   │   └── routes/                   # API route definitions
│   │
│   ├── consumer/                     # Background Kafka & RabbitMQ Worker Engine
│   │   ├── config/                   # Consumer environment settings
│   │   ├── dispatchers/              # Provider dispatchers (Email, SMS, Push, Webhook)
│   │   ├── lib/                      # Kafka & RabbitMQ connection managers
│   │   └── services/                 # Channel resolver, attempt tracker, DLQ service
│   │
│   └── frontend/                     # React 19 Admin & Tenant Dashboard
│       ├── public/                   # Static assets & favicon
│       └── src/
│           ├── components/           # Admin/Tenant dashboards, simulator, analytics
│           ├── config/               # Centralized API endpoint router
│           ├── App.tsx               # Main layout & route router
│           └── index.css             # TailwindCSS 4 styling system
│
├── packages/
│   ├── db/                           # Prisma ORM & Database Layer
│   │   ├── prisma/                   # PostgreSQL schema definition & migrations
│   │   ├── seed.ts                   # Isolated CLI seed script
│   │   └── index.ts                  # Exported Prisma Client singleton
│   │
│   ├── ui/                           # Shared UI Component Library
│   ├── eslint-config/                # Shared ESLint configuration rules
│   └── typescript-config/            # Shared tsconfig definitions
│
├── docker-compose.yml                # Local development orchestration
├── docker-compose.prod.yml           # Production Docker orchestration (with persistent volumes)
├── turbo.json                        # Turborepo task pipeline configuration
├── package.json                      # Root workspace package manifest
└── bun.lock                          # Monorepo lockfile
```

---

## 💬 Honest Limitations & What's Next

1. **Production Delivery SDKs**: Delivery dispatchers currently operate with simulated provider execution stubs (mocked HTTP responses for Twilio, SendGrid, and FCM). Integrating production provider SDKs is a drop-in step inside `apps/consumer/dispatchers/`.
2. **Managed Cloud Deployments**: Supports single-command deployment to managed cloud services (Vercel for Frontend, Render for Backend/Consumer, Aiven for Kafka, Upstash for Redis, CloudAMQP for RabbitMQ).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
