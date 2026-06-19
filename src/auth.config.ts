import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [], // Preenchido no auth.ts (ambiente non-edge)
} satisfies NextAuthConfig
