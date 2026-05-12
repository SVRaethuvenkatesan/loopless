import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Cookie,
  Database,
  FileText,
  Lock,
  Server,
  ShieldCheck,
  Trash2,
} from "lucide-react";

const LAST_UPDATED = "May 11, 2026";

const SERVER_DATA = [
  "Account details: email, password hash for email accounts, guest name, age group, consent timestamp, and account status.",
  "Onboarding preferences: coping style, loop entry point, notification preferences, and stress trigger selections.",
  "Check-ins: stress level, mood, trigger type, sleep quality, energy level, check-in time, and timezone offset.",
  "Urge logs: urge type, triggers, pre-stress, intensity, activity before the urge, social context, and time logged.",
  "Toolkit activity: tool type, duration, pre/post stress ratings, stress delta, and completion time.",
  "Progress data: streaks, badges, XP-related profile state, and milestone history.",
  "Insights data: generated daily insights, risk windows, correlation results, nudge logs, confidence values, and generated timestamps.",
  "Push notification data: browser push endpoint and push keys if you choose to enable notifications.",
];

const BROWSER_DATA = [
  "Authentication/session cookies from NextAuth so the app can keep you signed in.",
  "The loopless_access cookie when a deployment uses a project access password. It is httpOnly, sameSite=lax, and expires after 7 days.",
  "Guest identifiers in localStorage, such as loopless_guest_id and loopless_guest_name, so a guest profile can keep working on this device.",
  "Sidebar and UI preferences in localStorage, such as whether the sidebar is collapsed.",
  "Browser notification permission state, controlled by your browser or operating system.",
];

export default async function PrivacyPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="legal-page privacy-page">
      <LegalStyles />

      <header className="legal-hero">
        <div>
          <p className="legal-kicker">Privacy Policy</p>
          <h1>Your data should be understandable.</h1>
          <p>
            This page explains what Loopless stores on the server, what stays in
            your browser, and how that data is used to power the app.
          </p>
        </div>
        <aside className="legal-status-card">
          <ShieldCheck size={24} strokeWidth={2.5} />
          <span>Last updated</span>
          <strong>{LAST_UPDATED}</strong>
        </aside>
      </header>

      <main className="legal-layout">
        <aside className="legal-nav-card" aria-label="Privacy sections">
          <a href="#summary">Summary</a>
          <a href="#server-data">Server data</a>
          <a href="#browser-data">Cookies and browser data</a>
          <a href="#use">How data is used</a>
          <a href="#deletion">Deletion</a>
        </aside>

        <div className="legal-content">
          <section id="summary" className="legal-card legal-highlight">
            <div className="legal-card-head">
              <Lock size={22} strokeWidth={2.5} />
              <h2>Short version</h2>
            </div>
            <p>
              Loopless stores the data needed to run your account, track your
              check-ins and urges, calculate insights, and send notifications
              you enable. We do not sell your personal data. Loopless is not
              emergency care, medical advice, diagnosis, or therapy.
            </p>
          </section>

          <section id="server-data" className="legal-card">
            <div className="legal-card-head">
              <Server size={22} strokeWidth={2.5} />
              <h2>Data stored on the server</h2>
            </div>
            <p>
              The following information may be stored in the application
              database and linked to your user ID:
            </p>
            <ul className="legal-list">
              {SERVER_DATA.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="browser-data" className="legal-card">
            <div className="legal-card-head">
              <Cookie size={22} strokeWidth={2.5} />
              <h2>Cookies and browser data</h2>
            </div>
            <p>
              Loopless uses cookies and local browser storage for sign-in,
              access control, guest mode, and small UI preferences. This app
              does not need advertising cookies to function.
            </p>
            <ul className="legal-list">
              {BROWSER_DATA.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="use" className="legal-grid two">
            <article className="legal-card">
              <div className="legal-card-head">
                <Database size={22} strokeWidth={2.5} />
                <h2>How we use data</h2>
              </div>
              <p>
                Data is used to show your dashboard, streaks, badges, check-in
                history, urge patterns, coping results, risk windows, and
                personalised insights. Some text may be generated from your app
                history where AI features are configured.
              </p>
            </article>

            <article className="legal-card">
              <div className="legal-card-head">
                <Bell size={22} strokeWidth={2.5} />
                <h2>Notifications</h2>
              </div>
              <p>
                If you enable push notifications, the server stores a browser
                push subscription so reminders can be delivered. You can revoke
                notification permission in your browser settings.
              </p>
            </article>
          </section>

          <section id="deletion" className="legal-card">
            <div className="legal-card-head">
              <Trash2 size={22} strokeWidth={2.5} />
              <h2>Access, correction, and deletion</h2>
            </div>
            <p>
              Use Settings for account options available in this deployment.
              Guest users can clear guest data from the device. Server records
              linked to your user ID are designed to cascade-delete when the
              user record is deleted, where supported by the deployment.
            </p>
          </section>

          <section className="legal-card">
            <div className="legal-card-head">
              <FileText size={22} strokeWidth={2.5} />
              <h2>Related documents</h2>
            </div>
            <div className="legal-actions">
              <Link href="/terms">Terms of Service</Link>
              <Link href="/support">Help and Support</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function LegalStyles() {
  return (
    <style>{`
      .legal-page {
        width: min(1120px, calc(100vw - 40px));
        margin: 0 auto;
        padding: 28px 0 120px;
      }
      .legal-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        padding: 24px 0 22px;
        border-bottom: 1px solid var(--border);
      }
      .legal-kicker {
        color: var(--text3);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .legal-hero h1 {
        max-width: 720px;
        margin: 4px 0 10px;
        font-family: var(--font-display);
        font-size: clamp(34px, 5vw, 58px);
        line-height: 0.98;
      }
      .legal-hero p:not(.legal-kicker) {
        max-width: 650px;
        color: var(--text2);
        font-size: 15px;
        line-height: 1.65;
      }
      .legal-status-card {
        display: grid;
        gap: 6px;
        min-width: 190px;
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: var(--bg2);
        color: var(--text2);
        padding: 18px;
        box-shadow: 0 12px 38px rgba(21, 31, 26, 0.06);
      }
      .legal-status-card svg {
        color: var(--mint2);
      }
      .legal-status-card span {
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .legal-status-card strong {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 22px;
        line-height: 1.1;
      }
      .legal-layout {
        display: grid;
        grid-template-columns: 250px minmax(0, 1fr);
        gap: 16px;
        align-items: start;
        padding-top: 18px;
      }
      .legal-nav-card,
      .legal-card {
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: var(--bg2);
        box-shadow: 0 12px 38px rgba(21, 31, 26, 0.06);
      }
      .legal-nav-card {
        position: sticky;
        top: 86px;
        display: grid;
        gap: 6px;
        padding: 12px;
      }
      .legal-nav-card a {
        border-radius: 12px;
        color: var(--text2);
        padding: 10px 12px;
        font-size: 13px;
        font-weight: 900;
      }
      .legal-nav-card a:hover {
        background: var(--bg0);
        color: var(--text1);
      }
      .legal-content {
        display: grid;
        gap: 14px;
      }
      .legal-card {
        padding: 18px;
      }
      .legal-highlight {
        background: linear-gradient(135deg, rgba(59, 201, 142, 0.1), var(--bg2));
      }
      .legal-card-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .legal-card-head svg {
        color: var(--mint2);
        flex-shrink: 0;
      }
      .legal-card h2 {
        font-family: var(--font-display);
        font-size: 23px;
        line-height: 1.12;
      }
      .legal-card p {
        color: var(--text2);
        font-size: 14px;
        font-weight: 700;
        line-height: 1.65;
      }
      .legal-list {
        display: grid;
        gap: 8px;
        margin: 14px 0 0;
        padding: 0;
        list-style: none;
      }
      .legal-list li {
        border: 1px solid var(--border2);
        border-radius: 13px;
        background: var(--bg0);
        color: var(--text2);
        padding: 11px 12px;
        font-size: 13px;
        font-weight: 800;
        line-height: 1.45;
      }
      .legal-grid.two {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }
      .legal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .legal-actions a {
        display: inline-flex;
        align-items: center;
        min-height: 42px;
        border-radius: 12px;
        background: var(--text1);
        color: var(--bg0);
        padding: 0 14px;
        font-size: 13px;
        font-weight: 900;
      }
      .dark .legal-status-card,
      .dark .legal-nav-card,
      .dark .legal-card {
        background: var(--bg2);
        box-shadow: 0 14px 48px rgba(0, 0, 0, 0.28);
      }
      @media (max-width: 940px) {
        .legal-layout {
          grid-template-columns: 1fr;
        }
        .legal-nav-card {
          position: static;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 760px) {
        .legal-page {
          width: min(100% - 24px, 1120px);
          padding-top: 14px;
          padding-bottom: 130px;
        }
        .legal-hero {
          flex-direction: column;
          align-items: stretch;
        }
        .legal-status-card {
          min-width: 0;
        }
        .legal-nav-card,
        .legal-grid.two {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}
