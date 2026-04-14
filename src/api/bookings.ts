import api from './client';

export const bookingsAPI = {
  // Slots
  listSlots: (groundId: string, date: string, bookableOnly?: boolean) =>
    api.get('/bookings/slots/', {
      params: {
        ground: groundId,
        date,
        ...(bookableOnly !== undefined ? { bookable_only: bookableOnly } : {}),
      },
    }),
  createSlots: (data: any) => api.post('/bookings/slots/create/', data),
  updateSlot: (id: string, data: any) => api.patch(`/bookings/slots/${id}/`, data),
  deleteSlot: (id: string) => api.delete(`/bookings/slots/${id}/delete/`),

  // Bookings
  list: (params?: any) => api.get('/bookings/', { params }),
  create: (data: any) => api.post('/bookings/', data),
  detail: (id: string) => api.get(`/bookings/${id}/`),
  cancel: (id: string, reason?: string) =>
    api.patch(`/bookings/${id}/cancel/`, { reason }),
  confirm: (id: string) => api.patch(`/bookings/${id}/confirm/`),
  complete: (id: string) => api.patch(`/bookings/${id}/complete/`),
  adminBookings: (params?: any) =>
    api.get('/bookings/admin-bookings/', { params }),

  // Payment
  createPaymentOrder: (bookingId: string, data?: any) =>
    api.post(`/bookings/${bookingId}/payment-order/`, data),
  createUpiIntent: (bookingId: string, data?: any) =>
    api.post(`/bookings/${bookingId}/upi-intent/`, data),
  verifyPayment: (bookingId: string, data: any) =>
    api.post(`/bookings/${bookingId}/payment-verify/`, data),
  recordPayment: (bookingId: string, data: any) =>
    api.post(`/bookings/${bookingId}/payment/`, data),
};
