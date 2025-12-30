// lib/auth.ts
import { cookies } from 'next/headers';
import { verifyToken } from './auth/jwt';
import { authService } from './services/auth.services';

export interface Session {
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    const user = await authService.getUserById(decoded.userId);

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    return null;
  }
}

