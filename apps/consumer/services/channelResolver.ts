import type { NotificationEvent, NotificationChannel } from "../types";
import { prisma } from "db/client";

export async function resolveTargetChannels(event: NotificationEvent): Promise<NotificationChannel[]> {
  const resolvedChannels: Set<NotificationChannel> = new Set();

  const user = await prisma.endUser.findUnique({
    where: { id: event.userId },
  });

  const hasEmail = Boolean(user?.email);
  const hasPhone = Boolean(user?.phone);
  const hasPushToken = Boolean(user?.pushToken);

  if (event.channels && event.channels.length > 0) {
    for (const ch of event.channels) {
      const upperCh = ch.toUpperCase() as NotificationChannel;
      if (upperCh === "EMAIL" && hasEmail) resolvedChannels.add("EMAIL");
      else if (upperCh === "SMS" && hasPhone) resolvedChannels.add("SMS");
      else if (upperCh === "PUSH" && hasPushToken) resolvedChannels.add("PUSH");
      else if (upperCh === "WEBHOOK") resolvedChannels.add("WEBHOOK");
      else {
        resolvedChannels.add(upperCh);
      }
    }
    if (resolvedChannels.size > 0) {
      return Array.from(resolvedChannels);
    }
  }

  if (hasEmail) resolvedChannels.add("EMAIL");
  if (hasPushToken) resolvedChannels.add("PUSH");
  if (hasPhone) resolvedChannels.add("SMS");

  if (resolvedChannels.size === 0) {
    resolvedChannels.add("EMAIL");
  }

  return Array.from(resolvedChannels);
}
