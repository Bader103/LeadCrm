import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to attach the token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle rate limiting with exponential backoff
let retryCount = 0;

API.interceptors.response.use(
  (response) => {
    retryCount = 0; // Reset on success
    return response;
  },
  (error) => {
    const { config, response } = error;

    // Handle rate limiting (429) with exponential backoff
    if (response?.status === 429 && retryCount < 3) {
      retryCount++;
      const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(API(config));
        }, delay);
      });
    }

    // Properly format error response for consistent handling
    if (response?.data) {
      error.response.data.message = response.data.message || 'An error occurred';
    }

    return Promise.reject(error);
  }
);

export default API;
