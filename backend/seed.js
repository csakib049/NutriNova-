require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('./src/models/FoodItem');

// Stable, directly-linkable Unsplash CDN photo IDs (verified HTTP 200).
// TODO: A few foods share a category-level photo (e.g. both rices use the same
// image). Swap in exact food-specific images by replacing the id below.
const U = {
  rice: 'photo-1512058564366-18510be2db19',
  bread: 'photo-1509440159596-0249088772ff',
  sandwich: 'photo-1482049016688-2d3e1b311543',
  salad: 'photo-1512621776951-a57141f2eefd',
  saladBowl: 'photo-1546069901-ba9599a7e63c',
  saladBowl2: 'photo-1540420773420-3366772f4999',
  vegSoup: 'photo-1567306226416-28f0efdc88ce',
  pasta: 'photo-1519708227418-c8fd9a32b7a2',
  plate: 'photo-1504674900247-0877df9cc836',
  cookedMeal: 'photo-1606787366850-de6330128bfc',
  veggies: 'photo-1498837167922-ddd27525d352',
  salmon: 'photo-1467003909585-2f8a72700288',
  fishDish: 'photo-1587049352846-4a222e784d38',
  berries: 'photo-1467453678174-768ec283a940',
  apple: 'photo-1560806887-1e4cd0b6cbd6',
  banana: 'photo-1571771894821-ce9b6c11b08e',
  avocado: 'photo-1550258987-190a2d41a8ba',
  eggs: 'photo-1499636136210-6f4ee915583e',
  chocolate: 'photo-1585036156171-384164a8c675',
  yogurt: 'photo-1563805042-7684c019e1cb',
  milk: 'photo-1550583724-b2692b85b150',
  steak: 'photo-1607623814075-e51df1bdc82f',
  chicken: 'photo-1604503468506-a8da13d82791',
  meatPlate: 'photo-1515003197210-e0cd71810b5f',
  cheese: 'photo-1552767059-ce182ead6c1b',
  cheese2: 'photo-1541529086526-db283c563270',
  potato: 'photo-1518977676601-b53f82aba655',
  fries: 'photo-1607522370275-f14206abe5d3',
  tomato: 'photo-1590165482129-1b8b27698780',
  cucumber: 'photo-1592924357228-91a4daadcfea',
  carrot: 'photo-1447175008436-054170c2e979',
  mushroom: 'photo-1501426026826-31c667bdf23d',
  bellPepper: 'photo-1563565375-f3fdfdbefa83',
  orange: 'photo-1547514701-42782101795e',
  watermelon: 'photo-1587049352851-8d4e89133924',
  nuts: 'photo-1599599810769-bcde5a160d32',
  nuts2: 'photo-1508061253366-f7da158b6d46',
  almonds: 'photo-1603105037880-880cd4edfb0d',
  walnuts: 'photo-1515543904379-3d757afe72e4',
  legumes: 'photo-1505253716362-afaea1d3d1af',
  tofu: 'photo-1615485290382-441e4d049cb5',
  oliveOil: 'photo-1574323347407-f5e1ad6d020b',
  breakfast: 'photo-1484723091739-30a097e8f929',
};

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=60`;

const foods = [
  { name: 'Oatmeal (rolled oats)', calories: 389, protein: 17, carbs: 66, fat: 7, servingSize: '100g', glycemicIndex: 55, category: 'grains', icon: 'Wheat', isLowGlycemic: true, imageUrl: img(U.breakfast) },
  { name: 'Whole wheat bread', calories: 247, protein: 13, carbs: 41, fat: 3, servingSize: '100g', glycemicIndex: 50, category: 'grains', icon: 'Wheat', isLowGlycemic: false, imageUrl: img(U.bread) },
  { name: 'Brown rice (cooked)', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: '100g', glycemicIndex: 50, category: 'grains', icon: 'Wheat', isLowGlycemic: true, imageUrl: img(U.rice) },
  { name: 'White rice (cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g', glycemicIndex: 73, category: 'grains', icon: 'Wheat', isLowGlycemic: false, imageUrl: img(U.rice) },
  { name: 'Quinoa (cooked)', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, servingSize: '100g', glycemicIndex: 53, category: 'grains', icon: 'Wheat', isLowGlycemic: true, imageUrl: img(U.saladBowl2) },
  { name: 'Chicken breast (grilled)', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g', category: 'meat', icon: 'Beef', isLowGlycemic: true, imageUrl: img(U.chicken) },
  { name: 'Salmon fillet (baked)', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g', category: 'fish', icon: 'Fish', isLowGlycemic: true, imageUrl: img(U.salmon) },
  { name: 'Tuna (canned in water)', calories: 116, protein: 26, carbs: 0, fat: 0.8, servingSize: '100g', category: 'fish', icon: 'Fish', isLowGlycemic: true, imageUrl: img(U.fishDish) },
  { name: 'Egg (whole, boiled)', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: '100g', glycemicIndex: 0, category: 'dairy', icon: 'Egg', isLowGlycemic: true, imageUrl: img(U.eggs) },
  { name: 'Egg whites (cooked)', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, servingSize: '100g', glycemicIndex: 0, category: 'dairy', icon: 'Egg', isLowGlycemic: true, imageUrl: img(U.eggs) },
  { name: 'Greek yogurt (plain)', calories: 59, protein: 10, carbs: 3.6, fat: 0.7, servingSize: '100g', glycemicIndex: 11, category: 'dairy', icon: 'Milk', isLowGlycemic: true, imageUrl: img(U.yogurt) },
  { name: 'Low-fat milk (1%)', calories: 42, protein: 3.4, carbs: 5, fat: 1, servingSize: '100ml', glycemicIndex: 37, category: 'dairy', icon: 'Milk', isLowGlycemic: true, imageUrl: img(U.milk) },
  { name: 'Cheddar cheese', calories: 404, protein: 25, carbs: 1.3, fat: 33, servingSize: '100g', glycemicIndex: 0, category: 'dairy', icon: 'Milk', isLowGlycemic: true, imageUrl: img(U.cheese) },
  { name: 'Cottage cheese (low-fat)', calories: 81, protein: 12, carbs: 4.3, fat: 1.2, servingSize: '100g', category: 'dairy', icon: 'Milk', isLowGlycemic: true, imageUrl: img(U.cheese2) },
  { name: 'Sweet potato (baked)', calories: 90, protein: 2, carbs: 21, fat: 0.1, servingSize: '100g', glycemicIndex: 44, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.potato) },
  { name: 'White potato (boiled)', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, servingSize: '100g', glycemicIndex: 78, category: 'vegetables', icon: 'Salad', isLowGlycemic: false, imageUrl: img(U.fries) },
  { name: 'Broccoli (steamed)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: '100g', glycemicIndex: 10, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.veggies) },
  { name: 'Spinach (raw)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.salad) },
  { name: 'Kale (raw)', calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.saladBowl2) },
  { name: 'Mixed salad greens', calories: 17, protein: 1.5, carbs: 3.3, fat: 0.2, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.saladBowl) },
  { name: 'Tomato (raw)', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.tomato) },
  { name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.cucumber) },
  { name: 'Carrot (raw)', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: '100g', glycemicIndex: 39, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.carrot) },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: '100g', glycemicIndex: 36, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: img(U.apple) },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: '100g', glycemicIndex: 51, category: 'fruits', icon: 'Apple', isLowGlycemic: false, imageUrl: img(U.banana) },
  { name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, servingSize: '100g', glycemicIndex: 53, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: img(U.berries) },
  { name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: '100g', glycemicIndex: 41, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: img(U.berries) },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: '100g', glycemicIndex: 43, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: img(U.orange) },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 15, servingSize: '100g', glycemicIndex: 15, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: img(U.avocado) },
  { name: 'Almonds (raw)', calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: '100g', glycemicIndex: 15, category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: img(U.almonds) },
  { name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: '100g', glycemicIndex: 15, category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: img(U.walnuts) },
  { name: 'Peanut butter (natural)', calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: '100g', glycemicIndex: 15, category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: img(U.nuts) },
  { name: 'Chickpeas (cooked)', calories: 139, protein: 7.6, carbs: 23, fat: 2.1, servingSize: '100g', glycemicIndex: 28, category: 'legumes', icon: 'Bean', isLowGlycemic: true, imageUrl: img(U.legumes) },
  { name: 'Lentils (cooked)', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: '100g', glycemicIndex: 32, category: 'legumes', icon: 'Bean', isLowGlycemic: true, imageUrl: img(U.legumes) },
  { name: 'Black beans (cooked)', calories: 132, protein: 8.9, carbs: 24, fat: 0.5, servingSize: '100g', glycemicIndex: 30, category: 'legumes', icon: 'Bean', isLowGlycemic: true, imageUrl: img(U.legumes) },
  { name: 'Tofu (firm)', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, servingSize: '100g', glycemicIndex: 15, category: 'protein', icon: 'Leaf', isLowGlycemic: true, imageUrl: img(U.tofu) },
  { name: 'Olive oil', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: '100ml', glycemicIndex: 0, category: 'fats', icon: 'Droplet', isLowGlycemic: true, imageUrl: img(U.oliveOil) },
  { name: 'Mixed nuts', calories: 607, protein: 20, carbs: 20, fat: 54, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: img(U.nuts2) },
  { name: 'Dark chocolate (70%+)', calories: 598, protein: 7.8, carbs: 46, fat: 43, servingSize: '100g', glycemicIndex: 23, category: 'snacks', icon: 'Cookie', isLowGlycemic: true, imageUrl: img(U.chocolate) },
  { name: 'Hummus', calories: 166, protein: 7.9, carbs: 14, fat: 9.6, servingSize: '100g', category: 'legumes', icon: 'Bean', isLowGlycemic: true, imageUrl: img(U.saladBowl) },
  { name: 'Pasta (whole wheat, cooked)', calories: 124, protein: 5.3, carbs: 26, fat: 0.5, servingSize: '100g', glycemicIndex: 42, category: 'grains', icon: 'Wheat', isLowGlycemic: true, imageUrl: img(U.pasta) },
  { name: 'Pasta (white, cooked)', calories: 131, protein: 5, carbs: 25, fat: 1.1, servingSize: '100g', glycemicIndex: 72, category: 'grains', icon: 'Wheat', isLowGlycemic: false, imageUrl: img(U.pasta) },
  { name: 'Turkey breast (roasted)', calories: 135, protein: 30, carbs: 0, fat: 0.7, servingSize: '100g', category: 'meat', icon: 'Beef', isLowGlycemic: true, imageUrl: img(U.meatPlate) },
  { name: 'Beef (lean sirloin, grilled)', calories: 206, protein: 26, carbs: 0, fat: 11, servingSize: '100g', category: 'meat', icon: 'Beef', isLowGlycemic: true, imageUrl: img(U.steak) },
  { name: 'Shrimp (grilled)', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, servingSize: '100g', category: 'fish', icon: 'Fish', isLowGlycemic: true, imageUrl: img(U.fishDish) },
  { name: 'Parmesan cheese', calories: 431, protein: 38, carbs: 4.1, fat: 29, servingSize: '100g', category: 'dairy', icon: 'Milk', isLowGlycemic: true, imageUrl: img(U.cheese2) },
  { name: 'Mushrooms (cooked)', calories: 22, protein: 3.1, carbs: 4.4, fat: 0.1, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.mushroom) },
  { name: 'Bell pepper (red)', calories: 31, protein: 1, carbs: 6, fat: 0.3, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.bellPepper) },
  { name: 'Green beans (cooked)', calories: 31, protein: 1.8, carbs: 7, fat: 0.1, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: img(U.veggies) },
  { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, servingSize: '100g', glycemicIndex: 76, category: 'fruits', icon: 'Apple', isLowGlycemic: false, imageUrl: img(U.watermelon) },
  { name: 'Pumpkin seeds', calories: 559, protein: 30, carbs: 11, fat: 49, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: img(U.nuts2) },
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
