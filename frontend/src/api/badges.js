import { api } from './client';

export const badgesApi = {
  list: () => api.get('/badges'),
};
