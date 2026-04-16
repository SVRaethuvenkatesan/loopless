import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Allow guests (no session) — they have localStorage guestId
  // Only redirect if neither session nor guest cookie
  // Middleware handles hard auth protection; here we just wrap with shell
  return <AppShell>{children}</AppShell>;
}
