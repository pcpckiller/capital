import Link from 'next/link';
import { notFound } from 'next/navigation';

type Post = {
  id: string;
  slug: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export default async function AnnouncementDetail({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let res: Response | null = null;
  try {
    res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  } catch {
    res = null;
  }
  if (!res || !res.ok) notFound();
  const post = (await res.json()) as Post;

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">基金公告</h1>
          <Link
            href="/announcements"
            className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
          >
            返回列表
          </Link>
        </div>

        <article className="prose prose-invert max-w-none rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
          <div className="mb-4 text-[11px] text-white/60">
            更新于 {new Date(post.updatedAt).toLocaleString()}
          </div>
          <div className="whitespace-pre-wrap text-sm leading-7 text-white/85">{post.body}</div>
        </article>
      </div>
    </main>
  );
}
