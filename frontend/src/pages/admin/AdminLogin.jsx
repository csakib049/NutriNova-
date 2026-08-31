import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-brand/10 p-4 rounded-full">
            <ShieldCheck className="h-12 w-12 text-brand" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-brand mb-2">Admin Panel</h1>
        <p className="text-center text-muted mb-8">NutriNova Administration</p>
        {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 bg-surface p-6 rounded-xl shadow-md">
          <div>
            <label className="block text-muted mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
          </div>
          <div>
            <label className="block text-muted mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand text-brand-contrast p-3 rounded-lg hover:bg-brand-hover disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center mt-4 text-muted">
          <Link to="/" className="text-brand hover:underline">Back to main site</Link>
        </p>
      </div>
    </div>
  );
}