import { Router } from "express";
import * as tenantMemberController from "../controllers/tenantMember";
import {
  authenticateTenantMember,
  requireTenantAccess,
  requireTenantRole,
} from "../middleware/auth";



const router = Router({ mergeParams: true });


router.post("/", authenticateTenantMember, requireTenantAccess, requireTenantRole("OWNER", "ADMIN"), tenantMemberController.addTenantMember);
router.get("/", authenticateTenantMember, requireTenantAccess, tenantMemberController.getTenantMembers);
router.get("/:memberId", authenticateTenantMember, requireTenantAccess, tenantMemberController.getTenantMemberById);
router.put("/:memberId", authenticateTenantMember, requireTenantAccess, requireTenantRole("OWNER", "ADMIN"), tenantMemberController.updateTenantMember);
router.delete("/:memberId", authenticateTenantMember, requireTenantAccess, requireTenantRole("OWNER"), tenantMemberController.removeTenantMember);



export default router;
