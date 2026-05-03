import type { Metadata } from "next";
import Link from "next/link";

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
    desc: "24/7 crisis support (Australia)",
    emoji: "📞",
  },
  {
    name: "Beyond Blue",
    tel: "1300 22 4636",
    telHref: "1300224636",
    desc: "Mental health support",
    emoji: "💙",
  },
  {
    name: "headspace",
    tel: "1800 650 890",
    telHref: "1800650890",
    desc: "Young people 12–25",
    emoji: "🧠",
  },
  {
    name: "Quitline",
    tel: "13 7848",
    telHref: "137848",
    desc: "Nicotine quit support",
    emoji: "🌱",
  },
];

const FAQ = [
  {
    q: "Is Loopless a substitute for counselling or medical care?",
    a: "No. Loopless is a digital self-help companion for behavioural awareness and nicotine-related habits. It is not therapy, diagnosis, or emergency care. Always follow advice from qualified health professionals.",
  },
  {
    q: "How do check-ins and XP work?",
    a: "When you complete a daily check-in, you log stress, mood, and context so patterns can emerge over time. XP and levels recognise consistency - they are motivational, not clinical scores. Values may match what you see on your profile dashboard.",
  },
  {
    q: "What are Insights and Pattern views?",
    a: "After enough history (typically several days), the app surfaces correlations, charts, and short explanations from your check-ins and urge logs. You can review how each tile is calculated using the info buttons on Insights.",
  },
  {
    q: "What is demo or seed data?",
    a: "From Settings or developer tools you may load a 30‑day demonstration dataset so you can explore Insights without waiting for history. Toggle or restore real data when you’re done so your view matches your actual logs.",
  },
  {
    q: "Who can see my data?",
    a: "Your account data is scoped to your sign-in unless you’re using a disposable guest profile on this device. See the Privacy Policy for retention, deletion, and what may be processed by infrastructure or optional AI helpers for wording.",
  },
  {
    q: "How do I export, fix mistakes, or start over?",
    a: "Use Settings for account-linked options where available. Guest users can wipe local guest data from the sidebar. For permanent account deletion timelines, rely on Privacy Policy disclosures and flows your deployment provides.",
  },
  {
    q: "Push notifications aren’t appearing - why?",
    a: "Browsers block notifications until you allow them, and quiet hours apply if you configured them in Settings. If your environment doesn’t support web push, the app falls back gracefully.",
  },
  {
    q: "How do I send product feedback?",
    a: "Open your email client with our pre-filled subject, or describe what you hoped to see plus your device/browser. Compose from Settings → About or tap “Compose feedback” below.",
  },
];

export default function SupportPage() {
  const feedbackHref =
    "mailto:?subject=" +
    encodeURIComponent("Loopless feedback") +
    "&body=" +
    encodeURIComponent("What happened:\nWhat you expected:\nBrowser / OS:\n");

  return (
    <>
      <style>{`
        .support-grid{display:grid;gap:14px;margin-top:16px;}
        @media(min-width:900px){.support-grid.two{grid-template-columns:1fr 1fr;align-items:start;}}
        .support-card{
          background:var(--bg2);
          border:2px solid var(--border2);
          border-radius:20px;
          padding:18px 20px;
          box-shadow:var(--shadow-card);
        }
        .support-card h2{
          font-family:var(--font-display);
          font-size:17px;
          font-weight:600;
          color:var(--text1);
          margin:0 0 10px;
        }
        .support-lede{font-size:14px;color:var(--text2);line-height:1.55;margin-bottom:12px;}
        .crisis-list{display:flex;flex-direction:column;gap:10px;}
        .crisis-card{
          display:flex;align-items:center;gap:12px;
          background:linear-gradient(135deg,#5a1710,#872211);
          color:#fff;
          border:2px solid #1a1208;
          border-radius:14px;
          padding:12px 14px;
          text-decoration:none;
          box-shadow:3px 3px 0 rgba(26,18,8,.25);
          transition:transform .12s ease, box-shadow .12s ease;
        }
        .crisis-card:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 rgba(26,18,8,.3);}
        .crisis-card:active{transform:translate(1px,1px);box-shadow:2px 2px 0 rgba(26,18,8,.28);}
        .crisis-num{font-family:var(--font-display);font-size:17px;font-weight:700;color:#fecaca;}
        .crisis-meta{font-size:11px;color:rgba(255,255,255,.68);margin-top:2px;}
        details.support-faq{
          border:2px solid var(--border3);
          border-radius:14px;padding:12px 14px;
          background:var(--bg0);
        }
        details.support-faq + details.support-faq{margin-top:8px;}
        details.support-faq summary{
          cursor:pointer;
          font-weight:800;font-size:13.5px;color:var(--text1);
          list-style:none;display:flex;align-items:flex-start;gap:10px;padding:2px 0;
        }
        details.support-faq summary::-webkit-details-marker{display:none;}
        details.support-faq summary::before{
          content:"▸";flex-shrink:0;line-height:1.25;color:var(--mint2);
          transition:transform .15s ease;
        }
        details.support-faq[open] summary::before{transform:rotate(90deg);}
        details.support-faq p{
          margin:10px 0 2px;font-size:13px;line-height:1.6;color:var(--text2);
          padding-left:22px;border-left:2px solid var(--mint3);
          margin-left:2px;
        }
        .link-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;}
        .support-pill{
          display:inline-flex;align-items:center;gap:6px;padding:9px 14px;
          border-radius:999px;border:2px solid var(--border2);
          background:var(--bg3);font-size:13px;font-weight:800;color:var(--text1);
          text-decoration:none;transition:border-color .15s, background .15s;
        }
        .support-pill:hover{border-color:var(--mint2);background:var(--mint3);}
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Help & Support</h1>
        <p className="page-sub max-w-xl">
          Crisis lines (Australia), FAQs about Loopless, and pointers to Privacy
          & Settings - so you never have to hunt for essentials.
        </p>
      </div>

      <div className="page-content">
        <div className="support-grid two">
          <section className="support-card" aria-labelledby="crisis-heading">
            <h2 id="crisis-heading">If you&apos;re in immediate danger</h2>
            <p className="support-lede">
              Call <strong style={{ color: "var(--text1)" }}>000</strong> (AU)
              for emergencies. Below are confidential national lines - you
              don&apos;t need to be &quot;in crisis&quot; to call.
            </p>
            <div className="crisis-list">
              {CRISIS_LINES.map((h) => (
                <a
                  key={h.name}
                  className="crisis-card"
                  href={`tel:${h.telHref}`}
                >
                  <span style={{ fontSize: 24 }} aria-hidden>
                    {h.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>{h.name}</div>
                    <div className="crisis-meta">{h.desc}</div>
                  </div>
                  <div className="crisis-num">{h.tel}</div>
                </a>
              ))}
            </div>
          </section>

          <div className="support-grid">
            <section className="support-card" aria-labelledby="app-heading">
              <h2 id="app-heading">Using Loopless</h2>
              <p className="support-lede">
                Most answers live right inside the product: Insights tiles have
                &quot;how it works&quot; notes; Settings hosts reminders, demo
                data, and legal links.
              </p>
              <div className="link-row">
                <Link className="support-pill" href="/settings">
                  ⚙️ Open Settings
                </Link>
                <Link className="support-pill" href="/insights">
                  📊 Open Insights
                </Link>
                <Link className="support-pill" href="/coping">
                  🛠 Toolkit
                </Link>
              </div>
            </section>

            <section className="support-card" aria-labelledby="legal-heading">
              <h2 id="legal-heading">Policies & feedback</h2>
              <p className="support-lede">
                Read how we handle data, then send structured feedback when
                something feels off - it helps prioritise fixes.
              </p>
              <div className="link-row">
                <Link className="support-pill" href="/privacy">
                  🔒 Privacy Policy
                </Link>
                <Link className="support-pill" href="/terms">
                  📋 Terms of Service
                </Link>
                <a className="support-pill" href={feedbackHref}>
                  ✉️ Compose feedback
                </a>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text3)",
                  marginTop: 12,
                  lineHeight: 1.55,
                }}
              >
                The feedback link opens your default mail app with a subject
                line only - fill in <strong>To:</strong> with whoever operates
                this deployment, or paste details into your usual support
                channel.
              </p>
            </section>
          </div>
        </div>

        <section
          className="support-card"
          style={{ marginTop: 16 }}
          aria-labelledby="faq-heading"
        >
          <h2 id="faq-heading">Frequently asked questions</h2>
          <p className="support-lede">
            Short answers grounded in how this build behaves; always defer to
            your clinician for health decisions.
          </p>
          {FAQ.map((item) => (
            <details key={item.q} className="support-faq">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}
