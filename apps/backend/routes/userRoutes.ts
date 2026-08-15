import { Router } from "express";
import * as userController from "../controllers/user";
import { authenticatePlatformAdmin, requirePlatformRole } from "../middleware/auth";

const router = Router();

router.post("/platform/login", userController.loginPlatformAdmin);
router.post("/platform/logout", userController.logoutPlatformAdmin);


router.get("/platform/me", authenticatePlatformAdmin, userController.getPlatformAdminMe);

router.get("/platform/overview", authenticatePlatformAdmin, userController.getPlatformOverview);

router.get("/platform/admins", authenticatePlatformAdmin, userController.getAllPlatformAdmins);
router.get("/platform/admins/:id", authenticatePlatformAdmin, userController.getPlatformAdminById);

router.post(
  "/platform/admins",
  authenticatePlatformAdmin,
  requirePlatformRole("SUPER_ADMIN"),
  userController.createPlatformAdmin
);
router.put(
  "/platform/admins/:id",
  authenticatePlatformAdmin,
  requirePlatformRole("SUPER_ADMIN"),
  userController.updatePlatformAdmin
);
router.delete(
  "/platform/admins/:id",
  authenticatePlatformAdmin,
  requirePlatformRole("SUPER_ADMIN"),
  userController.deletePlatformAdmin
);

export default router;