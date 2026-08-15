export type PlatformRole = "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "READ_ONLY";
export type TenantMemberRole = "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";

export interface AdminJwtPayload {
  id: string;
  email: string;
  role: PlatformRole;
  userType: "PLATFORM_ADMIN";
}

export interface TenantMemberJwtPayload {
  memberId: string;
  tenantId: string;
  email: string;
  role: TenantMemberRole;
  userType: "TENANT_MEMBER";
}

export type AuthJwtPayload = AdminJwtPayload | TenantMemberJwtPayload;

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload;
      admin?: AdminJwtPayload;
      member?: TenantMemberJwtPayload;
    }
  }
}
