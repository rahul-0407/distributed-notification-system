import type { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "db/client";
import { publishEvent } from "../lib/kafkaProducer";
import type { Event } from "../types";



export async function sendNotification(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let tenantId = req.body.tenantId;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const rawKey = authHeader.substring(7);
      if (rawKey.startsWith("sk_live_")) {
        const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
        const keyRecord = await prisma.apiKey.findUnique({
          where: { keyHash },
        });

        if (!keyRecord || keyRecord.revokedAt) {
          res.status(401).json({ error: "Invalid or revoked API Key" });
          return;
        }
        tenantId = keyRecord.tenantId;

        await prisma.apiKey.update({
          where: { id: keyRecord.id },
          data: { lastUsedAt: new Date() },
        });
      }
    }

    const { userId, externalId, eventType, title, body } = req.body;

    if (!tenantId) {
      res.status(400).json({ error: "Tenant ID or valid API Key is required" });
      return;
    }

    let endUser = await prisma.endUser.findFirst({
      where: {
        tenantId,
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(userId ? [{ externalId: userId }] : []),
          ...(externalId ? [{ externalId }] : []),
        ],
      },
    });

    if (!endUser) {
      const extId = externalId || userId || `usr_${Date.now()}`;
      endUser = await prisma.endUser.create({
        data: {
          tenantId,
          externalId: extId,
          name: "Recipient User",
        },
      });
    }

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const notification = await prisma.notification.create({
      data: {
        tenantId,
        userId: endUser.id,
        eventId,
        eventType: eventType || "NOTIFICATION_EVENT",
        title: title || "New Notification",
        body: body || "",
        status: "SENT",
      },
    });

    const event: Event = {
      eventId,
      tenantId,
      userId: endUser.id,
      eventType: notification.eventType,
      title: notification.title ?? "New Notification",
      body: notification.body ?? "",
      createdAt: notification.createdAt,
    }
    await publishEvent(event);


    res.status(201).json({
      message: "Notification dispatched and stored successfully",
      notificationId: notification.id,
      eventId: notification.eventId,
      status: notification.status,
      recipient: {
        id: endUser.id,
        externalId: endUser.externalId,
      },
    });
  } catch (error: any) {
    console.error("sendNotification error:", error);
    res.status(500).json({ error: error.message || "Failed to process notification dispatch" });
  }
}