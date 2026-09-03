import { Kafka, type Consumer } from "kafkajs";
import { env } from "../config/env";

const kafka = new Kafka({
  clientId: "notification-consumer1",
  brokers: env.kafkaBrokers,
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
