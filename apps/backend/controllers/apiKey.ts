import type { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "db/client";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";

function generateRawApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `sk_live_${randomBytes}`;
  const keyPrefix = rawKey.slice(0, 12);
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  return { rawKey, keyHash, keyPrefix };
}

export async function createApiKey(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { name, expiresAt } = req.body;
    if (!name) {
      throw new BadRequestError("Key name is required");
    }

    const { rawKey, keyHash, keyPrefix } = generateRawApiKey();

    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        tenantId,
        name,
        keyHash,
        keyPrefix,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "API Key created successfully. Store this key safely as it will not be shown again.",
      apiKey: rawKey,
      record: apiKeyRecord,
    });
  } catch (error) {
    console.error("createApiKey error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to create API key" });
  }
}

export async function getApiKeys(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ apiKeys });
  } catch (error) {
    console.error("getApiKeys error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
}

export async function revokeApiKey(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    const keyId = (Array.isArray(req.params.keyId) ? req.params.keyId[0] : req.params.keyId) as string;

    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }
    if (!keyId) {
      throw new BadRequestError("API Key ID is required");
    }

    const existingKey = await prisma.apiKey.findFirst({
      where: { id: keyId, tenantId },
    });

    if (!existingKey) {
      throw new NotFoundError("API Key not found");
    }

    if (existingKey.revokedAt) {
      throw new BadRequestError("API Key is already revoked");
    }

    const updatedKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        revokedAt: true,
      },
    });

    res.status(200).json({
      message: "API Key revoked successfully",
      apiKey: updatedKey,
    });
  } catch (error) {
    console.error("revokeApiKey error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to revoke API key" });
  }
}
