import api from './client';

export const reviewsAPI = {
  list: (groundId: string) => api.get('/reviews/', { params: { ground: groundId } }),
  create: (data: any) => api.post('/reviews/create/', data),
  update: (id: string, data: any) => api.patch(`/reviews/${id}/`, data),
  delete: (id: string) => api.delete(`/reviews/${id}/delete/`),
  reply: (id: string, reply: string) => api.post(`/reviews/${id}/reply/`, { reply }),
};
