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


export async function signupTenant(req: Request, res: Response): Promise<void> {
  try {
    const { tenantName, name, slug, ownerEmail, email, ownerPassword, password, ownerName } = req.body;

    const finalTenantName = tenantName || name;
    const finalEmail = ownerEmail || email;
    const finalPassword = ownerPassword || password;
    const finalName = ownerName || finalTenantName || "Owner";

    if (!finalTenantName || !finalEmail || !finalPassword) {
      res.status(400).json({
        error: "Tenant name (tenantName), owner email (ownerEmail), and password (ownerPassword) are required",
      });
      return;
    }

    const generatedSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
      : `${finalTenantName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: generatedSlug },
    });

    if (existingTenant) {
      res.status(400).json({ error: "Tenant with this slug already exists" });
      return;
    }

    const existingMember = await prisma.tenantMember.findUnique({
      where: { email: finalEmail },
    });

    if (existingMember) {
      res.status(400).json({ error: "A member with this email already exists" });
      return;
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
    res.status(500).json({ error: "Failed to register tenant" });
  }
}

export async function loginTenantMember(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const member = await prisma.tenantMember.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });

    if (!member || !member.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isValidPassword = await verifyPassword(password, member.passwordHash);

    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
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
    res.status(500).json({ error: "Failed to log in tenant member" });
  }
}

export async function logoutTenantMember(_req: Request, res: Response): Promise<void> {

  try {

    
    clearAuthCookie(res, TENANT_COOKIE_NAME);
    res.status(200).json({ message: "Tenant member logged out successfully" });

  } catch (error) {
    console.error("logoutTenantMember error:", error);
    res.status(500).json({ error: "Failed to log out tenant member" });
  }
}

export async function getTenantMemberMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.member) {
      res.status(401).json({ error: "Unauthorized" });
      return;
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
      res.status(404).json({ error: "Tenant member profile not found" });
      return;
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
    res.status(500).json({ error: "Failed to fetch tenant member profile" });
  }
}


export async function createTenant(req: Request, res: Response): Promise<void> {}
export async function getAllTenants(req: Request, res: Response): Promise<void> {}
export async function getTenantById(req: Request, res: Response): Promise<void> {}
export async function updateTenant(req: Request, res: Response): Promise<void> {}
export async function deleteTenant(req: Request, res: Response): Promise<void> {}

export async function addTenantMember(req: Request, res: Response): Promise<void> {}
export async function getTenantMembers(req: Request, res: Response): Promise<void> {}
export async function getTenantMemberById(req: Request, res: Response): Promise<void> {}
export async function updateTenantMember(req: Request, res: Response): Promise<void> {}
export async function removeTenantMember(req: Request, res: Response): Promise<void> {}

export async function createApiKey(req: Request, res: Response): Promise<void> {}
export async function getApiKeys(req: Request, res: Response): Promise<void> {}
export async function revokeApiKey(req: Request, res: Response): Promise<void> {}

export async function createEndUser(req: Request, res: Response): Promise<void> {}
export async function getEndUsers(req: Request, res: Response): Promise<void> {}
export async function getEndUserById(req: Request, res: Response): Promise<void> {}
export async function updateEndUser(req: Request, res: Response): Promise<void> {}
export async function deleteEndUser(req: Request, res: Response): Promise<void> {}
