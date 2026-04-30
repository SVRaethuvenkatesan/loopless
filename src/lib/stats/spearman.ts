// Spearman correlation + two-tailed p-value via Student t-distribution
// No external dependencies — pure math.

function rankArray(arr: number[]): number[] {
  const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array<number>(arr.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length && indexed[j].v === indexed[i].v) j++;
    const avg = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) ranks[indexed[k].i] = avg;
    i = j;
  }
  return ranks;
}

// Lanczos log-gamma approximation (g=7, 9 coefficients)
function lgamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i <= 8; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Continued-fraction expansion for regularised incomplete beta (Lentz's method)
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200, EPS = 3e-7, FPMIN = 1e-30;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) <= EPS) break;
  }
  return h;
}

// Regularised incomplete beta I_x(a,b) — numerically stable via symmetry
function ibeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = lgamma(a + b) - lgamma(a) - lgamma(b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta);
  if (x < (a + 1) / (a + b + 2)) {
    return front * betacf(a, b, x) / a;
  }
  return 1 - front * betacf(b, a, 1 - x) / b;
}

// Two-tailed p-value for t-distribution with df degrees of freedom
export function tPValue(t: number, df: number): number {
  if (df <= 0) return 1;
  const x = df / (df + t * t);
  return ibeta(df / 2, 0.5, x);
}

export interface SpearmanResult {
  rho: number;
  pValue: number;
}

// Compute Spearman ρ and two-tailed p-value for two aligned arrays.
// Returns null if n < 4 or arrays mismatched.
export function spearmanCorrelation(x: number[], y: number[]): SpearmanResult | null {
  const n = x.length;
  if (n !== y.length || n < 4) return null;

  const rx = rankArray(x);
  const ry = rankArray(y);

  let d2 = 0;
  for (let i = 0; i < n; i++) {
    const d = rx[i] - ry[i];
    d2 += d * d;
  }

  const rho = Math.max(-1, Math.min(1, 1 - (6 * d2) / (n * (n * n - 1))));
  if (Math.abs(rho) >= 1) return { rho, pValue: 0 };

  const t = rho * Math.sqrt(n - 2) / Math.sqrt(1 - rho * rho);
  return { rho, pValue: tPValue(Math.abs(t), n - 2) };
}
