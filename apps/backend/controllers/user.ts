import type { Request, Response } from "express";
import { prisma } from "db/client";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  ADMIN_COOKIE_NAME,
} from "../utils/auth";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";

export async function loginPlatformAdmin(req: Request, res: Response): Promise<void> {
  try {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const admin = await prisma.platformAdmin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValidPassword = await verifyPassword(password, admin.passwordHash);

  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateToken({
    id: admin.id,
    email: admin.email,
    role: admin.role,
    userType: "PLATFORM_ADMIN",
  });

  
  setAuthCookie(res, ADMIN_COOKIE_NAME, token);

  res.status(200).json({
    message: "Platform Admin login successful",
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
  } catch (error) {
    console.error("loginPlatformAdmin error:", error);
    res.status(500).json({ error: "Failed to log in platform admin" });
  }
}

export async function logoutPlatformAdmin(_req: Request, res: Response): Promise<void> {
  try {
  clearAuthCookie(res, ADMIN_COOKIE_NAME);
  res.status(200).json({ message: "Platform Admin logged out successfully" });
  } catch (error) {
    console.error("logoutPlatformAdmin error:", error);
    res.status(500).json({ error: "Failed to log out platform admin" });
  }
}

export async function getPlatformAdminMe(req: Request, res: Response): Promise<void> {
  try {
  if (!req.admin) {
    throw new UnauthorizedError("Unauthorized");
  }

  const admin = await prisma.platformAdmin.findUnique({
    where: { id: req.admin.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin) {
    throw new NotFoundError("Admin profile not found");
  }

  res.status(200).json({ admin });
  } catch (error) {
    console.error("getPlatformAdminMe error:", error);
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
}

export async function createPlatformAdmin(req: Request, res: Response): Promise<void> {
  try {
  const { email, password, name, role } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const existingAdmin = await prisma.platformAdmin.findUnique({ where: { email } });
  if (existingAdmin) {
    throw new BadRequestError("Platform Admin with this email already exists");
  }

  const passwordHash = await hashPassword(password);
  const newAdmin = await prisma.platformAdmin.create({
    data: {
      email,
      passwordHash,
      name: name || null,
      role: role || "ADMIN",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(201).json({ message: "Platform Admin created successfully", admin: newAdmin });
  } catch (error) {
    console.error("createPlatformAdmin error:", error);
    res.status(500).json({ error: "Failed to create platform admin" });
  }
}

export async function getAllPlatformAdmins(_req: Request, res: Response): Promise<void> {
  try {
  const admins = await prisma.platformAdmin.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  res.status(200).json({ admins });
  } catch (error) {
    console.error("getAllPlatformAdmins error:", error);
    res.status(500).json({ error: "Failed to fetch platform admins" });
  }
}

export async function getPlatformAdminById(req: Request, res: Response): Promise<void> {
  try {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const admin = await prisma.platformAdmin.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  if (!admin) {
    throw new NotFoundError("Platform Admin not found");
  }
  res.status(200).json({ admin });
  } catch (error) {
    console.error("getPlatformAdminById error:", error);
    res.status(500).json({ error: "Failed to fetch platform admin" });
  }
}

export async function updatePlatformAdmin(req: Request, res: Response): Promise<void> {
  try {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const { name, role, password } = req.body;

  const dataToUpdate: Record<string, any> = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (role !== undefined) dataToUpdate.role = role;
  if (password) dataToUpdate.passwordHash = await hashPassword(password);

  const updatedAdmin = await prisma.platformAdmin.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      updatedAt: true,
    },
  });

  res.status(200).json({ message: "Platform Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    console.error("updatePlatformAdmin error:", error);
    res.status(500).json({ error: "Failed to update platform admin" });
  }
}

export async function deletePlatformAdmin(req: Request, res: Response): Promise<void> {
  try {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  await prisma.platformAdmin.delete({ where: { id } });
  res.status(200).json({ message: "Platform Admin deleted successfully" });
  } catch (error) {
    console.error("deletePlatformAdmin error:", error);
    res.status(500).json({ error: "Failed to delete platform admin" });
  }
}

export async function getPlatformOverview(_req: Request, res: Response): Promise<void> {
  try {
  const tenantCount = await prisma.tenant.count();
  const memberCount = await prisma.tenantMember.count();
  const notificationCount = await prisma.notification.count();
  res.status(200).json({
    overview: {
      totalTenants: tenantCount,
      totalMembers: memberCount,
      totalNotifications: notificationCount,
    },
  });
  } catch (error) {
    console.error("getPlatformOverview error:", error);
    res.status(500).json({ error: "Failed to fetch platform overview" });
  }
}
