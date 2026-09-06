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

    // Brute-force delay
    await new Promise(r => setTimeout(r, 800));

    await dbConnect();

    const account = await Account.findOne({ username: username.trim() });
    if (!account) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
    console.error('Account login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
