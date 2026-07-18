const express = require('express');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const FoodLog = require('../models/FoodLog');
const FoodItem = require('../models/FoodItem');
const { foodLogValidation } = require('../validators');

const router = express.Router();

router.post('/', auth, foodLogValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { date, mealType, foodItems } = req.body;

    const resolvedItems = [];
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

    for (const item of foodItems) {
      const food = await FoodItem.findById(item.foodItemId).lean();
      if (!food) return res.status(404).json({ error: `Food item ${item.foodItemId} not found` });

      const multiplier = item.quantity / 100;
      const cals = Math.round(food.calories * multiplier);
      const prot = Math.round(food.protein * multiplier);
      const carbs = Math.round(food.carbs * multiplier);
      const fat = Math.round(food.fat * multiplier);

      resolvedItems.push({
        foodItemId: food._id,
        name: food.name,
        quantity: item.quantity,
        calories: cals,
        protein: prot,
        carbs,
        fat,
      });

      totalCalories += cals;
      totalProtein += prot;
      totalCarbs += carbs;
      totalFat += fat;
    }

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    const log = await FoodLog.create({
      userId: req.user._id,
      date: logDate,
      mealType,
      foodItems: resolvedItems,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    });

    res.status(201).json({ log });
  } catch (error) {
    next(error);
  }
});

router.get('/daily', auth, async (req, res, next) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const logs = await FoodLog.find({
      userId: req.user._id,
      date: { $gte: date, $lte: endDate },
    }).sort({ createdAt: 1 }).lean();

    const summary = logs.reduce((acc, log) => {
      acc.calories += log.totalCalories;
      acc.protein += log.totalProtein;
      acc.carbs += log.totalCarbs;
      acc.fat += log.totalFat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({ logs, summary });
  } catch (error) {
    next(error);
  }
});

router.get('/weekly', auth, async (req, res, next) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];
    const endDate = new Date(dateStr);
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const logs = await FoodLog.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1, createdAt: 1 }).lean();

    const dailySummary = {};
    for (const log of logs) {
      const key = log.date.toISOString().split('T')[0];
      if (!dailySummary[key]) {
        dailySummary[key] = { date: key, calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      dailySummary[key].calories += log.totalCalories;
      dailySummary[key].protein += log.totalProtein;
      dailySummary[key].carbs += log.totalCarbs;
      dailySummary[key].fat += log.totalFat;
    }

    res.json({ logs, dailySummary: Object.values(dailySummary).sort((a, b) => a.date.localeCompare(b.date)) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
