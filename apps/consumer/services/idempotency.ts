import type { NotificationEvent } from "../types";
import { prisma } from "db/client";

export async function isDuplicateEvent(event: NotificationEvent): Promise<Boolean> {
  if (!event.eventId || !event.tenantId) return false;

  const existingNotification = await prisma.notification.findUnique({
    where: {
      tenantId_eventId: {
        tenantId: event.tenantId,
        eventId: event.eventId,
      },
    }
  })

  return Boolean(existingNotification && (existingNotification.status === "SENT" || existingNotification.status === "PARTIALLY_SENT"))
}

export async function markEventProcessed(event: NotificationEvent): Promise<void> {
  console.log(`[Idempotency] Event ${event.eventId} fan-out process complete.`);
}
