'use client';

import React, {
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
      <div className="w-full max-w-xl space-y-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
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
              href="/admin/posts"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur hover:bg-white/10"
            >
              发布公告
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
        <FundraisingCard />
        <DepositPoolCard />
      </div>
    </main>
  );
}

function FundraisingCard() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/admin/fundraising', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setProgress(Number(data?.progress ?? 0));
        setUpdatedAt(Number(data?.updatedAt ?? 0));
      } else {
        setMessage(data?.error ?? '加载失败');
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    setMessage(null);
    const res = await fetch('/api/admin/fundraising', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(data?.error ?? '保存失败');
      return;
    }
    setProgress(Number(data?.progress ?? progress));
    setUpdatedAt(Number(data?.updatedAt ?? Date.now()));
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.18em] text-white/50">Fundraising</div>
        {!loading && updatedAt > 0 && (
          <div className="text-[11px] text-white/50">更新于 {new Date(updatedAt).toLocaleString()}</div>
        )}
      </div>
      {message && <div className="mb-3 rounded-xl border border-red-800/40 bg-red-900/20 p-2 text-xs text-red-300">{message}</div>}
      <div className="space-y-2">
        <div className="h-4 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.08]">
          <div
            className="h-full rounded-full shadow-glowStrong"
            style={{
              width: `${Math.max(0, Math.min(100, progress))}%`,
              background: 'linear-gradient(90deg, #0070f3 0%, #7c3aed 60%, #22c55e 100%)'
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-20 rounded-2xl border border-white/10 bg-black/40 px-3 py-1 text-xs outline-none focus:border-electric focus:shadow-glow"
          />
          <span className="text-xs text-white/70">% </span>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            className="inline-flex h-9 items-center justify-center rounded-2xl bg-electric px-4 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110"
          >
            保存
          </button>
          <button
            onClick={() => setProgress(0)}
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            清零
          </button>
          <button
            onClick={() => setProgress(100)}
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            拉满
          </button>
        </div>
      </div>
    </div>
  );
}

function DepositPoolCard() {
  const [erc20, setErc20] = useState('');
  const [trc20, setTrc20] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [kvStatus, setKvStatus] = useState<'unknown' | 'enabled' | 'disabled'>('unknown');
  const [counts, setCounts] = useState<{ erc20: number; trc20: number }>({ erc20: 0, trc20: 0 });
  const [idx, setIdx] = useState<{ erc20: number; trc20: number }>({ erc20: 0, trc20: 0 });

  React.useEffect(() => {
    async function probe() {
      try {
        const res = await fetch('/api/admin/diagnostics/kv-test', { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        setKvStatus(data?.enabled ? 'enabled' : 'disabled');
      } catch {
        setKvStatus('unknown');
      }
    }
    probe();
    async function loadPools() {
      try {
        const res = await fetch('/api/admin/deposit-addresses', { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        if (res.ok && data) {
          const eArr = Array.isArray(data.erc20) ? data.erc20 : [];
          const tArr = Array.isArray(data.trc20) ? data.trc20 : [];
          setCounts({ erc20: eArr.length, trc20: tArr.length });
          setIdx({
            erc20: Number(data?.idx?.erc20 ?? 0),
            trc20: Number(data?.idx?.trc20 ?? 0)
          });
          // 仅当文本框为空时预填，避免覆盖正在编辑的内容
          setErc20((prev) => (prev ? prev : eArr.join('\n')));
          setTrc20((prev) => (prev ? prev : tArr.join('\n')));
        }
      } catch {}
    }
    loadPools();
  }, []);

  async function save() {
    setMessage(null);
    setSaving(true);
    const erc20Arr = erc20
      .split(/\r?\n|,|;/)
      .map((s) => s.trim())
      .filter(Boolean);
    const trc20Arr = trc20
      .split(/\r?\n|,|;/)
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch('/api/admin/deposit-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ erc20: erc20Arr, trc20: trc20Arr })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage(data?.error ?? '保存失败');
    } else {
      setMessage(data?.persistent ? '地址池已更新（已持久化）' : '地址池已更新（仅当前实例内有效，建议配置 KV）');
      // 保存成功后刷新一次统计与指针
      try {
        const r2 = await fetch('/api/admin/deposit-addresses', { cache: 'no-store' });
        const d2 = await r2.json().catch(() => null);
        if (r2.ok && d2) {
          setCounts({ erc20: (d2.erc20 || []).length, trc20: (d2.trc20 || []).length });
          setIdx({ erc20: Number(d2?.idx?.erc20 ?? 0), trc20: Number(d2?.idx?.trc20 ?? 0) });
        }
      } catch {}
    }
    setSaving(false);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.18em] text-white/50">Deposit Address Pools</div>
        <div className="text-[11px] text-white/50">
          KV 状态：
          <span className={kvStatus === 'enabled' ? 'text-emerald-300' : 'text-amber-300'}>
            {kvStatus === 'enabled' ? '已配置' : kvStatus === 'disabled' ? '未配置' : '未知'}
          </span>
        </div>
      </div>
      <div className="mb-2 text-[11px] text-white/60">
        当前存储：
        <span className={kvStatus === 'enabled' ? 'ml-1 rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-emerald-300' : 'ml-1 rounded-md bg-amber-400/10 px-1.5 py-0.5 text-amber-200'}>
          {kvStatus === 'enabled' ? '持久化至 KV（跨实例可见）' : '仅当前实例内存（建议配置 KV）'}
        </span>
        <span className="ml-3 text-white/50">
          当前计数：ERC20 {counts.erc20}（指针 {idx.erc20}） / TRC20 {counts.trc20}（指针 {idx.trc20}）
        </span>
      </div>
      {message && <div className="mb-3 rounded-xl border border-amber-800/40 bg-amber-900/20 p-2 text-xs text-amber-200">{message}</div>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <div className="text-[11px] text-white/60">ERC20 地址（每行一个）</div>
          <textarea
            value={erc20}
            onChange={(e) => setErc20(e.target.value)}
            rows={8}
            className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-xs outline-none focus:border-electric focus:shadow-glow"
            placeholder="0x1234...\n0xABCD..."
          />
        </div>
        <div className="space-y-1">
          <div className="text-[11px] text-white/60">TRC20 地址（每行一个）</div>
          <textarea
            value={trc20}
            onChange={(e) => setTrc20(e.target.value)}
            rows={8}
            className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-xs outline-none focus:border-electric focus:shadow-glow"
            placeholder="TXXXX...\nTYYYY..."
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex h-9 items-center justify-center rounded-2xl bg-electric px-4 text-xs font-semibold text-white shadow-glowStrong hover:brightness-110 disabled:opacity-60"
        >
          保存地址池
        </button>
        <div className="self-center text-[11px] text-white/55">将按顺序为新注册用户自动分配</div>
      </div>

      <AssignTester />
    </div>
  );
}

function AssignTester() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    const res = await fetch('/api/admin/deposit-addresses/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setResult(data?.error ?? '失败');
    } else {
      const a = data?.addresses ?? {};
      setResult(`ERC20: ${a.erc20 || '-'} | TRC20: ${a.trc20 || '-'}`);
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2 text-xs uppercase tracking-widest text-white/60">分配测试 / Assign Test</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="输入已注册的投资人邮箱"
          className="h-9 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-xs outline-none focus:border-electric focus:shadow-glow"
        />
        <button
          onClick={run}
          disabled={!email || loading}
          className="inline-flex h-9 items-center justify-center rounded-2xl bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
        >
          {loading ? '处理中…' : '立即分配/查看'}
        </button>
      </div>
      {result && <div className="mt-2 text-[11px] text-white/65">{result}</div>}
    </div>
  );
}
