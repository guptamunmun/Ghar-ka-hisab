const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route  GET /api/expenses?category=&startDate=&endDate=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(query),
    ]);

    res.json({ expenses, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// @route  POST /api/expenses
router.post('/', async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;
    if (!amount || !category) {
      return res.status(400).json({ message: 'Amount and category are required' });
    }
    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      description,
      date: date || Date.now(),
    });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

// @route  PUT /api/expenses/:id
router.put('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const { amount, category, description, date } = req.body;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;

    await expense.save();
    res.json(expense);
  } catch (err) {
    next(err);
  }
});

// @route  DELETE /api/expenses/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
