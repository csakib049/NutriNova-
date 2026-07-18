const express = require('express');
const auth = require('../middleware/auth');
const WeeklyCheckIn = require('../models/WeeklyCheckIn');
const BMIRecord = require('../models/BMIRecord');
const FoodLog = require('../models/FoodLog');

const router = express.Router();

router.get('/report/csv', auth, async (req, res, next) => {
  try {
    const checkIns = await WeeklyCheckIn.find({ userId: req.user._id })
      .sort({ weekStartDate: -1 })
      .limit(12)
      .lean();

    const bmiRecords = await BMIRecord.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(12)
      .lean();

    const foodLogs = await FoodLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(50)
      .lean();

    let csv = 'Nutrinova Weekly Progress Report\n';
    csv += `Generated: ${new Date().toISOString().split('T')[0]}\n`;
    csv += `User: ${req.user.name}, Email: ${req.user.email}\n\n`;

    csv += 'Weekly Check-Ins\n';
    csv += 'Week Start,Weight (kg),BMI,Glucose (mg/dL),Status,Notes\n';
    for (const ci of checkIns) {
      csv += `${ci.weekStartDate.toISOString().split('T')[0]},${ci.weight},${ci.bmi},${ci.glucose},"${ci.diabetesStatus || ''}","${(ci.notes || '').replace(/"/g, '""')}"\n`;
    }

    csv += '\nBMI History\n';
    csv += 'Date,BMI,Weight,Height,Category\n';
    for (const b of bmiRecords) {
      csv += `${b.date.toISOString().split('T')[0]},${b.bmi},${b.weight},${b.height},${b.category}\n`;
    }

    csv += '\nRecent Food Logs\n';
    csv += 'Date,Meal Type,Food Items,Calories,Protein,Carbs,Fat\n';
    for (const fl of foodLogs) {
      const foods = fl.foodItems.map(f => `${f.name} (${f.quantity}g)`).join('; ');
      csv += `${fl.date.toISOString().split('T')[0]},${fl.mealType},"${foods}",${fl.totalCalories},${fl.totalProtein},${fl.totalCarbs},${fl.totalFat}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=nutrinova-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
