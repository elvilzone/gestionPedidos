import { Sparkles, X, Loader } from 'lucide-react'

/**
 * Componente para el análisis de mensajes WhatsApp con IA.
 * Muestra el botón de activación y el panel de entrada/análisis.
 */
export default function PanelIA({
  mostrarPanel,
  mensajeWhatsApp,
  setMensajeWhatsApp,
  analizando,
  errorIA,
  onAbrir,
  onCerrar,
  onAnalizar,
}) {
  return (
    <>
      {/* Botón principal IA */}
      <button
        type="button"
        onClick={onAbrir}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '14px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        <Sparkles size={18} />
        Pegar mensaje de WhatsApp (IA)
      </button>

      {/* Panel de análisis */}
      {mostrarPanel && (
        <div className="card" style={{ marginBottom: '20px', border: '1px solid #E0D4FF' }}>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontWeight: '700', color: '#374151', margin: 0 }}>
              ✨ Analizar con IA
            </p>
            <button type="button" onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#9CA3AF" />
            </button>
          </div>
          <textarea
            value={mensajeWhatsApp}
            onChange={e => setMensajeWhatsApp(e.target.value)}
            placeholder="Pegá aquí el mensaje o conversación del cliente de WhatsApp..."
            style={{
              width: '100%',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '14px',
              minHeight: '120px',
              resize: 'vertical',
              marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          />
          {errorIA && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '8px' }}>⚠️ {errorIA}</p>}
          <button
            type="button"
            onClick={onAnalizar}
            disabled={analizando || !mensajeWhatsApp.trim()}
            style={{
              width: '100%',
              background: analizando || !mensajeWhatsApp.trim() ? '#C4B5FD' : '#7C3AED',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: analizando ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {analizando ? <><Loader size={16} className="animate-spin" /> Analizando...</> : <>Extraer datos</>}
          </button>
        </div>
      )}
    </>
  )
}
