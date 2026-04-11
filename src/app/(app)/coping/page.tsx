import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--text1)" }}>Coping tools — coming soon</p>
    </div>
  );
}
