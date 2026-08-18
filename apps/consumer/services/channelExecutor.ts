import type { NotificationEvent, ProcessingResult, NotificationChannel } from "../types";
import { sendEmailNotification } from "../dispatchers/emailDispatcher";
import { sendSmsNotification } from "../dispatchers/smsDispatcher";
import { sendPushNotification } from "../dispatchers/pushDispatcher";
import { sendWebhookNotification } from "../dispatchers/webhookDispatcher";
import { recordAttemptProcessing, recordAttemptSuccess, recordAttemptFailure } from "./attemptTracker";

const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeChannelWithRetries(
  channel: NotificationChannel,
  event: NotificationEvent,
  notificationRecordId?: string
): Promise<ProcessingResult> {
  let lastResult: ProcessingResult = { success: false, channel, error: "Not executed" };
  let attemptRecord: any = null;

  for (let attemptNumber = 1; attemptNumber <= MAX_RETRIES; attemptNumber++) {
    console.log(`[Channel Executor] Channel: ${channel} | Attempt ${attemptNumber}/${MAX_RETRIES} for Event ${event.eventId}`);

    if (notificationRecordId) {
      attemptRecord = await recordAttemptProcessing(
        notificationRecordId,
        channel,
        attemptNumber,
        attemptRecord?.id
      );
    }

    try {
      switch (channel) {
        case "EMAIL":
          lastResult = await sendEmailNotification(event);
          break;
        case "SMS":
          lastResult = await sendSmsNotification(event);
          break;
        case "PUSH":
          lastResult = await sendPushNotification(event);
          break;
        case "WEBHOOK":
          lastResult = await sendWebhookNotification(event);
          break;
        default:
          lastResult = { success: false, channel, error: `Unsupported channel: ${channel}` };
      }
    } catch (dispatchErr: any) {
      lastResult = { success: false, channel, error: dispatchErr.message || "Dispatch execution failed" };
    }

    if (lastResult.success) {
      await recordAttemptSuccess(attemptRecord?.id, lastResult);
      break;
    }

    const isFinalAttempt = attemptNumber === MAX_RETRIES;
    const backoffMs = 500 * Math.pow(2, attemptNumber - 1);
    const nextRetryAt = isFinalAttempt ? null : new Date(Date.now() + backoffMs);

    await recordAttemptFailure(attemptRecord?.id, lastResult.error, isFinalAttempt, nextRetryAt);

    if (!isFinalAttempt) {
      console.warn(`[Channel Executor] Channel ${channel} attempt ${attemptNumber} failed: ${lastResult.error}. Retrying in ${backoffMs}ms...`);
      await sleep(backoffMs);
    }
  }

  return lastResult;
}
