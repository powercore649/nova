import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/auth-config';

export interface AuthPayload {
  userId: string;
  username?: string;
  role?: string;
}

/**
 * Verify the JWT token from cookie header.
 * Returns the decoded payload or null if invalid/missing.
 */
export async function getAuthPayload(req: Request): Promise<AuthPayload | null> {
  const cookie = req.headers.get('cookie');
  const token = cookie?.split('token=')[1]?.split(';')[0];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return {
      userId: (payload.userId as string) || (payload.sub as string) || '',
      username: (payload.username as string) || '',
      role: (payload.role as string) || '',
    };
  } catch {
    return null;
  }
}

export async function isAuthenticated(req: Request): Promise<boolean> {
  return (await getAuthPayload(req)) !== null;
}
