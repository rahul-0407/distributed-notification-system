import type { Request, Response, NextFunction } from "express";
import { prisma } from "db/client";
import { verifyToken, ADMIN_COOKIE_NAME, TENANT_COOKIE_NAME } from "../utils/auth";
import type {
  AdminJwtPayload,
  TenantMemberJwtPayload,
  PlatformRole,
  TenantMemberRole,
} from "../types";

function extractToken(req: Request, preferredCookie?: string): string | null {
  if (preferredCookie && req.cookies && req.cookies[preferredCookie]) {
    return req.cookies[preferredCookie];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

export async function authenticatePlatformAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req, ADMIN_COOKIE_NAME);

  if (!token) {
    res.status(401).json({ error: "Unauthorized: Missing authentication token" });
    return;
  }

  const payload = verifyToken(token);

  if (!payload || payload.userType !== "PLATFORM_ADMIN") {
    res.status(401).json({ error: "Unauthorized: Invalid or expired platform admin token" });
    return;
  }

  const adminPayload = payload as AdminJwtPayload;

  try {
    const admin = await prisma.platformAdmin.findUnique({
      where: { id: adminPayload.id },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!admin) {
      res.status(401).json({ error: "Unauthorized: Admin account no longer exists" });
      return;
    }

    req.user = adminPayload;
    req.admin = adminPayload;
    next();
  } catch (error) {
    console.error("authenticatePlatformAdmin DB check error:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
}


export function requirePlatformRole(...roles: PlatformRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ error: "Unauthorized: Platform Admin authentication required" });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.admin.role)) {
      res.status(403).json({error: "Forbidden: Access restricted."});
      return;
    }

    next();
  };
}

export async function authenticateTenantMember(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req, TENANT_COOKIE_NAME);

  if (!token) {
    res.status(401).json({ error: "Unauthorized: Missing authentication token" });
    return;
  }

  const payload = verifyToken(token);

  if (!payload || payload.userType !== "TENANT_MEMBER") {
    res.status(401).json({ error: "Unauthorized: Invalid or expired tenant member token" });
    return;
  }

  const memberPayload = payload as TenantMemberJwtPayload;

  try {
    const member = await prisma.tenantMember.findUnique({
      where: { id: memberPayload.memberId },
      select: { id: true, tenantId: true, email: true, role: true, name: true },
    });

    if (!member) {
      res.status(401).json({ error: "Unauthorized: Tenant member account no longer exists" });
      return;
    }

    req.user = memberPayload;
    req.member = memberPayload;
    next();
  } catch (error) {
    console.error("authenticateTenantMember DB check error:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
}

export function requireTenantRole(...roles: TenantMemberRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.member) {
      res.status(401).json({ error: "Unauthorized: Tenant Member authentication required" });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.member.role)) {
      res.status(403).json({error: "Forbidden: Access restricted."});
      return;
    }

    next();
  };
}


export function requireTenantAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.member) {
    res.status(401).json({ error: "Unauthorized: Tenant Member authentication required" });
    return;
  }

  const targetTenantId =
    req.params.tenantId ||
    req.body?.tenantId ||
    (req.headers["x-tenant-id"] as string);

  if (targetTenantId && req.member.tenantId !== targetTenantId) {
    res.status(403).json({
      error: "Forbidden: You do not have permission to access resources for this tenant",
    });
    return;
  }

  next();
}
