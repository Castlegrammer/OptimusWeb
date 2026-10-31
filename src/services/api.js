// Servicio API Central para Optimus360 Web App
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.52.202.150.69.sslip.io/api/v1';

const TOKEN_KEY = 'optimus360_auth_token';
const USER_KEY = 'optimus360_user_info';

function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function getNowTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function formatFriendlyError(rawError, status = null) {
  const text = (typeof rawError === 'string' ? rawError : rawError?.message || '').toLowerCase();

  if (text.includes('failed to fetch') || text.includes('networkerror') || text.includes('load failed')) {
    return 'No se pudo conectar con el servidor central. Verifica tu conexión a internet o intenta nuevamente.';
  }

  if (status === 401 || text.includes('jwt') || text.includes('token') || text.includes('no autorizado') || text.includes('unauthorized')) {
    return 'Tu sesión ha vencido o no es válida. Por favor, inicia sesión nuevamente.';
  }

  if (status === 403) {
    return 'No tienes permisos suficientes para realizar esta acción.';
  }

  if (text.includes('unknown column') && text.includes('fecha_creacion')) {
    return 'El sistema actualizó automáticamente la estructura de fecha. Por favor vuelve a intentar guardar.';
  }

  if (text.includes('er_dup_entry') || text.includes('duplicate entry')) {
    if (text.includes('email') || text.includes('correo')) {
      return 'Ya existe una cuenta registrada con este correo electrónico.';
    }
    if (text.includes('codigo') || text.includes('barcode')) {
      return 'Ya existe un producto con este código de barras.';
    }
    return 'Ya existe un registro con estos mismos datos en la base de datos.';
  }

  if (text.includes('er_bad_field_error')) {
    return 'Hubo un error de compatibilidad con las columnas de la base de datos.';
  }

  if (status === 404) {
    return 'El registro solicitado no fue encontrado en el servidor.';
  }

  if (status >= 500) {
    if (rawError?.message && !rawError.message.includes('500') && !rawError.message.includes('Internal Server Error')) {
      return rawError.message;
    }
    return 'Ocurrió un error en el servidor central. Por favor, intenta nuevamente en unos momentos.';
  }

  return rawError?.message || 'Ocurrió un inconveniente al procesar la solicitud.';
}

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
    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
      const rawMessage = data?.message || data?.error || `Error ${response.status}: ${response.statusText}`;
      const friendlyMessage = formatFriendlyError({ message: rawMessage }, response.status);
      const err = new Error(friendlyMessage);
      err.status = response.status;
      err.raw = data;
      throw err;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    if (!err.status) {
      throw new Error(formatFriendlyError(err));
    }
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
        const userData = data.user || data.usuario || decodeJwtPayload(data.token) || { 
          email, 
          nombre: data.nombre || email.split('@')[0],
          tipo: 'Administrador'
        };
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
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
      try {
        const u = localStorage.getItem(USER_KEY);
        if (u) return JSON.parse(u);
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const decoded = decodeJwtPayload(token);
          if (decoded && (decoded.nombre || decoded.email)) {
            return {
              id: decoded.id,
              uuid: decoded.uuid,
              nombre: decoded.nombre,
              email: decoded.email,
              tipo: decoded.tipo || 'Administrador',
              moneda: decoded.moneda || 'USD',
            };
          }
        }
        return null;
      } catch (e) {
        return null;
      }
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
        const userData = res?.user || res?.usuario || res?.data?.user;
        if (userData) {
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          return userData;
        }
        const fallbackUser = this.getUser();
        if (fallbackUser) return fallbackUser;
        return null;
      } catch (err) {
        if (!localStorage.getItem(TOKEN_KEY)) {
          return null;
        }
        const fallbackUser = this.getUser();
        if (fallbackUser) return fallbackUser;
        return null;
      }
    },
  },

  // Productos
  productos: {
    async getAll(search = '', categoria = '') {
      try {
        let query = '';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoria && categoria !== 'Todas') params.append('categoria', categoria);
        if (params.toString()) query = `?${params.toString()}`;

        const res = await request(`/productos${query}`);
        if (res && res.data) return res.data;
      } catch (err) {
        try {
          const syncRes = await request('/sync/pull?since=2000-01-01');
          if (syncRes && syncRes.data && syncRes.data.productos) {
            let list = syncRes.data.productos.filter((p) => !p.eliminado);
            if (search) {
              const s = search.toLowerCase();
              list = list.filter(
                (p) =>
                  (p.nombre && p.nombre.toLowerCase().includes(s)) ||
                  (p.descripcion && p.descripcion.toLowerCase().includes(s))
              );
            }
            if (categoria && categoria !== 'Todas') {
              list = list.filter((p) => p.categoria === categoria);
            }
            return list;
          }
        } catch (e2) {}
      }
      return [];
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
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await request(`/clientes${query}`);
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        if (res && Array.isArray(res.clientes)) return res.clientes;
      } catch (err) {
        try {
          const syncRes = await request('/sync/pull?since=2000-01-01');
          if (syncRes && syncRes.data && Array.isArray(syncRes.data.clientes)) {
            let list = syncRes.data.clientes.filter((c) => !c.eliminado);
            if (search) {
              const s = search.toLowerCase();
              list = list.filter(
                (c) =>
                  (c.nombre && c.nombre.toLowerCase().includes(s)) ||
                  (c.telefono && c.telefono.toLowerCase().includes(s)) ||
                  (c.responsable && c.responsable.toLowerCase().includes(s))
              );
            }
            return list;
          }
        } catch (e2) {}
      }
      return [];
    },
    async create(clientData) {
      const payload = {
        ...clientData,
        fecha_creacion: clientData.fecha_creacion || getNowTimestamp(),
      };
      try {
        return await request('/clientes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch (err) {
        const cliUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `cli-${Date.now()}`;
        return await request('/sync/push', {
          method: 'POST',
          body: JSON.stringify({
            clientes: [
              {
                uuid: cliUuid,
                nombre: payload.nombre,
                telefono: payload.telefono || '',
                responsable: payload.responsable || '',
                fecha_creacion: payload.fecha_creacion,
                eliminado: false,
              },
            ],
          }),
        });
      }
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

  // Proveedores
  proveedores: {
    async getAll(search = '') {
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await request(`/proveedores${query}`);
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        if (res && Array.isArray(res.proveedores)) return res.proveedores;
      } catch (err) {
        try {
          const syncRes = await request('/sync/pull?since=2000-01-01');
          if (syncRes && syncRes.data && Array.isArray(syncRes.data.proveedores)) {
            let list = syncRes.data.proveedores.filter((p) => !p.eliminado);
            if (search) {
              const s = search.toLowerCase();
              list = list.filter(
                (p) =>
                  (p.nombre && p.nombre.toLowerCase().includes(s)) ||
                  (p.responsable && p.responsable.toLowerCase().includes(s)) ||
                  (p.telefono && p.telefono.toLowerCase().includes(s)) ||
                  (p.direccion && p.direccion.toLowerCase().includes(s))
              );
            }
            return list;
          }
        } catch (e2) {}
      }
      return [];
    },
    async create(provData) {
      const payload = {
        ...provData,
        fecha_creacion: provData.fecha_creacion || getNowTimestamp(),
      };
      try {
        return await request('/proveedores', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch (err) {
        const provUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `prov-${Date.now()}`;
        return await request('/sync/push', {
          method: 'POST',
          body: JSON.stringify({
            proveedores: [
              {
                uuid: provUuid,
                nombre: payload.nombre,
                responsable: payload.responsable || payload.contact || '',
                direccion: payload.direccion || payload.rif || '',
                telefono: payload.telefono || payload.phone || '',
                zona: payload.zona || 'Principal',
                fecha_creacion: payload.fecha_creacion,
                eliminado: false,
              },
            ],
          }),
        });
      }
    },
    async update(uuid, provData) {
      try {
        return await request(`/proveedores/${uuid}`, {
          method: 'PUT',
          body: JSON.stringify(provData),
        });
      } catch (err) {
        return await request('/sync/push', {
          method: 'POST',
          body: JSON.stringify({
            proveedores: [
              {
                uuid,
                nombre: provData.nombre,
                responsable: provData.responsable || provData.contact || '',
                direccion: provData.direccion || provData.rif || '',
                telefono: provData.telefono || provData.phone || '',
                zona: provData.zona || '',
                eliminado: false,
              },
            ],
          }),
        });
      }
    },
    async delete(uuid) {
      try {
        return await request(`/proveedores/${uuid}`, {
          method: 'DELETE',
        });
      } catch (err) {
        return await request('/sync/push', {
          method: 'POST',
          body: JSON.stringify({
            proveedores: [
              {
                uuid,
                eliminado: true,
              },
            ],
          }),
        });
      }
    },
  },

  // Ventas
  ventas: {
    async getAll(page = 1, limit = 50) {
      try {
        const res = await request(`/ventas?page=${page}&limit=${limit}`);
        if (res && res.data) return res.data;
      } catch (err) {
        try {
          const syncRes = await request('/sync/pull?since=2000-01-01');
          if (syncRes && syncRes.data && syncRes.data.ventas) {
            return syncRes.data.ventas.filter((v) => !v.eliminado);
          }
        } catch (e2) {}
      }
      return [];
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

  // Compras
  compras: {
    async getAll() {
      try {
        const syncRes = await request('/sync/pull?since=2000-01-01');
        if (syncRes && syncRes.data && syncRes.data.compras) {
          return syncRes.data.compras.filter((c) => !c.eliminado);
        }
      } catch (e) {}
      return [];
    },
    async create(compraData) {
      const cUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `com-${Date.now()}`;
      return await request('/sync/push', {
        method: 'POST',
        body: JSON.stringify({
          compras: [
            {
              uuid: cUuid,
              proveedor: compraData.proveedor || '',
              fecha: compraData.fecha || new Date().toISOString().split('T')[0],
              total: Number(compraData.total) || 0,
              inicial: Number(compraData.inicial) || Number(compraData.total) || 0,
              eliminado: false,
            },
          ],
        }),
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
