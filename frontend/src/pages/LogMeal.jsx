import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAnimVariants } from '../lib/motion';
import { ForkKnife, Search, ListPlus, ClipboardList } from 'lucide-react';

export default function LogMeal() {
  const { fadeUpSmall, staggerList } = useAnimVariants();
  const [search, setSearch] = useState('');
  const [foods, setFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [mealType, setMealType] = useState('breakfast');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySummary, setDailySummary] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchDaily(); }, [date]);

  useEffect(() => {
    if (search.length >= 1) {
      const timer = setTimeout(() => {
        api.get(`/foods/search?q=${search}`).then((res) => setFoods(res.data.foods)).catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setFoods([]);
    }
  }, [search]);

  const fetchDaily = async () => {
    try {
      const res = await api.get(`/food-logs/daily?date=${date}`);
      setDailyLogs(res.data.logs);
      setDailySummary(res.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  const addFood = (food) => {
    setSelectedFoods((prev) => {
      const existing = prev.find((f) => f.foodItemId === food._id);
      if (existing) {
        return prev.map((f) => f.foodItemId === food._id ? { ...f, quantity: f.quantity + 100 } : f);
      }
      return [...prev, { foodItemId: food._id, name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, quantity: 100 }];
    });
  };

  const updateQuantity = (id, qty) => {
    setSelectedFoods((prev) => prev.map((f) => f.foodItemId === id ? { ...f, quantity: Math.max(10, qty) } : f));
  };

  const removeSelected = (id) => {
    setSelectedFoods((prev) => prev.filter((f) => f.foodItemId !== id));
  };

  const handleSubmit = async () => {
    if (selectedFoods.length === 0) return;
    setError('');
    setSuccess('');
    try {
      await api.post('/food-logs', {
        date: new Date(date).toISOString(),
        mealType,
        foodItems: selectedFoods.map((f) => ({ foodItemId: f.foodItemId, quantity: f.quantity })),
      });
      setSuccess('Meal logged successfully!');
      setSelectedFoods([]);
      fetchDaily();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log meal');
    }
  };

  const totalCals = selectedFoods.reduce((s, f) => s + Math.round(f.calories * f.quantity / 100), 0);
  const totalProt = selectedFoods.reduce((s, f) => s + Math.round(f.protein * f.quantity / 100), 0);
  const totalCarbs = selectedFoods.reduce((s, f) => s + Math.round(f.carbs * f.quantity / 100), 0);
  const totalFat = selectedFoods.reduce((s, f) => s + Math.round(f.fat * f.quantity / 100), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <ForkKnife className="h-7 w-7 text-brand" />
        <h1 className="text-3xl font-bold text-brand">Log a Meal</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-surface p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold">Search & Add Foods</h2>
            </div>
            <div className="mb-4">
              <label className="block text-muted mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-muted mb-1">Meal Type</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)}
                className="w-full p-2 border rounded-lg">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods..." className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
            {foods.length > 0 && (
              <motion.ul className="mt-2 max-h-48 overflow-y-auto border rounded-lg" variants={staggerList} initial="hidden" animate="visible">
                {foods.map((food) => (
                  <motion.li key={food._id} variants={fadeUpSmall} onClick={() => addFood(food)}
                    className="p-2 hover:bg-brand-soft cursor-pointer border-b last:border-0 flex justify-between text-sm">
                    <span>{food.name}</span>
                    <span className="text-muted">{food.calories} cal / 100g</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>

          {selectedFoods.length > 0 && (
            <div className="bg-surface p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <ListPlus className="h-5 w-5 text-brand" />
                <h2 className="text-xl font-semibold">Selected Foods</h2>
              </div>
              <motion.ul variants={staggerList} initial="hidden" animate="visible">
                {selectedFoods.map((f) => (
                  <motion.li key={f.foodItemId} variants={fadeUpSmall} className="flex items-center gap-2 mb-2">
                    <span className="flex-1 text-sm">{f.name}</span>
                    <input type="number" value={f.quantity} onChange={(e) => updateQuantity(f.foodItemId, Number(e.target.value))}
                      className="w-20 p-1 border rounded text-sm" min={10} />
                    <span className="text-xs text-muted w-16 text-right">{Math.round(f.calories * f.quantity / 100)} cal</span>
                    <button onClick={() => removeSelected(f.foodItemId)} className="text-red-500 dark:text-red-400 text-sm">✕</button>
                  </motion.li>
                ))}
              </motion.ul>
              <div className="border-t pt-2 mt-2 text-sm font-semibold">
                Total: {totalCals} cal · P:{totalProt}g · C:{totalCarbs}g · F:{totalFat}g
              </div>
              <button onClick={handleSubmit} className="w-full bg-brand text-brand-contrast p-2 rounded-lg mt-3 hover:bg-brand-hover">Log Meal</button>
              {error && <div className="bg-danger-bg text-danger-strong p-2 rounded mt-2 text-sm">{error}</div>}
              {success && <div className="bg-success-bg text-success-strong p-2 rounded mt-2 text-sm">{success}</div>}
            </div>
          )}
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Today's Summary ({new Date(date).toLocaleDateString()})</h2>
          </div>
          {dailySummary ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-brand-soft rounded text-center">
                  <div className="text-2xl font-bold text-brand">{dailySummary.calories}</div>
                  <div className="text-sm text-muted">Calories</div>
                </div>
                <div className="p-3 bg-brand-soft rounded text-center">
                  <div className="text-2xl font-bold text-brand">{dailySummary.protein}g</div>
                  <div className="text-sm text-muted">Protein</div>
                </div>
                <div className="p-3 bg-brand-soft rounded text-center">
                  <div className="text-2xl font-bold text-brand">{dailySummary.carbs}g</div>
                  <div className="text-sm text-muted">Carbs</div>
                </div>
                <div className="p-3 bg-brand-soft rounded text-center">
                  <div className="text-2xl font-bold text-brand">{dailySummary.fat}g</div>
                  <div className="text-sm text-muted">Fat</div>
                </div>
              </div>
              <motion.div variants={staggerList} initial="hidden" animate="visible">
                {dailyLogs.map((log) => (
                  <motion.div key={log._id} variants={fadeUpSmall} className="mb-3 p-3 bg-surface-alt rounded">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="capitalize">{log.mealType}</span>
                      <span>{log.totalCalories} cal</span>
                    </div>
                    <div className="text-xs text-muted">
                      {log.foodItems.map((f) => `${f.name} (${f.quantity}g)`).join(', ')}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <p className="text-muted">No meals logged for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
}
