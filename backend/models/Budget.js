const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    monthlyBudget: { type: Number, required: true, default: 0 },
    categoryBudgets: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
