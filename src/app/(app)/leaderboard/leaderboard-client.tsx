"use client";

import { motion, useReducedMotion, useInView, animate } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useEffect, useRef, useState } from "react";

const LottiePlayer = dynamic(() => import("../dashboard/lottie-player"), { ssr: false });

const LEADER_BADGE_FRAME: Record<number, string> = {
  1: "/lottie/Game ranking badges lvl 1.lottie",
  2: "/lottie/Game ranking badges lvl 2.lottie",
  3: "/lottie/Game ranking badges lvl 3.lottie",
};

export type LeaderboardEntry = {
  userId: string;
  name: string;
  profileImage: string | null;
  xp: number;
  level: number;
  streak: number;
  badgeCount: number;
  checkinCount: number;
  rank: number;
  isCurrentUser: boolean;
};

function initialsForName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "LP"
  );
}

function CountUp({ to, duration = 1.6 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return controls.stop;
  }, [inView, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

function Avatar({ entry, size = "md" }: { entry: LeaderboardEntry; size?: "sm" | "md" }) {
  return (
    <span className={`lb-avatar ${size}`}>
      {entry.profileImage ? (
        <img src={entry.profileImage} alt="" />
      ) : (
        initialsForName(entry.name)
      )}
    </span>
  );
}

function PodiumBadge({ entry, delay = 0 }: { entry: LeaderboardEntry; delay?: number }) {
  return (
    <motion.article
      className={`lb-podium-card rank-${entry.rank}${entry.isCurrentUser ? " is-you" : ""}`}
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18, delay }}
    >
      {entry.rank === 1 && (
        <div className="lb-crown" aria-hidden>
          👑
        </div>
      )}

      <div className="lb-rank-pill">
        <span>{entry.rank}</span>
      </div>

      <div className="lb-badge-frame" aria-hidden>
        <div className="lb-lottie-wrap">
          <LottiePlayer src={LEADER_BADGE_FRAME[entry.rank]} loop autoplay />
        </div>
        <div className="lb-badge-photo">
          {entry.profileImage ? (
            <img src={entry.profileImage} alt="" />
          ) : (
            initialsForName(entry.name)
          )}
        </div>
      </div>

      <strong className="lb-podium-name">{entry.isCurrentUser ? "You" : entry.name}</strong>
      <em className="lb-podium-xp">{entry.xp.toLocaleString()} XP</em>
      <small className="lb-podium-meta">
        Lv.{entry.level} &middot; {entry.streak}d streak
      </small>
    </motion.article>
  );
}

export default function LeaderboardClient({
  leaderboard,
}: {
  leaderboard: { top: LeaderboardEntry[]; current: LeaderboardEntry | null };
}) {
  const reduceMotion = useReducedMotion();
  const top = leaderboard.top ?? [];
  const current = leaderboard.current;
  const podiumByRank = top.slice(0, 3);
  const podium = [podiumByRank[1], podiumByRank[0], podiumByRank[2]].filter(
    Boolean
  ) as LeaderboardEntry[];
  const rankList = top.slice(3);
  const currentInTop = Boolean(
    current && top.some((entry) => entry.userId === current.userId)
  );
  const totalXP = useMemo(
    () => top.reduce((sum, entry) => sum + entry.xp, 0),
    [top]
  );

  return (
    <>
      <style>{`
        /* ── Keyframes ──────────────────────────────────── */
        @keyframes lb-float {
          0%,100%{transform:translateY(0px) rotate(0deg)}
          50%{transform:translateY(-10px) rotate(1deg)}
        }
        @keyframes lb-gold-pulse {
          0%,100%{box-shadow:0 0 28px rgba(255,215,0,.35),0 28px 70px rgba(214,166,50,.22)}
          50%{box-shadow:0 0 52px rgba(255,215,0,.65),0 28px 70px rgba(214,166,50,.4)}
        }
        @keyframes lb-crown-dance {
          0%,100%{transform:translateY(0) rotate(-6deg) scale(1)}
          30%{transform:translateY(-6px) rotate(6deg) scale(1.12)}
          60%{transform:translateY(-3px) rotate(-3deg) scale(1.06)}
        }
        @keyframes lb-shimmer {
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }
        @keyframes lb-particle {
          0%{transform:translateY(0) scale(1);opacity:.7}
          100%{transform:translateY(-90px) scale(0);opacity:0}
        }
        @keyframes lb-star-twinkle {
          0%,100%{opacity:.2;transform:scale(.7)}
          50%{opacity:1;transform:scale(1.1)}
        }
        @keyframes lb-row-in {
          from{opacity:0;transform:translateX(-18px)}
          to{opacity:1;transform:translateX(0)}
        }

        /* ── Page ───────────────────────────────────────── */
        .lb-page{width:min(1180px,calc(100vw - 36px));margin:0 auto;padding:28px 0 118px;}

        /* ── Hero ───────────────────────────────────────── */
        .lb-hero{
          position:relative;overflow:hidden;
          border:1px solid rgba(93,219,168,.28);border-radius:28px;
          background:radial-gradient(ellipse at 78% 10%,rgba(120,229,184,.32),transparent 38%),
                      linear-gradient(138deg,#0d1c13,#1b3428 55%,#1f3c2e);
          color:#fff;padding:32px 28px 28px;
          box-shadow:0 24px 64px rgba(8,20,12,.22);
        }
        .lb-hero::before{
          content:"";position:absolute;inset:0;
          background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
          background-size:40px 40px;
          mask-image:radial-gradient(ellipse at 72% 18%,#000 0%,transparent 68%);
          pointer-events:none;
        }
        .lb-hero > *{position:relative;z-index:1;}

        /* Floating particles */
        .lb-particles{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;}
        .lb-particle{
          position:absolute;border-radius:50%;
          background:rgba(120,229,184,.6);
          animation:lb-particle var(--dur,4s) var(--delay,0s) infinite ease-out;
        }

        /* Stars */
        .lb-stars{position:absolute;inset:0;pointer-events:none;z-index:0;}
        .lb-star{
          position:absolute;border-radius:50%;background:#fff;
          animation:lb-star-twinkle var(--sdur,2.5s) var(--sdelay,0s) infinite ease-in-out;
        }

        .lb-eyebrow{margin:0 0 8px;color:#78e5b8;font-size:11px;font-weight:950;letter-spacing:.1em;text-transform:uppercase;}
        .lb-hero h1{
          max-width:760px;color:#fff;font-family:var(--font-display);
          font-size:clamp(42px,6vw,76px);line-height:.9;letter-spacing:-.02em;margin:0;
        }
        .lb-hero-desc{max-width:560px;margin:14px 0 0;color:rgba(255,255,255,.68);font-size:13.5px;font-weight:750;line-height:1.7;}
        .lb-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:26px;max-width:680px;}
        .lb-stat{
          border:1px solid rgba(255,255,255,.12);border-radius:18px;
          background:rgba(0,0,0,.2);backdrop-filter:blur(4px);padding:14px 16px;
          transition:border-color .2s;
        }
        .lb-stat:hover{border-color:rgba(120,229,184,.4);}
        .lb-stat span{display:block;color:rgba(255,255,255,.55);font-size:10px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;}
        .lb-stat strong{display:block;margin-top:5px;color:#fff;font-family:var(--font-display);font-size:30px;line-height:1;}

        /* ── Podium ─────────────────────────────────────── */
        .lb-podium{
          display:grid;grid-template-columns:.88fr 1.2fr .88fr;
          gap:14px;align-items:end;margin-top:20px;
        }
        .lb-podium-card{
          position:relative;
          border:1.5px solid var(--border2);border-radius:26px;
          background:linear-gradient(180deg,var(--bg2) 0%,var(--bg0) 100%);
          padding:22px 16px 18px;
          display:flex;flex-direction:column;align-items:center;text-align:center;
          overflow:visible;
          transition:transform .25s ease,box-shadow .25s ease;
        }
        .lb-podium-card:hover{transform:translateY(-4px);}

        /* Rank-specific heights & styles */
        .lb-podium-card.rank-1{
          border-color:rgba(255,215,0,.65);
          background:radial-gradient(ellipse at 50% -10%,rgba(255,215,0,.14),transparent 55%),
                      linear-gradient(180deg,var(--bg2),var(--bg0));
          min-height:360px;
          animation:lb-gold-pulse 2.8s ease-in-out infinite;
        }
        .lb-podium-card.rank-2{
          border-color:rgba(192,192,192,.5);
          box-shadow:0 0 24px rgba(192,192,192,.12);
          min-height:300px;
        }
        .lb-podium-card.rank-3{
          border-color:rgba(205,127,50,.5);
          box-shadow:0 0 24px rgba(205,127,50,.12);
          min-height:276px;
        }
        .lb-podium-card.is-you{
          border-color:rgba(61,201,142,.68)!important;
          background:radial-gradient(ellipse at 50% 0%,rgba(61,201,142,.2),transparent 55%),
                      linear-gradient(180deg,var(--bg2),var(--bg0))!important;
        }

        /* Decorative glow blob */
        .lb-podium-card::after{
          content:"";position:absolute;
          bottom:-40px;right:-20px;
          width:160px;height:160px;border-radius:50%;
          background:var(--card-glow,#3DC98E);
          opacity:.1;filter:blur(28px);
          pointer-events:none;
        }
        .rank-1{--card-glow:#FFD700;}
        .rank-2{--card-glow:#C0C0C0;}
        .rank-3{--card-glow:#CD7F32;}

        /* Crown */
        .lb-crown{
          font-size:26px;margin-bottom:4px;
          animation:lb-crown-dance 2.4s ease-in-out infinite;
          filter:drop-shadow(0 4px 8px rgba(255,215,0,.5));
          line-height:1;
        }

        /* Rank pill */
        .lb-rank-pill{
          position:absolute;top:-11px;left:50%;transform:translateX(-50%);
          background:var(--pill-bg,#64748b);border:2px solid var(--pill-border,#94a3b8);
          border-radius:20px;padding:2px 10px;
          color:#fff;font-size:11px;font-weight:950;letter-spacing:.04em;
          box-shadow:0 4px 12px rgba(0,0,0,.2);white-space:nowrap;
        }
        .rank-1 .lb-rank-pill{--pill-bg:#b8860b;--pill-border:#FFD700;}
        .rank-2 .lb-rank-pill{--pill-bg:#6b7280;--pill-border:#C0C0C0;}
        .rank-3 .lb-rank-pill{--pill-bg:#78440a;--pill-border:#CD7F32;}

        /* ── Badge frame ────────────────────────────────── */
        .lb-badge-frame{
          position:relative;
          width:140px;height:140px;
          display:grid;place-items:center;
          overflow:visible;
          margin-bottom:14px;
          animation:lb-float 3.6s ease-in-out infinite;
        }
        .rank-1 .lb-badge-frame{
          width:176px;height:176px;
          animation-duration:3s;
          filter:drop-shadow(0 14px 32px rgba(255,215,0,.28));
        }
        .rank-2 .lb-badge-frame{
          filter:drop-shadow(0 12px 24px rgba(192,192,192,.22));
          animation-delay:.4s;
        }
        .rank-3 .lb-badge-frame{
          filter:drop-shadow(0 12px 24px rgba(205,127,50,.22));
          animation-delay:.8s;
        }

        /* Lottie wrapper */
        .lb-lottie-wrap{
          position:absolute;
          inset:-22%;
          overflow:visible;
          pointer-events:none;
        }
        .rank-1 .lb-lottie-wrap{inset:-20%;}

        /* Profile photo */
        .lb-badge-photo{
          position:absolute;
          left:50%;top:50%;
          transform:translate(-50%,-50%);
          width:58px;height:58px;
          border-radius:50%;
          overflow:hidden;
          background:#17211b;
          color:#fff4bd;
          display:grid;place-items:center;
          font-size:17px;font-weight:950;
          border:3px solid rgba(255,255,255,.85);
          box-shadow:0 8px 20px rgba(0,0,0,.28);
          z-index:10;
          pointer-events:none;
          flex-shrink:0;
        }
        .rank-1 .lb-badge-photo{width:72px;height:72px;font-size:21px;border-width:3.5px;}
        .lb-badge-photo img{width:100%;height:100%;object-fit:cover;display:block;}

        /* Podium text */
        .lb-podium-name{
          position:relative;z-index:1;
          max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
          color:var(--text1);font-size:17px;font-weight:950;
        }
        .lb-podium-xp{
          position:relative;z-index:1;
          margin-top:6px;color:var(--mint2);font-style:normal;font-size:15px;font-weight:950;
        }
        .lb-podium-meta{
          position:relative;z-index:1;
          margin-top:5px;color:var(--text3);font-size:11px;font-weight:850;
        }

        /* ── Board (chasers) ────────────────────────────── */
        .lb-board{
          margin-top:18px;
          border:1px solid var(--border2);border-radius:24px;
          background:var(--bg2);padding:20px;
          box-shadow:0 18px 44px rgba(21,31,26,.07);
        }
        .lb-board-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;}
        .lb-board-head h2{font-size:24px;color:var(--text1);line-height:1;}
        .lb-list{display:grid;gap:8px;}

        .lb-row,.lb-current{
          display:grid;
          grid-template-columns:52px 42px minmax(0,1fr) auto;
          align-items:center;gap:12px;
          border:1px solid var(--border2);border-radius:18px;
          background:var(--bg0);padding:11px 14px;
          position:relative;overflow:hidden;
          transition:border-color .2s,transform .2s,box-shadow .2s;
          animation:lb-row-in .35s ease both;
        }
        .lb-row:hover{
          transform:translateX(4px);
          border-color:rgba(61,201,142,.4);
          box-shadow:0 6px 20px rgba(61,201,142,.08);
        }
        /* Shimmer on hover */
        .lb-row::after{
          content:"";position:absolute;inset:0;
          background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.06) 50%,transparent 70%);
          background-size:200% 100%;
          opacity:0;transition:opacity .2s;
          pointer-events:none;
        }
        .lb-row:hover::after{opacity:1;animation:lb-shimmer .8s ease;}

        .lb-row.is-you,.lb-current{
          border-color:rgba(61,201,142,.55);
          background:linear-gradient(135deg,rgba(61,201,142,.12),var(--bg0));
          box-shadow:0 0 0 1px rgba(61,201,142,.2) inset;
        }

        .lb-rank{color:var(--text3);font-size:13px;font-weight:950;text-align:center;}
        .lb-avatar{display:grid;place-items:center;overflow:hidden;background:var(--text1);color:var(--bg0);font-size:12px;font-weight:950;border-radius:14px;}
        .lb-avatar.sm{width:42px;height:42px;}
        .lb-avatar img,.lb-badge-photo img{width:100%;height:100%;object-fit:cover;display:block;}

        .lb-row strong,.lb-current strong{display:block;color:var(--text1);font-size:14px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .lb-row small,.lb-current small{display:block;margin-top:4px;color:var(--text3);font-size:11px;font-weight:800;}
        .lb-row em,.lb-current em{font-style:normal;color:var(--text1);font-size:13px;font-weight:950;white-space:nowrap;}

        .lb-current{margin-top:14px;animation:none;}
        .lb-empty{margin:0;color:var(--text3);font-size:13px;font-weight:800;}

        /* You badge in list */
        .you-chip{
          display:inline-flex;align-items:center;
          background:rgba(61,201,142,.18);border:1px solid rgba(61,201,142,.4);
          border-radius:8px;padding:1px 6px;
          color:var(--mint2);font-size:9px;font-weight:950;letter-spacing:.06em;text-transform:uppercase;
          margin-left:6px;vertical-align:middle;
        }

        /* Stagger row animations */
        .lb-list > :nth-child(1){animation-delay:.04s}
        .lb-list > :nth-child(2){animation-delay:.08s}
        .lb-list > :nth-child(3){animation-delay:.12s}
        .lb-list > :nth-child(4){animation-delay:.16s}
        .lb-list > :nth-child(5){animation-delay:.20s}
        .lb-list > :nth-child(6){animation-delay:.24s}
        .lb-list > :nth-child(7){animation-delay:.28s}

        /* ── Responsive ─────────────────────────────────── */
        @media(max-width:780px){
          .lb-page{width:calc(100vw - 24px);padding-top:18px;}
          .lb-hero{padding:20px;}
          .lb-hero-stats{grid-template-columns:1fr;}
          .lb-podium{grid-template-columns:1fr;}
          .lb-podium-card.rank-1{order:-1;}
          .lb-row,.lb-current{grid-template-columns:40px 38px minmax(0,1fr);}
          .lb-row em,.lb-current em{grid-column:3;justify-self:start;}
          .lb-board-head{align-items:flex-start;flex-direction:column;}
        }
      `}</style>

      <main className="lb-page">
        {/* ── Hero ── */}
        <section className="lb-hero">
          <div className="lb-particles" aria-hidden>
            {[
              { s: 4, x: "12%", delay: "0s", dur: "5s" },
              { s: 3, x: "28%", delay: "1.2s", dur: "4.2s" },
              { s: 5, x: "48%", delay: "2.4s", dur: "6s" },
              { s: 3, x: "65%", delay: "0.6s", dur: "4.8s" },
              { s: 4, x: "82%", delay: "1.8s", dur: "5.4s" },
              { s: 2, x: "90%", delay: "3s", dur: "3.8s" },
            ].map((p, i) => (
              <div
                key={i}
                className="lb-particle"
                style={{
                  width: p.s,
                  height: p.s,
                  bottom: 0,
                  left: p.x,
                  "--delay": p.delay,
                  "--dur": p.dur,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="lb-stars" aria-hidden>
            {[
              { s: 2, x: "72%", y: "18%", dur: "2.1s", delay: "0s" },
              { s: 3, x: "85%", y: "32%", dur: "3s", delay: ".6s" },
              { s: 2, x: "60%", y: "12%", dur: "2.6s", delay: "1.1s" },
              { s: 2, x: "92%", y: "55%", dur: "1.9s", delay: ".3s" },
              { s: 3, x: "76%", y: "65%", dur: "2.8s", delay: "1.5s" },
            ].map((s, i) => (
              <div
                key={i}
                className="lb-star"
                style={{
                  width: s.s,
                  height: s.s,
                  left: s.x,
                  top: s.y,
                  "--sdur": s.dur,
                  "--sdelay": s.delay,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <p className="lb-eyebrow">Loopless Arena</p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Leaderboard
          </motion.h1>
          <p className="lb-hero-desc">
            XP comes from check-ins, streaks, and earned badges. Top three claim the
            badge-frame podium; the rest of the top ten stay ready below.
          </p>
          <motion.div
            className="lb-hero-stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="lb-stat">
              <span>Top Score</span>
              <strong>
                <CountUp to={top[0]?.xp ?? 0} />
              </strong>
            </div>
            <div className="lb-stat">
              <span>Ranked Players</span>
              <strong>
                <CountUp to={top.length} duration={1} />
              </strong>
            </div>
            <div className="lb-stat">
              <span>Total Top XP</span>
              <strong>
                <CountUp to={totalXP} duration={2} />
              </strong>
            </div>
          </motion.div>
        </section>

        {/* ── Podium ── */}
        {podium.length ? (
          <section className="lb-podium" aria-label="Top three players">
            {podium.map((entry, i) => (
              <PodiumBadge
                key={entry.userId}
                entry={entry}
                delay={i * 0.1}
              />
            ))}
          </section>
        ) : (
          <section className="lb-board">
            <p className="lb-empty">Start earning XP to open the leaderboard.</p>
          </section>
        )}

        {/* ── Chasers ── */}
        <section className="lb-board">
          <div className="lb-board-head">
            <div>
              <p className="lb-eyebrow" style={{ color: "var(--mint2)" }}>
                Ranks 4–10
              </p>
              <h2>Chasers</h2>
            </div>
          </div>

          <motion.div
            className="lb-list"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {rankList.map((entry) => (
              <div
                className={`lb-row${entry.isCurrentUser ? " is-you" : ""}`}
                key={entry.userId}
              >
                <span className="lb-rank">#{entry.rank}</span>
                <Avatar entry={entry} size="sm" />
                <div>
                  <strong>
                    {entry.isCurrentUser ? "You" : entry.name}
                    {entry.isCurrentUser && (
                      <span className="you-chip">You</span>
                    )}
                  </strong>
                  <small>
                    Lv.{entry.level} &middot; {entry.badgeCount} badges &middot;{" "}
                    {entry.checkinCount} check-ins
                  </small>
                </div>
                <em>{entry.xp.toLocaleString()} XP</em>
              </div>
            ))}
          </motion.div>

          {current && !currentInTop ? (
            <div className="lb-current">
              <span className="lb-rank">#{current.rank}</span>
              <Avatar entry={current} size="sm" />
              <div>
                <strong>
                  You <span className="you-chip">You</span>
                </strong>
                <small>
                  Lv.{current.level} &middot; {current.badgeCount} badges &middot;{" "}
                  {current.checkinCount} check-ins
                </small>
              </div>
              <em>{current.xp.toLocaleString()} XP</em>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
