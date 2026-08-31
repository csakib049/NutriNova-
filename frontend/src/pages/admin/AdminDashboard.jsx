import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, CalendarClock, Activity, ClipboardList } from 'lucide-react';
import api from '../../api/axios';
import AdminLayout from './AdminLayout';
import { useAnimVariants } from '../../lib/motion';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, sub, delay, colors = 'bg-surface' }) {
  const { fadeUp } = useAnimVariants();
  return (
    <motion.div variants={fadeUp} custom={delay} className={`${colors} p-6 rounded-xl shadow-md`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-brand" />
        <h3 className="text-muted text-sm uppercase">{label}</h3>
      </div>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-muted text-sm mt-1">{sub}</p>}
    </motion.div>
  );
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const [countUsers, setCountUsers] = useState(0);
  useEffect(() => {
    let n = 0;
    if (!stats) return;
    const interval = setInterval(() => {
      n = Math.min(n + Math.ceil(stats.totalUsers / 30), stats.totalUsers);
      setCountUsers(n);
      if (n >= stats.totalUsers) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [stats]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-brand mb-6">Admin Dashboard</h1>
      {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mb-6">{error}</div>}

      {stats && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} label="Total Users" value={countUsers} sub={`${stats.totalFoodLogs} total food logs`} />
            <StatCard icon={UserPlus} label="New Users (7d)" value={stats.newUsersWeek} sub={`${stats.newUsersToday} today · ${stats.newUsersMonth} this month`} />
            <StatCard icon={ClipboardList} label="Total Check-Ins" value={stats.totalCheckIns} />
            <StatCard icon={Activity} label="BMI Records" value={stats.totalBmiRecords} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-brand" /> Gender Distribution</h2>
              {stats.genderDistribution.length === 0 ? (
                <p className="text-muted text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.genderDistribution.map((d) => (
                    <div key={d._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{d._id || 'Unspecified'}</span>
                        <span className="text-muted">{d.count}</span>
                      </div>
                      <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full"
                          style={{ width: `${(d.count / stats.totalUsers) * 100}%`, transition: 'width 0.6s' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CalendarClock className="h-5 w-5 text-brand" /> Signups (Last 7 Days)</h2>
              {stats.dailySignups.length === 0 ? (
                <p className="text-muted text-sm">No signups in the last week</p>
              ) : (
                <div className="flex items-end gap-2 h-40">
                  {stats.dailySignups.map((d) => (
                    <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold">{d.count}</span>
                      <div className="w-full bg-brand rounded-t-lg"
                        style={{ height: `${Math.max((d.count / Math.max(...stats.dailySignups.map((x) => x.count))) * 100, 4)}%`, minHeight: '6px', transition: 'height 0.6s' }}></div>
                      <span className="text-xs text-muted">{d._id.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2"><UserPlus className="h-5 w-5 text-brand" /> Recent Users</h2>
              <Link to="/admin/users" className="text-brand hover:underline text-sm">View all users →</Link>
            </div>
            {stats.recentUsers.length === 0 ? (
              <p className="text-muted text-sm">No users registered yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Goal</th>
                      <th className="py-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((u) => (
                      <tr key={u._id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{u.name}</td>
                        <td className="py-2 pr-4 text-muted">{u.email}</td>
                        <td className="py-2 pr-4 capitalize">{u.goal}</td>
                        <td className="py-2 text-muted">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}