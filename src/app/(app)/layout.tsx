import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";

// Server layout: gate protected routes and pass session to shell
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  return <AppShell session={session}>{children}</AppShell>;
}
