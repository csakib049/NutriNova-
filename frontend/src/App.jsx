import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
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
import FoodDetails from './pages/FoodDetails';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLogs from './pages/admin/AdminLogs';
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AdminProvider>
          <AuthProvider>
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
              <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>} />
              <Route path="/admin/logs" element={<AdminProtectedRoute><AdminLogs /></AdminProtectedRoute>} />
              <Route
                path="/*"
                element={
                  <div className="min-h-screen bg-page">
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/bmi" element={<ProtectedRoute><BMICalculator /></ProtectedRoute>} />
                      <Route path="/meal-plan" element={<ProtectedRoute><MealPlan /></ProtectedRoute>} />
                      <Route path="/log-meal" element={<ProtectedRoute><LogMeal /></ProtectedRoute>} />
                      <Route path="/food-details" element={<ProtectedRoute><FoodDetails /></ProtectedRoute>} />
                      <Route path="/checkin" element={<ProtectedRoute><WeeklyCheckIn /></ProtectedRoute>} />
                      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    </Routes>
                  </div>
                }
              />
            </Routes>
          </AuthProvider>
        </AdminProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
