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
    const data = await kv.hgetall(`user:${email}`);
    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      passwordHash: data.passwordHash,
      role: (data.role as 'investor' | 'admin') ?? 'investor'
    };
  }
  return memUsers.get(email) ?? null;
}

export async function validateUser(email: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function getPortfolioByUserId(userId: string): Promise<PortfolioRecord | null> {
  if (kv.enabled) {
    const data = await kv.hgetall(`portfolio:${userId}`);
    if (!data) return null;
    return {
      userId: data.userId,
      totalBalance: Number(data.totalBalance ?? 0),
      cumulativePnl: Number(data.cumulativePnl ?? 0),
      nav: Number(data.nav ?? 1),
      lockupEnd: data.lockupEnd ?? new Date().toISOString()
    };
  }
  return memPortfolios.get(userId) ?? null;
}

export async function updatePortfolio(input: {
  userId: string;
  totalBalance?: number;
  cumulativePnl?: number;
  nav?: number;
  lockupEnd?: string;
}) {
  if (kv.enabled) {
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
  }
  const arr: Array<Omit<UserRecord, 'passwordHash'>> = [];
  for (const u of memUsers.values()) {
    const { passwordHash: _omit3, ...rest } = u;
    arr.push(rest);
  }
  return arr;
}
