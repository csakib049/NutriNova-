import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Users, BarChart3, ScrollText, ShieldCheck, ExternalLink, Sun, Moon } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

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

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/logs', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminLayout({ children }) {
  const { logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-page">
      <nav className="bg-nav-bg text-nav-text shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/admin/dashboard" className="flex items-center gap-2 whitespace-nowrap shrink-0 -ml-2">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-xl font-bold">Nutrinova Admin</span>
            </Link>
            <div className="flex items-center gap-1 ml-4 flex-1 min-w-0 overflow-x-auto no-scrollbar">
              {links.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 text-sm shrink-0 flex items-center gap-1.5 ${isActive ? 'bg-nav-active text-nav-text' : 'hover:text-nav-hover'}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ThemeToggle />
              <Link to="/" className="whitespace-nowrap flex items-center gap-1 hover:text-nav-hover text-sm">
                <ExternalLink className="h-4 w-4" /> Site
              </Link>
              <button onClick={handleLogout} className="whitespace-nowrap bg-nav-active px-3 py-1 rounded hover:bg-black/25 text-sm">Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}