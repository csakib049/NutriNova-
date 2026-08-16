import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center text-brand mb-8">Login</h1>
      {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-muted mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
        </div>
        <div>
          <label className="block text-muted mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-brand text-brand-contrast p-3 rounded-lg hover:bg-brand-hover disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-4 text-muted">
        Don't have an account? <Link to="/signup" className="text-brand hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
