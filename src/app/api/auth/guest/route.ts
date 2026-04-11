import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, stressTriggers } from "@/lib/db/schema";
import { z } from "zod";

const guestSchema = z.object({
  guestName: z.string().min(1).max(50),
  ageGroup: z.enum(["18-20", "21-22", "23-24"]),
  triggers: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = guestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const { guestName, ageGroup, triggers } = parsed.data;

    const [newUser] = await db
      .insert(users)
      .values({
        guestName,
        ageGroup,
        isGuest: true,
        consentAt: new Date(),
      })
      .returning({ id: users.id });

    await db
      .insert(stressTriggers)
      .values(triggers.map((t) => ({ userId: newUser.id, triggerType: t })));

    return NextResponse.json(
      { message: "Guest account created", userId: newUser.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Guest error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
