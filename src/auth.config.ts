import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // providers are added in src/lib/auth.ts only

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const protectedPaths = [
        "/dashboard", "/checkin", "/loop", "/urge", "/coping",
        "/insights", "/progress", "/myths", "/support", "/onboarding",
        "/profile", "/settings",
      ];
      const authPaths = ["/login", "/register"];

      const isProtected = protectedPaths.some((p) => path.startsWith(p));
      const isAuthPage = authPaths.some((p) => path === p);

      // Redirect unauthenticated users away from protected routes
      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Redirect authenticated users away from auth pages
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Send new Google users to onboarding (flag set in jwt callback)
      const token = auth as any;
      if (isLoggedIn && token?.isNewGoogleUser === true && path !== "/onboarding") {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
