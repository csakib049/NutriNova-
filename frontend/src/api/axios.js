import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? 'https://nutrinova-backend.onrender.com/api' : '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const isAdminPath = config.url?.startsWith('/admin');
  const token = isAdminPath
    ? localStorage.getItem('adminToken')
    : localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminPath = error.config?.url?.startsWith('/admin');
      if (isAdminPath) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;