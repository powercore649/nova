import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('account-token')?.value;
  if (!token) {
    return NextResponse.json({ account: null });
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return NextResponse.json({
      account: {
        accountId: payload.accountId as string,
        username: payload.username as string,
        role: payload.role as string,
      },
    });
  } catch {
    return NextResponse.json({ account: null });
  }
}
