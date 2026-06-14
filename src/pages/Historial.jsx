import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, ChevronRight } from 'lucide-react'
import { getHistorial } from '../lib/api.js'
import { dbLocal } from '../lib/sync.js'
import { formatearPrecio, formatearFecha, etiquetaTipo, formatearNumeroPedido } from '../lib/formato.js'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Historial() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  // Filtro mes: "YYYY-MM"
  const hoy = new Date()
  const [mes, setMes] = useState(format(hoy, 'yyyy-MM'))

  useEffect(() => {
    const cargarHistorial = async () => {
      setCargando(true);
      setError(null);
      try {
        const res = await getHistorial({ mes });
        setPedidos(res.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el historial');
      } finally {
        setCargando(false);
      }
    };
    
    cargarHistorial();
  }, [mes])
  // Filtrar por búsqueda de nombre
  const pedidosFiltrados = pedidos.filter(p =>
    p.nombre_cliente.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalMes = pedidosFiltrados.reduce((acc, p) => acc + parseFloat(p.precio_total || 0), 0)

  return (
    <div style={{ background: '#FFF5F8', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #F3E8ED', padding: '16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#D4537E', margin: '0 0 12px' }}>
          📋 Historial
        </h1>
        {/* Selector de mes */}
        <input
          type="month"
          value={mes}
          onChange={e => setMes(e.target.value)}
          style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', fontSize: '15px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
        {/* Buscador */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Buscar por nombre de cliente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px 10px 36px', fontSize: '15px', boxSizing: 'border-box' }}
          />
        </div>
      </header>

      <main style={{ padding: '16px' }}>
        {/* Resumen del mes */}
        <div className="card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '600', margin: '0 0 2px' }}>
              {format(parseISO(mes + '-01'), 'MMMM yyyy', { locale: es }).toUpperCase()}
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''} entregado{pedidosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 2px', fontWeight: '600' }}>INGRESOS</p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#10B981', margin: 0 }}>{formatearPrecio(totalMes)}</p>
          </div>
        </div>

        {/* Lista */}
        {cargando && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spinner" />
          </div>
        )}

        {error && <p style={{ color: '#DC2626', textAlign: 'center' }}>{error}</p>}

        {!cargando && !error && pedidosFiltrados.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 16px' }}>
            <p style={{ fontSize: '36px', margin: '0 0 8px' }}>📭</p>
            <p style={{ color: '#9CA3AF', margin: 0 }}>
              {busqueda ? 'No se encontraron resultados' : 'No hay pedidos entregados este mes'}
            </p>
          </div>
        )}

        {!cargando && !error && pedidosFiltrados.map(p => (
          <div
            key={p.id}
            className="card"
            style={{ marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            onClick={() => navigate(`/pedido/${p.id}`)}
          >
            {/* Círculo check */}
            <div style={{ width: '40px', height: '40px', background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '18px' }}>✓</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontWeight: '700', margin: '0 0 2px', fontSize: '15px', color: '#1F2937' }}>{p.nombre_cliente}</p>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#059669', flexShrink: 0, marginLeft: '8px' }}>{formatearPrecio(p.precio_total)}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 2px' }}>{etiquetaTipo(p.tipo_producto)}</p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                {formatearNumeroPedido(p.id)} · Entregado {formatearFecha(p.fecha_entrega)}
              </p>
            </div>
            <ChevronRight size={16} color="#D1D5DB" />
          </div>
        ))}

        <div style={{ height: '20px' }} />
      </main>
    </div>
  )
}
