import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";


export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}


export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}


export function generateToken(payload: object, expiresIn: string = "7d"): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn } as jwt.SignOptions);
}
