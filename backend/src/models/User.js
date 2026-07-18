const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  age: { type: Number, min: 1, max: 150 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  height: { type: Number, min: 50, max: 300 },
  weight: { type: Number, min: 10, max: 500 },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'sedentary',
  },
  hasDiabetes: { type: Boolean, default: false },
  goal: { type: String, enum: ['lose', 'gain', 'maintain'], default: 'maintain' },
  targetWeight: { type: Number, min: 10, max: 500 },
  dailyWaterTarget: { type: Number, default: 2000 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
