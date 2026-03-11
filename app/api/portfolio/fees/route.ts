import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.server';

// Placeholder route to avoid build errors if older clients still call this path.
// Returns an empty array and 200 status; safe to keep after fee system removal.
export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json([]);
}

