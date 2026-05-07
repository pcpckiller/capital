'use client';

import {
  FormEvent,
  useState,
} from 'react';

import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  async function handleSendCode() {
    if (!email) {
      setError('请输入邮箱');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '发送失败');
      } else {
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        if (data.message) {
          setError(data.message); // Show if disabled by admin
        }
      }
    } catch (err) {
      setError('发送失败，请检查网络');
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, code })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? '注册失败，请稍后再试。');
      setLoading(false);
      return;
    }
    await signIn('credentials', { email, password, redirect: true, callbackUrl: '/dashboard' });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 text-white">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_0%,rgba(124,58,237,0.26),transparent_60%)]" />
        <div className="relative">
          <h1 className="text-xl font-semibold tracking-tight">注册 Cartoon Capital 账户</h1>
          <p className="mt-2 text-sm text-white/70">Email + 姓名 + 密码，几步完成注册。</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-white/60">姓名 / Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-white/40 focus:border-electric focus:shadow-glow"
                placeholder="Your full legal name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">邮箱 / Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-white/40 focus:border-electric focus:shadow-glow"
                  placeholder="you@domain.com"
                />
                <button
                  type="button"
                  disabled={sending || countdown > 0}
                  onClick={handleSendCode}
                  className="h-11 whitespace-nowrap rounded-2xl bg-white/10 px-4 text-xs font-medium text-white transition hover:bg-white/15 disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">验证码 / Verification Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-white/40 focus:border-electric focus:shadow-glow"
                placeholder="6 位验证码"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">密码 / Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none placeholder:text-white/40 focus:border-electric focus:shadow-glow"
                placeholder="至少 8 位复杂密码"
              />
            </div>
            {error && <div className="text-xs text-red-400">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-electric text-sm font-semibold text-white shadow-glowStrong transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? '注册中…' : '注册并登录'}
            </button>
          </form>

          <p className="mt-4 text-xs text-white/60">
            已有账户？直接{' '}
            <Link href="/login" className="text-electric hover:underline">
              登录
            </Link>
            。
          </p>
        </div>
      </div>
    </main>
  );
}

