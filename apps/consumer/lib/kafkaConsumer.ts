import { Kafka, type Consumer, logLevel } from "kafkajs";
import { env } from "../config/env";

function getSslConfig() {
  if (!env.kafkaSsl) return undefined;
  return {
    rejectUnauthorized: false,
  };
}

const kafka = new Kafka({
  clientId: "notification-consumer1",
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


let consumer: Consumer | null = null;

export async function getKafkaConsumer(): Promise<Consumer> {
  if (!consumer) {
    consumer = kafka.consumer({ groupId: env.kafkaGroupId });
    await consumer.connect();
    console.log(`[Kafka Consumer1] Connected to Kafka brokers: [${env.kafkaBrokers.join(", ")}]`);
  }
  return consumer;
}

export async function disconnectKafkaConsumer(): Promise<void> {
  if (consumer) {
    await consumer.disconnect();
    consumer = null;
    console.log(`[Kafka Consumer1] Disconnected from Kafka.`);
  }
}
