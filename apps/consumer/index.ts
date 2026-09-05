import type { EachMessagePayload } from "kafkajs";
import { env } from "./config/env";
import { getKafkaConsumer, disconnectKafkaConsumer } from "./lib/kafkaConsumer";
import { initRabbitMQTopology, closeRabbitMQ } from "./lib/rabbitmq";
import { isDuplicateEvent, markEventProcessed } from "./services/idempotency";
import { fanoutNotificationEventToRabbitMQ } from "./services/fanoutRouter";
import { sendToDeadLetterQueue } from "./services/dlqService";
import { startAllQueueWorkers } from "./workers";
import type { NotificationEvent } from "./types";
import { disconnectKafkaDLQProducer } from "./lib/kafkaProducer";

async function startConsumerWorker(): Promise<void> {
  console.log(`[Notification Consumer1 - Fan-Out Engine] Starting service...`);

  try {
    await initRabbitMQTopology();
    await startAllQueueWorkers();

    const consumer = await getKafkaConsumer();

    await consumer.subscribe({
      topic: env.kafkaTopic,
      fromBeginning: false
    })

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

          await fanoutNotificationEventToRabbitMQ(event);

          await markEventProcessed(event);

        } catch (error: any) {
          console.error(`[Processing Error] Failed to process message from topic ${topic}:`, error.message);
          try {
            const fallback: NotificationEvent = JSON.parse(rawPayload);
            await sendToDeadLetterQueue(fallback, error.message);
          } catch (recoveryError: any) {
            console.error(`[DLQ Error] Unparseable message payload: ${rawPayload}`);
          }
        }
      }
    })

  } catch (error: any) {
    console.error(`[Fatal Consumer1 Error]:`, error.message);
    process.exit(1);
  }
}




async function handleShutdown(signal: string) {
  console.log(`\n[Shutdown] Received ${signal}. Gracefully stopping consumer worker...`);
  await disconnectKafkaConsumer();
  await disconnectKafkaDLQProducer();
  await closeRabbitMQ();
  process.exit(0);
}


process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));


startConsumerWorker();