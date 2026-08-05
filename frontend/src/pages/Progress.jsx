import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import { ChartLine, Weight, CircleGauge, Activity, Flame } from 'lucide-react';

const LINE_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 1000,
  animationEasing: 'ease-out',
};

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

export default function Progress() {
  const [checkIns, setCheckIns] = useState([]);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const tooltipCursor = { fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' };
  const weightColor = isDark ? '#4ade80' : '#16a34a';
  const bmiColor = isDark ? '#60a5fa' : '#2563eb';
  const glucoseColor = isDark ? '#f87171' : '#dc2626';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [checkinRes, weeklyRes] = await Promise.all([
          api.get('/checkins/history'),
          api.get('/food-logs/weekly'),
        ]);
        setCheckIns(checkinRes.data.checkIns);
        setWeeklyLogs(weeklyRes.data.dailySummary || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;
  }

  const weightData = [...checkIns].reverse().map((ci) => ({
    date: new Date(ci.weekStartDate).toLocaleDateString(),
    weight: ci.weight,
  }));

  const bmiData = [...checkIns].reverse().map((ci) => ({
    date: new Date(ci.weekStartDate).toLocaleDateString(),
    bmi: ci.bmi,
  }));

  const glucoseData = [...checkIns].reverse().map((ci) => ({
    date: new Date(ci.weekStartDate).toLocaleDateString(),
    glucose: ci.glucose,
  }));

  const weeklyCalories = weeklyLogs.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    calories: d.calories,
    protein: d.protein,
    carbs: d.carbs,
    fat: d.fat,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <ChartLine className="h-7 w-7 text-brand" />
        <h1 className="text-3xl font-bold text-brand">Progress & Graphs</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Weight className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Weight Over Time</h2>
          </div>
          {weightData.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ stroke: grid }} />
                <Line type="monotone" dataKey="weight" stroke={weightColor} strokeWidth={2}
                  dot={(props) => <AnimatedDot {...props} r={4} fill={weightColor} stroke={weightColor} />}
                  activeDot={{ r: 6 }}
                  {...LINE_ANIMATION} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-muted">Need at least 2 check-ins to show a chart.</p>}
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <CircleGauge className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">BMI Over Time</h2>
          </div>
          {bmiData.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bmiData}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ stroke: grid }} />
                <Line type="monotone" dataKey="bmi" stroke={bmiColor} strokeWidth={2}
                  dot={(props) => <AnimatedDot {...props} r={4} fill={bmiColor} stroke={bmiColor} />}
                  activeDot={{ r: 6 }}
                  {...LINE_ANIMATION} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-muted">Need at least 2 check-ins to show a chart.</p>}
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Glucose Over Time</h2>
          </div>
          {glucoseData.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ stroke: grid }} />
                <Line type="monotone" dataKey="glucose" stroke={glucoseColor} strokeWidth={2}
                  dot={(props) => <AnimatedDot {...props} r={4} fill={glucoseColor} stroke={glucoseColor} />}
                  activeDot={{ r: 6 }}
                  {...LINE_ANIMATION} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-muted">Need at least 2 check-ins to show a chart.</p>}
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Daily Calorie Intake (Week)</h2>
          </div>
          {weeklyCalories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyCalories}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="date" tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <YAxis tick={tick} stroke={grid} axisLine={{ stroke: grid }} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={tooltipCursor} />
                <Legend wrapperStyle={{ color: isDark ? '#fafafa' : '#171717' }} />
                <Bar dataKey="calories" fill={weightColor} name="Calories" isAnimationActive animationDuration={800} animationEasing="ease-out" />
                <Bar dataKey="protein" fill={bmiColor} name="Protein (g)" isAnimationActive animationDuration={800} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted">Log some meals this week to see data.</p>}
        </div>
      </div>
    </div>
  );
}
