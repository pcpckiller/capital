import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import { listTransactionsByUser } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authConfig);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await listTransactionsByUser(userId);
  return NextResponse.json(rows);
}

