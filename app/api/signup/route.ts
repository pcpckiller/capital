import { NextResponse } from 'next/server';
import { assignDepositAddresses, createUser, findUserByEmail } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || typeof body.fullName !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const existing = await findUserByEmail(body.email);
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const user = await createUser({
    email: body.email,
    fullName: body.fullName,
    password: body.password
  });

  try {
    await assignDepositAddresses(user.id);
  } catch {
    // best-effort; dashboard fetch will also attempt assignment on first load
  }

  return NextResponse.json({ id: user.id, email: user.email, fullName: user.fullName });
}
