import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import { createSubscriptionRequest } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const email = (session?.user as { email?: string } | undefined)?.email;
  if (!userId || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { amount?: number } | null;
  if (!body || typeof body.amount !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const rec = await createSubscriptionRequest({
      userId: String(userId),
      userEmail: String(email),
      productId: 'master2',
      amount: Number(body.amount)
    });
    return NextResponse.json(rec);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 400 });
  }
}

