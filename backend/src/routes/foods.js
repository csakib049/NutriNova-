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
  body('protein').optional().isFloat({ min: 0 }).withMessage('Protein must be >= 0'),
  body('carbs').optional().isFloat({ min: 0 }).withMessage('Carbs must be >= 0'),
  body('fat').optional().isFloat({ min: 0 }).withMessage('Fat must be >= 0'),
  body('fiber').optional().isFloat({ min: 0 }).withMessage('Fiber must be >= 0'),
  body('sugar').optional().isFloat({ min: 0 }).withMessage('Sugar must be >= 0'),
  body('sodium').optional().isFloat({ min: 0 }).withMessage('Sodium must be >= 0'),
  body('imageUrl').optional().trim().isURL().withMessage('Image URL must be a valid URL'),
];

router.post('/', auth, foodCreateValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const existing = await FoodItem.findOne({ name: { $regex: `^${req.body.name}$`, $options: 'i' } }).lean();
    if (existing) {
      return res.status(409).json({ error: 'A food item with this name already exists', existing: existing._id });
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
