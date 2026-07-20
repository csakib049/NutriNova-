const FoodItem = require('../models/FoodItem');

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function distributeCalories(totalCalories, hasDiabetes) {
  if (hasDiabetes) {
    return {
      breakfast: Math.round(totalCalories * 0.25),
      lunch: Math.round(totalCalories * 0.30),
      dinner: Math.round(totalCalories * 0.30),
      snack: Math.round(totalCalories * 0.15),
    };
  }
  return {
    breakfast: Math.round(totalCalories * 0.25),
    lunch: Math.round(totalCalories * 0.30),
    dinner: Math.round(totalCalories * 0.30),
    snack: Math.round(totalCalories * 0.15),
  };
}

async function generateWeeklyPlan(targetCalories, targetProtein, targetCarbs, targetFat, hasDiabetes) {
  const mealCalories = distributeCalories(targetCalories, hasDiabetes);
  const foods = await FoodItem.find().lean();
  if (foods.length === 0) return null;

  const lowGI = hasDiabetes ? foods.filter(f => f.isLowGlycemic) : [];
  const pool = hasDiabetes && lowGI.length >= 10 ? lowGI : foods;

  const dailyPlans = DAYS.map(day => {
    const meals = MEAL_TYPES.map(type => {
      const calTarget = mealCalories[type];
      const selected = selectFoodsForMeal(pool, calTarget, type, hasDiabetes);
      return {
        type,
        foodItems: selected.items,
        totalCalories: Math.round(selected.totals.calories),
        totalProtein: Math.round(selected.totals.protein),
        totalCarbs: Math.round(selected.totals.carbs),
        totalFat: Math.round(selected.totals.fat),
      };
    });
    return { day, meals };
  });

  return {
    dailyPlans,
    targetCalories,
    targetProtein: Math.round(targetProtein),
    targetCarbs: Math.round(targetCarbs),
    targetFat: Math.round(targetFat),
  };
}

function selectFoodsForMeal(foodPool, targetCal, mealType, hasDiabetes) {
  const items = [];
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  let remaining = targetCal;

  const suitable = foodPool.filter(f => {
    if (hasDiabetes && mealType === 'snack') return f.isLowGlycemic && f.calories < 200;
    if (hasDiabetes && ['breakfast', 'lunch', 'dinner'].includes(mealType)) return f.isLowGlycemic;
    if (mealType === 'breakfast') return f.calories < 400;
    if (mealType === 'snack') return f.calories < 250;
    return true;
  });

  const mealPool = suitable.length >= 5 ? suitable : foodPool;

  const shuffled = [...mealPool].sort(() => Math.random() - 0.5);
  for (const food of shuffled) {
    if (items.length >= 5) break;
    if (remaining <= 0) break;
    const servings = Math.min(Math.floor(remaining / food.calories) || 1, 2);
    const mult = Math.min(servings, 2);
    items.push({
      name: food.name,
      calories: Math.round(food.calories * mult),
      protein: Math.round(food.protein * mult),
      carbs: Math.round(food.carbs * mult),
      fat: Math.round(food.fat * mult),
      servingSize: `${mult}x ${food.servingSize}`,
    });
    totals.calories += food.calories * mult;
    totals.protein += food.protein * mult;
    totals.carbs += food.carbs * mult;
    totals.fat += food.fat * mult;
    remaining -= food.calories * mult;
  }

  return { items, totals };
}

function getWeekStartDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = { generateWeeklyPlan, getWeekStartDate, distributeCalories };
