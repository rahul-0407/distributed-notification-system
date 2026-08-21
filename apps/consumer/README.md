# ⚡ Notification Consumer Worker (`apps/consumer`)

The background event processor for the **Distributed Notification System**. Built with **KafkaJS** and **Bun**, subscribing to Apache Kafka topics, guaranteeing idempotency, and executing multi-channel notification dispatches.

## 🚀 Features

- **Kafka Consumer Loop**: Listens on topic `notification-events` (`notification-consumer-group`).
- **Idempotency & Deduplication**: Prevents duplicate event processing via database and cache checks.
- **Multi-Channel Dispatchers**: Isolated delivery executors for **Email**, **SMS**, **Push**, and **Webhooks**.
- **Exponential Backoff & Retries**: Automated attempt tracking with configurable retry policies (up to 3 attempts with exponential backoff).
- **Dead Letter Queue (DLQ)**: Sends unprocessable or failed events to `notification-events-dlq` topic.

## 🛠️ Run Locally

```bash
# Run worker in hot reload mode
bun run dev

# Run in production mode
bun run start
```
