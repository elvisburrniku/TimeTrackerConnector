import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/custom-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const result = await signUp(email, password, name);

    if (!result) {
      return NextResponse.json(
        { error: 'User already exists or registration failed' },
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      { user: result.user },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}