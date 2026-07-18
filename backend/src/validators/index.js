const { body, query } = require('express-validator');

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const bmiValidation = [
  body('weight').isFloat({ min: 10, max: 500 }).withMessage('Weight must be between 10-500 kg'),
  body('height').isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50-300 cm'),
];

const checkInValidation = [
  body('weight').isFloat({ min: 10, max: 500 }).withMessage('Weight must be between 10-500 kg'),
  body('glucose').isFloat({ min: 20, max: 600 }).withMessage('Glucose must be between 20-600 mg/dL'),
];

const foodLogValidation = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('mealType').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
  body('foodItems').isArray({ min: 1 }).withMessage('At least one food item required'),
  body('foodItems.*.foodItemId').isMongoId().withMessage('Invalid food item ID'),
  body('foodItems.*.quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be > 0'),
];

const mealPlanGenerateValidation = [
  body('goal').optional().isIn(['lose', 'gain', 'maintain']),
  body('hasDiabetes').optional().isBoolean(),
];

const profileUpdateValidation = [
  body('name').optional().trim().notEmpty(),
  body('age').optional().isInt({ min: 1, max: 150 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('height').optional().isFloat({ min: 50, max: 300 }),
  body('weight').optional().isFloat({ min: 10, max: 500 }),
  body('activityLevel').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  body('hasDiabetes').optional().isBoolean(),
  body('goal').optional().isIn(['lose', 'gain', 'maintain']),
  body('targetWeight').optional().isFloat({ min: 10, max: 500 }),
];

module.exports = {
  signupValidation,
  loginValidation,
  bmiValidation,
  checkInValidation,
  foodLogValidation,
  mealPlanGenerateValidation,
  profileUpdateValidation,
};
