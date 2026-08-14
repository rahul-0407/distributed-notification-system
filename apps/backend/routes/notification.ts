import { Router } from "express";
import * as notificationController from "../controllers/notification";

const router = Router();

router.post("/", notificationController.sendNotification);

export default router;