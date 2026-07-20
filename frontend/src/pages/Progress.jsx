import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api/axios';

export default function Progress() {
  const [checkIns, setCheckIns] = useState([]);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>;
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
      <h1 className="text-3xl font-bold text-green-800 mb-8">Progress & Graphs</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Weight Over Time</h2>
          {weightData.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500">Need at least 2 check-ins to show a chart.</p>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">BMI Over Time</h2>
          {bmiData.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bmiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="bmi" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500">Need at least 2 check-ins to show a chart.</p>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Glucose Over Time</h2>
          {glucoseData.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={glucoseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="glucose" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500">Need at least 2 check-ins to show a chart.</p>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daily Calorie Intake (Week)</h2>
          {weeklyCalories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyCalories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#16a34a" name="Calories" />
                <Bar dataKey="protein" fill="#2563eb" name="Protein (g)" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500">Log some meals this week to see data.</p>}
        </div>
      </div>
    </div>
  );
}
