import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.server';
import { getEmailConfig, setEmailConfig } from '@/lib/mock-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await getEmailConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  await setEmailConfig({
    host: String(body.host || ''),
    port: Number(body.port || 465),
    user: String(body.user || ''),
    pass: String(body.pass || ''),
    from: String(body.from || ''),
    enabled: Boolean(body.enabled)
  });

  return NextResponse.json({ success: true });
}
