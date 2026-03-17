import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import { findUserByEmail, listHoldingsViewByUserId, setUnitsByUserId } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const user = await findUserByEmail(email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const rows = await listHoldingsViewByUserId(user.id);
  return NextResponse.json({ userId: user.id, email: user.email, holdings: rows });
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string; productId?: 'master1' | 'master2'; units?: number } | null;
  if (!body?.email || !body.productId || typeof body.units !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const user = await findUserByEmail(body.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const updated = await setUnitsByUserId(user.id, body.productId, Number(body.units));
  return NextResponse.json(updated);
}

