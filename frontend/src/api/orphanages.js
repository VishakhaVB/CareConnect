import { api } from './client';

export const orphanagesApi = {
  create: (data) => api.post('/orphanages', data),
  list: (verificationStatus) => {
    const query = verificationStatus ? `?verification_status=${encodeURIComponent(verificationStatus)}` : '';
    return api.get(`/orphanages${query}`);
  },
  getMyOrphanage: () => api.get('/orphanages/me'),
  updateMyOrphanage: (data) => api.put('/orphanages/me', data),
  getById: (id) => api.get(`/orphanages/${id}`),
};
