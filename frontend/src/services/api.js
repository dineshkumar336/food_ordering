import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Restaurants
export const getAllRestaurants = (params) => API.get('/restaurants', { params });
export const getRestaurantById = (id) => API.get(`/restaurants/${id}`);
export const getMyRestaurant = () => API.get('/restaurants/my');
export const updateRestaurant = (data) => API.put('/restaurants/update', data);

// Menu
export const getMenuByRestaurant = (restaurantId) => API.get(`/menu/restaurant/${restaurantId}`);
export const addMenuItem = (data) => API.post('/menu', data);
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getUserOrders = () => API.get('/orders/my');
export const getRestaurantOrders = (params) => API.get('/orders/restaurant', { params });
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);

// Delivery
export const getAvailableOrders = () => API.get('/delivery/available');
export const acceptDeliveryOrder = (id) => API.post(`/delivery/accept/${id}`);
export const getMyDeliveries = (params) => API.get('/delivery/my', { params });
export const updateDeliveryStatus = (id, status) => API.put(`/delivery/${id}/status`, { status });
export const toggleAvailability = () => API.put('/delivery/toggle-availability');
export const getAvailableDeliveryBoys = () => API.get('/delivery/available-boys');
export const assignDeliveryBoy = (orderId, deliveryBoyId) => API.post(`/delivery/assign/${orderId}`, { deliveryBoyId });
export const confirmOrderPickup = (id) => API.post(`/delivery/pickup/${id}`);

export default API;
