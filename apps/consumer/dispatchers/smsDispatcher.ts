import type { NotificationEvent, ProcessingResult } from "../types";

export async function sendSmsNotification(event: NotificationEvent): Promise<ProcessingResult> {
  console.log(`[SMS Dispatcher] Stub: Sending SMS for event ${event.eventId} to user ${event.userId}`);
  const providerId = `tw_${Math.random().toString(36).substring(2, 10)}`;
  return { success: true, channel: "SMS", providerId };
}
