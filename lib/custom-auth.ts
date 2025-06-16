import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.AUTH_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRES_IN = '7d';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const user = verifyToken(token);
    if (!user) {
      return null;
    }

    // Verify user still exists in database
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!dbUser) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email!,
      name: dbUser.name,
      role: dbUser.role,
    };
  } catch (error) {
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, role: true }
    });

    if (!user || !user.password) {
      return null;
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email!,
      name: user.name,
      role: user.role,
    };

    const token = generateToken(authUser);

    return { user: authUser, token };
  } catch (error) {
    console.error('Sign in error:', error);
    return null;
  }
}

export async function signUp(email: string, password: string, name: string): Promise<{ user: AuthUser; token: string } | null> {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        emailVerified: new Date(), // Auto-verify for custom auth
      },
      select: { id: true, email: true, name: true, role: true }
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email!,
      name: user.name,
      role: user.role,
    };

    const token = generateToken(authUser);

    return { user: authUser, token };
  } catch (error) {
    console.error('Sign up error:', error);
    return null;
  }
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function removeAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete('auth-token');
}