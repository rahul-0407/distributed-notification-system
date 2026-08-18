import type { NotificationEvent, ProcessingResult } from "../types";

export async function sendWebhookNotification(event: NotificationEvent): Promise<ProcessingResult> {
  console.log(`[Webhook Dispatcher] Stub: Triggering webhook for event ${event.eventId} to user ${event.userId}`);
  return { success: true, channel: "WEBHOOK" };
}
