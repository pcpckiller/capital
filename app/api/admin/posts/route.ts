import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.server';
import {
  listAllPostsAdmin,
  seedDefaultPostsIfEmpty,
  upsertPost
} from '@/lib/mock-db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await seedDefaultPostsIfEmpty();
  const posts = await listAllPostsAdmin();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as
    | {
        action?: 'upsert' | 'seedDefaults';
        id?: string;
        slug?: string;
        title?: string;
        body?: string;
        published?: boolean;
      }
    | null;
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  if (body.action === 'seedDefaults') {
    await seedDefaultPostsIfEmpty();
    const posts = await listAllPostsAdmin();
    return NextResponse.json(posts);
  }
  if (!body.slug || !body.title || typeof body.published !== 'boolean' || typeof body.body !== 'string') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const post = await upsertPost({
    id: body.id,
    slug: body.slug,
    title: body.title,
    body: body.body,
    published: body.published
  });
  return NextResponse.json(post);
}

