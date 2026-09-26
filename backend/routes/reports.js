const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');
const { startOfDayUTC, endOfDayUTC, startOfMonthUTC, endOfMonthUTC } = require('../utils/dateRange');

const router = express.Router();
router.use(protect);

// @route  GET /api/reports/daily?date=YYYY-MM-DD
router.get('/daily', async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = startOfDayUTC(date);
    const end = endOfDayUTC(date);

    const expenses = await Expense.find({ user: req.user._id, date: { $gte: start, $lte: end } }).sort({ date: -1 });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ date: start, total, expenses });
  } catch (err) {
    next(err);
  }
});

// @route  GET /api/reports/weekly?startDate=YYYY-MM-DD
// Without startDate: defaults to the trailing 7 days (last 6 days + today), which is
// what "this week's spending" should show. Passing startDate looks at that specific
// 7-day window going forward instead, for browsing a particular week.
router.get('/weekly', async (req, res, next) => {
  try {
    let start;
    let end;

    if (req.query.startDate) {
      start = startOfDayUTC(new Date(req.query.startDate));
      end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 6);
      end.setUTCHours(23, 59, 59, 999);
    } else {
      end = endOfDayUTC(new Date());
      start = startOfDayUTC(new Date());
      start.setUTCDate(start.getUTCDate() - 6);
    }

    const results = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'UTC' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const total = results.reduce((sum, r) => sum + r.total, 0);
    res.json({ startDate: start, endDate: end, total, daily: results });
  } catch (err) {
    next(err);
  }
});

// @route  GET /api/reports/monthly?month=&year=
router.get('/monthly', async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getUTCMonth() + 1;
    const year = Number(req.query.year) || now.getUTCFullYear();

    const start = startOfMonthUTC(year, month);
    const end = endOfMonthUTC(year, month);

    const [byDay, byCategory, totalAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: { $dayOfMonth: { date: '$date', timezone: 'UTC' } }, total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      month,
      year,
      total: totalAgg[0]?.total || 0,
      byDay: byDay.map((d) => ({ day: d._id, total: d.total })),
      byCategory: byCategory.map((c) => ({ category: c._id, total: c.total })),
    });
  } catch (err) {
    next(err);
  }
});

// @route  GET /api/reports/category?month=&year=
router.get('/category', async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getUTCMonth() + 1;
    const year = Number(req.query.year) || now.getUTCFullYear();
    const start = startOfMonthUTC(year, month);
    const end = endOfMonthUTC(year, month);

    const results = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json({ month, year, categories: results.map((c) => ({ category: c._id, total: c.total, count: c.count })) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
