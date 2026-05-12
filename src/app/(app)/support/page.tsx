import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  ChevronRight,
  FileText,
  HelpCircle,
  LifeBuoy,
  Lock,
  Mail,
  Phone,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help & Support | Loopless",
  description:
    "Crisis resources, FAQs, privacy pointers, and how to get help using Loopless.",
};

const CRISIS_LINES = [
  {
    name: "Lifeline",
    tel: "13 11 14",
    telHref: "131114",
    desc: "24/7 crisis support in Australia",
  },
  {
    name: "Beyond Blue",
    tel: "1300 22 4636",
    telHref: "1300224636",
    desc: "Mental health support and advice",
  },
  {
    name: "headspace",
    tel: "1800 650 890",
    telHref: "1800650890",
    desc: "Support for young people aged 12-25",
  },
  {
    name: "Quitline",
    tel: "13 7848",
    telHref: "137848",
    desc: "Nicotine quit support",
  },
];

const FAQ = [
  {
    q: "Is Loopless a substitute for counselling or medical care?",
    a: "No. Loopless is a self-help companion for awareness and habit support. It is not therapy, diagnosis, or emergency care.",
  },
  {
    q: "How do check-ins and XP work?",
    a: "Daily check-ins log stress, mood, and context so patterns can emerge over time. XP recognises consistency; it is motivational, not a clinical score.",
  },
  {
    q: "What are Insights and Pattern views?",
    a: "Insights use your check-ins and urge logs to surface correlations, charts, and short explanations after enough history is available.",
  },
  {
    q: "Who can see my data?",
    a: "Your account data is scoped to your sign-in. Guest data is local to this device unless your deployment adds account linking.",
  },
  {
    q: "Push notifications are not appearing. Why?",
    a: "Browsers block notifications until you allow them. Quiet hours and browser support can also prevent reminders from showing.",
  },
];

const QUICK_LINKS = [
  {
    href: "/settings",
    label: "Settings",
    desc: "Notifications, privacy, account options",
    Icon: Settings,
  },
  {
    href: "/insights",
    label: "Insights",
    desc: "Pattern explanations and data views",
    Icon: BarChart3,
  },
  {
    href: "/coping",
    label: "Toolkit",
    desc: "Reset tools for urge moments",
    Icon: Wrench,
  },
  {
    href: "/privacy",
    label: "Privacy",
    desc: "How data is handled",
    Icon: Lock,
  },
];

export default function SupportPage() {
  const feedbackHref =
    "mailto:?subject=" +
    encodeURIComponent("Loopless feedback") +
    "&body=" +
    encodeURIComponent("What happened:\nWhat you expected:\nBrowser / OS:\n");

  return (
    <div className="support-page">
      <SupportStyles />

      <header className="support-hero">
        <div>
          <p className="support-kicker">Help and support</p>
          <h1>Find the right help fast.</h1>
          <p>
            Start with emergency support when safety is involved. For product
            questions, use the quick links and FAQ below.
          </p>
        </div>
        <a className="support-emergency-card" href="tel:000">
          <AlertTriangle size={24} strokeWidth={2.5} />
          <span>Immediate danger</span>
          <strong>Call 000</strong>
        </a>
      </header>

      <main className="support-layout">
        <section className="support-crisis-panel" aria-labelledby="crisis-title">
          <div className="support-section-head">
            <div>
              <p className="support-kicker">Australia crisis lines</p>
              <h2 id="crisis-title">Talk to someone now</h2>
            </div>
            <Phone size={22} strokeWidth={2.5} />
          </div>
          <p className="support-lede">
            You do not need to be at breaking point to call. These services are
            confidential and built for moments that feel too heavy to hold alone.
          </p>
          <div className="support-crisis-list">
            {CRISIS_LINES.map((line) => (
              <a
                key={line.name}
                className="support-crisis-card"
                href={`tel:${line.telHref}`}
              >
                <span className="support-phone-icon">
                  <Phone size={18} strokeWidth={2.5} />
                </span>
                <span>
                  <strong>{line.name}</strong>
                  <small>{line.desc}</small>
                </span>
                <em>{line.tel}</em>
              </a>
            ))}
          </div>
        </section>

        <aside className="support-action-panel">
          <section className="support-card">
            <div className="support-section-head compact">
              <div>
                <p className="support-kicker">App support</p>
                <h2>Quick actions</h2>
              </div>
              <LifeBuoy size={22} strokeWidth={2.5} />
            </div>
            <div className="support-link-grid">
              {QUICK_LINKS.map(({ href, label, desc, Icon }) => (
                <Link key={href} className="support-link-card" href={href}>
                  <Icon size={19} strokeWidth={2.5} />
                  <span>
                    <strong>{label}</strong>
                    <small>{desc}</small>
                  </span>
                  <ChevronRight size={16} strokeWidth={2.5} />
                </Link>
              ))}
            </div>
          </section>

          <section className="support-card">
            <div className="support-section-head compact">
              <div>
                <p className="support-kicker">Feedback</p>
                <h2>Report friction</h2>
              </div>
              <Mail size={22} strokeWidth={2.5} />
            </div>
            <p className="support-lede">
              Include what happened, what you expected, and the device or
              browser you used.
            </p>
            <a className="support-primary-action" href={feedbackHref}>
              <Mail size={17} strokeWidth={2.5} />
              Compose feedback
            </a>
          </section>
        </aside>
      </main>

      <section className="support-faq-panel" aria-labelledby="faq-title">
        <div className="support-section-head">
          <div>
            <p className="support-kicker">FAQ</p>
            <h2 id="faq-title">Common questions</h2>
          </div>
          <HelpCircle size={22} strokeWidth={2.5} />
        </div>
        <div className="support-faq-grid">
          {FAQ.map((item) => (
            <details key={item.q} className="support-faq">
              <summary>
                <span>{item.q}</span>
                <ChevronRight size={17} strokeWidth={2.5} />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="support-trust-strip">
        <span>
          <ShieldCheck size={18} strokeWidth={2.5} />
          Loopless is not emergency care.
        </span>
        <Link href="/terms">
          <FileText size={17} strokeWidth={2.5} />
          Terms of Service
        </Link>
      </section>
    </div>
  );
}

function SupportStyles() {
  return (
    <style>{`
      .support-page {
        width: min(1120px, calc(100vw - 40px));
        margin: 0 auto;
        padding: 28px 0 120px;
      }
      .support-hero {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        padding: 24px 0 22px;
        border-bottom: 1px solid var(--border);
      }
      .support-kicker {
        color: var(--text3);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .support-hero h1 {
        max-width: 650px;
        margin: 4px 0 10px;
        font-family: var(--font-display);
        font-size: clamp(34px, 5vw, 58px);
        line-height: 0.98;
      }
      .support-hero p:not(.support-kicker) {
        max-width: 620px;
        color: var(--text2);
        font-size: 15px;
        line-height: 1.65;
      }
      .support-emergency-card {
        display: grid;
        gap: 6px;
        min-width: 200px;
        border: 1px solid rgba(224, 123, 90, 0.35);
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(224, 123, 90, 0.16), var(--bg2));
        color: var(--text1);
        padding: 18px;
      }
      .support-emergency-card svg {
        color: var(--coral);
      }
      .support-emergency-card span {
        color: var(--text3);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .support-emergency-card strong {
        font-family: var(--font-display);
        font-size: 28px;
        line-height: 1;
      }
      .support-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 16px;
        align-items: start;
        padding-top: 18px;
      }
      .support-crisis-panel,
      .support-card,
      .support-faq-panel,
      .support-trust-strip {
        border: 1px solid var(--border2);
        border-radius: 18px;
        background: var(--bg2);
        box-shadow: 0 12px 38px rgba(21, 31, 26, 0.06);
      }
      .support-crisis-panel,
      .support-card,
      .support-faq-panel {
        padding: 18px;
      }
      .support-action-panel {
        display: grid;
        gap: 14px;
      }
      .support-section-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 12px;
      }
      .support-section-head.compact {
        margin-bottom: 14px;
      }
      .support-section-head h2 {
        margin-top: 3px;
        font-family: var(--font-display);
        font-size: 24px;
        line-height: 1.08;
      }
      .support-section-head > svg {
        color: var(--mint2);
        margin-top: 4px;
      }
      .support-lede {
        color: var(--text2);
        font-size: 13px;
        font-weight: 700;
        line-height: 1.6;
        margin-bottom: 14px;
      }
      .support-crisis-list {
        display: grid;
        gap: 10px;
      }
      .support-crisis-card {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
        min-height: 78px;
        border: 1px solid var(--border2);
        border-radius: 16px;
        background: var(--bg0);
        color: var(--text1);
        padding: 13px;
      }
      .support-crisis-card:hover {
        border-color: rgba(224, 123, 90, 0.45);
      }
      .support-phone-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border-radius: 13px;
        background: rgba(224, 123, 90, 0.12);
        color: var(--coral);
      }
      .support-crisis-card strong,
      .support-crisis-card small {
        display: block;
      }
      .support-crisis-card strong {
        font-size: 15px;
        font-weight: 900;
      }
      .support-crisis-card small {
        margin-top: 2px;
        color: var(--text3);
        font-size: 12px;
        font-weight: 700;
        line-height: 1.35;
      }
      .support-crisis-card em {
        color: var(--text1);
        font-family: var(--font-display);
        font-size: 22px;
        font-style: normal;
        font-weight: 700;
        white-space: nowrap;
      }
      .support-link-grid {
        display: grid;
        gap: 8px;
      }
      .support-link-card {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr) 18px;
        align-items: center;
        gap: 10px;
        border: 1px solid var(--border2);
        border-radius: 14px;
        background: var(--bg0);
        color: var(--text1);
        padding: 11px;
      }
      .support-link-card > svg:first-child {
        color: var(--mint2);
      }
      .support-link-card strong,
      .support-link-card small {
        display: block;
      }
      .support-link-card strong {
        font-size: 13px;
        font-weight: 900;
      }
      .support-link-card small {
        overflow: hidden;
        color: var(--text3);
        font-size: 11px;
        font-weight: 700;
        line-height: 1.35;
        text-overflow: ellipsis;
      }
      .support-primary-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 44px;
        border-radius: 13px;
        background: var(--text1);
        color: var(--bg0);
        padding: 0 16px;
        font-size: 13px;
        font-weight: 900;
      }
      .support-faq-panel {
        margin-top: 16px;
      }
      .support-faq-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .support-faq {
        border: 1px solid var(--border2);
        border-radius: 15px;
        background: var(--bg0);
        padding: 0;
        overflow: hidden;
      }
      .support-faq summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        cursor: pointer;
        color: var(--text1);
        padding: 14px;
        font-size: 13px;
        font-weight: 900;
        line-height: 1.35;
        list-style: none;
      }
      .support-faq summary::-webkit-details-marker {
        display: none;
      }
      .support-faq summary svg {
        color: var(--text3);
        flex-shrink: 0;
        transition: transform 0.16s ease;
      }
      .support-faq[open] summary svg {
        transform: rotate(90deg);
      }
      .support-faq p {
        border-top: 1px solid var(--border2);
        color: var(--text2);
        padding: 13px 14px 15px;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.6;
      }
      .support-trust-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-top: 16px;
        color: var(--text2);
        padding: 14px 16px;
        font-size: 13px;
        font-weight: 800;
      }
      .support-trust-strip span,
      .support-trust-strip a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .support-trust-strip svg {
        color: var(--mint2);
      }
      .dark .support-crisis-panel,
      .dark .support-card,
      .dark .support-faq-panel,
      .dark .support-trust-strip,
      .dark .support-emergency-card {
        background: var(--bg2);
        box-shadow: 0 14px 48px rgba(0, 0, 0, 0.28);
      }
      @media (max-width: 1040px) {
        .support-layout {
          grid-template-columns: 1fr;
        }
        .support-action-panel {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 760px) {
        .support-page {
          width: min(100% - 24px, 1120px);
          padding-top: 14px;
          padding-bottom: 130px;
        }
        .support-hero {
          flex-direction: column;
          align-items: stretch;
        }
        .support-emergency-card {
          min-width: 0;
        }
        .support-action-panel,
        .support-faq-grid {
          grid-template-columns: 1fr;
        }
        .support-crisis-card {
          grid-template-columns: 42px minmax(0, 1fr);
        }
        .support-crisis-card em {
          grid-column: 2;
          font-size: 20px;
        }
        .support-trust-strip {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `}</style>
  );
}
