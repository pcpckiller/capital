import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import { listWithdrawalRequests, updateWithdrawalStatus } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const rows = await listWithdrawalRequests();
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { id?: string; status?: 'pending' | 'approved' | 'rejected' } | null;
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const updated = await updateWithdrawalStatus(body.id, body.status);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

