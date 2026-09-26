const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true }, // Electricity, School Fees, Rent, Cylinder, Phone, WiFi, OTT
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    dueDate: { type: Date, required: true },
    paid: { type: Boolean, default: false },
    paidOn: { type: Date },
    // Linked expense created automatically when this bill is marked paid, so payment
    // and un-payment can create/remove that expense without ever double-counting.
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', default: null },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

billSchema.index({ user: 1, month: 1, year: 1 });

module.exports = mongoose.model('Bill', billSchema);
