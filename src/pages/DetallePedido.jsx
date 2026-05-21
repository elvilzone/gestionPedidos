import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Truck, Trash2, MessageCircle } from 'lucide-react'
import html2canvas from 'html2canvas'
import { getPedido, marcarEntregado, eliminarPedido } from '../lib/api.js'
import {
  formatearPrecio, formatearFecha, formatearFechaLarga,
  etiquetaTipo, etiquetaModalidad, formatearNumeroPedido, calcularSemaforo
} from '../lib/formato.js'

export default function DetallePedido() {
  const { id } = useParams()
  const navigate = useNavigate()
  const comprobanteRef = useRef(null)
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmando, setConfirmando] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const mostrarToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    getPedido(id)
      .then(res => setPedido(res.data))
      .catch(() => setError('No se pudo cargar el pedido'))
      .finally(() => setCargando(false))
  }, [id])

  const handleEntregar = async () => {
    setProcesando(true)
    try {
      await marcarEntregado(id)
      mostrarToast('✓ Pedido marcado como entregado')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      console.error('Error al marcar entregado:', err)
      mostrarToast('Error al actualizar')
    } finally { setProcesando(false); setConfirmando(null) }
  }

  const handleEliminar = async () => {
    setProcesando(true)
    try {
      await eliminarPedido(id)
      navigate('/')
    } catch (err) {
      console.error('Error al eliminar:', err)
      mostrarToast('Error al eliminar')
    } finally { setProcesando(false); setConfirmando(null) }
  }

  const enviarWhatsApp = async () => {
    if (!comprobanteRef.current || !pedido) return
    mostrarToast('Generando comprobante...')
    try {
      const canvas = await html2canvas(comprobanteRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const link = document.createElement('a')
      link.download = `comprobante-${formatearNumeroPedido(pedido.id)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      const saldo = parseFloat(pedido.precio_total) - parseFloat(pedido.sena_recibida || 0)
      const texto = encodeURIComponent(
        `🎂 *TortasBO — Comprobante ${formatearNumeroPedido(pedido.id)}*\n\n` +
        `👤 ${pedido.nombre_cliente}\n` +
        `🛒 ${etiquetaTipo(pedido.tipo_producto)}\n` +
        `📅 Entrega: ${formatearFecha(pedido.fecha_entrega)}\n` +
        `📦 ${etiquetaModalidad(pedido.modalidad)}\n\n` +
        `💰 Total: ${formatearPrecio(pedido.precio_total)}\n` +
        `✅ Seña: ${formatearPrecio(pedido.sena_recibida)}\n` +
        `⚠️ Saldo: ${formatearPrecio(saldo)}\n\n` +
        `_Gracias por su confianza_ 🙏`
      )
      const digitos = (pedido.whatsapp || '').replace(/\D/g, '')
      // Quita cualquier cantidad de prefijos '591' repetidos al inicio del número
      const numero = digitos.replace(/^(?:591)+/, '')
      window.open(`https://wa.me/591${numero}?text=${texto}`, '_blank')
    } catch { mostrarToast('Error al generar el comprobante') }
  }

  if (cargando) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>
  if (error || !pedido) return <div style={{ padding: '24px', textAlign: 'center', color: '#DC2626' }}>{error || 'Pedido no encontrado'}</div>

  const saldo = parseFloat(pedido.precio_total) - parseFloat(pedido.sena_recibida || 0)
  const semaforo = calcularSemaforo(pedido.fecha_entrega, pedido.sena_recibida, pedido.precio_total)

  return (
    <div style={{ background: '#FFF5F8', minHeight: '100vh' }}>
      <header className="nav-header">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <ArrowLeft size={24} color="#374151" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, flex: 1 }}>{formatearNumeroPedido(pedido.id)}</h1>
        <button onClick={() => navigate(`/editar/${pedido.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <Edit size={20} color="#D4537E" />
        </button>
      </header>

      <main style={{ padding: '16px' }}>
        {/* Cabecera con semáforo */}
        <div className={`card semaforo-${semaforo}`} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 2px' }}>{pedido.nombre_cliente}</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>{pedido.whatsapp}</p>
            </div>
            <span className={`badge badge-${semaforo === 'rojo' ? 'rojo' : semaforo === 'amarillo' ? 'amarillo' : 'verde'}`}>
              {semaforo === 'rojo' ? '🔴 Urgente' : semaforo === 'amarillo' ? '🟡 Pronto' : '🟢 Con tiempo'}
            </span>
          </div>
        </div>

        {/* Foto */}
        {pedido.foto_url && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: '700', fontSize: '13px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>📸 Referencia</p>
            <img src={`/uploads/${pedido.foto_url}`} alt="Referencia" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '10px' }} />
          </div>
        )}

        {/* Detalles */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <p style={{ fontWeight: '700', fontSize: '13px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>🎂 Pedido</p>
          <Fila label="Tipo" valor={etiquetaTipo(pedido.tipo_producto)} />
          <Fila label="Descripción" valor={pedido.descripcion} multilinea />
          {pedido.notas && <Fila label="Notas" valor={pedido.notas} multilinea />}
          <Fila label="Entrega" valor={formatearFechaLarga(pedido.fecha_entrega)} />
          <Fila label="Modalidad" valor={etiquetaModalidad(pedido.modalidad)} />
          {pedido.direccion_entrega && <Fila label="Dirección" valor={pedido.direccion_entrega} />}
        </div>

        {/* Pagos */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <p style={{ fontWeight: '700', fontSize: '13px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>💰 Pagos</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
            {[
              { label: 'TOTAL', valor: pedido.precio_total, color: '#1F2937', bg: '#F9FAFB' },
              { label: 'SEÑA', valor: pedido.sena_recibida, color: '#059669', bg: '#D1FAE5' },
              { label: 'SALDO', valor: saldo, color: saldo > 0 ? '#DC2626' : '#059669', bg: saldo > 0 ? '#FEE2E2' : '#D1FAE5' },
            ].map(({ label, valor, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: '10px', padding: '12px 6px' }}>
                <p style={{ fontSize: '10px', color, margin: '0 0 4px', fontWeight: '700', opacity: 0.7 }}>{label}</p>
                <p style={{ fontSize: '15px', fontWeight: '800', color, margin: 0 }}>{formatearPrecio(valor)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comprobante oculto */}
        <ComprobanteOculto ref={comprobanteRef} pedido={pedido} saldo={saldo} />

        {/* Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn-primary" onClick={enviarWhatsApp}>
            <MessageCircle size={20} /> Enviar comprobante por WhatsApp
          </button>
          {!pedido.entregado && (
            <button className="btn-secondary" onClick={() => setConfirmando('entregar')}>
              <Truck size={20} /> Marcar como entregado
            </button>
          )}
          <button onClick={() => setConfirmando('eliminar')} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Trash2 size={16} /> Eliminar pedido
          </button>
        </div>
      </main>

      {/* Modal confirmación */}
      {confirmando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 300 }}>
          <div style={{ background: 'white', width: '100%', borderRadius: '20px 20px 0 0', padding: '24px 16px 40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px' }}>
              {confirmando === 'entregar' ? '¿Marcar como entregado?' : '¿Eliminar pedido?'}
            </h3>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 20px' }}>
              {confirmando === 'entregar' ? 'El pedido pasará al historial.' : 'Esta acción no se puede deshacer.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setConfirmando(null)} style={{ flex: 1 }}>Cancelar</button>
              <button
                className={confirmando === 'eliminar' ? 'btn-danger' : 'btn-primary'}
                onClick={confirmando === 'entregar' ? handleEntregar : handleEliminar}
                disabled={procesando}
                style={{ flex: 1 }}
              >
                {procesando ? 'Procesando...' : confirmando === 'entregar' ? 'Confirmar' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function Fila({ label, valor, multilinea }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: multilinea ? 'flex-start' : 'center' }}>
      <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '600', minWidth: '90px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#1F2937', flex: 1, lineHeight: '1.5' }}>{valor}</span>
    </div>
  )
}

// Comprobante visual oculto para capturar con html2canvas
const ComprobanteOculto = ({ pedido, saldo, ref }) => {
  const fechaEmision = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return (
    <div ref={ref} style={{ position: 'absolute', left: '-9999px', top: 0, width: '390px', background: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <div style={{ background: '#D4537E', color: 'white', padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 2px' }}>🎂 TortasBO</p>
        <p style={{ fontSize: '13px', margin: 0, opacity: 0.85 }}>Comprobante de Pedido</p>
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F3E8ED' }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#D4537E' }}>{formatearNumeroPedido(pedido.id)}</span>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Emitido: {fechaEmision}</span>
        </div>
        {pedido.foto_url && (
          <img src={`/uploads/${pedido.foto_url}`} alt="Ref" crossOrigin="anonymous" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '16px' }} />
        )}
        <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px' }}>Cliente</p>
        <p style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 2px' }}>{pedido.nombre_cliente}</p>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 14px' }}>{pedido.whatsapp}</p>
        <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px' }}>Producto</p>
        <p style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px' }}>{etiquetaTipo(pedido.tipo_producto)}</p>
        <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 14px', lineHeight: '1.5' }}>{pedido.descripcion}</p>
        <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 4px' }}>Entrega</p>
        <p style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 2px' }}>{formatearFecha(pedido.fecha_entrega)}</p>
        <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 16px' }}>{etiquetaModalidad(pedido.modalidad)}{pedido.direccion_entrega ? ` · ${pedido.direccion_entrega}` : ''}</p>
        <div style={{ background: '#FFF5F8', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
          {[
            { label: 'Total', valor: formatearPrecio(pedido.precio_total), color: '#1F2937' },
            { label: '✓ Seña pagada', valor: formatearPrecio(pedido.sena_recibida), color: '#059669' },
            { label: saldo > 0 ? 'Saldo al entregar' : '✓ Completamente pagado', valor: formatearPrecio(saldo), color: saldo > 0 ? '#DC2626' : '#059669', bold: true },
          ].map(({ label, valor, color, bold }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #F9D0DF' }}>
              <span style={{ fontSize: '14px', color, fontWeight: bold ? '700' : '400' }}>{label}</span>
              <span style={{ fontSize: '14px', color, fontWeight: '700' }}>{valor}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#9CA3AF', fontStyle: 'italic', margin: 0 }}>Gracias por su confianza 🙏</p>
      </div>
    </div>
  )
}
