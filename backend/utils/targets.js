// Default "ideal" spending mix, as a percentage of the monthly budget (or of total
// spend, if no budget is set). These are common household-budgeting rules of thumb
// (housing ~20-25%, groceries ~12-15%, etc.) — a general guideline, not personalised
// financial advice, and every category can be overridden per user via CategoryTarget.
// Percentages sum to 100.
const DEFAULT_TARGETS = {
  Rent: 25,
  Groceries: 12,
  Vegetables: 3,
  Milk: 2,
  Electricity: 4,
  Water: 1,
  Gas: 1,
  Phone: 2,
  WiFi: 2,
  OTT: 1,
  Househelp: 4,
  'School Fees': 10,
  Transport: 6,
  Medical: 5,
  Shopping: 8,
  'Eating Out': 6,
  Newspaper: 0.5,
  Other: 7.5,
};

// Categories nudged when a lifestyle profile shifts the mix — "discretionary" spend
// flexes with lifestyle tier; everything else is scaled inversely to keep the total at 100.
const DISCRETIONARY = ['Shopping', 'Eating Out', 'OTT', 'Other'];

const LIFESTYLE_SHIFT = {
  minimalist: -0.3,
  balanced: 0,
  comfortable: 0.3,
  premium: 0.6,
};

// Returns a category -> idealPercent map, nudged by the user's lifestyle tier.
// Always sums to 100. Falls back to DEFAULT_TARGETS unchanged when lifestyle is
// 'balanced' or unrecognised.
function personalizedTargets(lifestyle) {
  const base = { ...DEFAULT_TARGETS };
  const shift = LIFESTYLE_SHIFT[lifestyle] ?? 0;
  if (shift === 0) return base;

  DISCRETIONARY.forEach((c) => {
    base[c] = Math.max(0.5, base[c] * (1 + shift));
  });

  const sum = Object.values(base).reduce((a, b) => a + b, 0);
  const scale = 100 / sum;
  Object.keys(base).forEach((c) => {
    base[c] = Math.round(base[c] * scale * 10) / 10;
  });
  return base;
}

// A simple, transparent 0-100 "lifestyle score" heuristic from a few self-reported
// signals. This is a rule-of-thumb indicator for personalising category targets —
// explicitly NOT a credit score, financial health score, or professional financial
// assessment, and the frontend should present it that way.
function computeLifestyleScore({ age, income, lifestyle, workProfile }) {
  let score = 50;

  if (income >= 200000) score += 20;
  else if (income >= 100000) score += 10;
  else if (income >= 50000) score += 0;
  else score -= 10;

  const lifestyleMap = { minimalist: -10, balanced: 0, comfortable: 10, premium: 20 };
  score += lifestyleMap[lifestyle] ?? 0;

  const workMap = { salaried: 10, business: 5, freelance: 0, homemaker: 0, student: -5, retired: 5 };
  score += workMap[workProfile] ?? 0;

  if (age >= 45) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = { DEFAULT_TARGETS, DISCRETIONARY, personalizedTargets, computeLifestyleScore };
