const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('store_portal_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Auto-clear invalid or expired session
      localStorage.removeItem('store_portal_token');
      localStorage.removeItem('store_portal_user');
      window.dispatchEvent(new Event('auth-session-expired'));
    }

    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    error.data = data;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};
