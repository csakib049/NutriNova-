const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  foodItems: [{ name: String, calories: Number, protein: Number, carbs: Number, fat: Number, servingSize: String }],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
}, { _id: false });

const dailyPlanSchema = new mongoose.Schema({
  day: { type: String, required: true },
  meals: [mealItemSchema],
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  dailyPlans: [dailyPlanSchema],
  targetCalories: { type: Number, required: true },
  targetProtein: { type: Number, required: true },
  targetCarbs: { type: Number, required: true },
  targetFat: { type: Number, required: true },
}, { timestamps: true });

mealPlanSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
