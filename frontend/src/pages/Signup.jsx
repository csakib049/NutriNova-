import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details?.[0]?.msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center text-green-800 mb-8">Create Account</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800 disabled:opacity-50">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center mt-4 text-gray-600">
        Already have an account? <Link to="/login" className="text-green-700 hover:underline">Login</Link>
      </p>
    </div>
  );
}
