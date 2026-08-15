import type { Request, Response } from "express";
import { prisma } from "db/client";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";

export async function createEndUser(req: Request, res: Response): Promise<void> {
  try {
    const { externalId, email, phone, name, pushToken } = req.body;
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }
    if (!externalId) {
      throw new BadRequestError("External ID is required");
    }

    const existingEndUser = await prisma.endUser.findUnique({
      where: {
        tenantId_externalId: {
          tenantId,
          externalId,
        },
      },
    });

    if (existingEndUser) {
      throw new BadRequestError("End user with this external ID already exists");
    }

    const endUser = await prisma.endUser.create({
      data: {
        tenantId,
        externalId,
        email,
        phone,
        name,
        pushToken,
      },
    });

    res.status(201).json({
      message: "End user created successfully",
      endUser,
    });
  } catch (error) {
    console.error("createEndUser error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to create end user" });
  }
}

export async function getEndUsers(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const endUsers = await prisma.endUser.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ endUsers });
  } catch (error) {
    console.error("getEndUsers error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch end users" });
  }
}

export async function getEndUserById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    const userId = (Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId) as string;

    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const endUser = await prisma.endUser.findFirst({
      where: { id: userId, tenantId },
    });

    if (!endUser) {
      throw new NotFoundError("End user not found");
    }

    res.status(200).json({ endUser });
  } catch (error) {
    console.error("getEndUserById error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch end user" });
  }
}

export async function updateEndUser(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    const userId = (Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId) as string;

    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { email, phone, name, pushToken } = req.body;

    const dataToUpdate: Record<string, any> = {};
    if (email !== undefined) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (name !== undefined) dataToUpdate.name = name;
    if (pushToken !== undefined) dataToUpdate.pushToken = pushToken;

    const updatedEndUser = await prisma.endUser.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    res.status(200).json({
      message: "End user updated successfully",
      endUser: updatedEndUser,
    });
  } catch (error) {
    console.error("updateEndUser error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update end user" });
  }
}

export async function deleteEndUser(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    const userId = (Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId) as string;

    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    await prisma.endUser.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "End user deleted successfully" });
  } catch (error) {
    console.error("deleteEndUser error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete end user" });
  }
}
