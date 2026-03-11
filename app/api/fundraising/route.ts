import { NextResponse } from 'next/server';
import { getFundraisingProgress } from '@/lib/mock-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getFundraisingProgress();
  return NextResponse.json(data);
}

