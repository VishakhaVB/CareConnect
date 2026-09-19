import { api } from './client';

export const donationsApi = {
  create: (data) => api.post('/donations', data),
  getMyDonations: () => api.get('/donations/my'),
  getReceivedDonations: () => api.get('/donations/received'),
  getById: (id) => api.get(`/donations/${id}`),
  getReceipt: (id) => api.get(`/donations/${id}/receipt`),
};
