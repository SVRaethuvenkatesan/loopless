import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TermsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div style={{ padding: "32px 24px", maxWidth: "640px", margin: "0 auto", fontFamily: "'Nunito', sans-serif", color: "var(--text1)", paddingBottom: "100px" }}>
      <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 28, marginBottom: 16 }}>Terms of Service</h1>

      <div style={{ background: "var(--bg2)", border: "2px solid var(--border2)", borderRadius: 20, padding: 24, boxShadow: "var(--shadow-card)", fontSize: 14, lineHeight: 1.6 }}>
        <p style={{ marginBottom: 16 }}>
          <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
        </p>

        <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, marginTop: 24, marginBottom: 8 }}>1. Acceptance of Terms</h3>
        <p style={{ marginBottom: 16 }}>
          By accessing and using Loopless, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
        </p>

        <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, marginTop: 24, marginBottom: 8 }}>2. Not Medical Advice</h3>
        <p style={{ marginBottom: 16 }}>
          Loopless is a self-help tool designed to assist with vaping cessation and habit tracking. It does not provide professional medical advice, diagnosis, or treatment. Always seek the advice of your physician for medical questions.
        </p>

        <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, marginTop: 24, marginBottom: 8 }}>3. Account Responsibilities</h3>
        <p style={{ marginBottom: 16 }}>
          You are responsible for maintaining the confidentiality of your account. Loopless reserves the right to terminate accounts that violate our usage policies.
        </p>
      </div>
    </div>
  );
}
