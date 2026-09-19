import { api } from './client';

export const usersApi = {
  getMe: () => api.get('/users/me'),
  getMyBadges: () => api.get('/users/me/badges'),
};
