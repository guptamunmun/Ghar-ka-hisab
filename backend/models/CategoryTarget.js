const mongoose = require('mongoose');

// A user's manual override of the ideal-spend percentage for one category. Only
// categories the user has explicitly customised get a document here — anything
// without one falls back to the lifestyle-personalised (or plain default) target
// from utils/targets.js.
const categoryTargetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true },
    idealPercent: { type: Number, min: 0, max: 100, required: true },
  },
  { timestamps: true }
);

categoryTargetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('CategoryTarget', categoryTargetSchema);
