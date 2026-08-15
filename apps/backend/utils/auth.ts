import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { env } from "../config/env";
import type { AuthJwtPayload } from "../types";

export const ADMIN_COOKIE_NAME = "admin_token";
export const TENANT_COOKIE_NAME = "tenant_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthJwtPayload | object, expiresIn: string = "7d"): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthJwtPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as AuthJwtPayload;
  } catch (error) {
    return null;
  }
}

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    path: "/",
  };
}

export function setAuthCookie(res: Response, cookieName: string, token: string): void {
  res.cookie(cookieName, token, getCookieOptions());
}

export function clearAuthCookie(res: Response, cookieName: string): void {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
}
