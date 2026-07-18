const mongoose = require('mongoose');

const logEntrySchema = new mongoose.Schema({
  foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0.1 },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
}, { _id: false });

const foodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  foodItems: [logEntrySchema],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
}, { timestamps: true });

foodLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('FoodLog', foodLogSchema);
