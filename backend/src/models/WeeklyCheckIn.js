const mongoose = require('mongoose');

const weeklyCheckInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: Date, required: true },
  weight: { type: Number, required: true },
  bmi: { type: Number, required: true },
  glucose: { type: Number, required: true },
  diabetesStatus: { type: String, default: '' },
  notes: { type: String, default: '' },
  trend: {
    weight: { type: String, enum: ['improved', 'worsened', 'stable'], default: 'stable' },
    bmi: { type: String, enum: ['improved', 'worsened', 'stable'], default: 'stable' },
    glucose: { type: String, enum: ['improved', 'worsened', 'stable'], default: 'stable' },
  },
}, { timestamps: true });

weeklyCheckInSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyCheckIn', weeklyCheckInSchema);
