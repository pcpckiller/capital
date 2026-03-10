'use client';

import {
  FormEvent,
  useState,
} from 'react';

import { ShieldCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [totalBalance, setTotalBalance] = useState('');
  const [cumulativePnl, setCumulativePnl] = useState('');
  const [nav, setNav] = useState('');
  const [lockupEnd, setLockupEnd] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch('/api/admin/update-portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        totalBalance: totalBalance ? Number(totalBalance) : undefined,
        cumulativePnl: cumulativePnl ? Number(cumulativePnl) : undefined,
        nav: nav ? Number(nav) : undefined,
        lockupEnd: lockupEnd || undefined
      })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(data?.error ?? '更新失败');
    } else {
      setMessage('已更新投资人账户信息。');
    }
  }

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
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.18em] text-white/50">Admin</div>
          <div className="flex gap-2">
            <Link
              href="/admin/users"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
            >
              查看注册用户
            </Link>
            <Link
              href="/admin/curve"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
            >
              调整收益曲线
            </Link>
            <Link
              href="/api/admin/diagnostics"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
            >
              环境诊断
            </Link>
            <Link
              href="/api/admin/diagnostics/kv-test"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
            >
              KV连通性
            </Link>
          </div>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-electric" />
          <div>
            <div className="text-sm font-semibold">Admin: 更新投资人账户</div>
            <div className="text-[11px] text-white/60">
              通过邮箱定位用户，并更新余额、净值、累计盈亏与封闭期。
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="text-white/70">投资人邮箱 / Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-white/70">总资产 / Total Balance (USDT)</label>
              <input
                value={totalBalance}
                onChange={(e) => setTotalBalance(e.target.value)}
                type="number"
                className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
              />
            </div>
            <div className="space-y-1">
              <label className="text-white/70">累计盈亏 / Cumulative PnL (USDT)</label>
              <input
                value={cumulativePnl}
                onChange={(e) => setCumulativePnl(e.target.value)}
                type="number"
                className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
              />
            </div>
            <div className="space-y-1">
              <label className="text-white/70">净值 / NAV</label>
              <input
                value={nav}
                onChange={(e) => setNav(e.target.value)}
                type="number"
                step="0.001"
                className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
              />
            </div>
            <div className="space-y-1">
              <label className="text-white/70">封闭期结束时间 / Lockup End (ISO)</label>
              <input
                value={lockupEnd}
                onChange={(e) => setLockupEnd(e.target.value)}
                type="datetime-local"
                className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-2 inline-flex h-9 items-center justify-center rounded-2xl bg-electric px-4 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110"
          >
            保存更新
          </button>
          {message && <div className="mt-2 text-[11px] text-white/65">{message}</div>}
        </form>
      </div>
    </main>
  );
}
