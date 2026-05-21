import { useState } from 'react'
import { crearProducto } from '../lib/api.js'

/**
 * Componente para seleccionar el tipo de producto del catálogo
 * o crear uno nuevo dinámicamente.
 * Responsabilidad única: UI + lógica del catálogo de productos.
 */
export default function SelectorProducto({ productos, valorActual, onCambio, onProductoCreado }) {
  const [creando, setCreando] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')

  const handleSelect = (e) => {
    if (e.target.value === 'nuevo') {
      setCreando(true)
    } else {
      setCreando(false)
      onCambio(e.target.value)
    }
  }

  const handleCrear = async () => {
    if (!nuevoNombre.trim()) return
    try {
      const res = await crearProducto(nuevoNombre.trim())
      onProductoCreado(res.data)
      setCreando(false)
      setNuevoNombre('')
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear producto')
    }
  }

  return (
    <div className="campo">
      <label>Tipo de producto *</label>
      <select name="tipo_producto" value={valorActual} onChange={handleSelect}>
        <option value="">— Seleccionar —</option>
        {productos.map(p => (
          <option key={p.id} value={p.nombre}>{p.nombre}</option>
        ))}
        <option value="nuevo">+ Otro... (Crear nuevo)</option>
      </select>
      {creando && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <input
            type="text"
            placeholder="Ej: 🍰 Torta de 3 leches"
            value={nuevoNombre}
            onChange={e => setNuevoNombre(e.target.value)}
            style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCrear}
            style={{ width: 'auto', minHeight: 'auto', padding: '8px 16px' }}
          >
            Añadir
          </button>
        </div>
      )}
    </div>
  )
}
