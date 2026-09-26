const express = require('express');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');
const { startOfDayUTC, endOfDayUTC, startOfMonthUTC, endOfMonthUTC } = require('../utils/dateRange');

const router = express.Router();
router.use(protect);

// @route  GET /api/dashboard/summary
router.get('/summary', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const startOfToday = startOfDayUTC(now);
    const endOfToday = endOfDayUTC(now);

    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();
    const startOfMonth = startOfMonthUTC(year, month);
    const endOfMonth = endOfMonthUTC(year, month);

    const [todayAgg, monthAgg, categoryAgg, recentExpenses, budgetDoc] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfToday, $lte: endOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Expense.find({ user: userId }).sort({ date: -1, createdAt: -1 }).limit(5),
      Budget.findOne({ user: userId, month, year }),
    ]);

    const todayTotal = todayAgg[0]?.total || 0;
    const monthTotal = monthAgg[0]?.total || 0;
    const monthlyBudget = budgetDoc?.monthlyBudget || 0;
    const remaining = monthlyBudget ? monthlyBudget - monthTotal : null;

    res.json({
      todayTotal,
      monthTotal,
      monthlyBudget,
      remaining,
      categoryTotals: categoryAgg.map((c) => ({ category: c._id, total: c.total })),
      recentExpenses,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
