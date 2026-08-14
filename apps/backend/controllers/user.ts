import type { Request, Response } from "express";
import { prisma } from "db/client";
import { hashPassword, verifyPassword, generateToken } from "../utils/auth";


export async function loginPlatformAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const admin = await prisma.platformAdmin.findUnique({
      where: { email },
    });

    if (!admin) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isValidPassword = await verifyPassword(password, admin.passwordHash);

    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      userType: "PLATFORM_ADMIN",
    });

    res.status(200).json({
      message: "Login successful",
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


export async function createPlatformAdmin(req: Request, res: Response): Promise<void> {}

export async function getAllPlatformAdmins(req: Request, res: Response): Promise<void> {}

export async function getPlatformAdminById(req: Request, res: Response): Promise<void> {}

export async function updatePlatformAdmin(req: Request, res: Response): Promise<void> {}

export async function deletePlatformAdmin(req: Request, res: Response): Promise<void> {}

export async function getPlatformOverview(req: Request, res: Response): Promise<void> {}
