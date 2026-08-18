import type { NotificationEvent } from "../types";

export async function sendToDeadLetterQueue(event: NotificationEvent, error: Error): Promise<void> {
  console.error(`[DLQ Service] Stub: Event ${event.eventId} routed to Dead Letter Queue. Error: ${error.message}`);
}
