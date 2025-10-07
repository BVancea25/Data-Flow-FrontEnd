/* eslint-disable prettier/prettier */
import axios from 'axios';
import { getKeycloak } from '@/security/keycloak';

const api = axios.create({});

api.interceptors.request.use(
  (config) => {
    const kc = getKeycloak();
    if (kc && kc.token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${kc.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
