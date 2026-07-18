const mongoose = require('mongoose');

const bmiRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bmi: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  category: { type: String, enum: ['underweight', 'normal', 'overweight', 'obese'], required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BMIRecord', bmiRecordSchema);
