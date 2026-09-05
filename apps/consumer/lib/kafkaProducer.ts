import { Kafka, type Producer, logLevel } from "kafkajs";
import { env } from "../config/env";

function getSslConfig() {
  if (!env.kafkaSsl) return undefined;
  return {
    rejectUnauthorized: false,
  };
}

const kafka = new Kafka({
  clientId: "notification-consumer1-dlq-producer",
  brokers: env.kafkaBrokers,
  ssl: getSslConfig(),
  sasl: env.kafkaSaslUsername
    ? {
        mechanism: (env.kafkaSaslMechanism as any) || "scram-sha-512",
        username: env.kafkaSaslUsername,
        password: env.kafkaSaslPassword,
      }
    : undefined,
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 300,
    retries: 3,
  },
});


let dlqProducer: Producer | null = null;

export async function getKafkaDLQProducer(): Promise<Producer> {
  if (!dlqProducer) {
    dlqProducer = kafka.producer();
    await dlqProducer.connect();
    console.log(`[Kafka DLQ Producer] Connected to Kafka brokers: [${env.kafkaBrokers.join(", ")}]`);
  }
  return dlqProducer;
}

export async function publishToKafkaDLQ(payload: any): Promise<boolean> {
  try {
    const producer = await getKafkaDLQProducer();
    const messageKey = payload.event?.tenantId
      ? `${payload.event.tenantId}:${payload.event.userId || payload.event.eventId}`
      : payload.event?.eventId || `dlq_${Date.now()}`;

    await producer.send({
      topic: env.kafkaDlqTopic,
      messages: [
        {
          key: messageKey,
          value: JSON.stringify(payload),
          timestamp: Date.now().toString(),
        },
      ],
    });

    console.log(`[Kafka DLQ Producer] Event published to Kafka DLQ Topic "${env.kafkaDlqTopic}" with key "${messageKey}"`);
    return true;
  } catch (err: any) {
    console.error(`[Kafka DLQ Producer Error] Failed to produce message to DLQ topic:`, err.message);
    return false;
  }
}

export async function disconnectKafkaDLQProducer(): Promise<void> {
  if (dlqProducer) {
    await dlqProducer.disconnect().catch(() => {});
    dlqProducer = null;
    console.log(`[Kafka DLQ Producer] Disconnected gracefully.`);
  }
}
