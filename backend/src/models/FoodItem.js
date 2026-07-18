const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  servingSize: { type: String, default: '100g' },
  servingWeight: { type: Number, default: 100 },
  glycemicIndex: { type: Number, min: 0, max: 100 },
  category: { type: String, default: 'general' },
  isLowGlycemic: { type: Boolean, default: false },
  source: { type: String, default: 'manual' },
}, { timestamps: true });

foodItemSchema.index({ name: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);
