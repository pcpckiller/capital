import bcrypt from 'bcryptjs';

export type UserRecord = {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: 'investor' | 'admin';
};

export type PortfolioRecord = {
  userId: string;
  totalBalance: number; // in USDT
  cumulativePnl: number;
  nav: number;
  lockupEnd: string; // ISO date
};

const users = new Map<string, UserRecord>();
const portfolios = new Map<string, PortfolioRecord>();

function ensureDemoAdmin() {
  if (users.size > 0) return;
  const id = 'admin-1';
  const passwordHash = bcrypt.hashSync('CartoonAdmin!2026', 10);
  const admin: UserRecord = {
    id,
    email: 'admin@cartoon.capital',
    fullName: 'Cartoon Admin',
    passwordHash,
    role: 'admin'
  };
  users.set(admin.email, admin);
}

ensureDemoAdmin();

export async function createUser(input: {
  email: string;
  fullName: string;
  password: string;
}): Promise<UserRecord> {
  const existing = users.get(input.email.toLowerCase());
  if (existing) {
    throw new Error('User already exists');
  }
  const id = `user-${Date.now()}`;
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: UserRecord = {
    id,
    email: input.email.toLowerCase(),
    fullName: input.fullName,
    passwordHash,
    role: 'investor'
  };
  users.set(user.email, user);

  portfolios.set(user.id, {
    userId: user.id,
    totalBalance: 0,
    cumulativePnl: 0,
    nav: 1,
    lockupEnd: new Date().toISOString()
  });

  return user;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  return users.get(email.toLowerCase()) ?? null;
}

export async function validateUser(email: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function getPortfolioByUserId(userId: string): Promise<PortfolioRecord | null> {
  return portfolios.get(userId) ?? null;
}

export async function updatePortfolio(input: {
  userId: string;
  totalBalance?: number;
  cumulativePnl?: number;
  nav?: number;
  lockupEnd?: string;
}) {
  const existing = portfolios.get(input.userId);
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
  portfolios.set(input.userId, updated);
  return updated;
}

