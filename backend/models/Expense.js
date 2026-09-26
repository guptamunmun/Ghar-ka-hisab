const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: [
        'Groceries',
        'Milk',
        'Vegetables',
        'Rent',
        'Electricity',
        'Water',
        'Gas',
        'Phone',
        'WiFi',
        'OTT',
        'Househelp',
        'School Fees',
        'Transport',
        'Medical',
        'Shopping',
        'Eating Out',
        'Newspaper',
        'Other',
      ],
    },
    description: { type: String, trim: true, default: '' },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
