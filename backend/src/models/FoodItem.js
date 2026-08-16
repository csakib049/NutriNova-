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
  icon: { type: String, default: 'Utensils' },
  category: { type: String, default: 'general' },
  isLowGlycemic: { type: Boolean, default: false },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
  source: { type: String, default: 'manual' },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

foodItemSchema.index({ name: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);
