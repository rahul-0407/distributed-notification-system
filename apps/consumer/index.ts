import type { EachMessagePayload } from "kafkajs";
import { env } from "./config/env";
import { getKafkaConsumer, disconnectKafkaConsumer } from "./lib/kafkaConsumer";
import { isDuplicateEvent, markEventProcessed } from "./services/idempotency";
import { dispatchNotificationEvent } from "./services/dispatcher";
import { sendToDeadLetterQueue } from "./services/dlqService";
import type { NotificationEvent } from "./types";

async function startConsumerWorker(): Promise<void> {
  console.log(`[Notification Consumer Worker] Starting worker service...`);
  console.log(`[Config] Topic: ${env.kafkaTopic} | Group: ${env.kafkaGroupId} | Brokers: ${env.kafkaBrokers}`);

  try {
    const consumer = await getKafkaConsumer();

    await consumer.subscribe({
      topic: env.kafkaTopic,
      fromBeginning: false,
    });

    console.log(`[Notification Consumer Worker] Subscribed to topic "${env.kafkaTopic}". Listening for events...`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {

        const rawPayload = message.value?.toString();
        if (!rawPayload) return;

        try {
          const event: NotificationEvent = JSON.parse(rawPayload);
          console.log(`[Event Received] Topic: ${topic} | Partition: ${partition} | EventID: ${event.eventId} | User: ${event.userId}`);

          const duplicate = await isDuplicateEvent(event);
          if (duplicate) {
            console.log(`[Deduplicated] Event ${event.eventId} already processed. Skipping.`);
            return;
          }

          const results = await dispatchNotificationEvent(event);

          await markEventProcessed(event);

          console.log(`[Event Processed Successfully] EventID: ${event.eventId} | Results:`, results);
        } catch (err: any) {
          console.error(`[Processing Error] Failed to process message from topic ${topic}:`, err.message);
          try {
            const fallbackEvent: NotificationEvent = JSON.parse(rawPayload);
            await sendToDeadLetterQueue(fallbackEvent, err);
          } catch {
            console.error(`[DLQ Error] Unparseable message payload: ${rawPayload}`);
          }
        }
      },
    });
  } catch (error: any) {
    console.error(`[Fatal Consumer Worker Error]:`, error.message);
    process.exit(1);
  }
}


async function handleShutdown(signal: string) {
  console.log(`\n[Shutdown] Received ${signal}. Gracefully stopping consumer worker...`);
  await disconnectKafkaConsumer();
  process.exit(0);
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));


startConsumerWorker();