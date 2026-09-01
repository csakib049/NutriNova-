import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useAnimVariants } from '../lib/motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { Calculator, ChartLine, ListChecks, Flame } from 'lucide-react';
import BMRCalculator from '../components/BMRCalculator';

function AnimatedDot({ cx, cy, r = 3, fill, stroke, index }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} />;
  }
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 + (index || 0) * 0.08, duration: 0.3 }}
    />
  );
}

export default function BMICalculator() {
  const { user } = useAuth();
  const [weight, setWeight] = useState(user?.weight || '');
  const [height, setHeight] = useState(user?.height || '');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reduce = useReducedMotion();
  const { fadeUp, staggerContainer } = useAnimVariants();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const grid = isDark ? '#374151' : '#e5e7eb';
  const tick = { fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 };
  const tooltipStyle = {
    backgroundColor: isDark ? '#242424' : '#ffffff',
    border: `1px solid ${isDark ? '#404040' : '#e5e7eb'}`,
    borderRadius: 8,
  };
  const tooltipLabelStyle = { color: isDark ? '#fafafa' : '#171717' };
  const tooltipItemStyle = { color: isDark ? '#fafafa' : '#171717' };
  const bmiColor = isDark ? '#4ade80' : '#16a34a';

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
      <div className="flex items-center gap-2 mb-8">
        <Calculator className="h-7 w-7 text-brand" />
        <Flame className="h-7 w-7 text-brand" />
        <h1 className="text-3xl font-bold text-brand">BMI & BMR Calculators</h1>
      </div>

      {/* BMI Calculator left | BMI History right */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* BMI Calculator Card */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">BMI Calculator</h2>
          </div>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-muted mb-1">Weight (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
            </div>
            <div>
              <label className="block text-muted mb-1">Height (cm)</label>
              <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-brand text-brand-contrast p-3 rounded-lg hover:bg-brand-hover disabled:opacity-50">
              {loading ? 'Calculating...' : 'Calculate BMI'}
            </button>
          </form>
          {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mt-4">{error}</div>}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={`${result.bmi}-${result.category}`}
                className="mt-6 p-4 bg-brand-soft rounded-lg"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.9, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <p className="text-2xl font-bold text-brand">BMI: {result.bmi}</p>
                <p className="text-lg capitalize text-brand">{result.category}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BMI History */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <ChartLine className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">BMI History</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ stroke: grid }} />
                <Line type="monotone" dataKey="bmi" stroke={bmiColor} strokeWidth={2}
                  dot={(props) => <AnimatedDot {...props} r={4} fill={bmiColor} stroke={bmiColor} />}
                  activeDot={{ r: 6 }}
                  isAnimationActive animationDuration={1000} animationEasing="ease-out" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted">No BMI records yet.</p>
          )}
        </div>
      </div>

      {/* BMI Categories */}
      <motion.div
        className="bg-surface p-6 rounded-xl shadow-md mt-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={fadeUp} className="flex items-center gap-2 text-xl font-semibold mb-4">
          <ListChecks className="h-5 w-5 text-brand" />
          BMI Categories (WHO)
        </motion.h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <motion.div variants={fadeUp} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg"><span className="font-bold">Below 18.5</span><br />Underweight</motion.div>
          <motion.div variants={fadeUp} className="p-3 bg-brand-soft rounded-lg"><span className="font-bold">18.5 – 24.9</span><br />Normal</motion.div>
          <motion.div variants={fadeUp} className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg"><span className="font-bold">25 – 29.9</span><br />Overweight</motion.div>
          <motion.div variants={fadeUp} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg"><span className="font-bold">30+</span><br />Obese</motion.div>
        </div>
      </motion.div>

      {/* BMR Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-brand" />
          <h2 className="text-xl font-semibold">BMR Calculator</h2>
        </div>
        <div className="bg-surface rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <p className="text-muted mb-4">
              Basal Metabolic Rate (BMR) is the number of calories your body needs at rest to maintain basic functions like breathing, circulation, and cell production.
            </p>
            <BMRCalculator embedded />
          </div>
        </div>
      </div>
    </div>
  );
}
