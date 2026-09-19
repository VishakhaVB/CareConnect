import { api } from './client';

export const impactStoriesApi = {
  create: (data) => api.post('/impact-stories', data),
  list: (orphanageId) => {
    const query = orphanageId ? `?orphanage_id=${orphanageId}` : '';
    return api.get(`/impact-stories${query}`);
  },
  getById: (id) => api.get(`/impact-stories/${id}`),
  update: (id, data) => api.put(`/impact-stories/${id}`, data),
  delete: (id) => api.delete(`/impact-stories/${id}`),
};
