import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// This approach is more robust for the Next.js build scanner
const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
