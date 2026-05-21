import { useState } from 'react'

const FORM_INICIAL = {
  nombre_cliente: '',
  whatsapp: '+591 ',
  tipo_producto: '',
  descripcion: '',
  precio_total: '',
  sena_recibida: '0',
  fecha_entrega: '',
  modalidad: 'retiro',
  direccion_entrega: '',
  notas: '',
}

/**
 * Hook que encapsula el estado y validación del formulario de pedido.
 * Responsabilidad única: datos del formulario + reglas de validación.
 */
export function usePedidoForm(pedidoInicial) {
  const [form, setForm] = useState(pedidoInicial || FORM_INICIAL)

  const handleCampo = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const setModalidad = (value) => {
    setForm(prev => ({ ...prev, modalidad: value }))
  }

  const setTipoProducto = (nombre) => {
    setForm(prev => ({ ...prev, tipo_producto: nombre }))
  }

  const validar = () => {
    if (!form.nombre_cliente.trim()) return 'El nombre del cliente es obligatorio'
    if (!form.whatsapp.trim() || form.whatsapp.trim() === '+591') return 'El número de WhatsApp es obligatorio'
    if (!form.tipo_producto) return 'Seleccioná el tipo de producto'
    if (!form.descripcion.trim()) return 'La descripción del pedido es obligatoria'
    if (!form.precio_total || isNaN(parseFloat(form.precio_total))) return 'El precio total es obligatorio'
    if (!form.fecha_entrega) return 'La fecha de entrega es obligatoria'
    if (form.modalidad === 'delivery' && !form.direccion_entrega.trim()) return 'La dirección de entrega es obligatoria para delivery'
    return null
  }

  const saldo = parseFloat(form.precio_total || 0) - parseFloat(form.sena_recibida || 0)

  return { form, handleCampo, setModalidad, setTipoProducto, validar, saldo }
}
