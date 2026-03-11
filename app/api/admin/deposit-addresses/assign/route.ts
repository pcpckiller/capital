import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/lib/auth.server';
import {
  assignDepositAddresses,
  findUserByEmail,
} from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  if (!body?.email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  const user = await findUserByEmail(body.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const addr = await assignDepositAddresses(user.id);
  return NextResponse.json({ userId: user.id, email: user.email, addresses: addr });
}
