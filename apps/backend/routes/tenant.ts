import { Router } from "express";
import * as tenantController from "../controllers/tenant";
import * as tenantMemberController from "../controllers/tenantMember";
import tenantMemberRoutes from "./tenantMember";
import apiKeyRoutes from "./apiKey";
import endUserRoutes from "./endUser";
import {
  authenticateTenantMember,
  requireTenantRole,
  requireTenantAccess,
} from "../middleware/auth";



const router = Router();


router.post("/signup", tenantMemberController.signupTenant);
router.post("/auth/login", tenantMemberController.loginTenantMember);
router.post("/auth/logout", tenantMemberController.logoutTenantMember);
router.get("/auth/me", authenticateTenantMember, tenantMemberController.getTenantMemberMe);



router.post("/", tenantController.createTenant);
router.get("/", tenantController.getAllTenants);
router.get("/:tenantId", authenticateTenantMember, requireTenantAccess, tenantController.getTenantById);
router.put("/:tenantId", authenticateTenantMember, requireTenantAccess, requireTenantRole("OWNER", "ADMIN"), tenantController.updateTenant);
router.delete("/:tenantId", authenticateTenantMember, requireTenantAccess, requireTenantRole("OWNER"), tenantController.deleteTenant);


router.use("/:tenantId/members", tenantMemberRoutes);
router.use("/:tenantId/api-keys", apiKeyRoutes);
router.use("/:tenantId/end-users", endUserRoutes);




export default router;
