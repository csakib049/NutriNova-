const express = require('express');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const FoodItem = require('../models/FoodItem');
const { body } = require('express-validator');

const router = express.Router();

router.get('/search', auth, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      const foods = await FoodItem.find().limit(50).lean();
      return res.json({ foods });
    }
    const foods = await FoodItem.find({ name: { $regex: q, $options: 'i' } }).limit(20).lean();
    res.json({ foods });
  } catch (error) {
    next(error);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const foods = await FoodItem.find().sort({ category: 1, name: 1 }).lean();
    res.json({ foods });
  } catch (error) {
    next(error);
  }
});

const foodCreateValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('calories').isFloat({ min: 0 }).withMessage('Calories must be >= 0'),
  body('protein').isFloat({ min: 0 }).withMessage('Protein must be >= 0'),
  body('carbs').isFloat({ min: 0 }).withMessage('Carbs must be >= 0'),
  body('fat').isFloat({ min: 0 }).withMessage('Fat must be >= 0'),
];

router.post('/', auth, foodCreateValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const food = await FoodItem.create(req.body);
    res.status(201).json({ food });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const food = await FoodItem.findById(req.params.id).lean();
    if (!food) return res.status(404).json({ error: 'Food not found' });
    res.json({ food });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
