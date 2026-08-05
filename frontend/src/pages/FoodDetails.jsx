import { useState, useEffect } from 'react';
import { Search, Plus, Salad } from 'lucide-react';
import api from '../api/axios';
import FoodDetailCard from '../components/FoodDetailCard';

export default function FoodDetails() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', servingSize: '100g', calories: '', protein: '', carbs: '', fat: '',
    fiber: '', sugar: '', sodium: '', category: 'general', icon: 'Utensils',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await api.get('/foods');
        setFoods(res.data.foods);
      } catch (err) {
        console.error('Food details fetch error:', err);
        setError('Failed to load food data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) {
      setFormError('Food name is required');
      return;
    }
    if (!formData.calories || Number(formData.calories) < 0) {
      setFormError('Calories must be >= 0');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        servingSize: formData.servingSize || '100g',
        calories: Number(formData.calories),
        protein: Number(formData.protein || 0),
        carbs: Number(formData.carbs || 0),
        fat: Number(formData.fat || 0),
        fiber: Number(formData.fiber || 0),
        sugar: Number(formData.sugar || 0),
        sodium: Number(formData.sodium || 0),
        category: formData.category || 'general',
        icon: formData.icon || 'Utensils',
      };
      const res = await api.post('/foods', payload);
      setFoods((prev) => [...prev, res.data.food]);
      setShowModal(false);
      setFormData({ name: '', servingSize: '100g', calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: '', category: 'general', icon: 'Utensils' });
    } catch (err) {
      if (err.response?.status === 409) {
        setFormError('A food item with this name already exists. Please use a different name.');
      } else {
        setFormError(err.response?.data?.error || 'Failed to save food');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-danger-bg text-danger-strong p-3 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Salad className="h-7 w-7 text-brand" />
          <h1 className="text-3xl font-bold text-brand">Food Details</h1>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-brand text-brand-contrast px-5 py-2 rounded-lg hover:bg-brand-hover flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Food
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
        <input
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none"
        />
      </div>

      {filteredFoods.length === 0 ? (
        <p className="text-muted text-center py-10">No foods found matching "{search}"</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food) => (
            <FoodDetailCard key={food._id} food={food} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand">Add New Food</h2>
                <button onClick={() => setShowModal(false)} className="text-muted hover:text-muted text-2xl">&times;</button>
              </div>
              <form onSubmit={handleAddFood} className="space-y-4">
                <div>
                  <label className="block text-muted mb-1">Food Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted mb-1">Serving Size</label>
                    <input type="text" name="servingSize" value={formData.servingSize} onChange={handleChange}
                      className="w-full p-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-muted mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}
                      className="w-full p-3 border rounded-lg">
                      <option value="general">General</option>
                      <option value="grains">Grains</option>
                      <option value="meat">Meat</option>
                      <option value="fish">Fish</option>
                      <option value="dairy">Dairy</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="nuts">Nuts</option>
                      <option value="legumes">Legumes</option>
                      <option value="protein">Protein</option>
                      <option value="fats">Fats</option>
                      <option value="snacks">Snacks</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted mb-1">Calories *</label>
                    <input type="number" name="calories" value={formData.calories} onChange={handleChange} required min={0}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
                  </div>
                  <div>
                    <label className="block text-muted mb-1">Protein (g)</label>
                    <input type="number" name="protein" value={formData.protein} onChange={handleChange} min={0}
                      className="w-full p-3 border rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted mb-1">Carbs (g)</label>
                    <input type="number" name="carbs" value={formData.carbs} onChange={handleChange} min={0}
                      className="w-full p-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-muted mb-1">Fat (g)</label>
                    <input type="number" name="fat" value={formData.fat} onChange={handleChange} min={0}
                      className="w-full p-3 border rounded-lg" />
                  </div>
                </div>
                <details className="text-sm text-muted">
                  <summary className="cursor-pointer font-medium">Optional nutrition details</summary>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-muted mb-1">Fiber (g)</label>
                      <input type="number" name="fiber" value={formData.fiber} onChange={handleChange} min={0}
                        className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-muted mb-1">Sugar (g)</label>
                      <input type="number" name="sugar" value={formData.sugar} onChange={handleChange} min={0}
                        className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-muted mb-1">Sodium (mg)</label>
                      <input type="number" name="sodium" value={formData.sodium} onChange={handleChange} min={0}
                        className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                </details>
                {formError && <div className="bg-danger-bg text-danger-strong p-3 rounded">{formError}</div>}
                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-brand text-brand-contrast p-3 rounded-lg hover:bg-brand-hover disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Food'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="bg-surface-alt text-foreground px-6 py-3 rounded-lg hover:bg-border">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
