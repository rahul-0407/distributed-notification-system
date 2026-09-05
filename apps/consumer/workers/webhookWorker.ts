import { createWorkerChannel } from "../lib/rabbitmq";
import { env } from "../config/env";
import type { ChannelJobPayload } from "../types";
import { executeChannelWithRetries } from "../services/channelExecutor";
import { updateParentNotificationAggregateStatus } from "../services/attemptTracker";

export async function startWebhookWorker(): Promise<void> {
  const channel = await createWorkerChannel(10);
  console.log(`[Webhook Queue Worker] Listening on queue "${env.queues.webhook}"...`);

  await channel.consume(
    env.queues.webhook,
    async (msg) => {
      if (!msg) return;

      try {
        const payload: ChannelJobPayload = JSON.parse(msg.content.toString());
        console.log(`[Webhook Worker] Processing Job for Event ${payload.event.eventId}...`);

        const result = await executeChannelWithRetries("WEBHOOK", payload.event, payload.notificationId);

        await updateParentNotificationAggregateStatus(payload.notificationId);

        if (result.success) {
          channel.ack(msg);
          console.log(`[Webhook Worker] Job ${payload.event.eventId} completed successfully. ACK sent.`);
        } else {
          console.error(`[Webhook Worker] Job ${payload.event.eventId} failed. Sending NACK to DLX.`);
          channel.nack(msg, false, false);
        }
      } catch (err: any) {
        console.error(`[Webhook Worker] Unhandled exception processing job:`, err.message);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
}
