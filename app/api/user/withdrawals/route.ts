import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import { listUserWithdrawalRequests } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authConfig);
  const email = (session?.user as { email?: string } | undefined)?.email;
  if (!session || !email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await listUserWithdrawalRequests(email);
  return NextResponse.json(rows);
}

