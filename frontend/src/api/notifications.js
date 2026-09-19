import { api } from './client';

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`, {}),
};
