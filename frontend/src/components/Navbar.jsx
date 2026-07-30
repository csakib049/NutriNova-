import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold">Nutrinova</Link>
            {user && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-green-900 text-white' : 'hover:text-green-200'}`}>Dashboard</NavLink>
                <NavLink to="/bmi" className={({ isActive }) => `px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-green-900 text-white' : 'hover:text-green-200'}`}>BMI</NavLink>
                <NavLink to="/meal-plan" className={({ isActive }) => `px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-green-900 text-white' : 'hover:text-green-200'}`}>Meal Plan</NavLink>
                <NavLink to="/log-meal" className={({ isActive }) => `px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-green-900 text-white' : 'hover:text-green-200'}`}>Log Meal</NavLink>
                <NavLink to="/food-details" className={({ isActive }) => `px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-green-900 text-white' : 'hover:text-green-200'}`}>Food Details</NavLink>
                <NavLink to="/checkin" className={({ isActive }) => `px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-green-900 text-white' : 'hover:text-green-200'}`}>Check-In</NavLink>
                <NavLink to="/progress" className={({ isActive }) => `px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-green-900 text-white' : 'hover:text-green-200'}`}>Progress</NavLink>
                <NavLink to="/ai-assistant" className={({ isActive }) => `px-3 py-1 rounded transition-colors duration-200 ${isActive ? 'bg-green-900 text-white' : 'hover:text-green-200'}`}>AI</NavLink>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="hover:text-green-200">{user.name}</Link>
                <button onClick={handleLogout} className="bg-green-800 px-3 py-1 rounded hover:bg-green-900">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-200">Login</Link>
                <Link to="/signup" className="bg-green-800 px-3 py-1 rounded hover:bg-green-900">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
