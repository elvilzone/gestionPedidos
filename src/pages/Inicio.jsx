import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, TrendingUp, Package } from 'lucide-react'
import TarjetaPedido from '../components/TarjetaPedido.jsx'
import { getPedidos, getResumenSemana } from '../lib/api.js'
import { dbLocal } from '../lib/sync.js'
import { formatearPrecio } from '../lib/formato.js'

export default function Inicio() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [resumen, setResumen] = useState({ pendientes: 0, ingresos_semana: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = async () => {
    setCargando(true)
    setError(null)
    try {
      const [resPedidos, resResumen] = await Promise.all([
        getPedidos(),
        getResumenSemana(),
      ])
      
      // Ordenar pedidos activos por fecha de entrega ascendente (los más urgentes primero)
      const pedidosOrdenados = (resPedidos.data || []).sort((a, b) => {
        return new Date(a.fecha_entrega) - new Date(b.fecha_entrega)
      })

      setPedidos(pedidosOrdenados)
      setResumen(resResumen.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los datos locales.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  return (
    <div style={{ background: '#FFF5F8', minHeight: '100vh' }}>
      {/* Header */}
      <header className="nav-header" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#D4537E', margin: 0 }}>
            🎂 Pabel's Repostería
          </h1>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
            Gestión de pedidos
          </p>
        </div>
        <button onClick={cargarDatos} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <RefreshCw size={20} color="#D4537E" className={cargando ? 'animate-spin' : ''} />
        </button>
      </header>

      <main style={{ padding: '16px' }}>
        {/* Tarjetas de resumen semanal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Package size={16} color="#D4537E" />
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>Pendientes</span>
            </div>
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#D4537E', margin: 0 }}>
              {resumen.pendientes}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <TrendingUp size={16} color="#10B981" />
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>Esta semana</span>
            </div>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#10B981', margin: 0 }}>
              {formatearPrecio(resumen.ingresos_semana)}
            </p>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', margin: 0 }}>
            Pedidos activos
          </h2>
          {/* Leyenda semáforo */}
          <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#9CA3AF' }}>
            <span style={{ color: '#EF4444' }}>● Hoy</span>
            <span style={{ color: '#F59E0B' }}>● Mañana</span>
            <span style={{ color: '#10B981' }}>● Con tiempo</span>
          </div>
        </div>

        {cargando && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div className="card" style={{ textAlign: 'center', padding: '24px', border: '1px solid #FEE2E2' }}>
            <p style={{ color: '#DC2626', margin: '0 0 12px' }}>⚠️ {error}</p>
            <button className="btn-secondary" onClick={cargarDatos} style={{ width: 'auto', padding: '8px 20px' }}>
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && pedidos.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 16px' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🎂</p>
            <p style={{ color: '#9CA3AF', margin: '0 0 16px', fontWeight: '500' }}>
              No hay pedidos activos
            </p>
            <button className="btn-primary" onClick={() => navigate('/nuevo')} style={{ width: 'auto', padding: '12px 28px' }}>
              <Plus size={18} /> Crear primer pedido
            </button>
          </div>
        )}

        {!cargando && !error && (
          <div className="md-grid-2">
            {pedidos.map(p => (
              <TarjetaPedido key={p.id} pedido={p} />
            ))}
          </div>
        )}

        {/* Espaciado para FAB */}
        <div style={{ height: '80px' }} />
      </main>

      {/* Botón flotante nuevo pedido */}
      <button className="fab" onClick={() => navigate('/nuevo')} aria-label="Nuevo pedido">
        <Plus size={28} color="white" strokeWidth={2.5} />
      </button>
    </div>
  )
}
