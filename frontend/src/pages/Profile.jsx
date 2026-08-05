import { useState, useEffect } from 'react';
import { User, Droplet, Flame, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ ...user });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [waterToday, setWaterToday] = useState(0);
  const [waterHistory, setWaterHistory] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    api.get('/water/today').then((res) => setWaterToday(res.data.totalMl)).catch(() => {});
    api.get('/water/history').then((res) => {
      setWaterHistory(res.data.dailyTotals);
      setStreak(res.data.dailyTotals.filter((d) => d.totalMl >= 1500).length);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/users/me', form);
      updateUser(res.data.user);
      setMessage('Profile updated!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const addWater = async () => {
    try {
      await api.post('/water', { amountMl: 250 });
      const res = await api.get('/water/today');
      setWaterToday(res.data.totalMl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/export/report/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutrinova-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err) {
      setMessage('Export failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <User className="h-7 w-7 text-brand" />
        <h1 className="text-3xl font-bold text-brand">Profile & Settings</h1>
      </div>

      {message && <div className="bg-success-bg text-success-strong p-3 rounded mb-4">{message}</div>}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </div>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-muted text-sm">Name</label>
              <input type="text" name="name" value={form.name || ''} onChange={handleChange}
                className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-muted text-sm">Age</label>
              <input type="number" name="age" value={form.age || ''} onChange={handleChange}
                className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-muted text-sm">Gender</label>
              <select name="gender" value={form.gender || ''} onChange={handleChange}
                className="w-full p-2 border rounded-lg">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-muted text-sm">Height (cm)</label>
              <input type="number" step="0.1" name="height" value={form.height || ''} onChange={handleChange}
                className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-muted text-sm">Weight (kg)</label>
              <input type="number" step="0.1" name="weight" value={form.weight || ''} onChange={handleChange}
                className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-muted text-sm">Activity Level</label>
              <select name="activityLevel" value={form.activityLevel || 'sedentary'} onChange={handleChange}
                className="w-full p-2 border rounded-lg">
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly active</option>
                <option value="moderate">Moderately active</option>
                <option value="active">Active</option>
                <option value="very_active">Very active</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="hasDiabetes" checked={form.hasDiabetes || false} onChange={handleChange} id="diabetes" />
              <label htmlFor="diabetes" className="text-muted text-sm">Has Diabetes</label>
            </div>
            <div>
              <label className="block text-muted text-sm">Diabetes Status</label>
              <select name="diabetesStatus" value={form.diabetesStatus || 'No Diabetes'} onChange={handleChange}
                className="w-full p-2 border rounded-lg">
                <option value="No Diabetes">No Diabetes</option>
                <option value="Pre-Diabetic">Pre-Diabetic</option>
                <option value="Type 1 Diabetes">Type 1 Diabetes</option>
                <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                <option value="Gestational Diabetes">Gestational Diabetes</option>
              </select>
            </div>
            <div>
              <label className="block text-muted text-sm">Goal</label>
              <select name="goal" value={form.goal || 'maintain'} onChange={handleChange}
                className="w-full p-2 border rounded-lg">
                <option value="lose">Lose weight</option>
                <option value="maintain">Maintain weight</option>
                <option value="gain">Gain weight</option>
              </select>
            </div>
            <div>
              <label className="block text-muted text-sm">Target Weight (kg)</label>
              <input type="number" step="0.1" name="targetWeight" value={form.targetWeight || ''} onChange={handleChange}
                className="w-full p-2 border rounded-lg" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-brand text-brand-contrast p-2 rounded-lg hover:bg-brand-hover disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold">Water Intake Tracker</h2>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{waterToday / 1000}L</div>
              <div className="text-muted text-sm">today / 2L target</div>
              <div className="w-full bg-border rounded-full h-3 mt-3">
                <div className="bg-blue-500 dark:bg-blue-400 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (waterToday / 2000) * 100)}%` }}></div>
              </div>
              <button onClick={addWater} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 text-sm">+ Add Glass (250ml)</button>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold">Streak</h2>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">{streak}</div>
              <div className="text-muted text-sm">days with 1500ml+ water</div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Download className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold">Export Report</h2>
            </div>
            <p className="text-muted text-sm mb-3">Download a CSV of your weekly progress, BMI history, and food logs.</p>
            <button onClick={handleExport} className="bg-brand text-brand-contrast px-4 py-2 rounded-lg hover:bg-brand-hover text-sm">Download CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}
