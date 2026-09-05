import type { NotificationEvent } from "../types";
import { publishToKafkaDLQ } from "../lib/kafkaProducer";
import { prisma } from "db/client";

export async function sendToDeadLetterQueue(
  event: Partial<NotificationEvent>,
  error: Error | string
): Promise<void> {
  const errorMessage = typeof error === "string" ? error : error.message;

  const dlqPayload = {
    event,
    failedAt: new Date().toISOString(),
    errorReason: errorMessage,
    failureStage: "KAFKA_CONSUMPTION_OR_FANOUT_FAILED",
  };

  try {
    console.warn(`[Kafka DLQ Service] Routing Event ${event.eventId || "UNKNOWN"} to Kafka DLQ Topic... Reason: ${errorMessage}`);

    await publishToKafkaDLQ(dlqPayload);

    if (event.eventId) {
      await prisma.notification.updateMany({
        where: { eventId: event.eventId },
        data: { status: "FAILED" },
      });
    }

    console.log(`[Kafka DLQ Service] Event ${event.eventId || "UNKNOWN"} successfully published to Kafka DLQ topic & DB status updated to FAILED.`);
  } catch (err: any) {
    console.error(`[Kafka DLQ Service] Critical error routing event to Kafka Dead Letter Queue:`, err.message);
  }
}


