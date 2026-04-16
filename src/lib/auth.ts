// src/lib/auth.ts
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
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        try {
          const { withDb } = await import("@/lib/db/with-db");
          const user = await withDb(async (db) => {
            const { users } = await import("@/lib/db/schema");
            const { eq } = await import("drizzle-orm");
            return db.query.users.findFirst({ where: eq(users.email, email) });
          });
          if (!user?.passwordHash) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return {
            id: user.id,
            email: user.email ?? "",
            name: user.guestName ?? "",
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

    async signIn({ user, account }) {
      console.log(
        "[auth:signIn] provider:",
        account?.provider,
        "| email:",
        user.email,
        "| user.id from Google:",
        user.id,
      );

      if (account?.provider === "google" && user.email) {
        try {
          const { withDb } = await import("@/lib/db/with-db");
          const { v4: uuid } = await import("uuid");

          const dbUser = await withDb(async (db) => {
            const { users } = await import("@/lib/db/schema");
            const { eq } = await import("drizzle-orm");

            // Look up by EMAIL - never by user.id (that's Google's sub)
            let row = await db.query.users.findFirst({
              where: eq(users.email, user.email!),
            });
            console.log(
              "[auth:signIn] email lookup result:",
              row ? `found id=${row.id}` : "NOT FOUND",
            );

            if (!row) {
              const newId = uuid();
              console.log("[auth:signIn] inserting new user id:", newId);
              const [created] = await db
                .insert(users)
                .values({
                  id: newId,
                  email: user.email!,
                  guestName: user.name ?? undefined,
                  isGuest: false,
                  consentAt: new Date(),
                })
                .returning();
              row = created;
              console.log("[auth:signIn] insert result:", row?.id ?? "FAILED");
              (user as any).isNewGoogleUser = true;
            }

            return row;
          });

          if (dbUser?.id) {
            console.log(
              "[auth:signIn] overwriting user.id:",
              user.id,
              "→",
              dbUser.id,
            );
            user.id = dbUser.id;
          } else {
            console.error(
              "[auth:signIn] dbUser is null/undefined - DB insert failed",
            );
          }
        } catch (err: any) {
          console.error("[auth:signIn] CAUGHT ERROR:", err?.message ?? err);
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isNewGoogleUser = (user as any).isNewGoogleUser ?? false;
        console.log("[auth:jwt] storing token.id:", token.id);
      }
      return token;
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.isNewGoogleUser)
        (session.user as any).isNewGoogleUser = token.isNewGoogleUser;
      console.log("[auth:session] session.user.id:", session.user.id);
      return session;
    },
  },
});
