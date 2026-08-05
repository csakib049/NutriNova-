import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CalendarCheck, ClipboardCheck, Activity, ListTodo } from 'lucide-react';
import api from '../api/axios';

function TrendLabel({ status }) {
  const reduce = useReducedMotion();
  if (!status) return null;
  const colorClass = status === 'improved' ? 'text-success' : status === 'worsened' ? 'text-danger' : 'text-muted';
  return (
    <motion.span
      className={`text-xs font-medium ${colorClass}`}
      initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
      animate={{ opacity: 1, scale: reduce ? 1 : [0.6, 1.12, 1] }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {status}
    </motion.span>
  );
}

export default function WeeklyCheckIn() {
  const [weight, setWeight] = useState('');
  const [glucose, setGlucose] = useState('');
  const [diabetesStatus, setDiabetesStatus] = useState('No Diabetes');
  const [notes, setNotes] = useState('');
  const [checkIns, setCheckIns] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCheck, setShowCheck] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const reduce = useReducedMotion();
  const checkTimer = useRef(null);

  useEffect(() => () => clearTimeout(checkTimer.current), []);

  useEffect(() => {
    api.get('/checkins/history').then((res) => {
      setCheckIns(res.data.checkIns);
      if (res.data.checkIns.length > 0) setLatest(res.data.checkIns[0]);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/checkins/weekly', {
        weight: Number(weight),
        glucose: glucose ? Number(glucose) : null,
        diabetesStatus,
        notes,
      });
      setSuccess('Check-in submitted!');
      setLatest(res.data.checkIn);
      setRefreshKey((k) => k + 1);
      setShowCheck(true);
      checkTimer.current = setTimeout(() => setShowCheck(false), 1600);
      const histRes = await api.get('/checkins/history');
      setCheckIns(histRes.data.checkIns);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <CalendarCheck className="h-7 w-7 text-brand" />
        <h1 className="text-3xl font-bold text-brand">Weekly Check-In</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Submit Weekly Stats</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-muted mb-1">Weight (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" />
            </div>
            <div>
              <label className="block text-muted mb-1">Glucose Level (mg/dL)</label>
              <input type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-muted mb-1">Diabetes Status</label>
              <select value={diabetesStatus} onChange={(e) => setDiabetesStatus(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none">
                <option value="No Diabetes">No Diabetes</option>
                <option value="Pre-Diabetic">Pre-Diabetic</option>
                <option value="Type 1 Diabetes">Type 1 Diabetes</option>
                <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                <option value="Gestational Diabetes">Gestational Diabetes</option>
              </select>
            </div>
            <div>
              <label className="block text-muted mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full p-3 border rounded-lg" placeholder="How was your week?"></textarea>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-brand text-brand-contrast p-3 rounded-lg hover:bg-brand-hover disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Submitting...
                </>
              ) : showCheck ? (
                <motion.span
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <span className="text-lg leading-none">✓</span> Submitted!
                </motion.span>
              ) : (
                'Submit Check-In'
              )}
            </button>
          </form>
          {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mt-3">{error}</div>}
          {success && <div className="bg-success-bg text-success-strong p-3 rounded mt-3">{success}</div>}
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Latest Check-In</h2>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {latest ? (
              <motion.div
                key={`latest-${refreshKey}`}
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-surface-alt rounded text-center">
                    <div className="text-lg font-bold">{latest.weight} kg</div>
                    <div className="text-xs text-muted">Weight</div>
                    <TrendLabel status={latest.trend?.weight} />
                  </div>
                  <div className="p-3 bg-surface-alt rounded text-center">
                    <div className="text-lg font-bold">{latest.bmi}</div>
                    <div className="text-xs text-muted">BMI</div>
                    <TrendLabel status={latest.trend?.bmi} />
                  </div>
                  <div className="p-3 bg-surface-alt rounded text-center">
                    <div className="text-lg font-bold">{latest.glucose ?? '—'}</div>
                    <div className="text-xs text-muted">Glucose</div>
                    <TrendLabel status={latest.trend?.glucose} />
                  </div>
                  <div className="p-3 bg-surface-alt rounded text-center">
                    <div className="text-lg font-bold">{new Date(latest.weekStartDate).toLocaleDateString()}</div>
                    <div className="text-xs text-muted">Week</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted">No check-ins yet.</motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {checkIns.length > 1 && (
        <div className="bg-surface p-6 rounded-xl shadow-md mt-8">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Week</th>
                  <th className="text-left p-2">Weight</th>
                  <th className="text-left p-2">BMI</th>
                  <th className="text-left p-2">Glucose</th>
                  <th className="text-left p-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {checkIns.map((ci) => (
                  <tr key={ci._id} className="border-b">
                    <td className="p-2">{new Date(ci.weekStartDate).toLocaleDateString()}</td>
                    <td className="p-2">{ci.weight}</td>
                    <td className="p-2">{ci.bmi}</td>
                    <td className="p-2">{ci.glucose ?? '—'}</td>
                    <td className="p-2">
                      <TrendLabel status={ci.trend?.weight} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
