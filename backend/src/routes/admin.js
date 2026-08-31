const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const BMIRecord = require('../models/BMIRecord');
const WeeklyCheckIn = require('../models/WeeklyCheckIn');
const FoodLog = require('../models/FoodLog');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
});

// Admin Login
router.post('/login', adminLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    await AuditLog.create({
      adminId: admin._id,
      action: 'login',
      targetType: 'system',
      details: { username: admin.username },
      ip: req.ip,
    }).catch(() => {});

    res.json({ token, admin });
  } catch (error) {
    next(error);
  }
});

// Verify admin token
router.get('/verify', adminAuth, async (req, res) => {
  res.json({ admin: req.admin });
});

// Dashboard stats
router.get('/dashboard', adminAuth, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newUsersWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    const newUsersMonth = await User.countDocuments({ createdAt: { $gte: monthAgo } });

    const totalBmiRecords = await BMIRecord.countDocuments();
    const totalCheckIns = await WeeklyCheckIn.countDocuments();
    const totalFoodLogs = await FoodLog.countDocuments();

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    const genderDistribution = await User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);

    const diabetesDistribution = await User.aggregate([
      { $group: { _id: '$diabetesStatus', count: { $sum: 1 } } },
    ]);

    const goalDistribution = await User.aggregate([
      { $group: { _id: '$goal', count: { $sum: 1 } } },
    ]);

    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      totalBmiRecords,
      totalCheckIns,
      totalFoodLogs,
      recentUsers,
      genderDistribution,
      diabetesDistribution,
      goalDistribution,
      dailySignups,
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get('/users/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const bmiHistory = await BMIRecord.find({ userId: user._id }).sort({ date: -1 }).limit(10);
    const checkInHistory = await WeeklyCheckIn.find({ userId: user._id }).sort({ weekStartDate: -1 }).limit(10);
    const foodLogCount = await FoodLog.countDocuments({ userId: user._id });

    res.json({ user, bmiHistory, checkInHistory, foodLogCount });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res, next) => {
  try {
    const { name, email, age, gender, height, weight, activityLevel, hasDiabetes, diabetesStatus, goal, targetWeight } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (age !== undefined) updates.age = age;
    if (gender !== undefined) updates.gender = gender;
    if (height !== undefined) updates.height = height;
    if (weight !== undefined) updates.weight = weight;
    if (activityLevel !== undefined) updates.activityLevel = activityLevel;
    if (hasDiabetes !== undefined) updates.hasDiabetes = hasDiabetes;
    if (diabetesStatus !== undefined) updates.diabetesStatus = diabetesStatus;
    if (goal !== undefined) updates.goal = goal;
    if (targetWeight !== undefined) updates.targetWeight = targetWeight;

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    await AuditLog.create({
      adminId: req.admin._id,
      action: 'update_user',
      targetType: 'user',
      targetId: user._id,
      details: { before: { name: user.name, email: user.email }, after: { name: updated.name, email: updated.email } },
      ip: req.ip,
    });

    res.json({ user: updated });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userName = user.name;
    const userEmail = user.email;

    await AuditLog.create({
      adminId: req.admin._id,
      action: 'delete_user',
      targetType: 'user',
      targetId: user._id,
      details: { name: userName, email: userEmail },
      ip: req.ip,
    });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Analytics
router.get('/analytics', adminAuth, async (req, res, next) => {
  try {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const monthlySignups = await User.aggregate([
      { $match: { createdAt: { $gte: threeMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const avgBmi = await BMIRecord.aggregate([
      { $group: { _id: null, avgBmi: { $avg: '$bmi' }, count: { $sum: 1 } } },
    ]);

    const bmiCategoryDistribution = await BMIRecord.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const activityLevelDistribution = await User.aggregate([
      { $group: { _id: '$activityLevel', count: { $sum: 1 } } },
    ]);

    const avgCaloriesPerDay = await FoodLog.aggregate([
      { $match: { date: { $gte: monthAgo } } },
      { $group: { _id: '$date', totalCalories: { $sum: '$totalCalories' } } },
      { $group: { _id: null, avgCalories: { $avg: '$totalCalories' } } },
    ]);

    const topFoods = await FoodLog.aggregate([
      { $unwind: '$foodItems' },
      { $group: { _id: '$foodItems.name', totalLogged: { $sum: '$foodItems.quantity' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      monthlySignups,
      avgBmi: avgBmi[0] || { avgBmi: 0, count: 0 },
      bmiCategoryDistribution,
      activityLevelDistribution,
      avgCaloriesPerDay: avgCaloriesPerDay[0]?.avgCalories || 0,
      topFoods,
    });
  } catch (error) {
    next(error);
  }
});

// Audit logs
router.get('/logs', adminAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('adminId', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
