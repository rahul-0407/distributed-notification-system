import type { NotificationEvent } from "../types";
import { resolveTargetChannels } from "./channelResolver";
import { findAndUpdateNotificationQueued } from "./attemptTracker";
import { publishChannelJob } from "../lib/rabbitmq";

export async function fanoutNotificationEventToRabbitMQ(event: NotificationEvent): Promise<void> {
  const channels = await resolveTargetChannels(event);
  console.log(`[Fan-Out Router] Event: ${event.eventId} | Target Channels resolved: [${channels.join(", ")}]`);

  const notificationRecord = await findAndUpdateNotificationQueued(event);
  for (const channel of channels) {
    const jobPayload = {
      notificationId: notificationRecord?.id,
      channel,
      event,
      enqueuedAt: new Date().toISOString(),
    };

    await publishChannelJob(channel, jobPayload);
    console.log(`[Fan-Out Router] Enqueued job for Event ${event.eventId} -> RabbitMQ [${channel}] Queue`);
  }
}
