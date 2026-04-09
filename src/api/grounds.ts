import api from './client';

export const groundsAPI = {
  // Public
  list: (params?: any) => api.get('/grounds/', { params }),
  detail: (id: string) => api.get(`/grounds/${id}/`),
  amenities: () => api.get('/grounds/amenities/'),

  // Admin only
  create: (data: any) => api.post('/grounds/', data),
  update: (id: string, data: any) => api.patch(`/grounds/${id}/`, data),
  delete: (id: string) => api.delete(`/grounds/${id}/`),
  myGrounds: () => api.get('/grounds/my-grounds/'),

  // Images (multipart)
  uploadImages: (groundId: string, formData: FormData) => {
    return api.post(`/grounds/${groundId}/images/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteImage: (groundId: string, imageId: string) =>
    api.delete(`/grounds/${groundId}/images/${imageId}/`),

  // Pricing
  listPricing: (groundId: string) => api.get(`/grounds/${groundId}/pricing/`),
  addPricing: (groundId: string, data: any) =>
    api.post(`/grounds/${groundId}/pricing/`, data),
  updatePricing: (groundId: string, planId: string, data: any) =>
    api.patch(`/grounds/${groundId}/pricing/${planId}/`, data),
  deletePricing: (groundId: string, planId: string) =>
    api.delete(`/grounds/${groundId}/pricing/${planId}/`),

  // Favorites
  listFavorites: () => api.get('/grounds/favorites/'),
  addFavorite: (groundId: string) =>
    api.post('/grounds/favorites/', { ground_id: groundId }),
  removeFavorite: (favId: string) => api.delete(`/grounds/favorites/${favId}/`),
};
