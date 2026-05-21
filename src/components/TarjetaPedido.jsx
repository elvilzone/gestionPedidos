import { calcularSemaforo, etiquetaTipo, etiquetaModalidad, etiquetaUrgencia, formatearFecha, formatearPrecio, formatearNumeroPedido } from '../lib/formato.js'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, MapPin } from 'lucide-react'

/**
 * Tarjeta de pedido con semáforo de color según urgencia
 */
export default function TarjetaPedido({ pedido }) {
  const navigate = useNavigate()
  const semaforo = calcularSemaforo(pedido.fecha_entrega, pedido.sena_recibida, pedido.precio_total)
  const urgencia = etiquetaUrgencia(pedido.fecha_entrega)
  const saldo = parseFloat(pedido.precio_total) - parseFloat(pedido.sena_recibida || 0)

  return (
    <article
      className={`card semaforo-${semaforo}`}
      onClick={() => navigate(`/pedido/${pedido.id}`)}
      style={{ cursor: 'pointer', marginBottom: '12px', transition: 'transform 0.1s' }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.99)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Encabezado: nombre y número */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: '700', color: '#1F2937', fontSize: '16px', lineHeight: '1.2', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {pedido.nombre_cliente}
          </p>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>{formatearNumeroPedido(pedido.id)}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {urgencia && (
            <span className={`badge badge-${semaforo === 'rojo' ? 'rojo' : semaforo === 'amarillo' ? 'amarillo' : 'verde'}`}>
              {urgencia}
            </span>
          )}
          <ChevronRight size={18} color="#9CA3AF" />
        </div>
      </div>

      {/* Tipo de producto */}
      <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px', fontWeight: '500', margin: '0 0 8px' }}>
        {etiquetaTipo(pedido.tipo_producto)}
      </p>

      {/* Fecha y modalidad */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
        <span>📅 {formatearFecha(pedido.fecha_entrega)}</span>
        <span>{etiquetaModalidad(pedido.modalidad)}</span>
      </div>

      {/* Dirección si es delivery */}
      {pedido.modalidad === 'delivery' && pedido.direccion_entrega && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
          <MapPin size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pedido.direccion_entrega}</span>
        </div>
      )}

      {/* Precios */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ fontSize: '14px' }}>
          <span style={{ color: '#6B7280' }}>Total: </span>
          <span style={{ fontWeight: '700', color: '#1F2937' }}>{formatearPrecio(pedido.precio_total)}</span>
        </div>
        <div style={{ fontSize: '14px' }}>
          {parseFloat(pedido.sena_recibida) > 0 ? (
            <span>
              <span style={{ color: '#6B7280' }}>Saldo: </span>
              <span style={{ fontWeight: '700', color: saldo > 0 ? '#EF4444' : '#059669' }}>
                {saldo > 0 ? formatearPrecio(saldo) : '✓ Pagado'}
              </span>
            </span>
          ) : (
            <span className="badge badge-amarillo">Sin seña</span>
          )}
        </div>
      </div>
    </article>
  )
}
