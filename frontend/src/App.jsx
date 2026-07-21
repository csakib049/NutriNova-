import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Static imports for initial shell, lazy imports for pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BMICalculator = lazy(() => import('./pages/BMICalculator'));
const MealPlan = lazy(() => import('./pages/MealPlan'));
const LogMeal = lazy(() => import('./pages/LogMeal'));
const WeeklyCheckIn = lazy(() => import('./pages/WeeklyCheckIn'));
const Progress = lazy(() => import('./pages/Progress'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Profile = lazy(() => import('./pages/Profile'));

// Fallback spinner/loader component while page chunks download
function PageLoader() {
  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}