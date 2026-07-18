const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  amountMl: { type: Number, required: true, default: 250 },
}, { timestamps: true });

waterLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WaterLog', waterLogSchema);
