// Cliente API para comunicarse con el backend Express
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// ── Pedidos ──────────────────────────────────────────────────────────────────

/** Obtiene todos los pedidos activos (no entregados) */
export const getPedidos = () => api.get('/pedidos')

/** Obtiene pedidos entregados (historial), con filtros opcionales */
export const getHistorial = (params) => api.get('/pedidos/historial', { params })

/** Obtiene un pedido por ID */
export const getPedido = (id) => api.get(`/pedidos/${id}`)

/** Crea un nuevo pedido (FormData para incluir foto) */
export const crearPedido = (formData) =>
  api.post('/pedidos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

/** Actualiza un pedido (FormData para incluir foto opcional) */
export const actualizarPedido = (id, formData) =>
  api.put(`/pedidos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

/** Marca un pedido como entregado */
export const marcarEntregado = (id) => api.patch(`/pedidos/${id}/entregar`)

/** Elimina un pedido */
export const eliminarPedido = (id) => api.delete(`/pedidos/${id}`)

// ── Claude AI ────────────────────────────────────────────────────────────────

/** Envía un mensaje de WhatsApp a Claude para extraer datos del pedido */
export const analizarMensaje = (mensaje) =>
  api.post('/analizar-mensaje', { mensaje })

// ── Estadísticas ─────────────────────────────────────────────────────────────

/** Obtiene resumen de la semana: pedidos pendientes e ingresos */
export const getResumenSemana = () => api.get('/pedidos/resumen')

// ── Productos ────────────────────────────────────────────────────────────────
export const getProductos = () => api.get('/productos')
export const crearProducto = (nombre) => api.post('/productos', { nombre })

export default api
