import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getPedido, actualizarPedido } from '../lib/api.js'
import NuevoPedido from './NuevoPedido.jsx'
import { reprogramarNotificaciones } from '../lib/notifications.js'

/**
 * Pantalla de edición — reutiliza el formulario de NuevoPedido
 */
export default function EditarPedido() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPedido(id)
      .then(res => setPedido(res.data))
      .catch(() => setError('No se pudo cargar el pedido'))
      .finally(() => setCargando(false))
  }, [id])

  const handleGuardar = async (formData) => {
    await actualizarPedido(id, formData)
    reprogramarNotificaciones().catch(() => {})
    navigate(`/pedido/${id}`)
  }

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )

  if (error) return (
    <div style={{ padding: '24px', textAlign: 'center', color: '#DC2626' }}>{error}</div>
  )

  return (
    <NuevoPedido
      pedidoInicial={pedido}
      esEdicion={true}
      onGuardar={handleGuardar}
    />
  )
}
