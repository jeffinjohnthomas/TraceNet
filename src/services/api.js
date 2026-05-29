import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor to attach JWT Token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cis_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle expired tokens and generic auth failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cis_token');
      localStorage.removeItem('cis_role');
      window.location.href = '/'; // Trigger react-router to kick to basic login
    }
    return Promise.reject(error);
  }
);

export default api;
