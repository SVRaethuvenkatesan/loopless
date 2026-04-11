import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;

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

  const isAppRoute = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  const isAuthRoute =
    req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";

  if (isAppRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
