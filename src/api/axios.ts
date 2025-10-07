/* eslint-disable prettier/prettier */
import axios from 'axios';
import { useUserStore } from '@/store';

const api = axios.create({});

api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.getAccessToken;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
