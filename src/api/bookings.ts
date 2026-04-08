import api from './client';

export const bookingsAPI = {
  // Slots
  listSlots: (groundId: string, date: string) =>
    api.get('/bookings/slots/', { params: { ground: groundId, date } }),
  createSlots: (data: any) => api.post('/bookings/slots/create/', data),
  updateSlot: (id: string, data: any) => api.patch(`/bookings/slots/${id}/`, data),
  deleteSlot: (id: string) => api.delete(`/bookings/slots/${id}/delete/`),

  // Bookings
  list: () => api.get('/bookings/'),
  create: (data: any) => api.post('/bookings/', data),
  detail: (id: string) => api.get(`/bookings/${id}/`),
  cancel: (id: string, reason?: string) =>
    api.patch(`/bookings/${id}/cancel/`, { reason }),
  confirm: (id: string) => api.patch(`/bookings/${id}/confirm/`),
  complete: (id: string) => api.patch(`/bookings/${id}/complete/`),
  adminBookings: (params?: any) =>
    api.get('/bookings/admin-bookings/', { params }),

  // Payment
  recordPayment: (bookingId: string, data: any) => 
    api.post(`/bookings/${bookingId}/payment/`, data),
};
