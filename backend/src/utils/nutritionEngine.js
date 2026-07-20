/**
 * Nutrition engine using Mifflin-St Jeor equation for BMR,
 * then TDEE via activity multiplier, then macro split.
 */

function calculateBMR(weightKg, heightCm, age, gender) {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function calculateTDEE(bmr, activityLevel) {
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

function getGoalAdjustment(tdee, goal) {
  if (goal === 'lose') return tdee - 500;
  if (goal === 'gain') return tdee + 300;
  return tdee;
}

function calculateMacros(targetCalories, hasDiabetes) {
  let proteinRatio = 0.30;
  let carbRatio = 0.40;
  let fatRatio = 0.30;

  if (hasDiabetes) {
    carbRatio = 0.30;
    proteinRatio = 0.35;
    fatRatio = 0.35;
  }

  const proteinG = Math.round((targetCalories * proteinRatio) / 4);
  const carbsG = Math.round((targetCalories * carbRatio) / 4);
  const fatG = Math.round((targetCalories * fatRatio) / 9);

  return {
    calories: Math.round(targetCalories),
    protein: proteinG,
    carbs: carbsG,
    fat: fatG,
    proteinRatio,
    carbRatio,
    fatRatio,
  };
}

function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category;
  if (bmi < 18.5) category = 'underweight';
  else if (bmi < 25) category = 'normal';
  else if (bmi < 30) category = 'overweight';
  else category = 'obese';
  return { bmi: Math.round(bmi * 100) / 100, category };
}

function estimateTimeline(currentWeight, targetWeight, goal) {
  const diff = Math.abs(currentWeight - targetWeight);
  const weeklyRate = goal === 'lose' ? 0.5 : 0.25;
  const weeks = Math.ceil(diff / weeklyRate);
  return { weeks, estimatedDate: new Date(Date.now() + weeks * 7 * 86400000).toISOString().split('T')[0] };
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  getGoalAdjustment,
  calculateMacros,
  calculateBMI,
  estimateTimeline,
};
