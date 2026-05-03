"use client";
import { useId } from "react";
import { motion } from "framer-motion";
import { IcoLung, IcoArrow } from "./dash-icons";

// Lung recovery checkpoints (times are clinical markers; `days` drives the same score curve as «Day N» streak)
const MILESTONES = [
  {
    days: 1,
    label: "20 min",
    desc: "Heart rate drops to normal",
    accent: "#e07b5a",
    tierLabel: "I",
  },
  {
    days: 3,
    label: "72 hrs",
    desc: "Nicotine fully cleared from body",
    accent: "#c9982a",
    tierLabel: "II",
  },
  {
    days: 7,
    label: "1 week",
    desc: "Cilia start sweeping debris from lungs",
    accent: "#5bb8f5",
    tierLabel: "III",
  },
  {
    days: 14,
    label: "2 weeks",
    desc: "Circulation & lung function improving",
    accent: "#7b6fa0",
    tierLabel: "IV",
  },
  {
    days: 30,
    label: "1 month",
    desc: "Lung function up ~30%, coughing drops",
    accent: "#5a8f6a",
    tierLabel: "V",
  },
  {
    days: 90,
    label: "3 months",
    desc: "Airways less reactive to triggers",
    accent: "#3bc98e",
    tierLabel: "VI",
  },
  {
    days: 365,
    label: "1 year",
    desc: "Heart disease risk halved vs smoker",
    accent: "#5ddba8",
    tierLabel: "VII",
  },
] as const;

/** Recovery score shown in the lung (5% baseline → ~95% over a full year): same curve for milestones. */
export function lungPct(daysClean: number): number {
  if (daysClean <= 0) return 5;
  const ratio = Math.min(daysClean / 365, 1);
  return Math.round(5 + 90 * Math.pow(ratio, 0.45));
}

function MilestoneGameBadge({
  uid,
  reached,
  isCurrent,
  accent,
  tierRoman,
}: {
  uid: string;
  reached: boolean;
  isCurrent: boolean;
  accent: string;
  tierRoman: string;
}) {
  const rimGlow = reached
    ? "drop-shadow(0 0 6px rgba(255,215,120,0.55))"
    : isCurrent
      ? `drop-shadow(0 0 5px ${accent}66)`
      : "none";

  return (
    <motion.div
      style={{
        flexShrink: 0,
        width: 42,
        height: 48,
        filter: rimGlow,
      }}
      animate={
        reached
          ? { rotate: [-1.5, 1.5, -1], y: [0, -2, 0] }
          : isCurrent
            ? { scale: [1, 1.03, 1] }
            : {}
      }
      transition={
        reached
          ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <svg width="42" height="48" viewBox="0 0 42 48" aria-hidden>
        <defs>
          <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5e6a8" />
            <stop offset="35%" stopColor="#c9a227" />
            <stop offset="70%" stopColor="#8b6914" />
            <stop offset="100%" stopColor="#f0d78c" />
          </linearGradient>
          <linearGradient id={`${uid}-rimDim`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9a9a9a" />
            <stop offset="100%" stopColor="#6a6a6a" />
          </linearGradient>
          <linearGradient
            id={`${uid}-plate`}
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={reached ? accent : `${accent}`}
              stopOpacity={reached ? 0.95 : 0.28}
            />
            <stop
              offset="100%"
              stopColor={reached ? accent : "#555"}
              stopOpacity={reached ? 0.72 : 0.18}
            />
          </linearGradient>
          <linearGradient
            id={`${uid}-inner`}
            x1="40%"
            y1="10%"
            x2="60%"
            y2="90%"
          >
            <stop offset="0%" stopColor="#1a1a20" />
            <stop offset="100%" stopColor="#0f0f14" />
          </linearGradient>
        </defs>
        {/* Ribbons */}
        <path
          d="M4 39 L21 43 L38 39 L39 43 L21 46.5 L3 43 Z"
          fill={reached ? accent : "var(--text3)"}
          opacity={reached ? 0.55 : 0.25}
        />
        {/* Shield body */}
        <path
          d="M21 2 L37 10 L37 24 C37 34 31 41 21 44 C11 41 5 34 5 24 L5 10 Z"
          fill={`url(#${uid}-plate)`}
          stroke={
            reached || isCurrent ? `url(#${uid}-rim)` : `url(#${uid}-rimDim)`
          }
          strokeWidth={reached ? 2 : isCurrent ? 1.85 : 1.4}
        />
        {/* Inner inset plate */}
        <path
          d="M21 8 L31 13.5 V24 C31 31.8 26.9 37.8 21 40 C15.1 37.8 11 31.8 11 24 V13.5 Z"
          fill={`url(#${uid}-inner)`}
          opacity={reached ? 0.92 : 0.75}
          stroke="#ffffff18"
          strokeWidth="1"
        />
        {/* Tier mark */}
        <text
          x="21"
          y="31"
          textAnchor="middle"
          fill={reached ? "#fff" : isCurrent ? accent : "#888"}
          opacity={reached ? 0.92 : isCurrent ? 0.95 : 0.45}
          fontSize="12"
          fontWeight="900"
          fontFamily="system-ui,sans-serif"
        >
          {tierRoman}
        </text>
        {reached && (
          <>
            <circle
              cx="32"
              cy="9"
              r="3.8"
              fill="#ffd966"
              opacity="0.92"
              stroke="#b8860b"
              strokeWidth="0.5"
            />
            <path
              d="M30.8 10.8 L31.7 11.9 L34.2 8.9"
              stroke="#5a4520"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {!reached && isCurrent && (
          <ellipse
            cx="21"
            cy="11"
            rx="8"
            ry="2.2"
            fill={accent}
            opacity="0.25"
          />
        )}
      </svg>
    </motion.div>
  );
}

/** Fraction of usable fill range mapped from score 5% → ~95%. */
function fillRatioFromPct(pct: number): number {
  return Math.max(0, Math.min(1, (pct - 5) / 90));
}

/**
 * Paths from SVG Repo lung asset (`public/icons/lungs-svgrepo-com.svg`).
 * Styled with recovery gradient + bottom-up fill mask for the HUD.
 */
const SVGR_LUNG_CENTRAL_D =
  "M9.73659 18.9004V15.0258C9.73659 14.4898 9.54711 14.0324 9.16812 13.6534C8.78914 13.2744 8.33168 13.0849 7.79572 13.0849H7.55311C7.35237 13.0849 7.18103 13.0139 7.03909 12.872C6.89714 12.73 6.82617 12.5587 6.82617 12.358C6.82617 12.1572 6.89714 11.9859 7.03909 11.8439C7.18103 11.702 7.35237 11.631 7.55311 11.631H8.77954C9.40569 11.631 10.0159 11.5325 10.6102 11.3354C11.2045 11.1383 11.7527 10.8526 12.2548 10.4784L14.967 8.45705C15.3571 8.16635 15.5521 7.77777 15.5521 7.29132V1.45388C15.5521 1.0524 15.694 0.709718 15.9779 0.425831C16.2618 0.141944 16.6045 0 17.006 0C17.4075 0 17.7501 0.141944 18.034 0.425831C18.3179 0.709718 18.4599 1.0524 18.4599 1.45388V7.29132C18.4599 7.77777 18.6549 8.16635 19.0449 8.45705L21.7572 10.4784C22.2592 10.8526 22.8075 11.1383 23.4017 11.3354C23.996 11.5325 24.6062 11.631 25.2324 11.631H26.4589C26.6595 11.631 26.831 11.702 26.9729 11.8439C27.1148 11.9859 27.1858 12.1572 27.1858 12.358C27.1858 12.5587 27.1148 12.73 26.9729 12.872C26.831 13.0139 26.6595 13.0849 26.4589 13.0849H26.2163C25.6804 13.0849 25.2228 13.2744 24.8438 13.6534C24.4649 14.0324 24.2753 14.4898 24.2753 15.0258V18.9004C24.2753 19.3018 24.1334 19.6445 23.8495 19.9285C23.5657 20.2124 23.223 20.3543 22.8214 20.3543C22.42 20.3543 22.0774 20.2124 21.7934 19.9285C21.5096 19.6445 21.3676 19.3018 21.3676 18.9004V16.7334C21.3676 15.815 21.1616 14.9454 20.7497 14.1247C20.3378 13.3039 19.7637 12.6192 19.0273 12.0704L17.3073 10.7885C17.2021 10.7101 17.1017 10.6294 17.006 10.5462C16.9103 10.6294 16.8098 10.7101 16.7046 10.7885L14.9846 12.0704C14.2483 12.6192 13.6742 13.3039 13.2622 14.1247C12.8503 14.9454 12.6443 15.815 12.6443 16.7334V18.9004C12.6443 19.3018 12.5024 19.6445 12.2185 19.9285C11.9346 20.2124 11.5919 20.3543 11.1905 20.3543C10.789 20.3543 10.4463 20.2124 10.1624 19.9285C9.87853 19.6445 9.73659 19.3018 9.73659 18.9004Z";
const SVGR_LUNG_LEFT_D =
  "M14.4059 8.30824L15.5109 20.5009C15.7653 23.2096 14.0366 25.7434 11.2399 26.7215L5.05209 28.8946C3.51332 29.435 1.78489 28.737 1.19154 27.3354C1.05937 27.0233 0.991601 26.6915 0.991601 26.357V21.8867C0.991601 16.7224 3.32112 11.785 7.43461 8.2307L9.36579 6.54524C10.5623 5.53473 12.4523 5.57906 13.5874 6.64426C14.0665 7.11193 14.3497 7.6921 14.4059 8.30824Z";
const SVGR_LUNG_RIGHT_D =
  "M18.4803 20.5009L19.5854 8.30824C19.6416 7.6921 19.9247 7.11193 20.4028 6.64426C21.5372 5.57906 23.4263 5.53473 24.6221 6.54524L26.5523 8.2307C30.6636 11.785 32.9919 16.7224 32.9919 21.8867V26.357C32.9919 26.6915 32.9242 27.0233 32.7921 27.3354C32.199 28.737 30.4715 29.435 28.9336 28.8946L22.7491 26.7215C19.9546 25.7434 18.2259 23.2096 18.4803 20.5009Z";

const SVGR_VB_Y0 = -1.5;
const SVGR_VB_H = 33.65;

function LungSvg({ pct }: { pct: number }) {
  const rawUid = useId().replace(/:/g, "");
  const id = `lung${rawUid}`;
  const h = fillRatioFromPct(pct);
  const fillTop = SVGR_VB_Y0 + SVGR_VB_H * (1 - h);
  const revealH = Math.max(SVGR_VB_H * h, 0.08);

  return (
    <svg
      viewBox={`0 ${SVGR_VB_Y0} 33 ${SVGR_VB_H}`}
      width={152}
      height={152}
      style={{
        overflow: "visible",
        filter: "drop-shadow(0 6px 16px rgba(59,201,142,0.22))",
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-vital`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#289e6f" />
          <stop offset="45%" stopColor="#4bdfb0" />
          <stop offset="100%" stopColor="#cfffef" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="35%" y1="0%" x2="65%" y2="100%">
          <stop offset="0%" stopColor="#a8bbd4" />
          <stop offset="100%" stopColor="#3f5369" />
        </linearGradient>
        <linearGradient
          id={`${id}-shimmer`}
          x1="-30%"
          y1="0%"
          x2="130%"
          y2="100%"
        >
          <stop offset="42%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="50%" stopColor="#ffffff" stopOpacity={0.15} />
          <stop offset="58%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <filter
          id={`${id}-ambGlow`}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" />
        </filter>
        <mask
          id={`${id}-fillMask`}
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
        >
          <rect
            x="-4"
            y={SVGR_VB_Y0}
            width={41}
            height={SVGR_VB_H + 2}
            fill="black"
          />
          <motion.rect
            x={-4}
            width={41}
            fill="white"
            initial={false}
            animate={{ y: fillTop, height: revealH }}
            transition={{ type: "spring", stiffness: 52, damping: 20 }}
          />
        </mask>
      </defs>

      <motion.g
        style={{ transformOrigin: "50% 92%", transformBox: "fill-box" }}
        animate={{
          scaleY: [1, 1.05, 1],
          scaleX: [1, 1.022, 1],
          y: [0, -0.6, 0],
        }}
        transition={{
          duration: 4.25,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
        }}
      >
        <g opacity={0.45} filter={`url(#${id}-ambGlow)`}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={SVGR_LUNG_CENTRAL_D}
            fill="#5cdba6"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={SVGR_LUNG_LEFT_D}
            fill="#5cdba6"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={SVGR_LUNG_RIGHT_D}
            fill="#5cdba6"
          />
        </g>

        <g mask={`url(#${id}-fillMask)`}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={SVGR_LUNG_CENTRAL_D}
            fill={`url(#${id}-vital)`}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={SVGR_LUNG_LEFT_D}
            fill={`url(#${id}-vital)`}
            opacity={0.98}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={SVGR_LUNG_RIGHT_D}
            fill={`url(#${id}-vital)`}
            opacity={0.98}
          />
        </g>

        <motion.g
          mask={`url(#${id}-fillMask)`}
          animate={{ opacity: [0.25, 0.52, 0.25], x: [0, 0.5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={SVGR_LUNG_LEFT_D}
            fill={`url(#${id}-shimmer)`}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={SVGR_LUNG_RIGHT_D}
            fill={`url(#${id}-shimmer)`}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={SVGR_LUNG_CENTRAL_D}
            fill={`url(#${id}-shimmer)`}
            opacity={0.65}
          />
        </motion.g>

        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={SVGR_LUNG_CENTRAL_D}
          fill="none"
          stroke={`url(#${id}-rim)`}
          strokeWidth="0.42"
          strokeLinejoin="round"
          opacity={0.72}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={SVGR_LUNG_LEFT_D}
          fill="none"
          stroke={`url(#${id}-rim)`}
          strokeWidth="0.38"
          strokeLinejoin="round"
          opacity={0.72}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={SVGR_LUNG_RIGHT_D}
          fill="none"
          stroke={`url(#${id}-rim)`}
          strokeWidth="0.38"
          strokeLinejoin="round"
          opacity={0.72}
        />
      </motion.g>

      <text
        x="16.55"
        y="19.85"
        textAnchor="middle"
        fontSize="5.65"
        fontWeight="800"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fill="#135b44"
        stroke="#f9fffc"
        strokeWidth="0.35"
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {pct}%
      </text>
      <text
        x="16.55"
        y="26.95"
        textAnchor="middle"
        fontSize="2.05"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
        fill="#339f7a"
        letterSpacing="0.06em"
      >
        RECOVERY
      </text>
    </svg>
  );
}

export function LungProjection({ daysClean }: { daysClean: number }) {
  const blockId = useId().replace(/:/g, "");
  const currentPct = lungPct(daysClean);
  const nextMilestone = MILESTONES.find((m) => m.days > daysClean);
  const daysToNext = nextMilestone ? nextMilestone.days - daysClean : 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <IcoLung />
        <span
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 19,
            fontWeight: 700,
            color: "var(--text1)",
          }}
        >
          Lung Health Recovery
        </span>
      </div>

      <details
        style={{
          marginBottom: 12,
          borderRadius: 10,
          border: "1.5px solid var(--border2)",
          padding: "8px 12px",
          background: "var(--bg3)",
          color: "var(--text3)",
          fontSize: 11,
          fontWeight: 550,
          lineHeight: 1.45,
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 800,
            color: "var(--text2)",
          }}
        >
          How recovery % &amp; timelines work
        </summary>
        <p
          style={{
            margin: "10px 0 0",
            paddingTop: 8,
            borderTop: "1px solid var(--border2)",
          }}
        >
          The <strong style={{ color: "var(--text1)" }}>% in the lung</strong>{" "}
          uses only how many <strong>cigarette-free streak days</strong> you
          have logged ({`currently ${Math.max(daysClean, 0)}`}
          ): it begins around 5%, grows on a softened curve across the first
          year, and settles near <strong>{lungPct(365)}%</strong> after ~365
          days. This is one in-app motivational score-not a lung function
          measurement or CDC math.
        </p>
        <p style={{ margin: "8px 0 0" }}>
          The <strong>labels</strong> (20 min, 72 hrs…) come from quitting
          timelines in public-health guidance-they are the story at each
          milestone. Inside the app, badges unlock when your{" "}
          <strong>streak crosses the companion day count</strong> below (whole
          days only, so early labels are approximations of “first checkpoint”).
          Each row&apos;s <strong>% is the same curve</strong> evaluated at that
          day count-i.e., the headline score once that checkpoint has been
          reached-not a separate mystery number.
        </p>
      </details>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <LungSvg pct={currentPct} />
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text3)",
              textAlign: "center",
              maxWidth: 160,
            }}
          >
            {daysClean > 0
              ? `${daysClean} day streak • score from curve`
              : "Start streak to fill the lung"}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text3)",
              marginBottom: 8,
            }}
          >
            Achievements • score at milestone
          </div>
          {MILESTONES.map((m, i) => {
            const reached = daysClean >= m.days;
            const isCurrent =
              !reached && (i === 0 || daysClean >= MILESTONES[i - 1].days);
            const atPct = lungPct(m.days);
            const badgeUid = `${blockId}b${m.days}-${i}`;
            return (
              <motion.div
                key={m.days}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                  opacity: reached ? 1 : isCurrent ? 0.92 : 0.42,
                }}
              >
                <MilestoneGameBadge
                  uid={badgeUid}
                  reached={reached}
                  isCurrent={!!isCurrent}
                  accent={m.accent}
                  tierRoman={m.tierLabel}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: reached ? "var(--text1)" : "var(--text3)",
                      }}
                    >
                      {m.label}{" "}
                      <span style={{ fontWeight: 550, opacity: 0.75 }}>
                        (unlock streak ≥ {m.days}{" "}
                        {m.days === 1 ? "day" : "days"})
                      </span>
                    </span>
                    <span
                      title="Your headline recovery score once this streak checkpoint is unlocked"
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: reached ? "#3bc98e" : "var(--text3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {atPct}%
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text3)",
                      fontWeight: 500,
                      lineHeight: 1.35,
                    }}
                  >
                    {m.desc}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {nextMilestone && daysClean >= 0 && (
        <div
          style={{
            marginTop: 12,
            background: "var(--mint3)",
            border: "1.5px solid var(--mint-glow)",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--mint)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <IcoArrow />
          <span>
            {daysToNext} more day{daysToNext !== 1 ? "s" : ""} until{" "}
            <strong>{nextMilestone.label}</strong> • {nextMilestone.desc}
          </span>
        </div>
      )}

      <div
        style={{
          marginTop: 8,
          fontSize: 10,
          color: "var(--text3)",
          fontWeight: 500,
        }}
      >
        Source:{" "}
        <a
          href="https://www.cdc.gov/tobacco/quit_smoking/how_to_quit/benefits/index.htm"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--mint)", fontWeight: 700 }}
        >
          CDC - Health Benefits of Quitting
        </a>
      </div>
    </div>
  );
}
