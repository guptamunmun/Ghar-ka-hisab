const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');
const { startOfMonthUTC, endOfMonthUTC } = require('../utils/dateRange');

const router = express.Router();
router.use(protect);

// @route  GET /api/budget?month=&year=
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getUTCMonth() + 1;
    const year = Number(req.query.year) || now.getUTCFullYear();

    const budget = await Budget.findOne({ user: req.user._id, month, year });
    res.json(
      budget || {
        user: req.user._id,
        month,
        year,
        monthlyBudget: 0,
        categoryBudgets: {},
      }
    );
  } catch (err) {
    next(err);
  }
});

// @route  PUT /api/budget  (create or update month's budget)
router.put('/', async (req, res, next) => {
  try {
    const now = new Date();
    const { month = now.getUTCMonth() + 1, year = now.getUTCFullYear(), monthlyBudget, categoryBudgets } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month, year },
      {
        $set: {
          monthlyBudget: monthlyBudget ?? 0,
          categoryBudgets: categoryBudgets || {},
        },
      },
      { new: true, upsert: true }
    );

    res.json(budget);
  } catch (err) {
    next(err);
  }
});

// @route  GET /api/budget/status?month=&year=  -> spent vs budget per category + overall
router.get('/status', async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getUTCMonth() + 1;
    const year = Number(req.query.year) || now.getUTCFullYear();

    const startOfMonth = startOfMonthUTC(year, month);
    const endOfMonth = endOfMonthUTC(year, month);

    const [budget, categorySpend, totalAgg] = await Promise.all([
      Budget.findOne({ user: req.user._id, month, year }),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', spent: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, spent: { $sum: '$amount' } } },
      ]),
    ]);

    const monthlyBudget = budget?.monthlyBudget || 0;
    const totalSpent = totalAgg[0]?.spent || 0;
    const categoryBudgets = budget?.categoryBudgets ? Object.fromEntries(budget.categoryBudgets) : {};

    const categories = categorySpend.map((c) => ({
      category: c._id,
      spent: c.spent,
      budget: categoryBudgets[c._id] || 0,
      remaining: (categoryBudgets[c._id] || 0) - c.spent,
    }));

    res.json({
      monthlyBudget,
      totalSpent,
      remaining: monthlyBudget - totalSpent,
      percentUsed: monthlyBudget ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100)) : 0,
      categories,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
