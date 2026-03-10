import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && token.trim() !== '' && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token.trim()}`;
    console.log('Sending token:', token.substring(0, 30) + '...');
  } else {
    console.warn('No valid token found in localStorage');
  }
  return config;
});

// Auth APIs
export const authAPI = {
  sendOtp: (mobile, name, email) =>
    api.post('/auth/send-otp', { mobile, name, email }),

  verifyOtp: (mobile, otp) =>
    api.post('/auth/verify-otp', { mobile, otp }),

  adminLogin: (mobile, password) =>
    api.post('/auth/admin-login', { mobile, password }),
};

// Booking APIs
export const bookingAPI = {
  getBookedDates: () =>
    api.get('/bookings/booked-dates'),

  createBooking: (data) =>
    api.post('/bookings', data),

  getMyBookings: () =>
    api.get('/bookings/my'),

  getBookingById: (id) =>
    api.get(`/bookings/${id}`),

  getAllBookings: () =>
    api.get('/bookings/all'),
};

export default api;