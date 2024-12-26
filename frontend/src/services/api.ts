import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (username: string, password: string) => {
    try {
      // Convert credentials to URLSearchParams
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post('/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Login response:', response.data); // Debug log
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        return response.data;
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Login request error:', error); // Debug log
      throw error;
    }
  },
  
  signup: async (email: string, username: string, password: string) => {
    return await api.post('/signup', { email, username, password });
  },
  
  logout: () => {
    localStorage.removeItem('token');
  }
};

export const diaryApi = {
  createEntry: async (date: string, content: string) => {
    return await api.post('/entries/', { date, content });
  },
  
  getEntries: async () => {
    return await api.get('/entries/');
  },
  
  getEntryByDate: async (date: string) => {
    return await api.get(`/entries/${date}`);
  },
  
  deleteEntry: async (date: string) => {
    return await api.delete(`/entries/${date}`);
  }
};

export default api; 