import type { Request, Response } from "express";

export async function signupTenant(req: Request, res: Response): Promise<void> {}
export async function loginTenantMember(req: Request, res: Response): Promise<void> {}

export async function createTenant(req: Request, res: Response): Promise<void> {}
export async function getAllTenants(req: Request, res: Response): Promise<void> {}
export async function getTenantById(req: Request, res: Response): Promise<void> {}
export async function updateTenant(req: Request, res: Response): Promise<void> {}
export async function deleteTenant(req: Request, res: Response): Promise<void> {}

export async function addTenantMember(req: Request, res: Response): Promise<void> {}
export async function getTenantMembers(req: Request, res: Response): Promise<void> {}
export async function getTenantMemberById(req: Request, res: Response): Promise<void> {}
export async function updateTenantMember(req: Request, res: Response): Promise<void> {}
export async function removeTenantMember(req: Request, res: Response): Promise<void> {}

export async function createApiKey(req: Request, res: Response): Promise<void> {}
export async function getApiKeys(req: Request, res: Response): Promise<void> {}
export async function revokeApiKey(req: Request, res: Response): Promise<void> {}

export async function createEndUser(req: Request, res: Response): Promise<void> {}
export async function getEndUsers(req: Request, res: Response): Promise<void> {}
export async function getEndUserById(req: Request, res: Response): Promise<void> {}
export async function updateEndUser(req: Request, res: Response): Promise<void> {}
export async function deleteEndUser(req: Request, res: Response): Promise<void> {}
