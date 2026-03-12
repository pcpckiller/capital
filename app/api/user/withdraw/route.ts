import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import { createWithdrawalRequest } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const email = (session?.user as { email?: string } | undefined)?.email;
  if (!session || !email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { amount?: number; address?: string } | null;
  if (!body || typeof body.amount !== 'number' || !body.address || typeof body.address !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }
  const address = body.address.trim();
  if (!address) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }
  const req = await createWithdrawalRequest({ userEmail: email, amount, address });
  return NextResponse.json(req);
}

