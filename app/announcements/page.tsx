'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type PostMeta = {
  id: string;
  slug: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/posts', { cache: 'no-store' });
      const data = (await res.json()) as PostMeta[];
      setPosts(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-4xl">
        <div className="text-xs uppercase tracking-[0.18em] text-white/50">Announcements</div>
        <h1 className="mt-1 text-lg font-semibold">基金公告</h1>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
              加载中…
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
              暂无公告。
            </div>
          ) : (
            posts.map((p) => (
              <Link
                key={p.id}
                href={`/announcements/${p.slug}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur hover:bg-white/[0.06]"
              >
                <div className="text-sm font-semibold">{p.title}</div>
                <div className="mt-1 text-[11px] text-white/60">
                  {new Date(p.updatedAt).toLocaleString()}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

