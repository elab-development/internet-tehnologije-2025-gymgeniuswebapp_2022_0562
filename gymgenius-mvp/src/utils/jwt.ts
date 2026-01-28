import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { UserRole } from '@/types/models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Generiše JWT token za korisnika (HS256, jose)
 * Token važi 7 dana
 */
export async function generateToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>
): Promise<string> {
  return await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d') // ← STRING FORMAT: '7d' = 7 dana od iat
    .sign(secretKey);
}

/**
 * Verifikuje i dekodira JWT token (jose)
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string'
    ) {
      return payload as JwtPayload;
    }

    console.error('JWT payload missing required fields:', payload);
    return null;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Izvlači token iz Authorization header-a
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}