import { NextRequest, NextResponse } from "next/server";

function getExpectedToken(): string {
  const password = process.env.ACCESS_PASSWORD ?? "";
  const secret = (process.env.NEXTAUTH_SECRET ?? "").slice(0, 10);
  return btoa(`${password}:${secret}`);
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const expected = process.env.ACCESS_PASSWORD;

  if (!expected || password === expected) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("loopless_access", getExpectedToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  }

  return NextResponse.json(
    { success: false, error: "Wrong password" },
    { status: 401 }
  );
}
