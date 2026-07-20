import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function MealPlan() {
  const [plan, setPlan] = useState(null);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(0);

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

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Weekly Meal Plan</h1>
        <button onClick={handleGenerate} disabled={generating}
          className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50">
          {generating ? 'Generating...' : 'Generate New Plan'}
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {targets && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 grid grid-cols-4 gap-4 text-center">
          <div><span className="text-gray-500 text-sm">Calories</span><p className="text-xl font-bold text-green-700">{targets.calories}</p></div>
          <div><span className="text-gray-500 text-sm">Protein</span><p className="text-xl font-bold text-blue-700">{targets.protein}g</p></div>
          <div><span className="text-gray-500 text-sm">Carbs</span><p className="text-xl font-bold text-yellow-700">{targets.carbs}g</p></div>
          <div><span className="text-gray-500 text-sm">Fat</span><p className="text-xl font-bold text-red-700">{targets.fat}g</p></div>
        </div>
      )}

      {!plan && !generating && (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <p className="text-gray-500 text-lg mb-4">No meal plan yet. Generate one to get started!</p>
          <p className="text-gray-400">Make sure your profile has height, weight, age, and gender set.</p>
        </div>
      )}

      {plan && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {plan.dailyPlans?.map((day, i) => (
              <button key={day.day} onClick={() => setActiveDay(i)}
                className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${activeDay === i ? 'bg-green-700 text-white' : 'hover:bg-gray-100'}`}>
                {day.day}
              </button>
            ))}
          </div>
          <div className="p-6">
            {plan.dailyPlans?.[activeDay]?.meals?.map((meal) => (
              <div key={meal.type} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold capitalize text-green-800 mb-2">{meal.type}</h3>
                <div className="text-sm text-gray-500 mb-2">{meal.totalCalories} cal · P:{meal.totalProtein}g · C:{meal.totalCarbs}g · F:{meal.totalFat}g</div>
                <ul className="space-y-1">
                  {meal.foodItems?.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{item.name}</span>
                      <span className="text-gray-500">{item.calories} cal · {item.servingSize}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
