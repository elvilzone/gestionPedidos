import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { dbLocal, queueAction, triggerSync } from './sync';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000, // 15s — suficiente para conexiones lentas móviles
});

// Helper: Convertir File a Base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  if (!file || !(file instanceof Blob)) return resolve(null);
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

// ── Pedidos ──────────────────────────────────────────────────────────────────

export const getPedidosNet = () => api.get('/pedidos');

export const getPedidos = async () => {
  try {
    if (!navigator.onLine) throw new Error('Offline');
    // Intentar leer de red
    const res = await getPedidosNet();
    // Guardar en localforage como caché global y también individualmente
    await dbLocal.setItem('pedidos_activos', res.data);
    for (const p of res.data) {
      await dbLocal.setItem(`pedido_${p.id}`, p);
    }
    return res;
  } catch (error) {
    console.warn('Network falló, leyendo de localforage...');
    const locales = await dbLocal.getItem('pedidos_activos') || [];
    return { data: locales };
  }
};

export const getHistorial = async (params) => {
  try {
    if (!navigator.onLine) throw new Error('Offline');
    const res = await api.get('/pedidos/historial', { params });
    await dbLocal.setItem('pedidos_historial', res.data);
    return res;
  } catch (error) {
    const locales = await dbLocal.getItem('pedidos_historial') || [];
    // Filtrado local básico si es necesario
    const filtrados = params?.mes ? locales.filter(p => p.fecha_entrega.startsWith(params.mes)) : locales;
    return { data: filtrados };
  }
};

export const getPedido = async (id) => {
  // 1. Buscar PRIMERO en cache local (instantáneo)
  const cacheIndividual = await dbLocal.getItem(`pedido_${id}`);
  if (cacheIndividual) {
    // Tenemos cache, lo devolvemos inmediatamente y actualizamos en background
    api.get(`/pedidos/${id}`)
      .then(res => dbLocal.setItem(`pedido_${id}`, res.data))
      .catch(() => {});
    return { data: cacheIndividual };
  }

  // 2. Buscar en el array completo de pedidos cacheado
  const listado = await dbLocal.getItem('pedidos_activos') || [];
  const encontrado = listado.find(p => String(p.id) === String(id));
  if (encontrado) {
    await dbLocal.setItem(`pedido_${id}`, encontrado); // Guardar individual para próxima vez
    return { data: encontrado };
  }

  // 3. Sin cache: ir a la red
  try {
    if (!navigator.onLine) throw new Error('Offline');
    const res = await api.get(`/pedidos/${id}`);
    await dbLocal.setItem(`pedido_${id}`, res.data);
    return res;
  } catch (error) {
    const local = await dbLocal.getItem(`pedido_${id}`);
    if (local) return { data: local };
    throw error;
  }
};

export const crearPedido = async (formData) => {
  // Convertir FormData a objeto literal para serializar (necesario para offline y deduplicación)
  const payload = {};
  for (let [key, value] of formData.entries()) {
    if (key === 'foto' && value instanceof Blob) {
      payload.foto_base64 = await fileToBase64(value);
    } else {
      payload[key] = value;
    }
  }

  // UUID único para identificar este pedido tanto online como offline
  // Esto evita duplicados si el mismo pedido llega al servidor dos veces
  const clienteId = uuidv4();
  payload.cliente_id = clienteId;

  // ID temporal para mostrar en la UI mientras no tengamos el id real del servidor
  const tempId = `temp_${Date.now()}`;

  try {
    if (!navigator.onLine) throw new Error('Offline');

    // Agregar cliente_id al FormData para que el servidor lo registre
    formData.append('cliente_id', clienteId);
    const res = await api.post('/pedidos', formData);

    // Actualizar caché local: reemplazar entrada temporal si existe, si no agregar
    const locales = await dbLocal.getItem('pedidos_activos') || [];
    const idx = locales.findIndex(p => p.cliente_id === clienteId);
    if (idx !== -1) {
      locales[idx] = res.data; // reemplazar temporal con datos reales
    } else {
      locales.push(res.data);
    }
    await dbLocal.setItem('pedidos_activos', locales);
    await dbLocal.setItem(`pedido_${res.data.id}`, res.data);

    triggerSync(); // vaciar cualquier cola pendiente
    return res;

  } catch (err) {
    // Si el error es 4xx el servidor rechazó el pedido: no guardar localmente
    if (err.response && err.response.status >= 400 && err.response.status < 500) {
      throw err;
    }

    console.warn('[Offline/Error] Encolando creación de pedido', clienteId, err.message);

    // Guardar localmente con id temporal para que aparezca en la UI
    const locales = await dbLocal.getItem('pedidos_activos') || [];
    // Evitar duplicar si ya estaba guardado (doble submit)
    const yaExiste = locales.some(p => p.cliente_id === clienteId);
    if (!yaExiste) {
      const nuevoLocal = { ...payload, id: tempId, entregado: 0, is_deleted: 0 };
      locales.push(nuevoLocal);
      await dbLocal.setItem('pedidos_activos', locales);
      await dbLocal.setItem(`pedido_${tempId}`, nuevoLocal);
    }

    // Encolar para sincronizar cuando haya internet
    await queueAction('CREAR_PEDIDO', payload);
    const guardado = locales.find(p => p.cliente_id === clienteId) || { ...payload, id: tempId, entregado: 0, is_deleted: 0 };
    return { data: guardado };
  }
};

export const actualizarPedido = async (id, formData) => {
  const payload = {};
  for (let [key, value] of formData.entries()) {
    if (key === 'foto' && value instanceof Blob) {
      payload.foto_base64 = await fileToBase64(value);
    } else if (key !== 'foto') {
      payload[key] = value;
    }
  }

  const actLocal = async (p) => {
    const locales = await dbLocal.getItem('pedidos_activos') || [];
    const index = locales.findIndex(x => String(x.id) === String(id));
    if (index !== -1) {
      locales[index] = { ...locales[index], ...p };
      await dbLocal.setItem('pedidos_activos', locales);
      await dbLocal.setItem(`pedido_${id}`, locales[index]);
    }
  };

  try {
    if (navigator.onLine) {
      const res = await api.put(`/pedidos/${id}`, formData);
      await actLocal(res.data);
      return res;
    } else {
      throw new Error('Offline');
    }
  } catch (err) {
    console.warn('Offline: Encolando actualización de pedido', id);
    await queueAction('ACTUALIZAR_PEDIDO', { id, payload });
    await actLocal(payload);
    return { data: { id, ...payload } }; // Fake response
  }
};

export const marcarEntregado = async (id) => {
  const moverAHistorial = async () => {
    const activos = await dbLocal.getItem('pedidos_activos') || [];
    const pedido = activos.find(x => String(x.id) === String(id));
    if (pedido) {
      await dbLocal.setItem('pedidos_activos', activos.filter(x => String(x.id) !== String(id)));
      const historial = await dbLocal.getItem('pedidos_historial') || [];
      historial.unshift({ ...pedido, entregado: 1 });
      await dbLocal.setItem('pedidos_historial', historial);
    }
  };

  try {
    if (navigator.onLine) {
      const res = await api.patch(`/pedidos/${id}/entregar`);
      await moverAHistorial();
      return res;
    } else {
      throw new Error('Offline');
    }
  } catch (err) {
    await queueAction('MARCAR_ENTREGADO', { id });
    await moverAHistorial();
    return { data: { ok: true } };
  }
};

export const eliminarPedido = async (id) => {
  const eliminarLocal = async () => {
    const activos = await dbLocal.getItem('pedidos_activos') || [];
    await dbLocal.setItem('pedidos_activos', activos.filter(x => String(x.id) !== String(id)));
    await dbLocal.removeItem(`pedido_${id}`);
  };

  try {
    if (navigator.onLine) {
      const res = await api.delete(`/pedidos/${id}`);
      await eliminarLocal();
      return res;
    } else {
      throw new Error('Offline');
    }
  } catch (err) {
    await queueAction('ELIMINAR_PEDIDO', { id });
    await eliminarLocal();
    return { data: { ok: true } };
  }
};

// ── Estadísticas ─────────────────────────────────────────────────────────────
export const getResumenSemana = async () => {
  try {
    if (!navigator.onLine) throw new Error('Offline');
    const res = await api.get('/pedidos/resumen');
    await dbLocal.setItem('resumen_semana', res.data);
    return res;
  } catch (err) {
    const local = await dbLocal.getItem('resumen_semana') || { pendientes: 0, ingresos_semana: 0 };
    return { data: local };
  }
};

// ── Productos ────────────────────────────────────────────────────────────────
export const getProductos = async () => {
  try {
    if (!navigator.onLine) throw new Error('Offline');
    const res = await api.get('/productos');
    await dbLocal.setItem('productos', res.data);
    return res;
  } catch (err) {
    const local = await dbLocal.getItem('productos') || [];
    return { data: local };
  }
};

export const crearProducto = async (nombre) => {
  try {
    let nuevoProducto;
    if (navigator.onLine) {
      const res = await api.post('/productos', { nombre });
      nuevoProducto = res.data;
    } else {
      throw new Error('Offline');
    }
    // Actualizar caché local
    const locales = await dbLocal.getItem('productos') || [];
    locales.push(nuevoProducto);
    await dbLocal.setItem('productos', locales);
    return { data: nuevoProducto };
  } catch (err) {
    const nuevoProducto = { id: Date.now(), nombre };
    await queueAction('CREAR_PRODUCTO', { nombre });
    
    // Actualizar caché local offline
    const locales = await dbLocal.getItem('productos') || [];
    locales.push(nuevoProducto);
    await dbLocal.setItem('productos', locales);
    
    return { data: nuevoProducto };
  }
};

// ── Claude AI ────────────────────────────────────────────────────────────────
export const analizarMensaje = (mensaje) => api.post('/analizar-mensaje', { mensaje });

export default api;
