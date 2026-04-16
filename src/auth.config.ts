// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const protectedPaths = [
        "/dashboard",
        "/checkin",
        "/loop",
        "/urge",
        "/coping",
        "/insights",
        "/progress",
        "/myths",
        "/support",
        "/onboarding",
      ];

      const isAppRoute = protectedPaths.some((p) => path.startsWith(p));
      const isAuthRoute = ["/login", "/register", "/guest"].includes(path);

      // Not logged in → bounce to login
      if (isAppRoute && !isLoggedIn) return false;

      // Logged in + hitting auth page → go home
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // New Google user who hasn't done onboarding yet
      // (token flag set by signIn callback in auth.ts)
      if (
        isLoggedIn &&
        (auth as any)?.user?.isNewGoogleUser &&
        path !== "/onboarding"
      ) {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
