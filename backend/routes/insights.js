const express = require('express');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const CategoryTarget = require('../models/CategoryTarget');
const LifestyleProfile = require('../models/LifestyleProfile');
const { protect } = require('../middleware/auth');
const { startOfMonthUTC, endOfMonthUTC } = require('../utils/dateRange');
const { DEFAULT_TARGETS, personalizedTargets } = require('../utils/targets');

const router = express.Router();
router.use(protect);

// A deviation smaller than this (in percentage points) is treated as "on track"
// rather than flagged — avoids flagging noise from a ₹50 swing.
const ON_TRACK_THRESHOLD = 3;

// @route  GET /api/insights?month=&year=
// Compares this month's actual spend per category against the "ideal" percentage
// for that category (lifestyle-personalised if a profile exists, else the default
// rule-of-thumb mix), and returns a deviation + a plain-language optimisation tip
// for every category that's meaningfully over target.
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getUTCMonth() + 1;
    const year = Number(req.query.year) || now.getUTCFullYear();
    const start = startOfMonthUTC(year, month);
    const end = endOfMonthUTC(year, month);

    const [budgetDoc, categorySpend, totalAgg, profile, overrides] = await Promise.all([
      Budget.findOne({ user: req.user._id, month, year }),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      LifestyleProfile.findOne({ user: req.user._id }),
      CategoryTarget.find({ user: req.user._id }),
    ]);

    const totalSpent = totalAgg[0]?.total || 0;
    // Percentages are computed against the monthly budget when one is set (that's
    // the household's own intended spend level); otherwise against actual total
    // spend this month, so the feature still works before a budget is configured.
    // const base = budgetDoc?.monthlyBudget > 0 ? budgetDoc.monthlyBudget : totalSpent;
     // The "ideal % of X" targets (utils/targets.js) are standard percent-of-INCOME
    // budgeting guidelines (e.g. "rent should be ~25% of income") — comparing them
    // against anything else silently changes what the percentages mean. So the
    // comparison base is, in priority order:
    //   1. monthly household income from the Lifestyle Profile — the actually
    //      correct base these targets were designed against;
    //   2. the monthly budget, if no income is on file — an approximation, since a
    //      self-set budget isn't necessarily income-aligned;
    //   3. total spend this month, only if neither of the above exists yet, purely
    //      so the feature still shows *something* before any setup is done (note
    //      this makes total % always sum to exactly 100 — it's not a real target
    //      comparison, just a placeholder).
    let base = 0;
    let basedOn = 'totalSpend';
    if (profile?.income > 0) {
      base = profile.income;
      basedOn = 'income';
    } else if (budgetDoc?.monthlyBudget > 0) {
      base = budgetDoc.monthlyBudget;
      basedOn = 'budget';
    } else {
      base = totalSpent;
      basedOn = 'totalSpend';
    }


    const idealMap = profile ? personalizedTargets(profile.lifestyle) : { ...DEFAULT_TARGETS };
    overrides.forEach((o) => {
      idealMap[o.category] = o.idealPercent;
    });

    const spendMap = Object.fromEntries(categorySpend.map((c) => [c._id, c.total]));
    // Union of every category that has either a target or actual spend, so a
    // category the user spent on but never targeted (or vice versa) still shows up.
    const categories = Array.from(new Set([...Object.keys(idealMap), ...Object.keys(spendMap)]));

    const results = categories
      .map((category) => {
        const idealPercent = idealMap[category] ?? 0;
        const actualAmount = spendMap[category] || 0;
        const idealAmount = base > 0 ? Math.round((idealPercent / 100) * base) : 0;
        const actualPercent = base > 0 ? Math.round((actualAmount / base) * 1000) / 10 : 0;
        const deviationPercent = Math.round((actualPercent - idealPercent) * 10) / 10;
        const deviationAmount = actualAmount - idealAmount;

        let status = 'on-track';
        if (deviationPercent > ON_TRACK_THRESHOLD) status = 'over';
        else if (deviationPercent < -ON_TRACK_THRESHOLD) status = 'under';

        let insight = null;
        if (status === 'over') {
          insight = `Optimize on ${category}: you're spending ${actualPercent}% vs an ideal ${idealPercent}% — trimming about ₹${deviationAmount.toLocaleString(
            'en-IN'
          )} would bring it back in line.`;
        } else if (status === 'under' && actualAmount > 0) {
          insight = `${category} is well under its ${idealPercent}% target — nice work.`;
        }

        return {
          category,
          idealPercent,
          idealAmount,
          actualAmount,
          actualPercent,
          deviationPercent,
          deviationAmount,
          status,
          insight,
        };
      })
      // Biggest overspend first, so the top of the list is exactly where to optimise.
      .sort((a, b) => b.deviationAmount - a.deviationAmount);

    res.json({
      month,
      year,
      base,
      basedOn,
      // basedOn: budgetDoc?.monthlyBudget > 0 ? 'budget' : 'totalSpend',
      totalSpent,
      lifestyleScore: profile?.lifestyleScore ?? null,
      categories: results,
      topOptimizations: results.filter((r) => r.status === 'over').slice(0, 3),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
