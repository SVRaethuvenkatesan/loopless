import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  HeartPulse,
  Lock,
  Scale,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

const LAST_UPDATED = "May 11, 2026";

const TERMS = [
  {
    id: "acceptance",
    title: "Acceptance",
    Icon: CheckCircle2,
    body: "By accessing or using Loopless, you agree to these Terms of Service. If you do not agree, do not use the app.",
  },
  {
    id: "health",
    title: "Not medical advice",
    Icon: HeartPulse,
    body: "Loopless is a self-help and habit-awareness tool. It does not provide medical advice, diagnosis, treatment, counselling, or emergency support. Always follow advice from qualified health professionals.",
  },
  {
    id: "emergency",
    title: "Emergency situations",
    Icon: AlertTriangle,
    body: "Do not use Loopless as an emergency service. If you are in immediate danger in Australia, call 000. If you need crisis support, use a crisis service such as Lifeline on 13 11 14.",
  },
  {
    id: "account",
    title: "Your account",
    Icon: UserCheck,
    body: "You are responsible for keeping your sign-in details secure and for activity under your account or guest profile. Do not attempt to access another person's account or data.",
  },
  {
    id: "use",
    title: "Acceptable use",
    Icon: ShieldAlert,
    body: "Do not misuse the app, interfere with the service, scrape private data, bypass access controls, upload harmful content, or use Loopless for unlawful activity.",
  },
  {
    id: "privacy",
    title: "Privacy and data",
    Icon: Lock,
    body: "Your use of Loopless is also governed by the Privacy Policy. The app uses your logs and preferences to provide dashboards, insights, reminders, and progress features.",
  },
  {
    id: "changes",
    title: "Changes to the service",
    Icon: FileText,
    body: "Features may change as the product improves. Some insights, notifications, or AI-assisted wording may depend on environment configuration and available data.",
  },
  {
    id: "liability",
    title: "Limitations",
    Icon: Scale,
    body: "Loopless is provided as a support tool and may contain errors, interruptions, or incomplete insights. To the maximum extent permitted by law, the operator is not liable for decisions made solely from app output.",
  },
];

export default async function TermsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="terms-page">
      <TermsStyles />

      <header className="terms-hero">
        <div>
          <p className="terms-kicker">Terms of Service</p>
          <h1>Simple rules for using Loopless.</h1>
          <p>
            These terms explain what Loopless is, what it is not, and what you
            agree to when using the app.
          </p>
        </div>
        <aside className="terms-status-card">
          <FileText size={24} strokeWidth={2.5} />
          <span>Last updated</span>
          <strong>{LAST_UPDATED}</strong>
        </aside>
      </header>

      <main className="terms-layout">
        <aside className="terms-nav-card" aria-label="Terms sections">
          {TERMS.map((term) => (
            <a key={term.id} href={`#${term.id}`}>
              {term.title}
            </a>
          ))}
        </aside>

        <div className="terms-content">
          <section className="terms-card terms-highlight">
            <div className="terms-card-head">
              <AlertTriangle size={22} strokeWidth={2.5} />
              <h2>Important safety note</h2>
            </div>
            <p>
              Loopless can support habit tracking and reflection, but it is not
              a clinician, counsellor, crisis line, or emergency service. For
              urgent danger in Australia, call 000.
            </p>
          </section>

          <section className="terms-grid">
            {TERMS.map(({ id, title, body, Icon }) => (
              <article id={id} key={id} className="terms-card">
                <div className="terms-card-head">
                  <Icon size={22} strokeWidth={2.5} />
                  <h2>{title}</h2>
                </div>
                <p>{body}</p>
              </article>
            ))}
          </section>

          <section className="terms-card">
            <div className="terms-card-head">
              <Lock size={22} strokeWidth={2.5} />
              <h2>Related documents</h2>
            </div>
            <p>
              Review the Privacy Policy for details about server-stored data,
              cookies, local browser storage, and deletion options.
            </p>
            <div className="terms-actions">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/support">Help and Support</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function TermsStyles() {
  return (
    <style>{`
      .terms-page {
        width: min(1120px, calc(100vw - 40px));
        margin: 0 auto;
        padding: 28px 0 120px;
      }
      .terms-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        padding: 24px 0 22px;
        border-bottom: 1px solid var(--border);
      }
      .terms-kicker {
        color: var(--text3);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .terms-hero h1 {
        max-width: 720px;
        margin: 4px 0 10px;
        font-family: var(--font-display);
        font-size: clamp(34px, 5vw, 58px);
        line-height: 0.98;
      }
      .terms-hero p:not(.terms-kicker) {
        max-width: 650px;
        color: var(--text2);
        font-size: 15px;
        line-height: 1.65;
      }
      .terms-status-card {
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
      .terms-status-card svg {
        color: var(--mint2);
      }
      .terms-status-card span {
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .terms-status-card strong {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 22px;
        line-height: 1.1;
      }
      .terms-layout {
        display: grid;
        grid-template-columns: 250px minmax(0, 1fr);
        gap: 16px;
        align-items: start;
        padding-top: 18px;
      }
      .terms-nav-card,
      .terms-card {
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: var(--bg2);
        box-shadow: 0 12px 38px rgba(21, 31, 26, 0.06);
      }
      .terms-nav-card {
        position: sticky;
        top: 86px;
        display: grid;
        gap: 6px;
        padding: 12px;
      }
      .terms-nav-card a {
        border-radius: 12px;
        color: var(--text2);
        padding: 10px 12px;
        font-size: 13px;
        font-weight: 900;
      }
      .terms-nav-card a:hover {
        background: var(--bg0);
        color: var(--text1);
      }
      .terms-content {
        display: grid;
        gap: 14px;
      }
      .terms-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }
      .terms-card {
        padding: 18px;
      }
      .terms-highlight {
        background: linear-gradient(135deg, rgba(224, 123, 90, 0.13), var(--bg2));
      }
      .terms-card-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .terms-card-head svg {
        color: var(--mint2);
        flex-shrink: 0;
      }
      .terms-highlight .terms-card-head svg {
        color: var(--coral);
      }
      .terms-card h2 {
        font-family: var(--font-display);
        font-size: 23px;
        line-height: 1.12;
      }
      .terms-card p {
        color: var(--text2);
        font-size: 14px;
        font-weight: 700;
        line-height: 1.65;
      }
      .terms-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }
      .terms-actions a {
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
      .dark .terms-status-card,
      .dark .terms-nav-card,
      .dark .terms-card {
        background: var(--bg2);
        box-shadow: 0 14px 48px rgba(0, 0, 0, 0.28);
      }
      @media (max-width: 940px) {
        .terms-layout {
          grid-template-columns: 1fr;
        }
        .terms-nav-card {
          position: static;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 760px) {
        .terms-page {
          width: min(100% - 24px, 1120px);
          padding-top: 14px;
          padding-bottom: 130px;
        }
        .terms-hero {
          flex-direction: column;
          align-items: stretch;
        }
        .terms-status-card {
          min-width: 0;
        }
        .terms-nav-card,
        .terms-grid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}
