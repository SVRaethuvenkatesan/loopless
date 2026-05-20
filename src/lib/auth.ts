import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined;
        const password = credentials?.password as string | undefined;
        const guestId  = credentials?.guestId  as string | undefined;

        // Guest sign-in: look up by ID, confirm isGuest=true
        if (guestId && !email) {
          try {
            const { withDb } = await import("@/lib/db/with-db");
            const user = await withDb(async (db) => {
              const { users } = await import("@/lib/db/schema");
              const { eq }    = await import("drizzle-orm");
              return db.query.users.findFirst({ where: eq(users.id, guestId) });
            });
            if (!user?.isGuest) return null;
            return {
              id:      user.id,
              email:   user.email ?? "",
              name:    user.guestName ?? "Guest",
              isGuest: true,
              needsOnboarding: !user.ageGroup,
            } as any;
          } catch (err) {
            console.error("[auth] Guest authorize error:", err);
            return null;
          }
        }

        // Email/password sign-in
        if (!email || !password) return null;
        try {
          const { withDb } = await import("@/lib/db/with-db");
          const user = await withDb(async (db) => {
            const { users } = await import("@/lib/db/schema");
            const { eq }    = await import("drizzle-orm");
            return db.query.users.findFirst({ where: eq(users.email, email) });
          });
          if (!user?.passwordHash) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return {
            id:    user.id,
            email: user.email ?? "",
            name:  user.guestName ?? "",
            needsOnboarding: !user.ageGroup,
          };
        } catch (err) {
          console.error("[auth] Credentials error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    // Upsert Google users into our DB on every sign-in
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const { withDb } = await import("@/lib/db/with-db");
          const { v4: uuid } = await import("uuid");

          const dbUser = await withDb(async (db) => {
            const { users } = await import("@/lib/db/schema");
            const { eq }    = await import("drizzle-orm");
            let row = await db.query.users.findFirst({ where: eq(users.email, user.email!) });
            if (!row) {
              const newId = uuid();
              const [created] = await db
                .insert(users)
                .values({ id: newId, email: user.email!, guestName: user.name ?? undefined, isGuest: false, consentAt: new Date() })
                .returning();
              row = created;
              (user as any).isNewGoogleUser = true;
            }
            return row;
          });

          if (dbUser?.id) user.id = dbUser.id;
          (user as any).needsOnboarding = !dbUser?.ageGroup;
        } catch (err: any) {
          console.error("[auth] Google sign-in error:", err?.message ?? err);
        }
      }
      return true;
    },

    // Store user ID and flags in JWT token
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && typeof (session as any)?.needsOnboarding === "boolean") {
        token.needsOnboarding = (session as any).needsOnboarding;
      }
      if (user) {
        token.id            = user.id;
        token.isGuest       = (user as any).isGuest       ?? false;
        token.isNewGoogleUser = (user as any).isNewGoogleUser ?? false;
        token.needsOnboarding = (user as any).needsOnboarding ?? false;
      }
      return token;
    },

    // Expose user ID and flags on the session object
    async session({ session, token }) {
      if (token.id)      session.user.id      = token.id as string;
      if (token.isGuest) (session.user as any).isGuest = token.isGuest;
      if (token.isNewGoogleUser) (session.user as any).isNewGoogleUser = token.isNewGoogleUser;
      (session.user as any).needsOnboarding = token.needsOnboarding ?? false;
      return session;
    },
  },
});
