import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // providers are added in src/lib/auth.ts only

  callbacks: {
    authorized({ auth, request: { nextUrl, cookies } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // Project access gate — runs before any auth logic
      const accessPassword = process.env.ACCESS_PASSWORD;
      if (accessPassword && path !== "/access") {
        const secret = (process.env.NEXTAUTH_SECRET ?? "").slice(0, 10);
        const expected = btoa(`${accessPassword}:${secret}`);
        const cookieVal = cookies.get("loopless_access")?.value;
        if (cookieVal !== expected) {
          const url = new URL("/access", nextUrl);
          if (path !== "/") url.searchParams.set("from", path);
          return Response.redirect(url);
        }
      }

      const protectedPaths = [
        "/dashboard",
        "/checkin",
        "/urge",
        "/coping",
        "/insights",
        "/awareness",
        "/support",
        "/onboarding",
        "/profile",
        "/settings",
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

      return true;
    },
  },
} satisfies NextAuthConfig;
