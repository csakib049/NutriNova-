import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [todayLogs, setTodayLogs] = useState(null);
  const [latestBMI, setLatestBMI] = useState(null);
  const [trend, setTrend] = useState(null);
  const [water, setWater] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, bmiRes, trendRes, waterRes] = await Promise.all([
          api.get('/food-logs/daily'),
          api.get('/bmi/latest'),
          api.get('/checkins/trend'),
          api.get('/water/today'),
        ]);
        setTodayLogs(logsRes.data);
        setLatestBMI(bmiRes.data.record);
        setTrend(trendRes.data);
        setWater(waterRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm uppercase">Today's Calories</h3>
          <p className="text-3xl font-bold mt-1">{todayLogs?.summary?.calories || 0}</p>
          <p className="text-gray-500 text-sm">protein: {todayLogs?.summary?.protein || 0}g · carbs: {todayLogs?.summary?.carbs || 0}g · fat: {todayLogs?.summary?.fat || 0}g</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm uppercase">Current BMI</h3>
          <p className="text-3xl font-bold mt-1">{latestBMI?.bmi || 'N/A'}</p>
          <p className="text-gray-500 text-sm capitalize">{latestBMI?.category || 'Not calculated'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm uppercase">Latest Weight</h3>
          <p className="text-3xl font-bold mt-1">{trend?.latest?.weight || user?.weight || 'N/A'} kg</p>
          <p className="text-gray-500 text-sm">
            {trend?.trend?.weight === 'improved' ? '↓ Trending down' : trend?.trend?.weight === 'worsened' ? '↑ Trending up' : 'Stable'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm uppercase">Water Today</h3>
          <p className="text-3xl font-bold mt-1">{(water?.totalMl || 0) / 1000}L</p>
          <p className="text-gray-500 text-sm">{water?.count || 0} glasses</p>
        </div>
      </div>

      {!user?.height && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
          <p className="text-yellow-800">Complete your <Link to="/profile" className="underline font-semibold">profile</Link> to get a personalized meal plan.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/bmi" className="bg-green-50 p-3 rounded-lg text-center hover:bg-green-100">Calculate BMI</Link>
            <Link to="/meal-plan" className="bg-green-50 p-3 rounded-lg text-center hover:bg-green-100">View Meal Plan</Link>
            <Link to="/log-meal" className="bg-green-50 p-3 rounded-lg text-center hover:bg-green-100">Log a Meal</Link>
            <Link to="/checkin" className="bg-green-50 p-3 rounded-lg text-center hover:bg-green-100">Weekly Check-In</Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Latest Glucose</h2>
          <p className="text-3xl font-bold">{trend?.latest?.glucose || 'N/A'} <span className="text-lg font-normal text-gray-500">mg/dL</span></p>
          <p className="text-gray-500 text-sm mt-1">
            {trend?.trend?.glucose === 'improved' ? '↓ Improving' : trend?.trend?.glucose === 'worsened' ? '↑ Rising' : 'Stable'}
          </p>
        </div>
      </div>
    </div>
  );
}
