import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Account from '@/models/Account';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { JWT_SECRET } from '@/lib/auth-config';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username?.trim() || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    if (username.trim().length < 3 || username.trim().length > 32) {
      return NextResponse.json({ error: 'Username must be 3–32 characters' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await dbConnect();

    const existing = await Account.findOne({ username: username.trim() });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const account = await Account.create({ username: username.trim(), passwordHash });

    // Sign JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ accountId: String(account._id), username: account.username, role: 'user' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(secret);

    const response = NextResponse.json({ success: true, username: account.username });
    response.cookies.set('account-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
