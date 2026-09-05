import { createWorkerChannel } from "../lib/rabbitmq";
import { env } from "../config/env";
import type { ChannelJobPayload } from "../types";
import { executeChannelWithRetries } from "../services/channelExecutor";
import { updateParentNotificationAggregateStatus } from "../services/attemptTracker";

export async function startPushWorker(): Promise<void> {
  const channel = await createWorkerChannel(10);
  console.log(`[Push Queue Worker] Listening on queue "${env.queues.push}"...`);

  await channel.consume(
    env.queues.push,
    async (msg) => {
      if (!msg) return;

      try {
        const payload: ChannelJobPayload = JSON.parse(msg.content.toString());
        console.log(`[Push Worker] Processing Job for Event ${payload.event.eventId}...`);

        const result = await executeChannelWithRetries("PUSH", payload.event, payload.notificationId);

        await updateParentNotificationAggregateStatus(payload.notificationId);

        if (result.success) {
          channel.ack(msg);
          console.log(`[Push Worker] Job ${payload.event.eventId} completed successfully. ACK sent.`);
        } else {
          console.error(`[Push Worker] Job ${payload.event.eventId} failed. Sending NACK to DLX.`);
          channel.nack(msg, false, false);
        }
      } catch (err: any) {
        console.error(`[Push Worker] Unhandled exception processing job:`, err.message);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
}
