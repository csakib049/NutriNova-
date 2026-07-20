require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('./src/models/FoodItem');

const foods = [
  { name: 'Oatmeal (rolled oats)', calories: 389, protein: 17, carbs: 66, fat: 7, servingSize: '100g', glycemicIndex: 55, category: 'grains', isLowGlycemic: true },
  { name: 'Whole wheat bread', calories: 247, protein: 13, carbs: 41, fat: 3, servingSize: '100g', glycemicIndex: 50, category: 'grains', isLowGlycemic: false },
  { name: 'Brown rice (cooked)', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: '100g', glycemicIndex: 50, category: 'grains', isLowGlycemic: true },
  { name: 'White rice (cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g', glycemicIndex: 73, category: 'grains', isLowGlycemic: false },
  { name: 'Quinoa (cooked)', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, servingSize: '100g', glycemicIndex: 53, category: 'grains', isLowGlycemic: true },
  { name: 'Chicken breast (grilled)', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g', category: 'meat', isLowGlycemic: true },
  { name: 'Salmon fillet (baked)', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g', category: 'fish', isLowGlycemic: true },
  { name: 'Tuna (canned in water)', calories: 116, protein: 26, carbs: 0, fat: 0.8, servingSize: '100g', category: 'fish', isLowGlycemic: true },
  { name: 'Egg (whole, boiled)', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: '100g', glycemicIndex: 0, category: 'dairy', isLowGlycemic: true },
  { name: 'Egg whites (cooked)', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, servingSize: '100g', glycemicIndex: 0, category: 'dairy', isLowGlycemic: true },
  { name: 'Greek yogurt (plain)', calories: 59, protein: 10, carbs: 3.6, fat: 0.7, servingSize: '100g', glycemicIndex: 11, category: 'dairy', isLowGlycemic: true },
  { name: 'Low-fat milk (1%)', calories: 42, protein: 3.4, carbs: 5, fat: 1, servingSize: '100ml', glycemicIndex: 37, category: 'dairy', isLowGlycemic: true },
  { name: 'Cheddar cheese', calories: 404, protein: 25, carbs: 1.3, fat: 33, servingSize: '100g', glycemicIndex: 0, category: 'dairy', isLowGlycemic: true },
  { name: 'Cottage cheese (low-fat)', calories: 81, protein: 12, carbs: 4.3, fat: 1.2, servingSize: '100g', category: 'dairy', isLowGlycemic: true },
  { name: 'Sweet potato (baked)', calories: 90, protein: 2, carbs: 21, fat: 0.1, servingSize: '100g', glycemicIndex: 44, category: 'vegetables', isLowGlycemic: true },
  { name: 'White potato (boiled)', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, servingSize: '100g', glycemicIndex: 78, category: 'vegetables', isLowGlycemic: false },
  { name: 'Broccoli (steamed)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: '100g', glycemicIndex: 10, category: 'vegetables', isLowGlycemic: true },
  { name: 'Spinach (raw)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', isLowGlycemic: true },
  { name: 'Kale (raw)', calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', isLowGlycemic: true },
  { name: 'Mixed salad greens', calories: 17, protein: 1.5, carbs: 3.3, fat: 0.2, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', isLowGlycemic: true },
  { name: 'Tomato (raw)', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', isLowGlycemic: true },
  { name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', isLowGlycemic: true },
  { name: 'Carrot (raw)', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: '100g', glycemicIndex: 39, category: 'vegetables', isLowGlycemic: true },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: '100g', glycemicIndex: 36, category: 'fruits', isLowGlycemic: true },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: '100g', glycemicIndex: 51, category: 'fruits', isLowGlycemic: false },
  { name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, servingSize: '100g', glycemicIndex: 53, category: 'fruits', isLowGlycemic: true },
  { name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: '100g', glycemicIndex: 41, category: 'fruits', isLowGlycemic: true },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: '100g', glycemicIndex: 43, category: 'fruits', isLowGlycemic: true },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 15, servingSize: '100g', glycemicIndex: 15, category: 'fruits', isLowGlycemic: true },
  { name: 'Almonds (raw)', calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: '100g', glycemicIndex: 15, category: 'nuts', isLowGlycemic: true },
  { name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: '100g', glycemicIndex: 15, category: 'nuts', isLowGlycemic: true },
  { name: 'Peanut butter (natural)', calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: '100g', glycemicIndex: 15, category: 'nuts', isLowGlycemic: true },
  { name: 'Chickpeas (cooked)', calories: 139, protein: 7.6, carbs: 23, fat: 2.1, servingSize: '100g', glycemicIndex: 28, category: 'legumes', isLowGlycemic: true },
  { name: 'Lentils (cooked)', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: '100g', glycemicIndex: 32, category: 'legumes', isLowGlycemic: true },
  { name: 'Black beans (cooked)', calories: 132, protein: 8.9, carbs: 24, fat: 0.5, servingSize: '100g', glycemicIndex: 30, category: 'legumes', isLowGlycemic: true },
  { name: 'Tofu (firm)', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, servingSize: '100g', glycemicIndex: 15, category: 'protein', isLowGlycemic: true },
  { name: 'Olive oil', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: '100ml', glycemicIndex: 0, category: 'fats', isLowGlycemic: true },
  { name: 'Mixed nuts', calories: 607, protein: 20, carbs: 20, fat: 54, servingSize: '100g', category: 'nuts', isLowGlycemic: true },
  { name: 'Dark chocolate (70%+)', calories: 598, protein: 7.8, carbs: 46, fat: 43, servingSize: '100g', glycemicIndex: 23, category: 'snacks', isLowGlycemic: true },
  { name: 'Hummus', calories: 166, protein: 7.9, carbs: 14, fat: 9.6, servingSize: '100g', category: 'legumes', isLowGlycemic: true },
  { name: 'Pasta (whole wheat, cooked)', calories: 124, protein: 5.3, carbs: 26, fat: 0.5, servingSize: '100g', glycemicIndex: 42, category: 'grains', isLowGlycemic: true },
  { name: 'Pasta (white, cooked)', calories: 131, protein: 5, carbs: 25, fat: 1.1, servingSize: '100g', glycemicIndex: 72, category: 'grains', isLowGlycemic: false },
  { name: 'Turkey breast (roasted)', calories: 135, protein: 30, carbs: 0, fat: 0.7, servingSize: '100g', category: 'meat', isLowGlycemic: true },
  { name: 'Beef (lean sirloin, grilled)', calories: 206, protein: 26, carbs: 0, fat: 11, servingSize: '100g', category: 'meat', isLowGlycemic: true },
  { name: 'Shrimp (grilled)', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, servingSize: '100g', category: 'fish', isLowGlycemic: true },
  { name: 'Parmesan cheese', calories: 431, protein: 38, carbs: 4.1, fat: 29, servingSize: '100g', category: 'dairy', isLowGlycemic: true },
  { name: 'Mushrooms (cooked)', calories: 22, protein: 3.1, carbs: 4.4, fat: 0.1, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', isLowGlycemic: true },
  { name: 'Bell pepper (red)', calories: 31, protein: 1, carbs: 6, fat: 0.3, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', isLowGlycemic: true },
  { name: 'Green beans (cooked)', calories: 31, protein: 1.8, carbs: 7, fat: 0.1, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', isLowGlycemic: true },
  { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, servingSize: '100g', glycemicIndex: 76, category: 'fruits', isLowGlycemic: false },
  { name: 'Pumpkin seeds', calories: 559, protein: 30, carbs: 11, fat: 49, servingSize: '100g', category: 'nuts', isLowGlycemic: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await FoodItem.deleteMany({});
    console.log('Cleared existing food items');

    const inserted = await FoodItem.insertMany(foods);
    console.log(`Seeded ${inserted.length} food items`);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
