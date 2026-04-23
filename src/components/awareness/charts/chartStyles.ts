/* Shared chart styling constants for the Awareness module */

export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--bg2)",
  border: "2px solid var(--stroke)",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-sans)",
  fontWeight: 700,
  fontSize: "13px",
  padding: "10px 14px",
  boxShadow: "var(--shadow-card)",
};

export const AXIS_TICK = {
  fill: "var(--text2)",
  fontWeight: 700 as const,
  fontSize: 12,
  fontFamily: "var(--font-sans)",
};

export const LEGEND_STYLE: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "13px",
  fontFamily: "var(--font-sans)",
  paddingTop: "12px",
};

export const GRID_STROKE = "var(--border2)";
export const BAR_STROKE = "var(--stroke)";
export const BAR_STROKE_WIDTH = 2;
