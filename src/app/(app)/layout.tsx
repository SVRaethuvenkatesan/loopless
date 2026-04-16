import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return <AppShell>{children}</AppShell>;
}
