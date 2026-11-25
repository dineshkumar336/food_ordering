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
export const recoverAccount = (data) => API.post('/auth/recover', data);
export const mfaSetup = () => API.post('/auth/mfa/setup');
export const mfaEnable = (data) => API.post('/auth/mfa/enable', data);
export const mfaDisable = (data) => API.post('/auth/mfa/disable', data);
export const changePassword = (data) => API.put('/auth/password', data);
export const getActivity = () => API.get('/auth/activity');
// Revokes the token on the server. The token is passed in explicitly because the caller clears localStorage right after.
export const logoutUser = (token) => API.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } });

// Restaurants
export const getAllRestaurants = (params) => API.get('/restaurants', { params });
export const getRestaurantById = (id) => API.get(`/restaurants/${id}`);
export const getMyRestaurant = () => API.get('/restaurants/my');
export const updateRestaurant = (data) => API.put('/restaurants/update', data);

// Menu
export const getAllMenuItems = () => API.get('/menu/all');
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


export default API;
