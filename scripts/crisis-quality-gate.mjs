import fs from "node:fs";

const DATASET_PATH = "data/crisis-labelled-entries.json";
const MAX_FALSE_POSITIVE_RATE = 0.05;
const MAX_FALSE_NEGATIVE_RATE = 0.01;

const HIGH_SIGNAL = [
  /\b(kill myself|end my life|take my life)\b/i,
  /\b(want to die|wish i was dead|rather be dead)\b/i,
  /\b(suicide|suicidal)\b/i,
  /\b(self[-\s]?harm|hurt myself|harm myself)\b/i,
  /\b(can't go on|cannot go on|no reason to live)\b/i,
  /\b(overdose|od)\b/i,
];
const CONTEXT = [
  /\b(hopeless|worthless|burden|trapped|unsafe)\b/i,
  /\b(tonight|right now|soon|plan|goodbye)\b/i,
  /\b(alone|nobody cares|no one cares)\b/i,
];

function detect(text) {
  const high = HIGH_SIGNAL.filter((pattern) => pattern.test(text)).length;
  const context = CONTEXT.filter((pattern) => pattern.test(text)).length;
  const confidence = Math.min(0.99, high * 0.72 + context * 0.12);
  return high > 0 && confidence >= 0.72;
}

if (!fs.existsSync(DATASET_PATH)) {
  console.error(`Missing labelled dataset: ${DATASET_PATH}`);
  process.exit(1);
}

const entries = JSON.parse(fs.readFileSync(DATASET_PATH, "utf8"));
if (!Array.isArray(entries) || entries.length < 500) {
  console.error("Crisis classifier gate requires at least 500 labelled entries.");
  process.exit(1);
}

let fp = 0;
let fn = 0;
let negatives = 0;
let positives = 0;

for (const entry of entries) {
  const expected = Boolean(entry.crisis);
  const actual = detect(String(entry.text ?? ""));
  if (expected) positives += 1;
  else negatives += 1;
  if (!expected && actual) fp += 1;
  if (expected && !actual) fn += 1;
}

const fpr = negatives ? fp / negatives : 0;
const fnr = positives ? fn / positives : 0;

console.log(`False positive rate: ${(fpr * 100).toFixed(2)}%`);
console.log(`False negative rate: ${(fnr * 100).toFixed(2)}%`);

if (fpr > MAX_FALSE_POSITIVE_RATE || fnr > MAX_FALSE_NEGATIVE_RATE) {
  console.error("Crisis classifier quality gate failed.");
  process.exit(1);
}

if (process.env.CRISIS_CLASSIFIER_ADVISOR_APPROVED !== "true") {
  console.error("Mental health advisor approval flag is missing.");
  process.exit(1);
}

console.log("Crisis classifier quality gate passed.");
