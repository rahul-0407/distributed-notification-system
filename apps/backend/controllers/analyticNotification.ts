import type { Request, Response } from "express";


export async function getAdminAllNotifications(req: Request, res: Response): Promise<void> {}


export async function getAdminTenantNotifications(req: Request, res: Response): Promise<void> {}

export async function getAdminTenantUserNotifications(req: Request, res: Response): Promise<void> {}
export async function getAdminGlobalStats(req: Request, res: Response): Promise<void> {}

export async function getAdminTenantStats(req: Request, res: Response): Promise<void> {}
export async function getAdminDateFilteredNotifications(req: Request, res: Response): Promise<void> {}

export async function getTenantAllNotifications(req: Request, res: Response): Promise<void> {}

export async function getTenantUserNotifications(req: Request, res: Response): Promise<void> {}
export async function getTenantUserLast5Notifications(req: Request, res: Response): Promise<void> {}

export async function getTenantTodayNotifications(req: Request, res: Response): Promise<void> {}
export async function getTenantThisMonthNotifications(req: Request, res: Response): Promise<void> {}
export async function getTenantAnalyticsStats(req: Request, res: Response): Promise<void> {}

export async function getEndUserNotifications(req: Request, res: Response): Promise<void> {}
export async function getEndUserLast5Notifications(req: Request, res: Response): Promise<void> {}

export async function getEndUserTodayNotifications(req: Request, res: Response): Promise<void> {}

export async function getEndUserThisMonthNotifications(req: Request, res: Response): Promise<void> {}


export async function getNotificationById(req: Request, res: Response): Promise<void> {}
export async function getNotificationAttempts(req: Request, res: Response): Promise<void> {}
