import { useEffect, useState } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import AdminLayout from './AdminLayout';

const ACTION_LABELS = {
  update_user: 'Updated User',
  delete_user: 'Deleted User',
  login: 'Admin Login',
};

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/admin/logs', { params: { page, limit: 25 } })
      .then((res) => {
        setLogs(res.data.logs);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load logs'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-brand mb-2">Audit Logs</h1>
      <p className="text-muted mb-6">Record of all administrative actions</p>
      {error && <div className="bg-danger-bg text-danger-strong p-3 rounded mb-6">{error}</div>}

      <div className="bg-surface rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-muted" />
            <p className="text-muted">No admin actions recorded yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b bg-surface-alt">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target</th>
                    <th className="py-3 px-4">Admin</th>
                    <th className="py-3 px-4">IP</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b last:border-0 align-top">
                      <td className="py-3 px-4 whitespace-nowrap text-muted">{formatDateTime(log.createdAt)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.action === 'delete_user' ? 'bg-danger-bg text-danger-strong' : 'bg-success-bg text-success'}`}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        {log.action === 'update_user' || log.action === 'delete_user' ? (
                          <div>
                            <span className="font-medium">{log.details?.name || log.details?.after?.name || '—'}</span>
                            <span className="block text-muted text-xs">{log.details?.email || log.details?.after?.email}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{log.adminId?.username || 'admin'}</td>
                      <td className="py-3 px-4 text-muted whitespace-nowrap">{log.ip || '—'}</td>
                      <td className="py-3 px-4 text-muted max-w-xs">
                        {log.action === 'update_user' && (
                          <span className="text-xs">
                            Updated name/email from <span className="font-medium">{log.details?.before?.name}</span> → <span className="font-medium">{log.details?.after?.name}</span>
                          </span>
                        )}
                        {log.action === 'delete_user' && (
                          <span className="text-xs">Permanently removed user account and all related data</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted">Page {page} of {pages} · {total} entries</p>
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
    </AdminLayout>
  );
}