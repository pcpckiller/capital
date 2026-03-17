import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import {
  findUserByEmail,
  getUserAssetsByUserId,
  setManualOverrideByUserId,
} from '@/lib/mock-db';

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
  const user = email ? await findUserByEmail(email) : null;
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const assets = await getUserAssetsByUserId(user.id);
  return NextResponse.json(assets ?? { userId: user.id, autoAmount: 0, manualAmount: 0, isManualPriority: false, updatedAt: 0 });
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { email?: string; manualAmount?: number; isManualPriority?: boolean } | null;
  if (!body?.email) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const user = await findUserByEmail(body.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const manualAmount = typeof body.manualAmount === 'number' ? body.manualAmount : 0;
  const isManualPriority = Boolean(body.isManualPriority);
  const next = await setManualOverrideByUserId(user.id, manualAmount, isManualPriority);
  return NextResponse.json(next);
}
