import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import bcrypt from "bcryptjs";

async function getUser(email: string) {
  try {
    const { db } = await import("@/lib/db");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    return db.query.users.findFirst({ where: eq(users.email, email) });
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        const user = await getUser(email);
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email ?? "",
          name: user.guestName ?? "",
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const { db } = await import("@/lib/db");
          const { users } = await import("@/lib/db/schema");
          const { eq } = await import("drizzle-orm");

          const existing = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });

          if (!existing) {
            // Brand-new Google user → insert and mark needsOnboarding
            await db.insert(users).values({
              email: user.email,
              guestName: user.name ?? undefined,
              isGuest: false,
              consentAt: new Date(),
              // ageGroup null = hasn't completed onboarding
            });
            // Signal to jwt callback
            (user as any).isNewGoogleUser = true;
          }
          // Pass db id into next-auth user object
          const row = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });
          if (row) user.id = row.id;
        } catch (err) {
          console.error("Google sign-in DB upsert failed:", err);
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.isNewGoogleUser = (user as any).isNewGoogleUser ?? false;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.isNewGoogleUser) session.user.isNewGoogleUser = true;
      return session;
    },
  },
});
