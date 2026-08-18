import type { NotificationEvent, ProcessingResult } from "../types";
import { resolveTargetChannels } from "./channelResolver";
import { findAndUpdateNotificationStatus, finalizeNotificationStatus } from "./attemptTracker";
import { executeChannelWithRetries } from "./channelExecutor";

export async function dispatchNotificationEvent(event: NotificationEvent): Promise<ProcessingResult[]> {
  const channels = await resolveTargetChannels(event);
  console.log(`[Dispatcher Engine] Event: ${event.eventId} | Resolved Channels: [${channels.join(", ")}]`);

  const notificationRecord = await findAndUpdateNotificationStatus(event);

  const results: ProcessingResult[] = [];

  for (const channel of channels) {
    const result = await executeChannelWithRetries(channel, event, notificationRecord?.id);
    results.push(result);
  }

  await finalizeNotificationStatus(notificationRecord?.id, results);

  return results;
}
