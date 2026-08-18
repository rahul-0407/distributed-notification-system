import type { NotificationEvent, NotificationChannel, ProcessingResult } from "../types";
import { prisma } from "db/client";

export async function findAndUpdateNotificationStatus(event: NotificationEvent) {
  const notificationRecord = await prisma.notification.findUnique({
    where: {
      tenantId_eventId: {
        tenantId: event.tenantId,
        eventId: event.eventId,
      },
    },
  });

  if (notificationRecord && notificationRecord.status !== "PROCESSING") {
    await prisma.notification.update({
      where: { id: notificationRecord.id },
      data: { status: "PROCESSING" },
    });
  }

  return notificationRecord;
}

export async function recordAttemptProcessing(notificationId: string, channel: NotificationChannel, attemptNumber: number, existingAttemptId?: string) {
  if (channel !== "EMAIL" && channel !== "SMS" && channel !== "PUSH") return null;

  try {
    if (!existingAttemptId) {
      return await prisma.notificationAttempt.create({
        data: {
          notificationId,
          channel: channel as any,
          status: "PROCESSING",
          attemptNumber,
        },
      });
    } else {
      return await prisma.notificationAttempt.update({
        where: { id: existingAttemptId },
        data: {
          status: "PROCESSING",
          attemptNumber,
          lastAttemptAt: new Date(),
        },
      });
    }
  } catch (err: any) {
    console.error(`[AttemptTracker] Failed to log attempt for ${channel}:`, err.message);
    return null;
  }
}

export async function recordAttemptSuccess(attemptId: string | undefined, result: ProcessingResult) {
  if (!attemptId) return;

  try {
    await prisma.notificationAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SENT",
        providerId: result.providerId || null,
        errorMessage: null,
        errorCode: null,
        lastAttemptAt: new Date(),
      },
    });
  } catch (err: any) {
    console.error(`[AttemptTracker] Failed to log success for attempt ${attemptId}:`, err.message);
  }
}

export async function recordAttemptFailure(attemptId: string | undefined, errorMsg: string | undefined, isFinalAttempt: boolean, nextRetryAt: Date | null) {
  if (!attemptId) return;

  try {
    await prisma.notificationAttempt.update({
      where: { id: attemptId },
      data: {
        status: isFinalAttempt ? "FAILED" : "RETRYING",
        errorMessage: errorMsg || null,
        errorCode: "DISPATCH_FAILED",
        nextRetryAt,
        lastAttemptAt: new Date(),
      },
    });
  } catch (err: any) {
    console.error(`[AttemptTracker] Failed to log failure for attempt ${attemptId}:`, err.message);
  }
}

export async function finalizeNotificationStatus(notificationId: string | undefined, results: ProcessingResult[]) {
  if (!notificationId) return;

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  let finalStatus: "SENT" | "PARTIALLY_SENT" | "FAILED" = "SENT";
  if (failureCount > 0 && successCount > 0) {
    finalStatus = "PARTIALLY_SENT";
  } else if (failureCount > 0 && successCount === 0) {
    finalStatus = "FAILED";
  }

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: finalStatus },
    });
  } catch (err: any) {
    console.error(`[AttemptTracker] Failed to update master notification status:`, err.message);
  }
}
