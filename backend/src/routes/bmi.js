const express = require('express');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const BMIRecord = require('../models/BMIRecord');
const { bmiValidation } = require('../validators');
const { calculateBMI } = require('../utils/nutritionEngine');

const router = express.Router();

router.post('/', auth, bmiValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { weight, height } = req.body;
    const { bmi, category } = calculateBMI(weight, height);

    const record = await BMIRecord.create({
      userId: req.user._id,
      bmi,
      weight,
      height,
      category,
    });

    req.user.weight = weight;
    req.user.height = height;
    await req.user.save();

    res.status(201).json({ record, bmi, category });
  } catch (error) {
    next(error);
  }
});

router.get('/history', auth, async (req, res, next) => {
  try {
    const records = await BMIRecord.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(50)
      .lean();
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

router.get('/latest', auth, async (req, res, next) => {
  try {
    const record = await BMIRecord.findOne({ userId: req.user._id })
      .sort({ date: -1 })
      .lean();
    res.json({ record: record || null });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
