import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // providers added in src/lib/auth.ts only

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
        "/profile",
        "/settings",
      ];

      const authPaths = ["/login", "/register", "/guest"];

      const isProtected = protectedPaths.some((p) => path.startsWith(p));
      const isAuthPage = authPaths.includes(path);

      // Not logged in → send to login
      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Logged in + on auth page → go to dashboard
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // New Google user (no ageGroup set) → send to onboarding
      // We check via token claim set in auth.ts jwt callback
      const token = auth as any;
      if (
        isLoggedIn &&
        token?.isNewGoogleUser === true &&
        path !== "/onboarding"
      ) {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
