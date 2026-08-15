import type { Request, Response } from "express";
import { prisma } from "db/client";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  TENANT_COOKIE_NAME,
} from "../utils/auth";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";

export async function signupTenant(req: Request, res: Response): Promise<void> {
  try {
    const { tenantName, name, slug, ownerEmail, email, ownerPassword, password, ownerName } = req.body;

    const finalTenantName = tenantName || name;
    const finalEmail = ownerEmail || email;
    const finalPassword = ownerPassword || password;
    const finalName = ownerName || finalTenantName || "Owner";

    if (!finalTenantName || !finalEmail || !finalPassword) {
      throw new BadRequestError(
        "Tenant name (tenantName), owner email (ownerEmail), and password (ownerPassword) are required"
      );
    }

    const generatedSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : `${finalTenantName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: generatedSlug },
    });

    if (existingTenant) {
      throw new BadRequestError("Tenant with this slug already exists");
    }

    const existingMember = await prisma.tenantMember.findUnique({
      where: { email: finalEmail },
    });

    if (existingMember) {
      throw new BadRequestError("A member with this email already exists");
    }

    const passwordHash = await hashPassword(finalPassword);

    const { tenant, owner } = await prisma.$transaction(async (tx) => {
      const newTenant = await tx.tenant.create({
        data: {
          name: finalTenantName,
          slug: generatedSlug,
        },
      });

      const newOwner = await tx.tenantMember.create({
        data: {
          tenantId: newTenant.id,
          email: finalEmail,
          passwordHash,
          name: finalName,
          role: "OWNER",
        },
      });

      return { tenant: newTenant, owner: newOwner };
    });

    const token = generateToken({
      memberId: owner.id,
      tenantId: tenant.id,
      email: owner.email,
      role: owner.role,
      userType: "TENANT_MEMBER",
    });

    setAuthCookie(res, TENANT_COOKIE_NAME, token);

    res.status(201).json({
      message: "Tenant registered successfully",
      token,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        createdAt: tenant.createdAt,
      },
      owner: {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        role: owner.role,
      },
    });
  } catch (error) {
    console.error("signupTenant error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to register tenant" });
  }
}

export async function loginTenantMember(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const member = await prisma.tenantMember.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });

    if (!member || !member.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValidPassword = await verifyPassword(password, member.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = generateToken({
      memberId: member.id,
      tenantId: member.tenantId,
      email: member.email,
      role: member.role,
      userType: "TENANT_MEMBER",
    });

    setAuthCookie(res, TENANT_COOKIE_NAME, token);

    res.status(200).json({
      message: "Login successful",
      token,
      member: {
        id: member.id,
        tenantId: member.tenantId,
        email: member.email,
        name: member.name,
        role: member.role,
        tenant: {
          id: member.tenant.id,
          name: member.tenant.name,
          slug: member.tenant.slug,
        },
      },
    });
  } catch (error) {
    console.error("loginTenantMember error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to log in tenant member" });
  }
}

export async function logoutTenantMember(_req: Request, res: Response): Promise<void> {
  try {
    clearAuthCookie(res, TENANT_COOKIE_NAME);
    res.status(200).json({ message: "Tenant member logged out successfully" });
  } catch (error) {
    console.error("logoutTenantMember error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to log out tenant member" });
  }
}

export async function getTenantMemberMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.member) {
      throw new UnauthorizedError("Unauthorized");
    }

    const member = await prisma.tenantMember.findUnique({
      where: { id: req.member.memberId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundError("Tenant member profile not found");
    }

    res.status(200).json({
      member: {
        id: member.id,
        tenantId: member.tenantId,
        email: member.email,
        name: member.name,
        role: member.role,
        tenant: member.tenant,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      },
    });
  } catch (error) {
    console.error("getTenantMemberMe error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch tenant member profile" });
  }
}

export async function addTenantMember(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { email, password, name, role } = req.body;
    if (!email || !name) {
      throw new BadRequestError("Email and name are required");
    }

    const existingMember = await prisma.tenantMember.findUnique({
      where: { email },
    });

    if (existingMember) {
      throw new BadRequestError("A member with this email already exists");
    }

    const passwordHash = password ? await hashPassword(password) : null;

    const member = await prisma.tenantMember.create({
      data: {
        tenantId,
        email,
        passwordHash,
        name,
        role: role || "DEVELOPER",
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: "Tenant member added successfully", member });
  } catch (error) {
    console.error("addTenantMember error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to add tenant member" });
  }
}

export async function getTenantMembers(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const members = await prisma.tenantMember.findMany({
      where: { tenantId },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ members });
  } catch (error) {
    console.error("getTenantMembers error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch tenant members" });
  }
}

export async function getTenantMemberById(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    const memberId = (Array.isArray(req.params.memberId) ? req.params.memberId[0] : req.params.memberId) as string;

    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const member = await prisma.tenantMember.findFirst({
      where: { id: memberId, tenantId },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!member) {
      throw new NotFoundError("Tenant member not found");
    }

    res.status(200).json({ member });
  } catch (error) {
    console.error("getTenantMemberById error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch tenant member" });
  }
}

export async function updateTenantMember(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    const memberId = (Array.isArray(req.params.memberId) ? req.params.memberId[0] : req.params.memberId) as string;

    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { name, role, password } = req.body;
    const dataToUpdate: Record<string, any> = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (role !== undefined) dataToUpdate.role = role;
    if (password) dataToUpdate.passwordHash = await hashPassword(password);

    const updatedMember = await prisma.tenantMember.update({
      where: { id: memberId },
      data: dataToUpdate,
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ message: "Tenant member updated successfully", member: updatedMember });
  } catch (error) {
    console.error("updateTenantMember error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update tenant member" });
  }
}

export async function removeTenantMember(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = (req.params.tenantId as string) || req.member?.tenantId;
    const memberId = (Array.isArray(req.params.memberId) ? req.params.memberId[0] : req.params.memberId) as string;

    if (!tenantId) {
      throw new UnauthorizedError("Unauthorized");
    }

    await prisma.tenantMember.delete({
      where: { id: memberId },
    });

    res.status(200).json({ message: "Tenant member removed successfully" });
  } catch (error) {
    console.error("removeTenantMember error:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to remove tenant member" });
  }
}
