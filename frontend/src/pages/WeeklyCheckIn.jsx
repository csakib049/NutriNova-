import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function WeeklyCheckIn() {
  const [weight, setWeight] = useState('');
  const [glucose, setGlucose] = useState('');
  const [diabetesStatus, setDiabetesStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [checkIns, setCheckIns] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const res = await api.post('/checkins/weekly', { weight: Number(weight), glucose: Number(glucose), diabetesStatus, notes });
      setSuccess('Check-in submitted!');
      setLatest(res.data.checkIn);
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
      <h1 className="text-3xl font-bold text-green-800 mb-8">Weekly Check-In</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Submit Weekly Stats</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Glucose Level (mg/dL)</label>
              <input type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)} required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Diabetes Status</label>
              <input type="text" value={diabetesStatus} onChange={(e) => setDiabetesStatus(e.target.value)}
                placeholder="e.g., well-managed, elevated" className="w-full p-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full p-3 border rounded-lg" placeholder="How was your week?"></textarea>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Check-In'}
            </button>
          </form>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mt-3">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded mt-3">{success}</div>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Latest Check-In</h2>
          {latest ? (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded text-center">
                  <div className="text-lg font-bold">{latest.weight} kg</div>
                  <div className="text-xs text-gray-500">Weight</div>
                  <span className={`text-xs ${latest.trend?.weight === 'improved' ? 'text-green-600' : latest.trend?.weight === 'worsened' ? 'text-red-600' : 'text-gray-400'}`}>
                    {latest.trend?.weight}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded text-center">
                  <div className="text-lg font-bold">{latest.bmi}</div>
                  <div className="text-xs text-gray-500">BMI</div>
                  <span className={`text-xs ${latest.trend?.bmi === 'improved' ? 'text-green-600' : latest.trend?.bmi === 'worsened' ? 'text-red-600' : 'text-gray-400'}`}>
                    {latest.trend?.bmi}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded text-center">
                  <div className="text-lg font-bold">{latest.glucose}</div>
                  <div className="text-xs text-gray-500">Glucose</div>
                  <span className={`text-xs ${latest.trend?.glucose === 'improved' ? 'text-green-600' : latest.trend?.glucose === 'worsened' ? 'text-red-600' : 'text-gray-400'}`}>
                    {latest.trend?.glucose}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded text-center">
                  <div className="text-lg font-bold">{new Date(latest.weekStartDate).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500">Week</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No check-ins yet.</p>
          )}
        </div>
      </div>

      {checkIns.length > 1 && (
        <div className="bg-white p-6 rounded-xl shadow-md mt-8">
          <h2 className="text-xl font-semibold mb-4">History</h2>
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
                    <td className="p-2">{ci.glucose}</td>
                    <td className="p-2">
                      <span className={ci.trend?.weight === 'improved' ? 'text-green-600' : ci.trend?.weight === 'worsened' ? 'text-red-600' : 'text-gray-400'}>
                        {ci.trend?.weight}
                      </span>
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
