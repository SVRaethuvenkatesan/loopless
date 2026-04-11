import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--text1)", marginBottom: "8px" }}>Coming soon</p>
        <p style={{ color: "var(--text2)", fontSize: "13px" }}>This feature is in the build queue</p>
      </div>
    </div>
  );
}
