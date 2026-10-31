// Servicio API Central para Optimus360 Web App
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.52.202.150.69.sslip.io/api/v1';

const TOKEN_KEY = 'optimus360_auth_token';
const USER_KEY = 'optimus360_user_info';

function getHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Autenticación
  auth: {
    async login(email, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data;
    },
    logout() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    getToken() {
      return localStorage.getItem(TOKEN_KEY);
    },
    getUser() {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    },
    isAuthenticated() {
      return !!localStorage.getItem(TOKEN_KEY);
    },
    async getProfile() {
      return await request('/auth/profile');
    },
    async verifySession() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      try {
        const res = await request('/auth/profile');
        if (res && res.success && res.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          return res.user;
        }
        return null;
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
    },
  },

  // Productos
  productos: {
    async getAll(search = '', categoria = '') {
      let query = '';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoria && categoria !== 'Todas') params.append('categoria', categoria);
      if (params.toString()) query = `?${params.toString()}`;

      const res = await request(`/productos${query}`);
      return res.data || [];
    },
    async create(prodData) {
      return await request('/productos', {
        method: 'POST',
        body: JSON.stringify(prodData),
      });
    },
    async update(uuid, prodData) {
      return await request(`/productos/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(prodData),
      });
    },
    async delete(uuid) {
      return await request(`/productos/${uuid}`, {
        method: 'DELETE',
      });
    },
  },

  // Clientes
  clientes: {
    async getAll(search = '') {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await request(`/clientes${query}`);
      return res.data || [];
    },
    async create(clientData) {
      return await request('/clientes', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });
    },
    async update(uuid, clientData) {
      return await request(`/clientes/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
      });
    },
    async delete(uuid) {
      return await request(`/clientes/${uuid}`, {
        method: 'DELETE',
      });
    },
  },

  // Ventas
  ventas: {
    async getAll(page = 1, limit = 50) {
      const res = await request(`/ventas?page=${page}&limit=${limit}`);
      return res.data || [];
    },
    async getById(uuid) {
      const res = await request(`/ventas/${uuid}`);
      return res.data;
    },
    async create(ventaData) {
      return await request('/ventas', {
        method: 'POST',
        body: JSON.stringify(ventaData),
      });
    },
  },

  // Categorías
  categorias: {
    async getAll() {
      const res = await request('/categorias');
      return res.data || [];
    },
    async create(nombre) {
      return await request('/categorias', {
        method: 'POST',
        body: JSON.stringify({ nombre }),
      });
    },
    async delete(uuid) {
      return await request(`/categorias/${uuid}`, {
        method: 'DELETE',
      });
    },
  },

  // Estado del Dashboard en Vivo
  dashboard: {
    async getStatus() {
      return await request('/sync/status');
    },
  },
};

export default api;
