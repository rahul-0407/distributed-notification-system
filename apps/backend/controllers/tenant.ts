import type { Request, Response } from "express";
import { prisma } from "db/client";
import {
  AppError,
  BadRequestError,
  NotFoundError,
} from "../utils/errors";

export async function createTenant(req: Request, res: Response): Promise<void> {
  try {
    const { name, slug } = req.body;

    if (!name) {
      throw new BadRequestError("Name is required");
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new BadRequestError("Tenant with this slug already exists");
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
      },
    });

    res.status(201).json({
      message: "Tenant created successfully",
      tenant,
    });
  } catch (error) {
    console.error("createTenant error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to create tenant" });
  }
}

export async function getAllTenants(_req: Request, res: Response): Promise<void> {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ tenants });
  } catch (error) {
    console.error("getAllTenants error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
}

export async function getTenantById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (Array.isArray(req.params.tenantId) ? req.params.tenantId[0] : req.params.tenantId) as string;
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            members: true,
            users: true,
            apiKeys: true,
            notifications: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant not found");
    }

    res.status(200).json({ tenant });
  } catch (error) {
    console.error("getTenantById error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch tenant" });
  }
}

export async function updateTenant(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (Array.isArray(req.params.tenantId) ? req.params.tenantId[0] : req.params.tenantId) as string;
    const { name, slug } = req.body;

    const dataToUpdate: Record<string, any> = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (slug !== undefined) dataToUpdate.slug = slug;

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: dataToUpdate,
    });

    res.status(200).json({ message: "Tenant updated successfully", tenant: updatedTenant });
  } catch (error) {
    console.error("updateTenant error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update tenant" });
  }
}

export async function deleteTenant(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (Array.isArray(req.params.tenantId) ? req.params.tenantId[0] : req.params.tenantId) as string;
    await prisma.tenant.delete({
      where: { id: tenantId },
    });
    res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("deleteTenant error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete tenant" });
  }
}
