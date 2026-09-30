const express = require('express');
const LifestyleProfile = require('../models/LifestyleProfile');
const { protect } = require('../middleware/auth');
const { computeLifestyleScore, personalizedTargets } = require('../utils/targets');

const router = express.Router();
router.use(protect);

// @route  GET /api/lifestyle
// Returns null (not an error) if the user hasn't filled the profile out yet, so the
// frontend can show a "set up your profile" prompt instead of an error state.
router.get('/', async (req, res, next) => {
  try {
    const profile = await LifestyleProfile.findOne({ user: req.user._id });
    res.json(profile || null);
  } catch (err) {
    next(err);
  }
});

// @route  PUT /api/lifestyle  (create or update — upsert)
router.put('/', async (req, res, next) => {
  try {
    const { age, lifestyle, income, workProfile } = req.body;
    if (!age || !lifestyle || income === undefined || !workProfile) {
      return res.status(400).json({ message: 'age, lifestyle, income and workProfile are all required' });
    }

    const lifestyleScore = computeLifestyleScore({ age: Number(age), income: Number(income), lifestyle, workProfile });

    const profile = await LifestyleProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { age: Number(age), lifestyle, income: Number(income), workProfile, lifestyleScore } },
      { new: true, upsert: true }
    );

    res.json({ profile, suggestedTargets: personalizedTargets(lifestyle) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
