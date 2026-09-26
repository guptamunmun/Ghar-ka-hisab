const express = require('express');
const Bill = require('../models/Bill');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route  GET /api/bills?month=&year=
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getUTCMonth() + 1;
    const year = Number(req.query.year) || now.getUTCFullYear();

    const bills = await Bill.find({ user: req.user._id, month, year }).sort({ dueDate: 1 });
    res.json(bills);
  } catch (err) {
    next(err);
  }
});

// @route  POST /api/bills
router.post('/', async (req, res, next) => {
  try {
    const { name, amount, category, dueDate } = req.body;
    if (!name || !amount || !category || !dueDate) {
      return res.status(400).json({ message: 'Name, amount, category and dueDate are required' });
    }
    const due = new Date(dueDate);
    const bill = await Bill.create({
      user: req.user._id,
      name,
      amount,
      category,
      dueDate: due,
      month: due.getUTCMonth() + 1,
      year: due.getUTCFullYear(),
    });
    res.status(201).json(bill);
  } catch (err) {
    next(err);
  }
});

// @route  PUT /api/bills/:id  (edit, or mark paid via { paid: true })
// Marking a bill paid automatically creates a matching Expense (category = bill's
// category, amount = bill's amount) so it's counted in the dashboard total,
// budget spend, and reports — no separate step needed. Un-marking it removes
// that generated expense again so totals don't get inflated by a bill that
// turns out to have been paid by mistake. If the bill's amount is edited
// while it's already paid, the linked expense is kept in sync too.
router.put('/:id', async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user._id });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    const { name, amount, category, dueDate, paid } = req.body;
    if (name !== undefined) bill.name = name;
    if (amount !== undefined) bill.amount = amount;
    if (category !== undefined) bill.category = category;
    if (dueDate !== undefined) bill.dueDate = dueDate;

    const wasPaid = bill.paid;

    if (paid !== undefined) {
      bill.paid = paid;
      bill.paidOn = paid ? new Date() : undefined;
    }

    if (paid === true && !wasPaid) {
      // Newly marked paid: create the linked expense.
      const expense = await Expense.create({
        user: req.user._id,
        amount: bill.amount,
        category: bill.category,
        description: `Bill payment: ${bill.name}`,
        date: bill.paidOn,
      });
      bill.expenseId = expense._id;
    } else if (paid === false && wasPaid && bill.expenseId) {
      // Un-marked paid: remove the linked expense so totals stay accurate.
      await Expense.findByIdAndDelete(bill.expenseId);
      bill.expenseId = null;
    } else if (bill.paid && bill.expenseId && amount !== undefined) {
      // Bill amount edited while already paid: keep the linked expense's amount in sync.
      await Expense.findByIdAndUpdate(bill.expenseId, { amount: bill.amount, category: bill.category });
    }

    await bill.save();
    res.json(bill);
  } catch (err) {
    next(err);
  }
});

// @route  DELETE /api/bills/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    // Clean up the linked expense too, if the bill had been paid.
    if (bill.expenseId) {
      await Expense.findByIdAndDelete(bill.expenseId);
    }
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
