import { Router } from "express";
import * as tenantController from "../controllers/tenant";

const router = Router();

router.post("/signup", tenantController.signupTenant);
router.post("/auth/login", tenantController.loginTenantMember);

router.post("/", tenantController.createTenant);
router.get("/", tenantController.getAllTenants);
router.get("/:tenantId", tenantController.getTenantById);
router.put("/:tenantId", tenantController.updateTenant);
router.delete("/:tenantId", tenantController.deleteTenant);

router.post("/:tenantId/members", tenantController.addTenantMember);
router.get("/:tenantId/members", tenantController.getTenantMembers);
router.get("/:tenantId/members/:memberId", tenantController.getTenantMemberById);
router.put("/:tenantId/members/:memberId", tenantController.updateTenantMember);
router.delete("/:tenantId/members/:memberId", tenantController.removeTenantMember);

router.post("/:tenantId/api-keys", tenantController.createApiKey);
router.get("/:tenantId/api-keys", tenantController.getApiKeys);
router.delete("/:tenantId/api-keys/:keyId", tenantController.revokeApiKey);

router.post("/:tenantId/end-users", tenantController.createEndUser);
router.get("/:tenantId/end-users", tenantController.getEndUsers);
router.get("/:tenantId/end-users/:userId", tenantController.getEndUserById);
router.put("/:tenantId/end-users/:userId", tenantController.updateEndUser);
router.delete("/:tenantId/end-users/:userId", tenantController.deleteEndUser);

export default router;
