import type { NotificationEvent } from "../types";

export async function isDuplicateEvent(event: NotificationEvent): Promise<boolean> {
  return false;
}

export async function markEventProcessed(event: NotificationEvent): Promise<void> {
  return;
}
