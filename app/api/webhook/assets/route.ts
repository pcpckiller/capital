import { NextResponse } from 'next/server';

import { findUserByEmail, setAutoAmountByUserId } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get('x-webhook-secret');
    if (!header || header !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  const body = (await request.json().catch(() => null)) as { email?: string; autoAmount?: number } | null;
  if (!body?.email || typeof body.autoAmount !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const user = await findUserByEmail(body.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const next = await setAutoAmountByUserId(user.id, Number(body.autoAmount));
  return NextResponse.json(next);
}

