import { useEffect, useState } from 'react';
import { Search, Pencil, Trash2, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import AdminLayout from './AdminLayout';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function UserDetailModal({ user, onClose }) {
  const [details, setDetails] = useState({ user, bmiHistory: [], checkInHistory: [], foodLogCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${user._id}`)
      .then((res) => setDetails({ ...res.data, user: res.data.user }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{details.user.name}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-alt" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div></div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-alt p-3 rounded-lg">
                <p className="text-xs text-muted uppercase">Email</p>
                <p className="font-medium break-all">{details.user.email}</p>
              </div>
              <div className="bg-surface-alt p-3 rounded-lg">
                <p className="text-xs text-muted uppercase">Joined</p>
                <p className="font-medium">{formatDate(details.user.createdAt)}</p>
              </div>
              <div className="bg-surface-alt p-3 rounded-lg">
                <p className="text-xs text-muted uppercase">Goal</p>
                <p className="font-medium capitalize">{details.user.goal}</p>
              </div>
              <div className="bg-surface-alt p-3 rounded-lg">
                <p className="text-xs text-muted uppercase">Diabetes</p>
                <p className="font-medium">{details.user.diabetesStatus}</p>
              </div>
              {details.user.height && (
                <div className="bg-surface-alt p-3 rounded-lg">
                  <p className="text-xs text-muted uppercase">Height / Weight</p>
                  <p className="font-medium">{details.user.height} cm / {details.user.weight} kg</p>
                </div>
              )}
              <div className="bg-surface-alt p-3 rounded-lg">
                <p className="text-xs text-muted uppercase">Food Logs</p>
                <p className="font-medium">{details.foodLogCount}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Recent BMI History</h3>
              {details.bmiHistory.length === 0 ? (
                <p className="text-muted text-sm">No BMI records</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-muted border-b"><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">BMI</th><th className="py-2">Category</th></tr></thead>
                    <tbody>
                      {details.bmiHistory.map((r) => (
                        <tr key={r._id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{formatDate(r.date)}</td>
                          <td className="py-2 pr-4">{r.bmi?.toFixed(1)}</td>
                          <td className="py-2 capitalize">{r.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3">Recent Check-Ins</h3>
              {details.checkInHistory.length === 0 ? (
                <p className="text-muted text-sm">No check-ins</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-muted border-b"><th className="py-2 pr-4">Week</th><th className="py-2 pr-4">Weight</th><th className="py-2 pr-4">BMI</th><th className="py-2">Glucose</th></tr></thead>
                    <tbody>
                      {details.checkInHistory.map((r) => (
                        <tr key={r._id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{formatDate(r.weekStartDate)}</td>
                          <td className="py-2 pr-4">{r.weight} kg</td>
                          <td className="py-2 pr-4">{r.bmi?.toFixed(1)}</td>
                          <td className="py-2">{r.glucose} mg/dL</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    age: user.age || '',
    gender: user.gender || '',
    height: user.height || '',
    weight: user.weight || '',
    activityLevel: user.activityLevel || '',
    hasDiabetes: user.hasDiabetes,
    diabetesStatus: user.diabetesStatus,
    goal: user.goal,
    targetWeight: user.targetWeight || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      for (const key of ['age', 'height', 'weight', 'targetWeight']) {
        if (payload[key] === '') payload[key] = undefined;
      }
      await api.put(`/admin/users/${user._id}`, payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-2 border rounded-lg focus:ring-2 focus:ring-ring outline-none text-sm";
  const labelClass = "block text-muted mb-1 text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit User</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-alt" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className={labelClass}>Name</label><input name="name" value={form.name} onChange={handleChange} className={inputClass} required /></div>
          <div><label className={labelClass}>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Age</label><input name="age" type="number" value={form.age} onChange={handleChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Height (cm)</label><input name="height" type="number" value={form.height} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Weight (kg)</label><input name="weight" type="number" value={form.weight} onChange={handleChange} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Activity Level</label>
              <select name="activityLevel" value={form.activityLevel} onChange={handleChange} className={inputClass}>
                <option value="">Select</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Goal</label>
              <select name="goal" value={form.goal} onChange={handleChange} className={inputClass}>
                <option value="lose">Lose</option>
                <option value="gain">Gain</option>
                <option value="maintain">Maintain</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Diabetes Status</label>
            <select name="diabetesStatus" value={form.diabetesStatus} onChange={handleChange} className={inputClass}>
              <option value="No Diabetes">No Diabetes</option>
              <option value="Pre-Diabetic">Pre-Diabetic</option>
              <option value="Type 1 Diabetes">Type 1 Diabetes</option>
              <option value="Type 2 Diabetes">Type 2 Diabetes</option>
              <option value="Gestational Diabetes">Gestational Diabetes</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="hasDiabetes" name="hasDiabetes" type="checkbox" checked={form.hasDiabetes} onChange={handleChange} className="h-4 w-4 accent-brand" />
            <label htmlFor="hasDiabetes" className="text-sm">Has diabetes</label>
          </div>
          <div><label className={labelClass}>Target Weight (kg)</label><input name="targetWeight" type="number" value={form.targetWeight} onChange={handleChange} className={inputClass} /></div>
          <button type="submit" disabled={loading} className="w-full bg-brand text-brand-contrast p-2.5 rounded-lg hover:bg-brand-hover disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailUser, setDetailUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users', { params: { search: debouncedSearch, page, limit: 15 } })
      .then((res) => {
        setUsers(res.data.users);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, page]);

  const handleDelete = async (user) => {
    try {
      await api.delete(`/admin/users/${user._id}`);
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-brand">User Management</h1>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-ring outline-none w-full sm:w-72"
          />
        </div>
      </div>

      {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mb-6">{error}</div>}

      <div className="bg-surface rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>
        ) : users.length === 0 ? (
          <p className="text-muted text-center py-16">No users found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b bg-surface-alt">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Goal</th>
                    <th className="py-3 px-4">Diabetes</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b last:border-0 hover:bg-surface-alt/50">
                      <td className="py-3 px-4 font-medium whitespace-nowrap">{u.name}</td>
                      <td className="py-3 px-4 text-muted whitespace-nowrap">{u.email}</td>
                      <td className="py-3 px-4 capitalize whitespace-nowrap">{u.goal}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${u.hasDiabetes ? 'bg-danger-bg text-danger-strong' : 'bg-success-bg text-success'}`}>
                          {u.hasDiabetes ? u.diabetesStatus : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetailUser(u)} className="p-1.5 rounded hover:bg-surface-alt" title="View details" aria-label="View details">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditUser(u)} className="p-1.5 rounded hover:bg-surface-alt text-brand" title="Edit user" aria-label="Edit user">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(u)} className="p-1.5 rounded hover:bg-surface-alt text-danger" title="Delete user" aria-label="Delete user">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted">Page {page} of {pages} · {total} users</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded border hover:bg-surface-alt disabled:opacity-40" aria-label="Previous page">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 rounded border hover:bg-surface-alt disabled:opacity-40" aria-label="Next page">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={fetchUsers} />}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-surface rounded-xl shadow-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Delete User</h2>
            <p className="text-muted mb-6">
              Are you sure you want to permanently delete <span className="font-semibold text-foreground">{confirmDelete.name}</span> ({confirmDelete.email})? This will remove all their data.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg border hover:bg-surface-alt">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 rounded-lg bg-danger text-danger-bg font-semibold hover:bg-danger-strong hover:text-white transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}