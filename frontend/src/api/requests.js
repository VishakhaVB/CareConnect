import { api } from './client';

export const requestsApi = {
  create: (data) => api.post('/requests', data),
  list: ({ status, orphanageId } = {}) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (orphanageId) params.append('orphanage_id', orphanageId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/requests${query}`);
  },
  getMyRequests: () => api.get('/requests/my'),
  getById: (id) => api.get(`/requests/${id}`),
  update: (id, data) => api.put(`/requests/${id}`, data),
  delete: (id) => api.delete(`/requests/${id}`),
};
