import { Kafka, type Consumer, logLevel } from "kafkajs";
import { env } from "../config/env";

function getSslConfig() {
  if (!env.kafkaSsl) return undefined;
  return {
    rejectUnauthorized: false,
  };
}



const kafka = new Kafka({
  clientId: env.kafkaClientId,
  brokers: env.kafkaBrokers.split(",").map((b) => b.trim()),
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
    initialRetryTime: 500,
    retries: 10,
  },
});

let consumer: Consumer | null = null;

export async function getKafkaConsumer(): Promise<Consumer> {
  if (consumer) return consumer;

  consumer = kafka.consumer({
    groupId: env.kafkaGroupId,
    allowAutoTopicCreation: true,
  });

  await consumer.connect();  
  console.log(`[Kafka Consumer] Worker connected to Kafka brokers successfully.`);
  return consumer;
}

export async function disconnectKafkaConsumer(): Promise<void> {
  if (consumer) {
    await consumer.disconnect().catch(() => {});
    consumer = null;
    console.log("[Kafka Consumer] Worker disconnected gracefully.");
  }
}
