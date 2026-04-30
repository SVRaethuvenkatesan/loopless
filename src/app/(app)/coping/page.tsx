import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CopingClient from "./coping-client";

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/login");
  return <CopingClient />;
}
