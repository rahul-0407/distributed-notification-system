import type { NotificationEvent } from "../types";
import { prisma } from "db/client";
import { getRedisClient } from "../lib/redis";

const IDEMPOTENCY_TTL_SECONDS = 86400;

export async function isDuplicateEvent(event: NotificationEvent): Promise<boolean> {
  if (!event.eventId || !event.tenantId) return false;

  const redisKey = `idempotency:${event.tenantId}:${event.eventId}`;

  try {
    const redisVal = await getRedisClient().get(redisKey);
    if (redisVal) {
      console.log(`[Idempotency - Redis Cache Hit] Event ${event.eventId} already processed. Skipping.`);
      return true;
    }
  } catch (err: any) {
    console.error(`[Idempotency - Redis Error] Falling back to DB check:`, err.message);
  }

  const existingNotification = await prisma.notification.findUnique({
    where: {
      tenantId_eventId: {
        tenantId: event.tenantId,
        eventId: event.eventId,
      },
    },
  });

  const isDuplicate = Boolean(
    existingNotification &&
      (existingNotification.status === "SENT" ||
        existingNotification.status === "PARTIALLY_SENT" ||
        existingNotification.status === "PROCESSING")
  );


  if (isDuplicate) {
    try {
      await getRedisClient().set(redisKey, "PROCESSED", "EX", IDEMPOTENCY_TTL_SECONDS);
    } catch (_) {}
  }

  return isDuplicate;
}

export async function markEventProcessed(event: NotificationEvent): Promise<void> {
  if (!event.eventId || !event.tenantId) return;

  const redisKey = `idempotency:${event.tenantId}:${event.eventId}`;

  try {
    await getRedisClient().set(redisKey, "PROCESSED", "EX", IDEMPOTENCY_TTL_SECONDS);
    console.log(`[Idempotency] Marked Event ${event.eventId} as processed in Redis (24h TTL).`);
  } catch (err: any) {
    console.error(`[Idempotency] Failed to cache processed status in Redis:`, err.message);
  }
}

