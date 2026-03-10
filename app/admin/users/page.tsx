'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type UserRow = {
  id: string;
  email: string;
  fullName: string;
  role: 'investor' | 'admin';
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? '加载失败');
        return;
      }
      const data = (await res.json()) as UserRow[];
      setUsers(data);
    }
    load();
  }, []);

  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-bg text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm text-white/70">
          仅管理员可访问此页面。
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/50">Admin</div>
            <h1 className="mt-1 text-lg font-semibold">注册用户列表</h1>
          </div>
          <Link
            href="/admin"
            className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur hover:bg-white/10"
          >
            返回 Admin
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
          {error ? (
            <div className="text-sm text-red-400">{error}</div>
          ) : !users ? (
            <div className="text-sm text-white/60">加载中…</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-white/60">暂无用户。</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/60">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">姓名</th>
                    <th className="py-2 pr-4">邮箱</th>
                    <th className="py-2 pr-4">角色</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-white/80">{u.id}</td>
                      <td className="py-2 pr-4">{u.fullName}</td>
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2 pr-4">
                        <span className="rounded-2xl border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

