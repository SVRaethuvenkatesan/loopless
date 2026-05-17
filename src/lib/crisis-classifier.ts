export type CrisisSignalResult = {
  highSignal: boolean;
  confidence: number;
  matched: string[];
  source: "checkin" | "journal";
};

const HIGH_SIGNAL_PATTERNS = [
  /\b(kill myself|end my life|take my life)\b/i,
  /\b(want to die|wish i was dead|rather be dead)\b/i,
  /\b(suicide|suicidal)\b/i,
  /\b(self[-\s]?harm|hurt myself|harm myself)\b/i,
  /\b(can't go on|cannot go on|no reason to live)\b/i,
  /\b(overdose|od)\b/i,
];

const CONTEXT_PATTERNS = [
  /\b(hopeless|worthless|burden|trapped|unsafe)\b/i,
  /\b(tonight|right now|soon|plan|goodbye)\b/i,
  /\b(alone|nobody cares|no one cares)\b/i,
];

export function detectCrisisSignal(
  text: string | null | undefined,
  source: "checkin" | "journal",
): CrisisSignalResult {
  const normalized = (text ?? "").trim();
  if (!normalized) {
    return { highSignal: false, confidence: 0, matched: [], source };
  }

  const matchedHigh = HIGH_SIGNAL_PATTERNS.filter((pattern) =>
    pattern.test(normalized),
  ).map((pattern) => pattern.source);
  const matchedContext = CONTEXT_PATTERNS.filter((pattern) =>
    pattern.test(normalized),
  ).map((pattern) => pattern.source);

  const confidence = Math.min(
    0.99,
    matchedHigh.length * 0.72 + matchedContext.length * 0.12,
  );

  return {
    highSignal: matchedHigh.length > 0 && confidence >= 0.72,
    confidence,
    matched: [...matchedHigh, ...matchedContext],
    source,
  };
}
