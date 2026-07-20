import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">Welcome back, {user.name}!</h1>
        <p className="text-xl text-gray-600 mb-8">Track your nutrition journey with Nutrinova.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard" className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800">Go to Dashboard</Link>
          <Link to="/log-meal" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300">Log a Meal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-green-800 mb-6">Nutrinova</h1>
        <p className="text-2xl text-gray-600 mb-4">AI-Powered Diet Tracking & Meal Planning</p>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
          Calculate your BMI, get personalized meal plans, track your daily nutrition,
          monitor your health trends, and achieve your wellness goals.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/signup" className="bg-green-700 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-800">Get Started Free</Link>
          <Link to="/login" className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg hover:bg-gray-300">Login</Link>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8 mt-20">
        <div className="p-6 bg-white rounded-xl shadow-md">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-xl font-semibold mb-2">BMI & Health Tracking</h3>
          <p className="text-gray-600">Calculate BMI, track weekly progress with visual charts for weight, BMI, and glucose.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-md">
          <div className="text-3xl mb-3">🥗</div>
          <h3 className="text-xl font-semibold mb-2">Personalized Meal Plans</h3>
          <p className="text-gray-600">AI-generated weekly meal plans tailored to your goals, diabetes status, and activity level.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-md">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI Diet Assistant</h3>
          <p className="text-gray-600">Ask natural-language questions about diet, nutrition, and get personalized advice.</p>
        </div>
      </div>
    </div>
  );
}
