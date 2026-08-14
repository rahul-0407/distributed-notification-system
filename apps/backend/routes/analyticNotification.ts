import { Router } from "express";
import * as analyticController from "../controllers/analyticNotification";

const router = Router();

router.get("/admin/all", analyticController.getAdminAllNotifications);

router.get("/admin/tenant/:tenantId", analyticController.getAdminTenantNotifications);

router.get("/admin/tenant/:tenantId/user/:userId", analyticController.getAdminTenantUserNotifications);

router.get("/admin/stats", analyticController.getAdminGlobalStats);

router.get("/admin/tenant/:tenantId/stats", analyticController.getAdminTenantStats);

router.get("/admin/date-range", analyticController.getAdminDateFilteredNotifications);


router.get("/tenant/:tenantId/all", analyticController.getTenantAllNotifications);

router.get("/tenant/:tenantId/user/:userId", analyticController.getTenantUserNotifications);

router.get("/tenant/:tenantId/user/:userId/last-5", analyticController.getTenantUserLast5Notifications);

router.get("/tenant/:tenantId/today", analyticController.getTenantTodayNotifications);

router.get("/tenant/:tenantId/this-month", analyticController.getTenantThisMonthNotifications);

router.get("/tenant/:tenantId/stats", analyticController.getTenantAnalyticsStats);

router.get("/user/:userId/notifications", analyticController.getEndUserNotifications);


router.get("/user/:userId/last-5", analyticController.getEndUserLast5Notifications);


router.get("/user/:userId/today", analyticController.getEndUserTodayNotifications);


router.get("/user/:userId/this-month", analyticController.getEndUserThisMonthNotifications);


router.get("/notification/:notificationId", analyticController.getNotificationById);

router.get("/notification/:notificationId/attempts", analyticController.getNotificationAttempts);

export default router;
