const express = require('express');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { profileUpdateValidation } = require('../validators');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/me', auth, profileUpdateValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const allowed = ['name', 'age', 'gender', 'height', 'weight', 'activityLevel', 'hasDiabetes', 'goal', 'targetWeight'];
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    }
    await req.user.save();
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
