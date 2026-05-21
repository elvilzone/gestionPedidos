import { useRef } from 'react'
import { Camera, X } from 'lucide-react'

/**
 * Componente para seleccionar y previsualizar una foto de referencia.
 * Maneja el input de archivo y la lógica de revocación de blob URLs.
 */
export default function SelectorFoto({ previewFoto, onFotoSeleccionada, onQuitarFoto }) {
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    // La lógica de revocación del blob URL anterior está en el padre (onFotoSeleccionada)
    onFotoSeleccionada(archivo)
  }

  return (
    <div className="campo">
      <label>Foto de referencia</label>
      {previewFoto ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={previewFoto}
            alt="Referencia"
            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px' }}
          />
          <button
            type="button"
            onClick={onQuitarFoto}
            style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
              borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', border: '2px dashed #F9D0DF', borderRadius: '10px',
            padding: '24px', background: '#FFF5F8', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            color: '#D4537E',
          }}
        >
          <Camera size={28} />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Adjuntar foto</span>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Galería o cámara</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}
