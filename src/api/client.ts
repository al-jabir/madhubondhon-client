import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 45000, headers: { 'Content-Type': 'application/json' } });
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
let refreshPending: Promise<string> | null = null;
function clearSession() {
  localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user');
}
async function refreshSession() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  const response = await axios.post(API_BASE_URL + '/auth/refresh', { refreshToken }, { timeout: 45000 });
  const { accessToken, refreshToken: nextRefreshToken } = response.data.data || {};
  if (!accessToken || !nextRefreshToken) throw new Error('Invalid token response');
  localStorage.setItem('accessToken', accessToken); localStorage.setItem('refreshToken', nextRefreshToken);
  return accessToken as string;
}
apiClient.interceptors.response.use(response => response, async error => {
  const original = error.config;
  // Bad credentials must reach the login form, even when an old session exists.
  const publicAuth = /\/auth\/(login|register|refresh|forgot-password|reset-password)(?:[?#]|$)/.test(original?.url || '');
  if (error.response?.status !== 401 || !original || original._retry || publicAuth) return Promise.reject(error);
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return Promise.reject(error);
  original._retry = true;
  try {
    const current = localStorage.getItem('accessToken');
    if (current && original.headers?.Authorization !== 'Bearer ' + current) {
      original.headers.Authorization = 'Bearer ' + current;
      return apiClient(original);
    }
    if (!refreshPending) refreshPending = refreshSession().finally(() => { refreshPending = null; });
    const token = await refreshPending;
    original.headers.Authorization = 'Bearer ' + token;
    return apiClient(original);
  } catch (refreshError) {
    // A stopped local server is recoverable: keep the saved session for a restart.
    if (!axios.isAxiosError(refreshError) || [400,401,403].includes(refreshError.response?.status || 0)) {
      clearSession();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') window.location.assign('/login');
    }
    return Promise.reject(refreshError);
  }
});
export default apiClient;
