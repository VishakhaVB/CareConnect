import { api } from './client';

export const volunteersApi = {
  createProfile: (data) => api.post('/volunteers', data),
  getMyProfile: () => api.get('/volunteers/me'),
  updateMyProfile: (data) => api.put('/volunteers/me', data),
};
