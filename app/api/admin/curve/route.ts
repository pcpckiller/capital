import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.server';
import {
  findUserByEmail,
  getCurveByUserId,
  getPortfolioByUserId,
  setCurveByUserId
} from '@/lib/mock-db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }
  const user = await findUserByEmail(email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const curve = await getCurveByUserId(user.id);
  if (curve && curve.length > 0) return NextResponse.json(curve);
  const p = await getPortfolioByUserId(user.id);
  const nav = p?.nav ?? 1;
  const base = Math.max(nav - 0.2, 0.8);
  const fallback = Array.from({ length: 12 }).map((_, i) => ({
    label: `M${i + 1}`,
    value: base + ((nav - base) * (i + 1)) / 12
  }));
  return NextResponse.json(fallback);
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as
    | { email: string; points: Array<{ label: string; value: number }> }
    | null;
  if (!body || typeof body.email !== 'string' || !Array.isArray(body.points)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const user = await findUserByEmail(body.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const clean = body.points
    .slice(0, 24)
    .map((p, i) => ({
      label: typeof p.label === 'string' && p.label ? p.label : `M${i + 1}`,
      value: Number.isFinite(p.value) ? Number(p.value) : 0
    }))
    .filter((p) => Number.isFinite(p.value));
  if (clean.length === 0) {
    return NextResponse.json({ error: 'No valid points' }, { status: 400 });
  }
  await setCurveByUserId(user.id, clean);
  return NextResponse.json({ ok: true });
}

