import { Router } from "express";
import * as tenantController from "../controllers/tenant";
import {
  authenticateTenantMember,
  requireTenantRole,
  requireTenantAccess,
} from "../middleware/auth";

const router = Router();


router.post("/signup", tenantController.signupTenant);
router.post("/auth/login", tenantController.loginTenantMember);
router.post("/auth/logout", tenantController.logoutTenantMember);


router.get("/auth/me", authenticateTenantMember, tenantController.getTenantMemberMe);


router.post("/", tenantController.createTenant);
router.get("/", tenantController.getAllTenants);
router.get("/:tenantId", authenticateTenantMember, requireTenantAccess, tenantController.getTenantById);
router.put(
  "/:tenantId",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER", "ADMIN"),
  tenantController.updateTenant
);
router.delete(
  "/:tenantId",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER"),
  tenantController.deleteTenant
);


router.post(
  "/:tenantId/members",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER", "ADMIN"),
  tenantController.addTenantMember
);
router.get(
  "/:tenantId/members",
  authenticateTenantMember,
  requireTenantAccess,
  tenantController.getTenantMembers
);
router.get(
  "/:tenantId/members/:memberId",
  authenticateTenantMember,
  requireTenantAccess,
  tenantController.getTenantMemberById
);
router.put(
  "/:tenantId/members/:memberId",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER", "ADMIN"),
  tenantController.updateTenantMember
);
router.delete(
  "/:tenantId/members/:memberId",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER"),
  tenantController.removeTenantMember
);


router.post(
  "/:tenantId/api-keys",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER", "ADMIN", "DEVELOPER"),
  tenantController.createApiKey
);
router.get(
  "/:tenantId/api-keys",
  authenticateTenantMember,
  requireTenantAccess,
  tenantController.getApiKeys
);
router.delete(
  "/:tenantId/api-keys/:keyId",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER", "ADMIN"),
  tenantController.revokeApiKey
);


router.post(
  "/:tenantId/end-users",
  authenticateTenantMember,
  requireTenantAccess,
  tenantController.createEndUser
);
router.get(
  "/:tenantId/end-users",
  authenticateTenantMember,
  requireTenantAccess,
  tenantController.getEndUsers
);
router.get(
  "/:tenantId/end-users/:userId",
  authenticateTenantMember,
  requireTenantAccess,
  tenantController.getEndUserById
);
router.put(
  "/:tenantId/end-users/:userId",
  authenticateTenantMember,
  requireTenantAccess,
  tenantController.updateEndUser
);
router.delete(
  "/:tenantId/end-users/:userId",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER", "ADMIN"),
  tenantController.deleteEndUser
);

export default router;
