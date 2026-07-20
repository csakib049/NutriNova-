import { Link, useNavigate } from 'react-router-dom';
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
                <Link to="/dashboard" className="hover:text-green-200">Dashboard</Link>
                <Link to="/bmi" className="hover:text-green-200">BMI</Link>
                <Link to="/meal-plan" className="hover:text-green-200">Meal Plan</Link>
                <Link to="/log-meal" className="hover:text-green-200">Log Meal</Link>
                <Link to="/checkin" className="hover:text-green-200">Check-In</Link>
                <Link to="/progress" className="hover:text-green-200">Progress</Link>
                <Link to="/ai-assistant" className="hover:text-green-200">AI</Link>
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
