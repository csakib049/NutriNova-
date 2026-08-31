import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-nav-text"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="inline-flex"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-nav-bg text-nav-text shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 whitespace-nowrap shrink-0 -ml-2">
            <img src="/nutrinova-logo.png" alt="Nutrinova logo" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-xl font-bold">Nutrinova</span>
          </Link>
          {user && (
            <div className="flex items-center gap-1 ml-4 flex-1 min-w-0 overflow-x-auto no-scrollbar">
              <NavLink to="/dashboard" className={({ isActive }) => `whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 text-sm shrink-0 ${isActive ? 'bg-nav-active text-nav-text' : 'hover:text-nav-hover'}`}>Dashboard</NavLink>
              <NavLink to="/bmi" className={({ isActive }) => `whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 text-sm shrink-0 ${isActive ? 'bg-nav-active text-nav-text' : 'hover:text-nav-hover'}`}>BMI</NavLink>
              <NavLink to="/meal-plan" className={({ isActive }) => `whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 text-sm shrink-0 ${isActive ? 'bg-nav-active text-nav-text' : 'hover:text-nav-hover'}`}>Meal Plan</NavLink>
              <NavLink to="/log-meal" className={({ isActive }) => `whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 text-sm shrink-0 ${isActive ? 'bg-nav-active text-nav-text' : 'hover:text-nav-hover'}`}>Log Meal</NavLink>
              <NavLink to="/food-details" className={({ isActive }) => `whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 text-sm shrink-0 ${isActive ? 'bg-nav-active text-nav-text' : 'hover:text-nav-hover'}`}>Food Details</NavLink>
              <NavLink to="/checkin" className={({ isActive }) => `whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 text-sm shrink-0 ${isActive ? 'bg-nav-active text-nav-text' : 'hover:text-nav-hover'}`}>Weekly Check-In</NavLink>
              <NavLink to="/progress" className={({ isActive }) => `whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 text-sm shrink-0 ${isActive ? 'bg-nav-active text-nav-text' : 'hover:text-nav-hover'}`}>Progress</NavLink>
              <NavLink to="/ai-assistant" className={({ isActive }) => `whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 text-sm shrink-0 ${isActive ? 'bg-nav-active text-nav-text' : 'hover:text-nav-hover'}`}>AI</NavLink>
            </div>
          )}
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/profile" className="whitespace-nowrap hover:text-nav-hover">{user.name}</Link>
                <button onClick={handleLogout} className="whitespace-nowrap bg-nav-active px-3 py-1 rounded hover:bg-black/25">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="whitespace-nowrap hover:text-nav-hover">Login</Link>
                <Link to="/signup" className="whitespace-nowrap bg-nav-active px-3 py-1 rounded hover:bg-black/25">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
