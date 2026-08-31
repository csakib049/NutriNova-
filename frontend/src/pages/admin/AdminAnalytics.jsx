import { useEffect, useState } from 'react';
import { BarChart3, CircleGauge, HeartPulse, TrendingUp, Flame, FileDown } from 'lucide-react';
import api from '../../api/axios';
import AdminLayout from './AdminLayout';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/analytics')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;
  }

  const aviLabel = {
    sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active', very_active: 'Very Active',
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-brand mb-6">Analytics & Reports</h1>
      {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mb-6">{error}</div>}

      {data && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                <h3 className="text-muted text-sm uppercase">Monthly Signups</h3>
              </div>
              <p className="text-3xl font-bold">{data.monthlySignups.reduce((s, m) => s + m.count, 0)}</p>
              <p className="text-muted text-sm">in the last 3 months</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <CircleGauge className="h-4 w-4 text-brand" />
                <h3 className="text-muted text-sm uppercase">Average BMI</h3>
              </div>
              <p className="text-3xl font-bold">{data.avgBmi.avgBmi ? data.avgBmi.avgBmi.toFixed(1) : 'N/A'}</p>
              <p className="text-muted text-sm">across {data.avgBmi.count} records</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-brand" />
                <h3 className="text-muted text-sm uppercase">Avg Daily Calories</h3>
              </div>
              <p className="text-3xl font-bold">{data.avgCaloriesPerDay ? Math.round(data.avgCaloriesPerDay) : 'N/A'}</p>
              <p className="text-muted text-sm">kcal / logged day</p>
            </div>
            <div className="bg-surface p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <HeartPulse className="h-4 w-4 text-brand" />
                <h3 className="text-muted text-sm uppercase">Top Goal</h3>
              </div>
              <p className="text-3xl font-bold">Lose</p>
              <p className="text-muted text-sm">most common user goal</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-brand" /> Signups by Month</h2>
              {data.monthlySignups.length === 0 ? (
                <p className="text-muted text-sm">No data yet</p>
              ) : (
                <div className="flex items-end gap-4 h-52">
                  {data.monthlySignups.map((m) => {
                    const max = Math.max(...data.monthlySignups.map((x) => x.count));
                    return (
                      <div key={`${m._id.year}-${m._id.month}`} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold">{m.count}</span>
                        <div className="w-full bg-brand rounded-t-lg"
                          style={{ height: `${(m.count / max) * 100}%`, transition: 'height 0.6s' }}></div>
                        <span className="text-xs text-muted">{MONTHS[m._id.month - 1]} {m._id.year % 100}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-surface p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CircleGauge className="h-5 w-5 text-brand" /> BMI Categories</h2>
              {data.bmiCategoryDistribution.length === 0 ? (
                <p className="text-muted text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {data.bmiCategoryDistribution.map((c) => {
                    const total = data.bmiCategoryDistribution.reduce((s, x) => s + x.count, 0);
                    return (
                      <div key={c._id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{c._id}</span>
                          <span className="text-muted">{((c.count / total) * 100).toFixed(0)}% · {c.count}</span>
                        </div>
                        <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{ width: `${(c.count / total) * 100}%`, transition: 'width 0.6s' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Activity Level Distribution</h2>
              {data.activityLevelDistribution.length === 0 ? (
                <p className="text-muted text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {data.activityLevelDistribution.map((a) => {
                    const total = data.activityLevelDistribution.reduce((s, x) => s + x.count, 0);
                    return (
                      <div key={a._id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{aviLabel[a._id] || a._id}</span>
                          <span className="text-muted">{a.count}</span>
                        </div>
                        <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{ width: `${(a.count / total) * 100}%`, transition: 'width 0.6s' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-surface p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileDown className="h-5 w-5 text-brand" /> Most Logged Foods</h2>
              {data.topFoods.length === 0 ? (
                <p className="text-muted text-sm">No food logs yet</p>
              ) : (
                <ol className="space-y-2">
                  {data.topFoods.map((f, i) => (
                    <li key={f._id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-brand-soft text-brand text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                        <span className="truncate">{f._id}</span>
                      </span>
                      <span className="text-muted shrink-0 ml-2">{f.count}× logged</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}