import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret');

export type AuthRole = 'viewer' | 'admin';

export async function signToken(payload: Record<string, string>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '8h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export function hasRole(payload: JWTPayload | null, role: AuthRole): boolean {
  return payload?.role === role;
}
