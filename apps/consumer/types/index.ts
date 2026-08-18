export interface NotificationEvent {
  eventId: string;
  tenantId: string;
  userId: string;
  eventType: string;
  title: string;
  body?: string;
  payload?: Record<string, any>;
  channels?: string[];
  createdAt?: string | Date;
  id?: string | Buffer<ArrayBufferLike> | null;
}

export type NotificationChannel = "EMAIL" | "SMS" | "PUSH" | "WEBHOOK";

export interface ProcessingResult {
  success: boolean;
  channel?: NotificationChannel;
  providerId?: string;
  error?: string;
}
