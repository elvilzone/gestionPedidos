import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader } from 'lucide-react'
import { crearPedido, getProductos } from '../lib/api.js'
import { dbLocal } from '../lib/sync.js'
import { usePedidoForm } from '../hooks/usePedidoForm.js'
import { useAnalizadorIA } from '../hooks/useAnalizadorIA.js'
import PanelIA from '../components/PanelIA.jsx'
import SelectorFoto from '../components/SelectorFoto.jsx'
import SelectorProducto from '../components/SelectorProducto.jsx'
import { reprogramarNotificaciones } from '../lib/notifications.js'

export default function NuevoPedido({ pedidoInicial, esEdicion, onGuardar }) {
  const navigate = useNavigate()

  // ── Formulario ────────────────────────────────────────────────────────────
  const { form, handleCampo, setModalidad, setTipoProducto, validar, saldo } = usePedidoForm(pedidoInicial)

  // ── Foto ──────────────────────────────────────────────────────────────────
  const [foto, setFoto] = useState(null)
  const [previewFoto, setPreviewFoto] = useState(
    pedidoInicial?.foto_url ? `/uploads/${pedidoInicial.foto_url}` : null
  )

  const handleFotoSeleccionada = (archivo) => {
    // Liberar blob URL anterior para evitar memory leak
    if (previewFoto && previewFoto.startsWith('blob:')) URL.revokeObjectURL(previewFoto)
    setFoto(archivo)
    setPreviewFoto(URL.createObjectURL(archivo))
  }

  const handleQuitarFoto = () => {
    if (previewFoto && previewFoto.startsWith('blob:')) URL.revokeObjectURL(previewFoto)
    setFoto(null)
    setPreviewFoto(null)
  }

  // ── Productos ─────────────────────────────────────────────────────────────
  const [productosList, setProductosList] = useState([])
  useEffect(() => {
    // Carga rápida del caché
    dbLocal.getItem('productos').then(locales => {
      if (locales && locales.length > 0) setProductosList(locales);
    }).catch(() => {});

    // Actualización silenciosa desde la red
    getProductos().then(res => setProductosList(res.data)).catch(console.error)
  }, [])

  // ── IA (Claude) ───────────────────────────────────────────────────────────
  const ia = useAnalizadorIA((extraido) => {
    // Cuando Claude extrae datos, los aplica al formulario sin pisar campos ya completos
    if (extraido.nombre) handleCampo({ target: { name: 'nombre_cliente', value: extraido.nombre } })
    if (extraido.tipoProducto) setTipoProducto(extraido.tipoProducto)
    if (extraido.descripcion) handleCampo({ target: { name: 'descripcion', value: extraido.descripcion } })
    if (extraido.fechaEntrega) handleCampo({ target: { name: 'fecha_entrega', value: extraido.fechaEntrega } })
    if (extraido.modalidad) setModalidad(extraido.modalidad)
    if (extraido.direccion) handleCampo({ target: { name: 'direccion_entrega', value: extraido.direccion } })
    if (extraido.notas) handleCampo({ target: { name: 'notas', value: extraido.notas } })
  })

  // ── Guardar ───────────────────────────────────────────────────────────────
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const handleGuardar = async (e) => {
    e.preventDefault()
    const errValidacion = validar()
    if (errValidacion) { setError(errValidacion); return }

    setGuardando(true)
    setError(null)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (foto) fd.append('foto', foto)

      if (esEdicion && onGuardar) {
        await onGuardar(fd)
      } else {
        await crearPedido(fd)
        // Reprogramar recordatorios para incluir el nuevo pedido
        reprogramarNotificaciones().catch(() => {})
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el pedido')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{ background: '#FFF5F8', minHeight: '100vh' }}>
      {/* Header */}
      <header className="nav-header">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <ArrowLeft size={24} color="#374151" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', margin: 0, flex: 1 }}>
          {esEdicion ? 'Editar pedido' : 'Nuevo pedido'}
        </h1>
      </header>

      <form onSubmit={handleGuardar} style={{ padding: '16px' }} className="md-grid-2">

        {/* ── IA: Analizar mensaje WhatsApp ──────────────────────────────── */}
        <div className="md-col-span-2">
        <PanelIA
          mostrarPanel={ia.mostrarPanel}
          mensajeWhatsApp={ia.mensajeWhatsApp}
          setMensajeWhatsApp={ia.setMensajeWhatsApp}
          analizando={ia.analizando}
          errorIA={ia.errorIA}
          onAbrir={ia.abrirPanel}
          onCerrar={ia.cerrarPanel}
          onAnalizar={ia.analizar}
        />
        </div>

        {/* ── Datos del cliente ─────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <p style={{ fontWeight: '700', color: '#374151', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            👤 Datos del cliente
          </p>
          <div className="campo">
            <label>Nombre del cliente *</label>
            <input name="nombre_cliente" value={form.nombre_cliente} onChange={handleCampo} placeholder="Ej: María García" />
          </div>
          <div className="campo">
            <label>WhatsApp (Bolivia) *</label>
            <input name="whatsapp" value={form.whatsapp} onChange={handleCampo} placeholder="+591 70012345" type="tel" />
          </div>
        </div>

        {/* ── Detalles del pedido ───────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <p style={{ fontWeight: '700', color: '#374151', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🎂 Detalles del pedido
          </p>

          {/* Selector de producto dinámico */}
          <SelectorProducto
            productos={productosList}
            valorActual={form.tipo_producto}
            onCambio={setTipoProducto}
            onProductoCreado={(producto) => {
              setProductosList(prev => [...prev, producto])
              setTipoProducto(producto.nombre)
            }}
          />

          <div className="campo">
            <label>Descripción detallada *</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleCampo}
              placeholder="Ej: Torta de 3 pisos, sabor vainilla, decoración de rosas rosas..."
              rows={4}
            />
          </div>

          {/* Selector de foto */}
          <SelectorFoto
            previewFoto={previewFoto}
            onFotoSeleccionada={handleFotoSeleccionada}
            onQuitarFoto={handleQuitarFoto}
          />

          <div className="campo">
            <label>Notas adicionales</label>
            <textarea
              name="notas"
              value={form.notas}
              onChange={handleCampo}
              placeholder="Alergias, instrucciones especiales..."
              rows={2}
            />
          </div>
        </div>

        {/* ── Pagos ────────────────────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <p style={{ fontWeight: '700', color: '#374151', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            💰 Pagos
          </p>
          <div className="campo">
            <label>Precio total (Bs) *</label>
            <input name="precio_total" value={form.precio_total} onChange={handleCampo} type="number" min="0" step="0.5" placeholder="0.00" />
          </div>
          <div className="campo">
            <label>Seña recibida (Bs)</label>
            <input name="sena_recibida" value={form.sena_recibida} onChange={handleCampo} type="number" min="0" step="0.5" placeholder="0.00" />
          </div>
          {/* Saldo calculado */}
          <div style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Saldo al entregar:</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: saldo > 0 ? '#EF4444' : '#10B981' }}>
              Bs {isNaN(saldo) ? '0.00' : saldo.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── Entrega ───────────────────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <p style={{ fontWeight: '700', color: '#374151', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📦 Entrega
          </p>
          <div className="campo">
            <label>Fecha de entrega *</label>
            <input name="fecha_entrega" value={form.fecha_entrega} onChange={handleCampo} type="date" />
          </div>
          <div className="campo">
            <label>Modalidad *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'retiro', label: '🏪 Retiro en local' },
                { value: 'salon', label: '🍽️ Consumo en salón' },
                { value: 'delivery', label: '🛵 Delivery' },
              ].map(op => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setModalidad(op.value)}
                  style={{
                    padding: '12px 8px',
                    border: `2px solid ${form.modalidad === op.value ? '#D4537E' : '#E5E7EB'}`,
                    borderRadius: '10px',
                    background: form.modalidad === op.value ? '#FFF5F8' : 'white',
                    color: form.modalidad === op.value ? '#D4537E' : '#6B7280',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
          {form.modalidad === 'delivery' && (
            <div className="campo">
              <label>Dirección de entrega *</label>
              <input name="direccion_entrega" value={form.direccion_entrega} onChange={handleCampo} placeholder="Calle, número, barrio..." />
            </div>
          )}
        </div>

        {/* Zona inferior: Error y Guardar */}
        <div className="md-col-span-2">
          {/* Error de validación */}
        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px', fontWeight: '500' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Botón guardar */}
        <button type="submit" className="btn-primary" disabled={guardando}>
          {guardando
            ? <><span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> Guardando...</>
            : '✓ Guardar pedido'
          }
        </button>
        </div>
        <div style={{ height: '20px' }} />
      </form>
    </div>
  )
}
