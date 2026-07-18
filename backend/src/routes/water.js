const express = require('express');
const auth = require('../middleware/auth');
const WaterLog = require('../models/WaterLog');

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
  try {
    const { amountMl } = req.body;
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const log = await WaterLog.create({
      userId: req.user._id,
      date,
      amountMl: amountMl || 250,
    });

    res.status(201).json({ log });
  } catch (error) {
    next(error);
  }
});

router.get('/today', auth, async (req, res, next) => {
  try {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const logs = await WaterLog.find({
      userId: req.user._id,
      date: { $gte: date, $lte: endDate },
    }).lean();

    const totalMl = logs.reduce((s, l) => s + l.amountMl, 0);
    res.json({ logs, totalMl, count: logs.length });
  } catch (error) {
    next(error);
  }
});

router.get('/history', auth, async (req, res, next) => {
  try {
    const logs = await WaterLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    const dailyTotals = {};
    for (const log of logs) {
      const key = log.date.toISOString().split('T')[0];
      dailyTotals[key] = (dailyTotals[key] || 0) + log.amountMl;
    }

    res.json({ dailyTotals: Object.entries(dailyTotals).map(([date, totalMl]) => ({ date, totalMl })).sort((a, b) => a.date.localeCompare(b.date)) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
