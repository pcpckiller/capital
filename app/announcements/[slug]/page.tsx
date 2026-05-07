import { notFound } from 'next/navigation';

import { getPostBySlug } from '@/lib/mock-db';

export const dynamic = 'force-dynamic';

export default async function AnnouncementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div className="mt-4 text-xs text-white/40">
          {new Date(post.publishedAt).toLocaleString()}
        </div>
        <div className="mt-8 prose prose-invert max-w-none whitespace-pre-wrap text-white/80">
          {post.body}
        </div>
      </div>
    </main>
  );
}
