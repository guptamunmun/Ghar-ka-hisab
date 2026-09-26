// const express = require('express');
// const RecurringExpense = require('../models/RecurringExpense');
// const Expense = require('../models/Expense');
// const { protect } = require('../middleware/auth');

// const router = express.Router();
// router.use(protect);

// // @route  GET /api/recurring
// router.get('/', async (req, res, next) => {
//   try {
//     const items = await RecurringExpense.find({ user: req.user._id }).sort({ name: 1 });
//     res.json(items);
//   } catch (err) {
//     next(err);
//   }
// });

// // @route  POST /api/recurring
// router.post('/', async (req, res, next) => {
//   try {
//     const { name, amount, isVariableAmount, category, frequency, dayOfMonth, monthOfYear, reminderEnabled } = req.body;
//     if (!name || !category) {
//       return res.status(400).json({ message: 'Name and category are required' });
//     }
//     // Amount is only required when the expense is NOT marked as variable.
//     if (!isVariableAmount && !amount) {
//       return res.status(400).json({ message: 'Amount is required unless this is a variable-amount expense' });
//     }
//     const item = await RecurringExpense.create({
//       user: req.user._id,
//       name,
//       amount: amount || 0,
//       isVariableAmount: !!isVariableAmount,
//       category,
//       frequency,
//       dayOfMonth,
//       monthOfYear,
//       reminderEnabled: !!reminderEnabled,
//     });
//     res.status(201).json(item);
//   } catch (err) {
//     next(err);
//   }
// });
// / @route  POST /api/recurring/:id/pay
// // Marks this recurring expense paid for the CURRENT cycle: creates a matching
// // Expense (so it counts toward the dashboard total, budget, and reports right
// // away — same behaviour as paying a Bill) and stamps lastPaidDate. Because the
// // reminder check compares lastPaidDate against the current cycle (today/this
// // week/this month/this year, depending on frequency), the reminder automatically
// // stops nagging for now and starts again on its own once the NEXT cycle's
// // scheduled date arrives — no need to re-enable anything manually.
// router.post('/:id/pay', async (req, res, next) => {
//   try {
//     const item = await RecurringExpense.findOne({ _id: req.params.id, user: req.user._id });
//     if (!item) return res.status(404).json({ message: 'Recurring expense not found' });
 
//     const { amount, date } = req.body;
//     const paidAmount = amount !== undefined ? Number(amount) : item.amount;
 
//     if (!paidAmount && paidAmount !== 0) {
//       return res.status(400).json({ message: 'An amount is required to log this payment' });
//     }
 
//     const paidOn = date ? new Date(date) : new Date();
 
//     const expense = await Expense.create({
//       user: req.user._id,
//       amount: paidAmount,
//       category: item.category,
//       description: `Recurring payment: ${item.name}`,
//       date: paidOn,
//     });
 
//     item.lastPaidDate = paidOn;
//     // If this was a variable-amount item, keep `amount` as a rolling estimate so
//     // next time's pre-filled amount reflects the most recent real payment.
//     if (item.isVariableAmount && amount !== undefined) {
//       item.amount = paidAmount;
//     }
//     await item.save();
 
//     res.json({ item, expense });
//   } catch (err) {
//     next(err);
//   }
// });

// // @route  PUT /api/recurring/:id
// router.put('/:id', async (req, res, next) => {
//   try {
//     const item = await RecurringExpense.findOne({ _id: req.params.id, user: req.user._id });
//     if (!item) return res.status(404).json({ message: 'Recurring expense not found' });

//     Object.assign(item, req.body);
//     await item.save();
//     res.json(item);
//   } catch (err) {
//     next(err);
//   }
// });

// // @route  DELETE /api/recurring/:id
// router.delete('/:id', async (req, res, next) => {
//   try {
//     const item = await RecurringExpense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
//     if (!item) return res.status(404).json({ message: 'Recurring expense not found' });
//     res.json({ message: 'Recurring expense deleted' });
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = router;
const express = require('express');
const RecurringExpense = require('../models/RecurringExpense');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route  GET /api/recurring
router.get('/', async (req, res, next) => {
  try {
    const items = await RecurringExpense.find({ user: req.user._id }).sort({ name: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// @route  POST /api/recurring
router.post('/', async (req, res, next) => {
  try {
    const { name, amount, isVariableAmount, category, frequency, dayOfMonth, monthOfYear, reminderEnabled } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }
    // Amount is only required when the expense is NOT marked as variable.
    if (!isVariableAmount && !amount) {
      return res.status(400).json({ message: 'Amount is required unless this is a variable-amount expense' });
    }
    const item = await RecurringExpense.create({
      user: req.user._id,
      name,
      amount: amount || 0,
      isVariableAmount: !!isVariableAmount,
      category,
      frequency,
      dayOfMonth,
      monthOfYear,
      reminderEnabled: !!reminderEnabled,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// @route  POST /api/recurring/:id/pay
// Marks this recurring expense paid for the CURRENT cycle: creates a matching
// Expense (so it counts toward the dashboard total, budget, and reports right
// away — same behaviour as paying a Bill) and stamps lastPaidDate. Because the
// reminder check compares lastPaidDate against the current cycle (today/this
// week/this month/this year, depending on frequency), the reminder automatically
// stops nagging for now and starts again on its own once the NEXT cycle's
// scheduled date arrives — no need to re-enable anything manually.
router.post('/:id/pay', async (req, res, next) => {
  try {
    const item = await RecurringExpense.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Recurring expense not found' });

    const { amount, date } = req.body;
    const paidAmount = amount !== undefined ? Number(amount) : item.amount;

    if (!paidAmount && paidAmount !== 0) {
      return res.status(400).json({ message: 'An amount is required to log this payment' });
    }

    const paidOn = date ? new Date(date) : new Date();

    const expense = await Expense.create({
      user: req.user._id,
      amount: paidAmount,
      category: item.category,
      description: `Recurring payment: ${item.name}`,
      date: paidOn,
    });

    item.lastPaidDate = paidOn;
    // If this was a variable-amount item, keep `amount` as a rolling estimate so
    // next time's pre-filled amount reflects the most recent real payment.
    if (item.isVariableAmount && amount !== undefined) {
      item.amount = paidAmount;
    }
    await item.save();

    res.json({ item, expense });
  } catch (err) {
    next(err);
  }
});

// @route  PUT /api/recurring/:id
router.put('/:id', async (req, res, next) => {
  try {
    const item = await RecurringExpense.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Recurring expense not found' });

    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// @route  DELETE /api/recurring/:id
// Note: unlike a Bill (which maps 1:1 to a single generated expense), a recurring
// item can have MANY expenses logged against it over its lifetime — one per "pay"
// action. Deleting the recurring template intentionally leaves those historical
// expenses alone; they're real past spending, not undo state.
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await RecurringExpense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Recurring expense not found' });
    res.json({ message: 'Recurring expense deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;