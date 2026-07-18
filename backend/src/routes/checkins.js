const express = require('express');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const WeeklyCheckIn = require('../models/WeeklyCheckIn');
const BMIRecord = require('../models/BMIRecord');
const { checkInValidation } = require('../validators');
const { calculateBMI } = require('../utils/nutritionEngine');

const router = express.Router();

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeTrend(current, previous) {
  if (!previous) return 'stable';
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return 'stable';
  return diff < 0 ? 'improved' : 'worsened';
}

function computeGlucoseTrend(current, previous) {
  if (!previous) return 'stable';
  const diff = current - previous;
  if (Math.abs(diff) < 5) return 'stable';
  return diff < 0 ? 'improved' : 'worsened';
}

router.post('/weekly', auth, checkInValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { weight, glucose, diabetesStatus, notes } = req.body;
    const height = req.body.height || req.user.height;
    if (!height) return res.status(400).json({ error: 'Height is required for BMI calculation' });

    const { bmi, category } = calculateBMI(weight, height);
    const weekStart = getWeekStart();

    const previous = await WeeklyCheckIn.findOne({ userId: req.user._id }).sort({ weekStartDate: -1 }).lean();

    const trend = {
      weight: computeTrend(weight, previous?.weight),
      bmi: computeTrend(bmi, previous?.bmi),
      glucose: computeGlucoseTrend(glucose, previous?.glucose),
    };

    const checkIn = await WeeklyCheckIn.findOneAndUpdate(
      { userId: req.user._id, weekStartDate: weekStart },
      { userId: req.user._id, weekStartDate: weekStart, weight, bmi, glucose, diabetesStatus, notes, trend },
      { upsert: true, new: true }
    );

    await BMIRecord.create({ userId: req.user._id, bmi, weight, height, category });

    req.user.weight = weight;
    await req.user.save();

    res.status(201).json({ checkIn, trend });
  } catch (error) {
    next(error);
  }
});

router.get('/history', auth, async (req, res, next) => {
  try {
    const checkIns = await WeeklyCheckIn.find({ userId: req.user._id })
      .sort({ weekStartDate: -1 })
      .limit(52)
      .lean();
    res.json({ checkIns });
  } catch (error) {
    next(error);
  }
});

router.get('/trend', auth, async (req, res, next) => {
  try {
    const checkIns = await WeeklyCheckIn.find({ userId: req.user._id })
      .sort({ weekStartDate: -1 })
      .limit(2)
      .lean();

    if (checkIns.length === 0) {
      return res.json({ trend: null, message: 'No check-ins yet' });
    }

    const latest = checkIns[0];
    const previous = checkIns[1] || null;

    res.json({
      latest,
      previous,
      trend: latest.trend,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
