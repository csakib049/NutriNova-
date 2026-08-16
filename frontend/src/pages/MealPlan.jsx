import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import api from '../api/axios';
import { useAnimVariants } from '../lib/motion';
import { CalendarDays, ForkKnife } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function MealPlan() {
  const [plan, setPlan] = useState(null);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [customSearch, setCustomSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [customMealType, setCustomMealType] = useState('breakfast');
  const reduce = useReducedMotion();
  const { fadeUpSmall, staggerList } = useAnimVariants();

  const fetchPlan = async () => {
    try {
      const res = await api.get('/meal-plan/current');
      if (res.data.plan) {
        setPlan(res.data.plan);
        setTargets({
          calories: res.data.plan.targetCalories,
          protein: res.data.plan.targetProtein,
          carbs: res.data.plan.targetCarbs,
          fat: res.data.plan.targetFat,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlan(); }, []);

  useEffect(() => {
    if (customSearch.length >= 1) {
      const timer = setTimeout(() => {
        api.get(`/foods/search?q=${customSearch}`).then((res) => setSearchResults(res.data.foods)).catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [customSearch]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await api.post('/meal-plan/generate');
      setPlan(res.data.plan);
      setTargets(res.data.targets);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const addFoodToCustom = (food) => {
    setSelectedFoods((prev) => {
      const existing = prev.find((f) => f._id === food._id);
      if (existing) {
        return prev.map((f) => f._id === food._id ? { ...f, quantity: f.quantity + 100 } : f);
      }
      return [...prev, { ...food, quantity: 100 }];
    });
  };

  const updateCustomQty = (id, qty) => {
    setSelectedFoods((prev) => prev.map((f) => f._id === id ? { ...f, quantity: Math.max(10, qty) } : f));
  };

  const removeCustomFood = (id) => {
    setSelectedFoods((prev) => prev.filter((f) => f._id !== id));
  };

  const handleSaveCustomMeal = async () => {
    if (selectedFoods.length === 0) return;
    setError('');
    const foodItems = selectedFoods.map((f) => ({
      name: f.name,
      calories: Math.round(f.calories * f.quantity / 100),
      protein: Math.round(f.protein * f.quantity / 100),
      carbs: Math.round(f.carbs * f.quantity / 100),
      fat: Math.round(f.fat * f.quantity / 100),
      servingSize: `${f.quantity}g`,
    }));
    try {
      const res = await api.post('/meal-plan/add-custom-meal', {
        day: DAYS[activeDay],
        mealType: customMealType,
        foodItems,
      });
      setPlan(res.data.plan);
      setShowModal(false);
      setSelectedFoods([]);
      setCustomSearch('');
      setCustomMealType('breakfast');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save custom meal');
    }
  };

  const customTotalCals = selectedFoods.reduce((s, f) => s + Math.round(f.calories * f.quantity / 100), 0);
  const customTotalProt = selectedFoods.reduce((s, f) => s + Math.round(f.protein * f.quantity / 100), 0);
  const customTotalCarbs = selectedFoods.reduce((s, f) => s + Math.round(f.carbs * f.quantity / 100), 0);
  const customTotalFat = selectedFoods.reduce((s, f) => s + Math.round(f.fat * f.quantity / 100), 0);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-7 w-7 text-brand" />
          <h1 className="text-3xl font-bold text-brand">Weekly Meal Plan</h1>
        </div>
        <div className="flex gap-3">
          {plan && (
            <button onClick={() => setShowModal(true)}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
              Create Your Own Meal
            </button>
          )}
          <button onClick={handleGenerate} disabled={generating}
            className="bg-brand text-brand-contrast px-6 py-2 rounded-lg hover:bg-brand-hover disabled:opacity-50">
            {generating ? 'Generating...' : 'Generate New Plan'}
          </button>
        </div>
      </div>
      {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mb-4">{error}</div>}

      {targets && (
        <div className="bg-surface p-4 rounded-xl shadow-md mb-6 grid grid-cols-4 gap-4 text-center">
          <div><span className="text-muted text-sm">Calories</span><p className="text-xl font-bold text-brand">{targets.calories}</p></div>
          <div><span className="text-muted text-sm">Protein</span><p className="text-xl font-bold text-blue-700 dark:text-blue-400">{targets.protein}g</p></div>
          <div><span className="text-muted text-sm">Carbs</span><p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{targets.carbs}g</p></div>
          <div><span className="text-muted text-sm">Fat</span><p className="text-xl font-bold text-red-700 dark:text-red-400">{targets.fat}g</p></div>
        </div>
      )}

      {!plan && !generating && (
        <div className="bg-surface p-8 rounded-xl shadow-md text-center">
          <p className="text-muted text-lg mb-4">No meal plan yet. Generate one to get started!</p>
          <p className="text-muted">Make sure your profile has height, weight, age, and gender set.</p>
        </div>
      )}

      {plan && (
        <div className="bg-surface rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {plan.dailyPlans?.map((day, i) => (
              <button key={day.day} onClick={() => setActiveDay(i)}
                className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${activeDay === i ? 'bg-brand text-brand-contrast' : 'hover:bg-surface-alt'}`}>
                {day.day}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeDay}
              className="p-6"
              initial={{ opacity: 0, x: reduce ? 0 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduce ? 0 : -24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {plan.dailyPlans?.[activeDay]?.meals?.map((meal) => (
                <div key={meal.type} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold capitalize text-brand mb-2">{meal.type}</h3>
                  <div className="text-sm text-muted mb-2">{meal.totalCalories} cal · P:{meal.totalProtein}g · C:{meal.totalCarbs}g · F:{meal.totalFat}g</div>
                  <motion.ul className="space-y-1" variants={staggerList} initial="hidden" animate="visible">
                    {meal.foodItems?.map((item, i) => (
                      <motion.li key={i} variants={fadeUpSmall} className="flex justify-between text-sm bg-surface-alt p-2 rounded">
                        <span>{item.name}</span>
                        <span className="text-muted">{item.calories} cal · {item.servingSize}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-surface rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.95, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.95, y: reduce ? 0 : 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <ForkKnife className="h-6 w-6 text-brand" />
                  <h2 className="text-2xl font-bold text-brand">Create Your Own Meal</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-muted hover:text-muted text-2xl">&times;</button>
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-1">Meal Type</label>
                <select value={customMealType} onChange={(e) => setCustomMealType(e.target.value)}
                  className="w-full p-2 border rounded-lg">
                  {MEAL_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-muted mb-1">Search Foods</label>
                <input type="text" value={customSearch} onChange={(e) => setCustomSearch(e.target.value)}
                  placeholder="Type to search foods..." className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
                {searchResults.length > 0 && (
                  <ul className="mt-2 max-h-40 overflow-y-auto border rounded-lg">
                    {searchResults.map((food) => (
                      <li key={food._id} onClick={() => addFoodToCustom(food)}
                        className="p-2 hover:bg-brand-soft cursor-pointer border-b last:border-0 flex justify-between text-sm">
                        <span>{food.name}</span>
                        <span className="text-muted">{food.calories} cal / 100g</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedFoods.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-muted mb-2">Selected Foods</h3>
                  {selectedFoods.map((f) => (
                    <div key={f._id} className="flex items-center gap-2 mb-2">
                      <span className="flex-1 text-sm">{f.name}</span>
                      <input type="number" value={f.quantity} onChange={(e) => updateCustomQty(f._id, Number(e.target.value))}
                        className="w-20 p-1 border rounded text-sm" min={10} />
                      <span className="text-xs text-muted w-16 text-right">{Math.round(f.calories * f.quantity / 100)} cal</span>
                      <button onClick={() => removeCustomFood(f._id)} className="text-red-500 dark:text-red-400 text-sm">&times;</button>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 text-sm font-semibold">
                    Total: {customTotalCals} cal · P:{customTotalProt}g · C:{customTotalCarbs}g · F:{customTotalFat}g
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleSaveCustomMeal} disabled={selectedFoods.length === 0}
                  className="flex-1 bg-brand text-brand-contrast p-3 rounded-lg hover:bg-brand-hover disabled:opacity-50">
                  Save to Meal Plan ({DAYS[activeDay]})
                </button>
                <button onClick={() => setShowModal(false)}
                  className="bg-surface-alt text-foreground px-6 py-3 rounded-lg hover:bg-border">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
