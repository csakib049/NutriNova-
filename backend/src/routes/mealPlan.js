const express = require('express');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const MealPlan = require('../models/MealPlan');
const { mealPlanGenerateValidation } = require('../validators');
const { calculateBMR, calculateTDEE, getGoalAdjustment, calculateMacros } = require('../utils/nutritionEngine');
const { generateWeeklyPlan, getWeekStartDate } = require('../utils/mealPlanner');

const router = express.Router();

router.post('/generate', auth, mealPlanGenerateValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const user = req.user;
    const goal = req.body.goal || user.goal || 'maintain';
    const hasDiabetes = req.body.hasDiabetes !== undefined ? req.body.hasDiabetes : user.hasDiabetes;

    if (!user.height || !user.weight || !user.age || !user.gender) {
      return res.status(400).json({ error: 'Complete your profile (height, weight, age, gender) first' });
    }

    const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
    const tdee = calculateTDEE(bmr, user.activityLevel);
    const targetCalories = getGoalAdjustment(tdee, goal);
    const macros = calculateMacros(targetCalories, hasDiabetes);

    const weekStart = getWeekStartDate();

    const planData = await generateWeeklyPlan(
      macros.calories,
      macros.protein,
      macros.carbs,
      macros.fat,
      hasDiabetes
    );

    if (!planData) {
      return res.status(400).json({ error: 'Food database is empty. Run seed script first.' });
    }

    await MealPlan.findOneAndUpdate(
      { userId: user._id, weekStartDate: weekStart },
      { ...planData, userId: user._id, weekStartDate: weekStart, targetCalories: macros.calories, targetProtein: macros.protein, targetCarbs: macros.carbs, targetFat: macros.fat },
      { upsert: true, new: true }
    );

    const plan = await MealPlan.findOne({ userId: user._id, weekStartDate: weekStart }).lean();

    res.status(201).json({
      plan,
      targets: { calories: macros.calories, protein: macros.protein, carbs: macros.carbs, fat: macros.fat },
      bmr: Math.round(bmr),
      tdee,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/current', auth, async (req, res, next) => {
  try {
    const weekStart = getWeekStartDate();
    let plan = await MealPlan.findOne({ userId: req.user._id, weekStartDate: weekStart }).lean();

    if (!plan) {
      const earlierPlan = await MealPlan.findOne({ userId: req.user._id }).sort({ weekStartDate: -1 }).lean();
      if (earlierPlan) {
        return res.json({ plan: earlierPlan, isPrevious: true });
      }
      return res.json({ plan: null });
    }

    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
