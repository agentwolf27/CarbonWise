// Shared authentication resolver for API routes.
// Accepts EITHER a NextAuth web session OR a signed Chrome-extension JWT.
//
// This replaces the previous insecure pattern of parsing `ext_<userId>_...`
// strings (which let any caller impersonate any user). Extension tokens are
// now cryptographically verified against NEXTAUTH_SECRET.

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-jwt-secret';

interface ExtensionTokenClaims {
  userId?: string;
  type?: string;
  source?: string;
}

/**
 * Resolve the authenticated user id from a request.
 * @returns the user id, or null if neither a valid session nor a valid token is present.
 */
export async function resolveUserId(request: Request): Promise<string | null> {
  // 1) Web app: NextAuth session cookie
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return session.user.id;
  }

  // 2) Chrome extension: verified Bearer JWT
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as ExtensionTokenClaims;
      if (decoded?.userId) {
        return decoded.userId;
      }
    } catch {
      // invalid / expired / tampered token
      return null;
    }
  }

  return null;
}
