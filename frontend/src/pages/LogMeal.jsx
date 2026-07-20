import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function LogMeal() {
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
      <h1 className="text-3xl font-bold text-green-800 mb-8">Log a Meal</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Search & Add Foods</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Meal Type</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)}
                className="w-full p-2 border rounded-lg">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods..." className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            {foods.length > 0 && (
              <ul className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                {foods.map((food) => (
                  <li key={food._id} onClick={() => addFood(food)}
                    className="p-2 hover:bg-green-50 cursor-pointer border-b last:border-0 flex justify-between text-sm">
                    <span>{food.name}</span>
                    <span className="text-gray-500">{food.calories} cal / 100g</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedFoods.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Selected Foods</h2>
              {selectedFoods.map((f) => (
                <div key={f.foodItemId} className="flex items-center gap-2 mb-2">
                  <span className="flex-1 text-sm">{f.name}</span>
                  <input type="number" value={f.quantity} onChange={(e) => updateQuantity(f.foodItemId, Number(e.target.value))}
                    className="w-20 p-1 border rounded text-sm" min={10} />
                  <span className="text-xs text-gray-500 w-16 text-right">{Math.round(f.calories * f.quantity / 100)} cal</span>
                  <button onClick={() => removeSelected(f.foodItemId)} className="text-red-500 text-sm">✕</button>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 text-sm font-semibold">
                Total: {totalCals} cal · P:{totalProt}g · C:{totalCarbs}g · F:{totalFat}g
              </div>
              <button onClick={handleSubmit} className="w-full bg-green-700 text-white p-2 rounded-lg mt-3 hover:bg-green-800">Log Meal</button>
              {error && <div className="bg-red-100 text-red-700 p-2 rounded mt-2 text-sm">{error}</div>}
              {success && <div className="bg-green-100 text-green-700 p-2 rounded mt-2 text-sm">{success}</div>}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Today's Summary ({new Date(date).toLocaleDateString()})</h2>
          {dailySummary ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-50 rounded text-center">
                  <div className="text-2xl font-bold text-green-700">{dailySummary.calories}</div>
                  <div className="text-sm text-gray-500">Calories</div>
                </div>
                <div className="p-3 bg-green-50 rounded text-center">
                  <div className="text-2xl font-bold text-green-700">{dailySummary.protein}g</div>
                  <div className="text-sm text-gray-500">Protein</div>
                </div>
                <div className="p-3 bg-green-50 rounded text-center">
                  <div className="text-2xl font-bold text-green-700">{dailySummary.carbs}g</div>
                  <div className="text-sm text-gray-500">Carbs</div>
                </div>
                <div className="p-3 bg-green-50 rounded text-center">
                  <div className="text-2xl font-bold text-green-700">{dailySummary.fat}g</div>
                  <div className="text-sm text-gray-500">Fat</div>
                </div>
              </div>
              {dailyLogs.map((log) => (
                <div key={log._id} className="mb-3 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="capitalize">{log.mealType}</span>
                    <span>{log.totalCalories} cal</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {log.foodItems.map((f) => `${f.name} (${f.quantity}g)`).join(', ')}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className="text-gray-500">No meals logged for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
}
