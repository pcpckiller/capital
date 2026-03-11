import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.server';
import { getFeeBreakdownForUser } from '@/lib/mock-db';

export async function GET() {
  const session = await getServerSession(authConfig);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await getFeeBreakdownForUser(userId);
  return NextResponse.json(rows);
}

