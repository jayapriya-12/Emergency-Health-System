import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('emergency_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login check failure, just clear invalid token
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('emergency_token');
        localStorage.removeItem('emergency_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const patientAPI = {
  getNearbyHospitals: (params) => api.get('/patient/hospitals', { params }),
  getHospitalById: (id) => api.get(`/patient/hospitals/${id}`),
  getAvailableAmbulances: (params) => api.get('/patient/ambulances', { params }),
  createSOSRequest: (data) => api.post('/patient/emergency-request', data),
  getActiveRequest: () => api.get('/patient/active-request'),
  getRequestHistory: () => api.get('/patient/request-history'),
  updateProfile: (data) => api.put('/patient/profile', data),
};

export const hospitalAPI = {
  getDashboard: () => api.get('/hospital/dashboard'),
  getRequests: () => api.get('/hospital/requests'),
  respondToRequest: (id, data) => api.put(`/hospital/requests/${id}/respond`, data),
  updateAvailability: (data) => api.put('/hospital/availability', data),
  addAmbulance: (data) => api.post('/hospital/ambulances', data),
};

export const driverAPI = {
  getDashboard: () => api.get('/driver/dashboard'),
  updateStatus: (status) => api.put('/driver/status', { status }),
  updateLocation: (data) => api.put('/driver/location', data),
  acceptRequest: (id) => api.post(`/driver/requests/${id}/accept`),
  updateTripStatus: (data) => api.put('/driver/trip/status', data),
  getTripHistory: () => api.get('/driver/history'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getHospitals: () => api.get('/admin/hospitals'),
  toggleHospitalVerification: (id) => api.put(`/admin/hospitals/${id}/verify`),
  getAmbulances: () => api.get('/admin/ambulances'),
  getEmergencyRequests: () => api.get('/admin/emergency-requests'),
};

export default api;
