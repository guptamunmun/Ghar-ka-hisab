const mongoose = require('mongoose');

const lifestyleProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    age: { type: Number, min: 13, max: 120, required: true },
    // Self-described household lifestyle tier — used only to nudge suggested category
    // targets (e.g. how much discretionary spend is "normal" for this tier). Not a
    // judgement, just a personalisation input.
    lifestyle: { type: String, enum: ['minimalist', 'balanced', 'comfortable', 'premium'], required: true },
    income: { type: Number, min: 0, required: true }, // monthly household income, ₹
    workProfile: {
      type: String,
      enum: ['salaried', 'business', 'freelance', 'student', 'homemaker', 'retired'],
      required: true,
    },
    // Computed by utils/targets.js#computeLifestyleScore whenever the profile is saved.
    lifestyleScore: { type: Number, min: 0, max: 100, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LifestyleProfile', lifestyleProfileSchema);
