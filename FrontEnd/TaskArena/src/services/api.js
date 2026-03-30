import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Converts a relative /api/upload/xxx path to an absolute URL for use in <img src>
export const getImageUrl = (url) => {
  if (!url || url.startsWith('http') || url.startsWith('blob:')) return url;
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return url; // local dev — relative URL works fine
  // base = "https://backend.com/api" → origin = "https://backend.com"
  return base.replace(/\/$/, '').replace(/\/api$/, '') + url;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
