import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BMICalculator() {
  const { user } = useAuth();
  const [weight, setWeight] = useState(user?.weight || '');
  const [height, setHeight] = useState(user?.height || '');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/bmi/history').then((res) => setHistory(res.data.records)).catch(() => {});
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/bmi', { weight: Number(weight), height: Number(height) });
      setResult(res.data);
      const histRes = await api.get('/bmi/history');
      setHistory(histRes.data.records);
    } catch (err) {
      setError(err.response?.data?.error || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...history].reverse();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-8">BMI Calculator</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Height (cm)</label>
              <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800 disabled:opacity-50">
              {loading ? 'Calculating...' : 'Calculate BMI'}
            </button>
          </form>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mt-4">{error}</div>}
          {result && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-800">BMI: {result.bmi}</p>
              <p className="text-lg capitalize text-green-700">{result.category}</p>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">BMI History</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                <Line type="monotone" dataKey="bmi" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No BMI records yet.</p>
          )}
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">BMI Categories (WHO)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg"><span className="font-bold">Below 18.5</span><br />Underweight</div>
          <div className="p-3 bg-green-50 rounded-lg"><span className="font-bold">18.5 – 24.9</span><br />Normal</div>
          <div className="p-3 bg-yellow-50 rounded-lg"><span className="font-bold">25 – 29.9</span><br />Overweight</div>
          <div className="p-3 bg-red-50 rounded-lg"><span className="font-bold">30+</span><br />Obese</div>
        </div>
      </div>
    </div>
  );
}
