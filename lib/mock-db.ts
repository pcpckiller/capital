import bcrypt from 'bcryptjs';

import { kv } from './kv';

export type UserRecord = {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: 'investor' | 'admin';
};

export type PortfolioRecord = {
  userId: string;
  totalBalance: number;
  cumulativePnl: number;
  nav: number;
  lockupEnd: string;
};

const memUsers = new Map<string, UserRecord>();
const memPortfolios = new Map<string, PortfolioRecord>();
type CurvePoint = { label: string; value: number };
const memCurves = new Map<string, CurvePoint[]>();
export type PostRecord = {
  id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt: number;
  createdAt: number;
  updatedAt: number;
};
const memPosts = new Map<string, PostRecord>();
const memSlugToId = new Map<string, string>();
let memFundraising = { progress: 0, updatedAt: 0 };

function ensureDemoAdmin() {
  if (kv.enabled) return;
  if (memUsers.size > 0) return;
  const id = 'admin-1';
  const passwordHash = bcrypt.hashSync('CartoonAdmin!2026', 10);
  const admin: UserRecord = {
    id,
    email: 'admin@cartoon.capital',
    fullName: 'Cartoon Admin',
    passwordHash,
    role: 'admin'
  };
  memUsers.set(admin.email, admin);
}

ensureDemoAdmin();

export async function createUser(input: {
  email: string;
  fullName: string;
  password: string;
}): Promise<UserRecord> {
  const email = input.email.toLowerCase();
  if (kv.enabled) {
    try {
      const exists = await kv.hgetall(`user:${email}`);
      if (exists) throw new Error('User already exists');
      const id = `user-${Date.now()}`;
      const passwordHash = await bcrypt.hash(input.password, 10);
      await kv.hmset(`user:${email}`, {
        id,
        email,
        fullName: input.fullName,
        passwordHash,
        role: 'investor'
      });
      await kv.sadd('users:set', email);
      await kv.hmset(`portfolio:${id}`, {
        userId: id,
        totalBalance: '0',
        cumulativePnl: '0',
        nav: '1',
        lockupEnd: new Date().toISOString()
      });
      return {
        id,
        email,
        fullName: input.fullName,
        passwordHash,
        role: 'investor'
      };
    } catch {
      // fall through to in-memory
    }
  }
  const existing = memUsers.get(email);
  if (existing) throw new Error('User already exists');
  const id = `user-${Date.now()}`;
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: UserRecord = { id, email, fullName: input.fullName, passwordHash, role: 'investor' };
  memUsers.set(email, user);
  memPortfolios.set(id, {
    userId: id,
    totalBalance: 0,
    cumulativePnl: 0,
    nav: 1,
    lockupEnd: new Date().toISOString()
  });
  return user;
}

export async function findUserByEmail(emailInput: string): Promise<UserRecord | null> {
  const email = emailInput.toLowerCase();
  if (kv.enabled) {
    try {
      const data = await kv.hgetall(`user:${email}`);
      if (!data) {
        // Graceful bootstrap for admin when KV has not been initialized
        if (email === 'admin@cartoon.capital') {
          const passwordHash = bcrypt.hashSync('CartoonAdmin!2026', 10);
          return {
            id: 'admin-1',
            email,
            fullName: 'Cartoon Admin',
            passwordHash,
            role: 'admin'
          };
        }
        return null;
      }
      return {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        passwordHash: data.passwordHash,
        role: (data.role as 'investor' | 'admin') ?? 'investor'
      };
    } catch {
      // fall through to memory
    }
  }
  return memUsers.get(email) ?? null;
}

export async function validateUser(email: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  // Seed admin into KV after first successful login, if not present
  if (kv.enabled && user.role === 'admin') {
    try {
      const existing = await kv.hgetall(`user:${user.email}`);
      if (!existing) {
        await kv.hmset(`user:${user.email}`, {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          passwordHash: user.passwordHash,
          role: user.role
        });
        await kv.sadd('users:set', user.email);
      }
    } catch {
      // ignore seeding failure
    }
  }
  return user;
}

export async function getPortfolioByUserId(userId: string): Promise<PortfolioRecord | null> {
  if (kv.enabled) {
    try {
      const data = await kv.hgetall(`portfolio:${userId}`);
      if (!data) return null;
      return {
        userId: data.userId,
        totalBalance: Number(data.totalBalance ?? 0),
        cumulativePnl: Number(data.cumulativePnl ?? 0),
        nav: Number(data.nav ?? 1),
        lockupEnd: data.lockupEnd ?? new Date().toISOString()
      };
    } catch {
      // fall through
    }
  }
  return memPortfolios.get(userId) ?? null;
}

export async function getCurveByUserId(userId: string): Promise<CurvePoint[] | null> {
  if (kv.enabled) {
    try {
      const data = await kv.hgetall(`portfolio:${userId}`);
      const raw = data?.curve;
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as CurvePoint[];
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return null;
    } catch {
      // fall through
    }
  }
  return memCurves.get(userId) ?? null;
}

export async function setCurveByUserId(userId: string, points: CurvePoint[]) {
  if (kv.enabled) {
    try {
      await kv.hmset(`portfolio:${userId}`, { curve: JSON.stringify(points) });
      return;
    } catch {
      // fall through
    }
  }
  memCurves.set(userId, points);
}

export async function updatePortfolio(input: {
  userId: string;
  totalBalance?: number;
  cumulativePnl?: number;
  nav?: number;
  lockupEnd?: string;
}) {
  if (kv.enabled) {
    try {
      const existing = await getPortfolioByUserId(input.userId);
      if (!existing) throw new Error('Portfolio not found');
      const next: PortfolioRecord = {
        ...existing,
        ...(input.totalBalance !== undefined ? { totalBalance: input.totalBalance } : null),
        ...(input.cumulativePnl !== undefined ? { cumulativePnl: input.cumulativePnl } : null),
        ...(input.nav !== undefined ? { nav: input.nav } : null),
        ...(input.lockupEnd !== undefined ? { lockupEnd: input.lockupEnd } : null)
      };
      await kv.hmset(`portfolio:${input.userId}`, {
        userId: next.userId,
        totalBalance: String(next.totalBalance),
        cumulativePnl: String(next.cumulativePnl),
        nav: String(next.nav),
        lockupEnd: next.lockupEnd
      });
      return next;
    } catch {
      // fall through
    }
  }
  const existing = memPortfolios.get(input.userId);
  if (!existing) {
    throw new Error('Portfolio not found');
  }
  const updated: PortfolioRecord = {
    ...existing,
    ...('totalBalance' in input ? { totalBalance: input.totalBalance! } : null),
    ...('cumulativePnl' in input ? { cumulativePnl: input.cumulativePnl! } : null),
    ...('nav' in input ? { nav: input.nav! } : null),
    ...('lockupEnd' in input ? { lockupEnd: input.lockupEnd! } : null)
  };
  memPortfolios.set(input.userId, updated);
  return updated;
}

export async function listUsers(): Promise<Array<Omit<UserRecord, 'passwordHash'>>> {
  if (kv.enabled) {
    try {
      const emails = await kv.smembers('users:set');
      const out: Array<Omit<UserRecord, 'passwordHash'>> = [];
      for (const email of emails) {
        const u = await findUserByEmail(email);
        if (u) {
          const { passwordHash: _omit1, ...rest } = u;
          out.push(rest);
        }
      }
      if (out.length === 0) {
        const admin = await findUserByEmail('admin@cartoon.capital');
        if (admin) {
          const { passwordHash: _omit2, ...rest } = admin;
          out.push(rest);
        }
      }
      return out;
    } catch {
      // fall through
    }
  }
  const arr: Array<Omit<UserRecord, 'passwordHash'>> = [];
  for (const u of memUsers.values()) {
    const { passwordHash: _omit3, ...rest } = u;
    arr.push(rest);
  }
  return arr;
}

// Posts (Announcements)
export async function upsertPost(input: {
  id?: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt?: number;
}): Promise<PostRecord> {
  const now = Date.now();
  if (kv.enabled) {
    try {
      let id = input.id;
      if (!id) {
        const existed = await kv.hget('posts:slug', input.slug);
        if (existed) throw new Error('Slug already exists');
        id = `post-${now}`;
      }
      await kv.hmset(`post:${id}`, {
        id,
        slug: input.slug,
        title: input.title,
        body: input.body,
        published: input.published ? '1' : '0',
        publishedAt: String(input.publishedAt ?? now),
        createdAt: String(input.id ? now : now), // we don't have createdAt in store; set/update
        updatedAt: String(now)
      });
      await kv.hmset('posts:slug', { [input.slug]: id! });
      await kv.sadd('posts:set', id!);
      return {
        id: id!,
        slug: input.slug,
        title: input.title,
        body: input.body,
        published: input.published,
        publishedAt: input.publishedAt ?? now,
        createdAt: now,
        updatedAt: now
      };
    } catch {
      // fall through to memory
    }
  }
  // memory
  let id = input.id;
  if (!id) {
    if (memSlugToId.has(input.slug)) throw new Error('Slug already exists');
    id = `post-${now}`;
  }
  const rec: PostRecord = {
    id,
    slug: input.slug,
    title: input.title,
    body: input.body,
    published: input.published,
    publishedAt: input.publishedAt ?? now,
    createdAt: now,
    updatedAt: now
  };
  memPosts.set(id, rec);
  memSlugToId.set(input.slug, id);
  return rec;
}

export async function getPostBySlug(slug: string): Promise<PostRecord | null> {
  if (kv.enabled) {
    try {
      const id = await kv.hget('posts:slug', slug);
      if (!id) return null;
      const data = await kv.hgetall(`post:${id}`);
      if (!data) return null;
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        body: data.body,
        published: data.published === '1',
        publishedAt: Number(data.publishedAt ?? data.createdAt ?? Date.now()),
        createdAt: Number(data.createdAt ?? Date.now()),
        updatedAt: Number(data.updatedAt ?? Date.now())
      };
    } catch {
      // fall through
    }
  }
  const id = memSlugToId.get(slug);
  return id ? memPosts.get(id) ?? null : null;
}

export async function listPublishedPosts(): Promise<PostRecord[]> {
  if (kv.enabled) {
    try {
      const ids = await kv.smembers('posts:set');
      const out: PostRecord[] = [];
      for (const id of ids) {
        const data = await kv.hgetall(`post:${id}`);
        if (!data) continue;
        const rec: PostRecord = {
          id: data.id,
          slug: data.slug,
          title: data.title,
          body: data.body,
          published: data.published === '1',
          publishedAt: Number(data.publishedAt ?? data.createdAt ?? Date.now()),
          createdAt: Number(data.createdAt ?? Date.now()),
          updatedAt: Number(data.updatedAt ?? Date.now())
        };
        if (rec.published) out.push(rec);
      }
      out.sort((a, b) => b.publishedAt - a.publishedAt);
      return out;
    } catch {
      // fall through
    }
  }
  const arr = Array.from(memPosts.values()).filter((p) => p.published);
  arr.sort((a, b) => b.publishedAt - a.publishedAt);
  return arr;
}

export async function listAllPostsAdmin(): Promise<PostRecord[]> {
  if (kv.enabled) {
    try {
      const ids = await kv.smembers('posts:set');
      const out: PostRecord[] = [];
      for (const id of ids) {
        const data = await kv.hgetall(`post:${id}`);
        if (!data) continue;
        out.push({
          id: data.id,
          slug: data.slug,
          title: data.title,
          body: data.body,
          published: data.published === '1',
          publishedAt: Number(data.publishedAt ?? data.createdAt ?? Date.now()),
          createdAt: Number(data.createdAt ?? Date.now()),
          updatedAt: Number(data.updatedAt ?? Date.now())
        });
      }
      out.sort((a, b) => b.publishedAt - a.publishedAt);
      return out;
    } catch {
      // fall through
    }
  }
  const arr = Array.from(memPosts.values());
  arr.sort((a, b) => b.publishedAt - a.publishedAt);
  return arr;
}

export async function seedDefaultPostsIfEmpty(): Promise<void> {
  const current = await listAllPostsAdmin();
  if (current.length > 0) return;
  const now = Date.now();
  const defaults: Array<{ slug: string; title: string; body: string; publishedAt: number }> = [
    {
      slug: 'phase-ii-fundraising',
      title: '新一期募资公告',
      body:
        '卡顿对冲基金现开启新一期募资窗口。目标规模 1000 万 USDT，认购期限 30 天，单户最低 5 万 USDT。市场中性策略组合，力求稳健阿尔法。详情请联系 IR。',
      publishedAt: now
    },
    {
      slug: 'phase-i-redemption-window',
      title: '第一期到期开放赎回公告',
      body:
        '第一期产品现已到达开放赎回窗口，合格投资人可在本月内提交赎回申请。未提交者视为续期。更多说明与流程请参见投资人邮件或联系 IR。',
      publishedAt: now
    }
  ];
  for (const p of defaults) {
    await upsertPost({ slug: p.slug, title: p.title, body: p.body, published: true, publishedAt: p.publishedAt });
  }
}

export async function getFundraisingProgress(): Promise<{ progress: number; updatedAt: number }> {
  if (kv.enabled) {
    try {
      const data = await kv.hgetall('fundraising:config');
      const progress = Number(data?.progress ?? 0);
      const updatedAt = Number(data?.updatedAt ?? 0);
      return { progress, updatedAt };
    } catch {}
  }
  return memFundraising;
}

export async function setFundraisingProgress(progress: number): Promise<{ progress: number; updatedAt: number }> {
  const p = Math.max(0, Math.min(100, Math.round(progress)));
  const updatedAt = Date.now();
  if (kv.enabled) {
    try {
      await kv.hmset('fundraising:config', { progress: String(p), updatedAt: String(updatedAt) });
      return { progress: p, updatedAt };
    } catch {}
  }
  memFundraising = { progress: p, updatedAt };
  return memFundraising;
}

