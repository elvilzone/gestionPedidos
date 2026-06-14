import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { dbLocal } from './sync';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
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

export const getPedidos = async () => {
  const locales = await dbLocal.getItem('pedidos_activos') || [];
  return { data: locales };
};

export const getHistorial = async (params) => {
  const locales = await dbLocal.getItem('pedidos_historial') || [];
  const filtrados = params?.mes ? locales.filter(p => p.fecha_entrega.startsWith(params.mes)) : locales;
  return { data: filtrados };
};

export const getPedido = async (id) => {
  const listado = await dbLocal.getItem('pedidos_activos') || [];
  const encontrado = listado.find(p => String(p.id) === String(id));
  if (encontrado) {
    return { data: encontrado };
  }
  const historial = await dbLocal.getItem('pedidos_historial') || [];
  const enHistorial = historial.find(p => String(p.id) === String(id));
  if (enHistorial) {
    return { data: enHistorial };
  }
  throw new Error('Pedido no encontrado');
};

export const crearPedido = async (formData) => {
  const payload = {};
  for (let [key, value] of formData.entries()) {
    if (key === 'foto' && value instanceof Blob) {
      payload.foto_url = await fileToBase64(value);
    } else {
      payload[key] = value;
    }
  }

  const nuevoLocal = { 
    ...payload, 
    id: Date.now().toString(), 
    entregado: 0, 
    is_deleted: 0,
    precio_total: parseFloat(payload.precio_total) || 0,
    sena_recibida: parseFloat(payload.sena_recibida) || 0,
    updated_at: Date.now()
  };

  const locales = await dbLocal.getItem('pedidos_activos') || [];
  locales.push(nuevoLocal);
  await dbLocal.setItem('pedidos_activos', locales);
  
  return { data: nuevoLocal };
};

export const actualizarPedido = async (id, formData) => {
  const payload = {};
  for (let [key, value] of formData.entries()) {
    if (key === 'foto' && value instanceof Blob) {
      payload.foto_url = await fileToBase64(value);
    } else if (key !== 'foto') {
      payload[key] = value;
    }
  }
  payload.precio_total = parseFloat(payload.precio_total) || 0;
  payload.sena_recibida = parseFloat(payload.sena_recibida) || 0;

  const locales = await dbLocal.getItem('pedidos_activos') || [];
  const index = locales.findIndex(x => String(x.id) === String(id));
  if (index !== -1) {
    // Si no se subió foto nueva, conservar la anterior
    if (!payload.foto_url && locales[index].foto_url) {
      payload.foto_url = locales[index].foto_url;
    }
    
    locales[index] = { ...locales[index], ...payload, updated_at: Date.now() };
    await dbLocal.setItem('pedidos_activos', locales);
    return { data: locales[index] };
  }
  throw new Error('Pedido no encontrado');
};

export const marcarEntregado = async (id) => {
  const activos = await dbLocal.getItem('pedidos_activos') || [];
  const pedido = activos.find(x => String(x.id) === String(id));
  if (pedido) {
    await dbLocal.setItem('pedidos_activos', activos.filter(x => String(x.id) !== String(id)));
    const historial = await dbLocal.getItem('pedidos_historial') || [];
    historial.unshift({ ...pedido, entregado: 1, updated_at: Date.now() });
    await dbLocal.setItem('pedidos_historial', historial);
    return { data: { ok: true } };
  }
  throw new Error('Pedido no encontrado');
};

export const eliminarPedido = async (id) => {
  const activos = await dbLocal.getItem('pedidos_activos') || [];
  const nuevoActivos = activos.filter(x => String(x.id) !== String(id));
  if (activos.length !== nuevoActivos.length) {
    await dbLocal.setItem('pedidos_activos', nuevoActivos);
    return { data: { ok: true } };
  }
  
  // Quizás esté en el historial
  const historial = await dbLocal.getItem('pedidos_historial') || [];
  const nuevoHistorial = historial.filter(x => String(x.id) !== String(id));
  if (historial.length !== nuevoHistorial.length) {
    await dbLocal.setItem('pedidos_historial', nuevoHistorial);
    return { data: { ok: true } };
  }
  
  throw new Error('Pedido no encontrado');
};

// ── Estadísticas ─────────────────────────────────────────────────────────────
export const getResumenSemana = async () => {
  const activos = await dbLocal.getItem('pedidos_activos') || [];
  const historial = await dbLocal.getItem('pedidos_historial') || [];
  
  const pendientes = activos.length;
  
  const hace7Dias = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const ingresos_semana = historial.reduce((sum, p) => {
    // Intentar usar updated_at como fecha de entrega, o timestamp del ID
    const time = p.updated_at || parseInt(p.id) || Date.now();
    if (time >= hace7Dias) {
      return sum + (parseFloat(p.precio_total) || 0);
    }
    return sum;
  }, 0);

  return { data: { pendientes, ingresos_semana } };
};

// ── Productos ────────────────────────────────────────────────────────────────
export const getProductos = async () => {
  const local = await dbLocal.getItem('productos') || [];
  return { data: local };
};

export const crearProducto = async (nombre) => {
  const nuevoProducto = { id: Date.now(), nombre };
  const locales = await dbLocal.getItem('productos') || [];
  locales.push(nuevoProducto);
  await dbLocal.setItem('productos', locales);
  return { data: nuevoProducto };
};

// ── Claude AI ────────────────────────────────────────────────────────────────
// Única función que usa el servidor real (para no exponer la API key)
export const analizarMensaje = (mensaje) => api.post('/analizar-mensaje', { mensaje });

export default api;
