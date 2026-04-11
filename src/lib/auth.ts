import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const guestSchema = z.object({
  guestId: z.string().uuid(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email))
          .limit(1);

        if (!user || user.deletedAt) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash!,
        );
        if (!valid) return null;

        return { id: user.id, email: user.email!, isGuest: false };
      },
    }),
    Credentials({
      id: "guest",
      async authorize(credentials) {
        const parsed = guestSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, parsed.data.guestId))
          .limit(1);

        if (!user || !user.isGuest) return null;

        return {
          id: user.id,
          email: null,
          name: user.guestName,
          isGuest: true,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isGuest = (user as any).isGuest;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.email) session.user.email = token.email as string;
      if (token.isGuest !== undefined)
        (session.user as any).isGuest = token.isGuest;
      if (token.name) session.user.name = token.name as string;
      return session;
    },
  },
});
