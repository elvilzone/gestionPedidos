// Funciones de formato para Bolivia
import { format, parseISO, isToday, isTomorrow, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea un precio en bolivianos: "Bs 250.00"
 */
export const formatearPrecio = (monto) => {
  const num = parseFloat(monto) || 0
  return `Bs ${num.toFixed(2)}`
}

/**
 * Formatea una fecha ISO a formato boliviano: "15/06/2025"
 */
export const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '—'
  try {
    return format(parseISO(fechaISO), 'dd/MM/yyyy')
  } catch {
    return fechaISO
  }
}

/**
 * Formatea fecha con día de semana: "lunes 15/06/2025"
 */
export const formatearFechaLarga = (fechaISO) => {
  if (!fechaISO) return '—'
  try {
    return format(parseISO(fechaISO), "EEEE dd/MM/yyyy", { locale: es })
  } catch {
    return fechaISO
  }
}

/**
 * Determina el color del semáforo según la fecha de entrega y seña
 * Retorna: 'rojo' | 'amarillo' | 'verde'
 */
export const calcularSemaforo = (fechaEntregaISO, senaRecibida, precioTotal) => {
  if (!fechaEntregaISO) return 'amarillo'

  try {
    const fecha = parseISO(fechaEntregaISO)
    const hoy = isToday(fecha)
    const manana = isTomorrow(fecha)
    const diasRestantes = differenceInDays(fecha, new Date())

    if (hoy || diasRestantes < 0) return 'rojo'
    if (manana) return 'amarillo'
    return 'verde'
  } catch {
    return 'amarillo'
  }
}

/**
 * Etiqueta corta de urgencia
 */
export const etiquetaUrgencia = (fechaISO) => {
  if (!fechaISO) return ''
  try {
    const fecha = parseISO(fechaISO)
    if (isToday(fecha)) return '¡Hoy!'
    if (isTomorrow(fecha)) return 'Mañana'
    const dias = differenceInDays(fecha, new Date())
    if (dias < 0) return `¡Vencido!`
    return ''
  } catch {
    return ''
  }
}

/**
 * Etiqueta del tipo de producto
 * Los productos se almacenan con su nombre completo (ej: "💍 Torta matrimonial")
 * desde la tabla dinámica de productos, por lo que se devuelve directamente.
 */
export const etiquetaTipo = (tipo) => tipo || '—'

/**
 * Etiqueta de modalidad de entrega
 */
export const etiquetaModalidad = (modalidad) => {
  if (modalidad === 'delivery') return '🛵 Delivery'
  if (modalidad === 'salon') return '🍽️ Consumo en salón'
  return '🏪 Retiro en local'
}

/**
 * Número de pedido formateado: #0042
 */
export const formatearNumeroPedido = (id) => `#${String(id).padStart(4, '0')}`
