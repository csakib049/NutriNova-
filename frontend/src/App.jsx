import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BMICalculator from './pages/BMICalculator';
import MealPlan from './pages/MealPlan';
import LogMeal from './pages/LogMeal';
import WeeklyCheckIn from './pages/WeeklyCheckIn';
import Progress from './pages/Progress';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/bmi" element={<ProtectedRoute><BMICalculator /></ProtectedRoute>} />
            <Route path="/meal-plan" element={<ProtectedRoute><MealPlan /></ProtectedRoute>} />
            <Route path="/log-meal" element={<ProtectedRoute><LogMeal /></ProtectedRoute>} />
            <Route path="/checkin" element={<ProtectedRoute><WeeklyCheckIn /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

