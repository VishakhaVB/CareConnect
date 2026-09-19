import { api } from './client';

export const reviewsApi = {
  create: (orphanageId, data) => api.post(`/orphanages/${orphanageId}/reviews`, data),
  listByOrphanage: (orphanageId) => api.get(`/orphanages/${orphanageId}/reviews`),
};
