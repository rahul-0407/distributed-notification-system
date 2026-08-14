import { Router } from "express";
import * as userController from "../controllers/user";

const router = Router();

router.post("/platform/login", userController.loginPlatformAdmin);
router.post("/platform/admins", userController.createPlatformAdmin);
router.get("/platform/admins", userController.getAllPlatformAdmins);
router.get("/platform/admins/:id", userController.getPlatformAdminById);
router.put("/platform/admins/:id", userController.updatePlatformAdmin);
router.delete("/platform/admins/:id", userController.deletePlatformAdmin);
router.get("/platform/overview", userController.getPlatformOverview);

export default router;