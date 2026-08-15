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
    res.status(500).json({ error: "Failed to fetch tenant member profile" });
  }
}


export async function createTenant(req: Request, res: Response): Promise<void> {
  try {
  const {name, slug} = req.body;

  if (!name) {
    throw new BadRequestError("Name is required");
  }

  const existingTenant = await prisma.tenant.findUnique({
    where: {slug},
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
    res.status(500).json({ error: "Failed to create tenant" });
  }
}

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
