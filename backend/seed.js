require('dotenv').config();
const mongoose = require('mongoose');
const FoodItem = require('./src/models/FoodItem');

// Stable, directly-linkable Unsplash CDN photo IDs (verified HTTP 200).
// TODO: A few foods share a category-level photo (e.g. both rices use the same
// image). Swap in exact food-specific images by replacing the id below.
const U = {
  rice: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9HMla35ecAOGXrAwG0Kjx4ydOF6nyRU9dqq_LItqv-A&s=10',
  bread: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8usLfSSIMRUQ88bDXOTSc6NLPF02OIZBRiJLgQ5eFCw&s=10',
  sandwich: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPV9CJoCjGXdVpI-P1vv6Loxn4kbvmCP3JfPJBPscloA&s=10',
  salad: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU0CpSY5QTA0vjNyd3DoMB0NzvZ6RcN8pf4AoMjdKfxA&s=10',
  vegSoup: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI-RUZHASD35xiNKL68mloQUHOc6kmsiYPWb6FRV_4UA&s=10',
  pasta: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlclysgvlBxOSHCKHVxGDfIg-brdAMFSwA47Vcxy4O6Q&s=10',
  veggies: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa5dDCCVsvVGBc5wEhNSHWsC05ImIh_dWRVIYAXtEeEg&s=10',
  salmon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKnuZ84n6i7vWYBnmgTz-71TqWozd5zcuYNcL3HsYOHw&s=10',
  berries: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyMghlGJ3NckyIGdyJeIq2Fp_ZfNQA4N4EM6pXxLRQ2A&s=10',
  apple: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEFlx5Tsuaj2xZ1P2KTZndxqvpbm9tuyyHl7_oH64LeA&s=10',
  banana: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVpsEdsU3BD2g7UBj7PEOqR-q4NVYKzt_sw9nC5E5ukw&s=10',
  avocado: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThYFfOormkGssSOMDMjX0_3iHVdMpY7xhAUupOcuC82Q&s=10',
  eggs: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZbeaiAMZZLNKC8eoN5Re06J0ODkOOwEQ-8pJIurSWJg&s=10',
  chocolate: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw-iCIectFKi0FjRgI77YCWLkSo7LeP80NkpV69yTaUQ&s=10',
  yogurt: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdCnypfvzga6-4K26Vh4UI_eX0Thi0BdwUT4Yp6bnUOw&s',
  milk: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbogsMNu0-iIBRRJByJ0x61RZxsjNeZUvgh3L-knWk4w&s=10',
  steak: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNm2ulMjkL4TkwKvG5nzus3q59TuNysM0oyXUZQSHjfw&s=10',
  chicken: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdiN8rZav98p1-24sfqhEOOd9Mc1349BElJy1bgIWG0Q&s=10',
  meatPlate: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7VN06FWj0H40GlKLvCyuKVhZ6UC2OXQtXC0oYPN--3Q&s=10',
  cheese: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiyBcD5RK-ARfEqRMflzFrLebcdSITK3zz43gA4zajmQ&s=10',
  potato: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyNZAekQtxPxmEb75fF7OCG1g9UdIsSqnTMvRXA3n2uw&s=10',
  fries: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbU4Uk5o4A3mvL--R4Ok6jFzeI0SkJOhn5Ky_LP8uTZA&s=10',
  tomato: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWkeBCptZ0x8Wd67gJpl4XThNEmUM0teiWXEYRci9DAQ&s=10',
  cucumber: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPSp1cgXTlxwFxhsprUIXRptc6onYoB-mHaeAe122xUg&s=10',
  carrot: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrzTGBJLJJxqtiXUD5mfSmaYPx3aQ1Xr2MBeEVC2v5FA&s=10',
  mushroom: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvN78DshlhJTpQHI1ew1YE9dU-tQtvl1g7ENvlGRQ3XA&s=10',
  bellPepper: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsdreZnFLIgEFwNoaRtkGVFlW0uMwjemn8JGwGzlBTcw&s=10',
  orange: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlPBf2wG-cBHgJa0oiZfdMREhzTRgRNtA1OtQbaBvQ0g&s=10',
  watermelon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVLFJBI9hvHnnu51acuAwEGsMTBo43V73QVKMUYPU8gg&s=10',
  nuts: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYbKpn9gO31twi_NG2JojYWjTdBLuxbpeZfK9R6ZF8CQ&s=10',
  almonds: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiN8l1t3kKvkvi4KcYH7OxRFKLMvkshQywRaJQ6M8mUw&s=10',
  walnuts: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhUIm_Yt2pzol560z8guac5tTtdJYrerWWHGKfN674cw&s=10',
  legumes: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPA6iw9NuSOvSKRnt-2s6sSjnMz2Ejjbp-RULaA2ooXQ&s=10',
  tofu: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5Ko0BuzkH5CMyrR3J8B7Do4WWOp3_3CNryoqfOv67WQ&s=10',
  oliveOil: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA7Ljz2zqlrh0OtWisH_xSU4DVNXbDwhSaWB2svAe_XQ&s=10',
 parmesanCheese:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvTPkOyLW5Dp3c_rE-3F9O80mKKUH_bVkEiyKboiFLdg&s=10',
 tuna:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWRGos9N-lvaa4TGBJ6KVtKG0_kKDSWcPhq_AnxL0WJg&s=10',
 oatmel:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuIhcwfJgrDhTpyiA7ofWJWwh1OD4FHlUYQLVPi-6Sxw&s=10',
hummus:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmzchLgslJiHf6eOLIl8MWxf6f_KzSZTIPogJBdlm8ag&s=10',
mixedNuts:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrZGMGkn6BjfZ0bhT9LEqGxFFQ4FgzAyMux899zIJBww&s=10',
pumkinSeed:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYNLKpeMj4rY8ujUrDAunqUlxGRNBdynmAjAY5WoGjrg&s=10',
kale:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIPFtj3I5UJXSkb4_jd0cl47dWCRqizsIlpRlluCM_1A&s=10',
mixedSalad:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJiO7k-DNFlhNvv6e74vXsrXzUb-ggRViAIJe814w4SQ&s=10',
blackBeans:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi_YmavAdPmK4UVYOvlyxIHxS3XIf3PNPATjIohcJcJg&s=10',
chickpeas:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAisNrQcVUVgibvTeY81mpOtaMLICJWBZJn4zXvwBIeA&s=10',
lentils:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc8SumWCa3jhGvCMfHrvPbkfmnxPEzumkZg0yGTS2b6A&s=10',







// bangla food 


khichuri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSrT00X7X6XInGOXMGMH7Rwslgk1m73D8VIZnRXQI1rw&s=10',
pantavat:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw1yYcB1V1EGGhtrpxjyxUR5vPge8G1Mhxx3u14q87yw&s=10',
daal:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNcvlt-mli_R6kObmQQKG0ve60bLPXQsSSp1cl8pzuQQ&s=10',
alu_vorta:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReoAQ3uW9XCKZ1_JEied4pSrJC8rKUjfP_-YvnChc9qw&s=10',
begun_vorta:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbm_1M9nHCNwJj6B2qCEXCXZc67CyQjsRGOxHBFrYO9Q&s=10',
mixed_vegetable:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH5A5C7Cy-nRmuFaLW3mEo46UZrqrxo4xavQRISgn0ig&s=10',
hilsafish:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2DmWgiXg5du7yLr78Ds1S7Bxtfr3v9XoSd2bShQqjVA&s=10',
rui_fish:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_x-xmvpPWQLlcjjHOa7EsjZvEUhlyGrEJD20AH71ADQ&s=10',
catla_fish:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0k3K_klPf3sIbKKac8vnT6UhA30KNieVqCcmqMfcSpg&s=10',
shrimp:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCJxylsoRBc3SxVqb6U791bpayDA7kc95cmlkD4zzXKQ&s=10',
chicken:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7utlaFoi0zHLHzm3CYANXPeIT04NcknEI2yT6OVKaUg&s=10',
beef:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV66SLzOYHkz0g3zqpFsGbrs4-DGqORnvTbFayv_f_7w&s=10',
mutton:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAhiAstdY7_3MtiP9Va2efuxXI_eePrYUqJRH7H9F1Yg&s=10',
luchi:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQreWMNSfNwwf1ap3YcvfcbTcw-6SYDd-jojtFHtvswA&s=10',
poratha:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3G9MPFamcvvdWaCiUsEBADtmxVFlrbbJp7AAQyvMeQA&s=10',
pitha:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKbA4THwfMwFzD7UaxovyzUdqkdK6sutUrz1kRIJpeA&s=10',
payesh:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGNuYtzVkJiT0ZhgGiDWU0WWPdx19eogcBzLpYfqdgSA&s=10',
quina:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGeS7kkvqUUYvlv8rlwq70w_mS-_ZvFI3zRE0YLkI2eA&s=10',




};

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=60`;

const foods = [
  { name: 'Oatmeal (rolled oats)', calories: 389, protein: 17, carbs: 66, fat: 7, servingSize: '100g', glycemicIndex: 55, category: 'grains', icon: 'Wheat', isLowGlycemic: true, imageUrl: U.oatmel },
  { name: 'Whole wheat bread', calories: 247, protein: 13, carbs: 41, fat: 3, servingSize: '100g', glycemicIndex: 50, category: 'grains', icon: 'Wheat', isLowGlycemic: false, imageUrl: U.bread },
  { name: 'Brown rice (cooked)', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: '100g', glycemicIndex: 50, category: 'grains', icon: 'Wheat', isLowGlycemic: true, imageUrl: U.rice },
  { name: 'White rice (cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g', glycemicIndex: 73, category: 'grains', icon: 'Wheat', isLowGlycemic: false, imageUrl: U.rice },
  { name: 'Quinoa (cooked)', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, servingSize: '100g', glycemicIndex: 53, category: 'grains', icon: 'Wheat', isLowGlycemic: true, imageUrl: U.quina },
  { name: 'Chicken breast (grilled)', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g', category: 'meat', icon: 'Beef', isLowGlycemic: true, imageUrl: U.chicken },
  { name: 'Salmon fillet (baked)', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g', category: 'fish', icon: 'Fish', isLowGlycemic: true, imageUrl: U.salmon },
  { name: 'Tuna (canned in water)', calories: 116, protein: 26, carbs: 0, fat: 0.8, servingSize: '100g', category: 'fish', icon: 'Fish', isLowGlycemic: true, imageUrl: U.tuna },
  { name: 'Egg (whole, boiled)', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: '100g', glycemicIndex: 0, category: 'dairy', icon: 'Egg', isLowGlycemic: true, imageUrl: U.eggs },
  { name: 'Egg whites (cooked)', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, servingSize: '100g', glycemicIndex: 0, category: 'dairy', icon: 'Egg', isLowGlycemic: true, imageUrl: U.eggs },
  { name: 'Greek yogurt (plain)', calories: 59, protein: 10, carbs: 3.6, fat: 0.7, servingSize: '100g', glycemicIndex: 11, category: 'dairy', icon: 'Milk', isLowGlycemic: true, imageUrl: U.yogurt },
  { name: 'Low-fat milk (1%)', calories: 42, protein: 3.4, carbs: 5, fat: 1, servingSize: '100ml', glycemicIndex: 37, category: 'dairy', icon: 'Milk', isLowGlycemic: true, imageUrl: U.milk },
  { name: 'Cheddar cheese', calories: 404, protein: 25, carbs: 1.3, fat: 33, servingSize: '100g', glycemicIndex: 0, category: 'dairy', icon: 'Milk', isLowGlycemic: true, imageUrl: U.cheese },
  { name: 'Sweet potato (baked)', calories: 90, protein: 2, carbs: 21, fat: 0.1, servingSize: '100g', glycemicIndex: 44, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.potato },
  { name: 'White potato (boiled)', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, servingSize: '100g', glycemicIndex: 78, category: 'vegetables', icon: 'Salad', isLowGlycemic: false, imageUrl: U.fries },
  { name: 'Broccoli (steamed)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: '100g', glycemicIndex: 10, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.veggies },
  { name: 'Spinach (raw)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.salad },
  { name: 'Kale (raw)', calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.kale },
  { name: 'Mixed salad greens', calories: 17, protein: 1.5, carbs: 3.3, fat: 0.2, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.mixedSalad },
  { name: 'Tomato (raw)', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.tomato },
  { name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.cucumber },
  { name: 'Carrot (raw)', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: '100g', glycemicIndex: 39, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.carrot },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: '100g', glycemicIndex: 36, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: U.apple },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: '100g', glycemicIndex: 51, category: 'fruits', icon: 'Apple', isLowGlycemic: false, imageUrl: U.banana },
  { name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, servingSize: '100g', glycemicIndex: 53, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: U.berries },
  { name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: '100g', glycemicIndex: 41, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: U.berries },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: '100g', glycemicIndex: 43, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: U.orange },
  { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 15, servingSize: '100g', glycemicIndex: 15, category: 'fruits', icon: 'Apple', isLowGlycemic: true, imageUrl: U.avocado },
  { name: 'Almonds (raw)', calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: '100g', glycemicIndex: 15, category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.almonds },
  { name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: '100g', glycemicIndex: 15, category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.walnuts },
  { name: 'Peanut butter (natural)', calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: '100g', glycemicIndex: 15, category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.nuts },
  { name: 'Chickpeas (cooked)', calories: 139, protein: 7.6, carbs: 23, fat: 2.1, servingSize: '100g', glycemicIndex: 28, category: 'legumes', icon: 'Bean', isLowGlycemic: true, imageUrl: U.chickpeas },
  { name: 'Lentils (cooked)', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: '100g', glycemicIndex: 32, category: 'legumes', icon: 'Bean', isLowGlycemic: true, imageUrl: U.lentils },
  { name: 'Black beans (cooked)', calories: 132, protein: 8.9, carbs: 24, fat: 0.5, servingSize: '100g', glycemicIndex: 30, category: 'legumes', icon: 'Bean', isLowGlycemic: true, imageUrl: U.blackBeans },
  { name: 'Tofu (firm)', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, servingSize: '100g', glycemicIndex: 15, category: 'protein', icon: 'Leaf', isLowGlycemic: true, imageUrl: U.tofu },
  { name: 'Olive oil', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: '100ml', glycemicIndex: 0, category: 'fats', icon: 'Droplet', isLowGlycemic: true, imageUrl: U.oliveOil },
  { name: 'Mixed nuts', calories: 607, protein: 20, carbs: 20, fat: 54, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.mixedNuts },
  { name: 'Dark chocolate (70%+)', calories: 598, protein: 7.8, carbs: 46, fat: 43, servingSize: '100g', glycemicIndex: 23, category: 'snacks', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.chocolate },
  { name: 'Hummus', calories: 166, protein: 7.9, carbs: 14, fat: 9.6, servingSize: '100g', category: 'legumes', icon: 'Bean', isLowGlycemic: true, imageUrl: U.hummus },
  { name: 'Pasta (whole wheat, cooked)', calories: 124, protein: 5.3, carbs: 26, fat: 0.5, servingSize: '100g', glycemicIndex: 42, category: 'grains', icon: 'Wheat', isLowGlycemic: true, imageUrl: U.pasta },
  { name: 'Pasta (white, cooked)', calories: 131, protein: 5, carbs: 25, fat: 1.1, servingSize: '100g', glycemicIndex: 72, category: 'grains', icon: 'Wheat', isLowGlycemic: false, imageUrl: U.pasta },
  { name: 'Turkey breast (roasted)', calories: 135, protein: 30, carbs: 0, fat: 0.7, servingSize: '100g', category: 'meat', icon: 'Beef', isLowGlycemic: true, imageUrl: U.meatPlate },
  { name: 'Beef (lean sirloin, grilled)', calories: 206, protein: 26, carbs: 0, fat: 11, servingSize: '100g', category: 'meat', icon: 'Beef', isLowGlycemic: true, imageUrl: U.steak },
  { name: 'Shrimp (grilled)', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, servingSize: '100g', category: 'fish', icon: 'Fish', isLowGlycemic: true, imageUrl: U.shrimp },
  { name: 'Parmesan cheese', calories: 431, protein: 38, carbs: 4.1, fat: 29, servingSize: '100g', category: 'dairy', icon: 'Milk', isLowGlycemic: true, imageUrl: U.parmesanCheese },
  { name: 'Mushrooms (cooked)', calories: 22, protein: 3.1, carbs: 4.4, fat: 0.1, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.mushroom },
  { name: 'Bell pepper (red)', calories: 31, protein: 1, carbs: 6, fat: 0.3, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.bellPepper },
  { name: 'Green beans (cooked)', calories: 31, protein: 1.8, carbs: 7, fat: 0.1, servingSize: '100g', glycemicIndex: 15, category: 'vegetables', icon: 'Salad', isLowGlycemic: true, imageUrl: U.veggies },
  { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, servingSize: '100g', glycemicIndex: 76, category: 'fruits', icon: 'Apple', isLowGlycemic: false, imageUrl: U.watermelon },
  { name: 'Pumpkin seeds', calories: 559, protein: 30, carbs: 11, fat: 49, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.pumkinSeed },


//Bangla food 


  { name: 'Khichuri', calories: 135, protein: 4, carbs: 23, fat: 3, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.khichuri },
  { name: 'Panta vat', calories: 120, protein: 2, carbs: 25, fat: 0, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.pantavat },
  { name: 'Daal', calories: 116, protein: 9, carbs: 20, fat: 0, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.daal },
  { name: 'Alu vorta', calories: 110, protein: 2, carbs: 18, fat: 3, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.alu_vorta },
  { name: 'Begun Vorta', calories: 90, protein: 2, carbs: 10, fat: 5, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.begun_vorta},
  { name: 'Mixed vegetable', calories: 80, protein: 2, carbs: 10, fat: 3, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.mixed_vegetable },
  { name: 'Hilsha fish', calories: 310, protein: 25, carbs: 0, fat: 22, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.hilsafish },
  { name: 'Rui fish', calories: 127, protein: 20, carbs: 0, fat: 5, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.rui_fish },
  { name: 'Catla fish', calories: 130, protein: 20, carbs: 0, fat: 5, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.catla_fish },
  { name: 'Shrimp', calories: 99, protein: 24, carbs: 0, fat: 0, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.shrimp },
  { name: 'Chicken', calories: 190, protein: 29, carbs: 0, fat: 8, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.chicken },
  { name: 'Beef', calories: 250, protein: 26, carbs: 0, fat: 17, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.beef },
  { name: 'Mutton', calories: 294, protein: 25, carbs: 0, fat: 21, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.mutton },
  { name: 'Luchi', calories: 320, protein: 7, carbs: 45, fat: 13, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.luchi },
  { name: 'Potratha', calories: 300, protein: 7, carbs: 40, fat: 13, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.poratha },
  { name: 'Pitha', calories: 180, protein: 4, carbs: 35, fat: 3, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.pitha },
  { name: 'Payesh', calories: 150, protein: 3, carbs: 22, fat: 5, servingSize: '100g', category: 'nuts', icon: 'Cookie', isLowGlycemic: true, imageUrl: U.payesh },


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
