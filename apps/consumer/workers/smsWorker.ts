import { createWorkerChannel } from "../lib/rabbitmq";
import { env } from "../config/env";
import type { ChannelJobPayload } from "../types";
import { executeChannelWithRetries } from "../services/channelExecutor";
import { updateParentNotificationAggregateStatus } from "../services/attemptTracker";

export async function startSmsWorker(): Promise<void> {
  const channel = await createWorkerChannel(10);
  console.log(`[SMS Queue Worker] Listening on queue "${env.queues.sms}"...`);

  await channel.consume(
    env.queues.sms,
    async (msg) => {
      if (!msg) return;

      try {
        const payload: ChannelJobPayload = JSON.parse(msg.content.toString());
        console.log(`[SMS Worker] Processing Job for Event ${payload.event.eventId}...`);

        const result = await executeChannelWithRetries("SMS", payload.event, payload.notificationId);

        await updateParentNotificationAggregateStatus(payload.notificationId);

        if (result.success) {
          channel.ack(msg);
          console.log(`[SMS Worker] Job ${payload.event.eventId} completed successfully. ACK sent.`);
        } else {
          console.error(`[SMS Worker] Job ${payload.event.eventId} failed. Sending NACK to DLX.`);
          channel.nack(msg, false, false);
        }
      } catch (err: any) {
        console.error(`[SMS Worker] Unhandled exception processing job:`, err.message);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
}
