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

router.post('/add-custom-meal', auth, async (req, res, next) => {
  try {
    const { day, mealType, foodItems } = req.body;
    if (!day || !mealType || !foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ error: 'day, mealType, and foodItems array are required' });
    }
    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
      return res.status(400).json({ error: 'Invalid meal type' });
    }
    if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day)) {
      return res.status(400).json({ error: 'Invalid day' });
    }

    const weekStart = getWeekStartDate();

    let plan = await MealPlan.findOne({ userId: req.user._id, weekStartDate: weekStart });
    if (!plan) {
      return res.status(400).json({ error: 'No meal plan for this week. Generate a plan first.' });
    }

    let dayPlan = plan.dailyPlans.find(dp => dp.day === day);
    if (!dayPlan) {
      plan.dailyPlans.push({ day, meals: [] });
      dayPlan = plan.dailyPlans[plan.dailyPlans.length - 1];
    }

    let mealSlot = dayPlan.meals.find(m => m.type === mealType);
    if (mealSlot) {
      mealSlot.foodItems.push(...foodItems);
      mealSlot.totalCalories = mealSlot.foodItems.reduce((s, f) => s + (f.calories || 0), 0);
      mealSlot.totalProtein = mealSlot.foodItems.reduce((s, f) => s + (f.protein || 0), 0);
      mealSlot.totalCarbs = mealSlot.foodItems.reduce((s, f) => s + (f.carbs || 0), 0);
      mealSlot.totalFat = mealSlot.foodItems.reduce((s, f) => s + (f.fat || 0), 0);
    } else {
      const totals = foodItems.reduce((acc, f) => ({
        calories: acc.calories + (f.calories || 0),
        protein: acc.protein + (f.protein || 0),
        carbs: acc.carbs + (f.carbs || 0),
        fat: acc.fat + (f.fat || 0),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      dayPlan.meals.push({
        type: mealType,
        foodItems,
        totalCalories: Math.round(totals.calories),
        totalProtein: Math.round(totals.protein),
        totalCarbs: Math.round(totals.carbs),
        totalFat: Math.round(totals.fat),
      });
    }

    plan.markModified('dailyPlans');
    await plan.save();

    const updatedPlan = await MealPlan.findById(plan._id).lean();
    res.status(201).json({ plan: updatedPlan });
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
