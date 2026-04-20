import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PrivacyPage() {
  const session = await auth();
  if (!session) redirect("/login");
  
  return (
    <div style={{ padding: "32px 24px", maxWidth: "640px", margin: "0 auto", fontFamily: "'Nunito', sans-serif", color: "#1a1208", paddingBottom: "100px" }}>
      <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 28, marginBottom: 16 }}>Privacy Policy</h1>
      
      <div style={{ background: "white", border: "2px solid rgba(26,18,8,.1)", borderRadius: 20, padding: 24, boxShadow: "4px 4px 0 rgba(26,18,8,.08)", fontSize: 14, lineHeight: 1.6 }}>
        <p style={{ marginBottom: 16 }}>
          <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
        </p>

        <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, marginTop: 24, marginBottom: 8 }}>1. Data Collection</h3>
        <p style={{ marginBottom: 16 }}>
          Loopless collects basic information required to provide our service, including your email (if using Google Login), check-in data (stress levels, mood), and urge logs. Guest accounts store data locally on your device.
        </p>

        <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, marginTop: 24, marginBottom: 8 }}>2. Data Usage</h3>
        <p style={{ marginBottom: 16 }}>
          Your data is used strictly to power your personal dashboard, track your streak, and generate personalized AI insights. We do not sell your personal data to third parties.
        </p>

        <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, marginTop: 24, marginBottom: 8 }}>3. Data Privacy & Security</h3>
        <p style={{ marginBottom: 16 }}>
          We employ industry-standard encryption to protect your data. Your health-related logs are kept private and are only accessible by you.
        </p>

        <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, marginTop: 24, marginBottom: 8 }}>4. Deletion</h3>
        <p style={{ marginBottom: 16 }}>
          You can delete your account and all associated data permanently at any time via the Settings page.
        </p>
      </div>
    </div>
  );
}
