import { api } from './client';

export const eventsApi = {
  create: (data) => api.post('/events', data),
  list: ({ status, orphanageId } = {}) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (orphanageId) params.append('orphanage_id', orphanageId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/events${query}`);
  },
  getMyParticipations: () => api.get('/events/my/participations'),
  getById: (id) => api.get(`/events/${id}`),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  participate: (id) => api.post(`/events/${id}/participate`, {}),
  cancelParticipation: (id) => api.delete(`/events/${id}/participate`),
};
