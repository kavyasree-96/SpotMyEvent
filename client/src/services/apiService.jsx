import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchTrendingEvents = async () => {
  const response = await api.get('/trending-events');
  return response.data;
};

export const fetchAiRecommendations = async (interest, city = 'Bangalore') => {
  const response = await api.post('/ai-recommendations', { interest, city });
  return response.data;
};

export default api;