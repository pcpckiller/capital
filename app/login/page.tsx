'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/dashboard'
    });
    if (res?.error) {
      setError('登录失败，请检查邮箱与密码。');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 text-white">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_0%,rgba(0,112,243,0.26),transparent_60%)]" />
        <div className="relative">
          <h1 className="text-xl font-semibold tracking-tight">登录 Cartoon Capital</h1>
          <p className="mt-2 text-sm text-white/70">使用注册邮箱登录投资人面板。</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-white/60">邮箱 / Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-white/40 focus:border-electric focus:shadow-glow"
                placeholder="you@domain.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">密码 / Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-white/40 focus:border-electric focus:shadow-glow"
                placeholder="••••••••"
              />
            </div>
            {error && <div className="text-xs text-red-400">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-electric text-sm font-semibold text-white shadow-glowStrong transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? '登录中…' : '登录 / Login'}
            </button>
          </form>

          <p className="mt-4 text-xs text-white/60">
            还没有账户？请先{' '}
            <Link href="/signup" className="text-electric hover:underline">
              注册
            </Link>
            。
          </p>
        </div>
      </div>
    </main>
  );
}

