const express = require('express');
const CategoryTarget = require('../models/CategoryTarget');
const LifestyleProfile = require('../models/LifestyleProfile');
const { protect } = require('../middleware/auth');
const { DEFAULT_TARGETS, personalizedTargets } = require('../utils/targets');

const router = express.Router();
router.use(protect);

// @route  GET /api/targets
// Returns the effective ideal-percent for every category: the user's manual
// override if they've set one, otherwise their lifestyle-personalised target (if
// they've filled out a lifestyle profile), otherwise the plain default.
router.get('/', async (req, res, next) => {
  try {
    const [profile, overrides] = await Promise.all([
      LifestyleProfile.findOne({ user: req.user._id }),
      CategoryTarget.find({ user: req.user._id }),
    ]);

    const base = profile ? personalizedTargets(profile.lifestyle) : { ...DEFAULT_TARGETS };
    const overrideMap = Object.fromEntries(overrides.map((o) => [o.category, o.idealPercent]));

    const targets = Object.keys(base).map((category) => ({
      category,
      idealPercent: overrideMap[category] ?? base[category],
      isCustomized: category in overrideMap,
    }));

    res.json({ targets, hasLifestyleProfile: !!profile });
  } catch (err) {
    next(err);
  }
});

// @route  PUT /api/targets/:category  — set/override one category's ideal percent
router.put('/:category', async (req, res, next) => {
  try {
    const { idealPercent } = req.body;
    if (idealPercent === undefined || idealPercent < 0 || idealPercent > 100) {
      return res.status(400).json({ message: 'idealPercent must be a number between 0 and 100' });
    }
    const target = await CategoryTarget.findOneAndUpdate(
      { user: req.user._id, category: req.params.category },
      { $set: { idealPercent } },
      { new: true, upsert: true }
    );
    res.json(target);
  } catch (err) {
    next(err);
  }
});

// @route  DELETE /api/targets/:category  — clear an override, revert to the default/personalised target
router.delete('/:category', async (req, res, next) => {
  try {
    await CategoryTarget.findOneAndDelete({ user: req.user._id, category: req.params.category });
    res.json({ message: 'Reverted to default target' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
