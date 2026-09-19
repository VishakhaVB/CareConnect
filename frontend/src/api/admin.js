import { api } from './client';

export const adminApi = {
  getStatistics: () => api.get('/admin/statistics'),
  getUsers: () => api.get('/admin/users'),
  getOrphanages: () => api.get('/admin/orphanages'),
  verifyOrphanage: (id) => api.put(`/admin/orphanages/${id}/verify`, {}),
  rejectOrphanage: (id) => api.put(`/admin/orphanages/${id}/reject`, {}),
  getDonations: () => api.get('/admin/donations'),
  getRequests: () => api.get('/admin/requests'),
  getVolunteers: () => api.get('/admin/volunteers'),
  getEvents: () => api.get('/admin/events'),
  getReviews: () => api.get('/admin/reviews'),
  getImpactStories: () => api.get('/admin/impact-stories'),
  createBadge: (data) => api.post('/admin/badges', data),
  updateBadge: (id, data) => api.put(`/admin/badges/${id}`, data),
  deleteBadge: (id) => api.delete(`/admin/badges/${id}`),
  awardBadge: (badgeId, userId) => api.post(`/admin/badges/${badgeId}/award/${userId}`, {}),
};
