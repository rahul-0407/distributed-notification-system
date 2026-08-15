import { Router } from "express";
import * as apiKeyController from "../controllers/apiKey";
import {
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole,
} from "../middleware/auth";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER", "ADMIN", "DEVELOPER"),
  apiKeyController.createApiKey
);

router.get(
  "/",
  authenticateTenantMember,
  requireTenantAccess,
  apiKeyController.getApiKeys
);

router.delete(
  "/:keyId",
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole("OWNER", "ADMIN"),
  apiKeyController.revokeApiKey
);

export default router;
