import type { NotificationEvent, ProcessingResult } from "../types";

export async function sendEmailNotification(event: NotificationEvent): Promise<ProcessingResult> {
  console.log(`[Email Dispatcher] Stub: Sending email for event ${event.eventId} to user ${event.userId}`);
  const providerId = `sg_${Math.random().toString(36).substring(2, 10)}`;
  return { success: true, channel: "EMAIL", providerId };
}
