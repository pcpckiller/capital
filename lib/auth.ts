export { authConfig, handler } from './auth.server';
providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await validateUser(credentials.email, credentials.password);
        if (!user) return null;
        const result: NextAuthUser & { role: 'investor' | 'admin' } = {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role
        };
        return result;
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({
      token,
      user
    }: {
      token: { role?: string } & Record<string, unknown>;
      user?: NextAuthUser & { role?: string };
    }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      const s = session as DefaultSession & {
        user?: DefaultSession['user'] & { id?: string; role?: string };
      };
      if (s.user) {
        s.user.id = typeof token.sub === 'string' ? token.sub : undefined;
        const role = (token as unknown as { role?: string }).role;
        (s.user as { role?: string }).role = typeof role === 'string' ? role : undefined;
export const handler = NextAuth(authConfig);
