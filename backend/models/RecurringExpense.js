const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true }, // e.g. Milk, Newspaper, Househelp, WiFi, OTT
    // amount is the "typical" amount. When isVariableAmount is true, this is just an
    // estimate/reference (e.g. milk bill changes a bit every month) and isn't enforced.
    amount: { type: Number, required: true, min: 0, default: 0 },
    isVariableAmount: { type: Boolean, default: false },
    category: { type: String, required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'monthly' },
    dayOfMonth: { type: Number, min: 1, max: 31, default: 1 },
    // Only used when frequency is 'yearly' — the month (1-12) it recurs in, paired
    // with dayOfMonth for the exact date (e.g. an annual insurance renewal on 12 March).
    monthOfYear: { type: Number, min: 1, max: 12, default: 1 },
    active: { type: Boolean, default: true },
    // Reminder settings — reminds the user around the scheduled date so they don't forget
    // to pay/log this recurring expense.
    reminderEnabled: { type: Boolean, default: false },
        // The last time this recurring expense was marked paid. Used to work out whether
    // it's already been paid for the CURRENT cycle (so the reminder stops nagging once
    // paid) and automatically starts nagging again once the next cycle comes around —
    // no manual re-enabling needed.

      lastPaidDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);
