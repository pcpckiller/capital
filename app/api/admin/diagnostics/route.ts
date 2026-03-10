import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.server';
import { kv } from '@/lib/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const hasNextAuthUrl = Boolean(process.env.NEXTAUTH_URL);
  const hasSecret = Boolean(process.env.NEXTAUTH_SECRET);
  return NextResponse.json({
    nextAuth: { hasNextAuthUrl, hasSecret },
    kv: { enabled: kv.enabled }
  });
}

