import type { NotificationEvent, ProcessingResult } from "../types";

export async function sendPushNotification(event: NotificationEvent): Promise<ProcessingResult> {
  console.log(`[Push Dispatcher] Stub: Sending push notification for event ${event.eventId} to user ${event.userId}`);
  const providerId = `fcm_${Math.random().toString(36).substring(2, 10)}`;
  return { success: true, channel: "PUSH", providerId };
}
