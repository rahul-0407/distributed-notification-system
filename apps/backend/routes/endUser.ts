import { Router } from "express";
import * as endUserController from "../controllers/endUser";
import {
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole,
} from "../middleware/auth";



const router = Router({ mergeParams: true });

router.post("/", authenticateTenantMember, requireTenantAccess, endUserController.createEndUser);
router.get("/", authenticateTenantMember, requireTenantAccess, endUserController.getEndUsers);
router.get("/:userId", authenticateTenantMember, requireTenantAccess, endUserController.getEndUserById);
router.put("/:userId", authenticateTenantMember, requireTenantAccess, endUserController.updateEndUser);
router.delete("/:userId", authenticateTenantMember, requireTenantAccess, requireTenantRole("OWNER", "ADMIN"), endUserController.deleteEndUser);




export default router;
