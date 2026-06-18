import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Inventory
export const getInventory = () => API.get('/inventory');
export const getInventoryById = (id) => API.get(`/inventory/${id}`);
export const createInventory = (data) => API.post('/inventory', data);
export const updateInventory = (id, data) => API.put(`/inventory/${id}`, data);
export const deleteInventory = (id) => API.delete(`/inventory/${id}`);
export const bulkInsertInventory = (items) => API.post('/inventory/bulk', { items });
export const checkStockForDate = (date) => API.get(`/inventory/check-stock?date=${date}`);

// Bookings
export const getBookings = (params) => API.get('/bookings', { params });
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const checkAvailability = (data) => API.post('/bookings/check-availability', data);
export const createBooking = (data) => API.post('/bookings', data);
export const updateBooking = (id, data) => API.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);
export const updateReturn = (id, data) => API.put(`/bookings/${id}/return`, data);

// Dashboard
export const getDashboardStats = () => API.get('/dashboard/stats');
export const getDateUtilization = (params) => API.get('/dashboard/utilization', { params });
export const getShopInfo = () => API.get('/dashboard/shop-info');

// PDF
export const downloadPDF = (bookingId) => `${API.defaults.baseURL}/pdf/download/${bookingId}`;