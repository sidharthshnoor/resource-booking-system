// Mock data mechanism can be replaced with real backend URL
const API_BASE_URL = '/api';

/**
 * Helper to handle fetch responses and throw errors properly
 */
export async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText;
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch (e) {
      // Not JSON
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  
  if (response.status === 204) {
    return null; // No content
  }
  
  return response.json();
}

/**
 * Standard fetch with authorization header if token exists
 */
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('rbs_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  return handleResponse(response);
}

export default {
  get: (url) => fetchWithAuth(url, { method: 'GET' }),
  post: (url, data) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => fetchWithAuth(url, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (url, data) => fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url) => fetchWithAuth(url, { method: 'DELETE' }),
};
