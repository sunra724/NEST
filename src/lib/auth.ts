import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';

export type AuthRole = 'viewer' | 'admin';

export function getEnvValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  return value.replace(/^["']|["']$/g, '');
}

function getJwtSecret() {
  return new TextEncoder().encode(getEnvValue('JWT_SECRET') ?? 'fallback-secret');
}

function getJwtExpiresIn() {
  return getEnvValue('JWT_EXPIRES_IN') ?? '8h';
}

export async function signToken(payload: Record<string, string>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(getJwtExpiresIn())
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}

export function hasRole(payload: JWTPayload | null, role: AuthRole): boolean {
  return payload?.role === role;
}
