import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

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
      ];

      const isAppRoute = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p),
      );

      const isAuthRoute =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/register" ||
        nextUrl.pathname === "/guest";

      if (isAppRoute && !isLoggedIn) return false;
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
