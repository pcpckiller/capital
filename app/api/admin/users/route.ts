import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.server';
import { listUsers } from '@/lib/mock-db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const users = await listUsers();
  return NextResponse.json(users);
}

