import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== AUTH =====
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// ===== COLIS =====
export const colisAPI = {
  getAll:        (status)          => api.get('/admin/colis', { params: status ? { status } : {} }),
  getById:       (id)              => api.get(`/admin/colis/${id}`),
  getByNumero:   (num)             => api.get(`/admin/colis/suivi/${num}`),
  create:        (data)            => api.post('/admin/colis', data),
  assigner:      (id, livreurId)   => api.put(`/admin/colis/${id}/assigner`, { livreurId }),
  updateStatus:  (id, status, notes) => api.patch(`/admin/colis/${id}/status`, { status, notes }),
  delete:        (id)              => api.delete(`/admin/colis/${id}`),
  scanByBarcode: (code)            => api.get(`/admin/colis/scan/${code}`),
};

// ===== LIVREURS =====
export const livreursAPI = {
  getAll:      (actifsOnly) => api.get('/admin/livreurs', { params: { actifsOnly: actifsOnly || false } }),
  getById:     (id)         => api.get(`/admin/livreurs/${id}`),
  create:      (data)       => api.post('/admin/livreurs', data),
  update:      (id, data)   => api.put(`/admin/livreurs/${id}`, data),
  toggleActif: (id)         => api.patch(`/admin/livreurs/${id}/toggle-actif`),
  delete:      (id)         => api.delete(`/admin/livreurs/${id}`),
  getStats:    (id)         => api.get(`/admin/livreurs/${id}/statistiques`),
};

// ===== DASHBOARD =====
export const dashboardAPI = {
  getStats:     () =>    api.get('/admin/statistiques'),
  getPositions: () =>    api.get('/admin/positions'),
  getPosition:  (id) =>  api.get(`/admin/positions/${id}`),
};

// ===== VEHICULES =====
export const vehiculesAPI = {
  getAll:       ()              => api.get('/admin/vehicules'),
  getByLivreur: (livreurId)     => api.get(`/admin/vehicules/livreur/${livreurId}`),
  create:       (data)          => api.post('/admin/vehicules', data),
  update:       (id, data)      => api.put(`/admin/vehicules/${id}`, data),   // ✅ NOUVEAU
  assigner:     (id, livreurId) => api.patch(`/admin/vehicules/${id}/assigner/${livreurId}`),
  delete:       (id)            => api.delete(`/admin/vehicules/${id}`),
};

export default api;