import { useState } from 'react'
import { analizarMensaje } from '../lib/api.js'

/**
 * Hook que encapsula la lógica de análisis de mensajes con Claude AI.
 * Responsabilidad única: interacción con la API de IA + estado derivado.
 *
 * @param {Function} onDatosExtraidos - Callback que recibe los datos extraídos por la IA
 */
export function useAnalizadorIA(onDatosExtraidos) {
  const [mostrarPanel, setMostrarPanel] = useState(false)
  const [mensajeWhatsApp, setMensajeWhatsApp] = useState('')
  const [analizando, setAnalizando] = useState(false)
  const [errorIA, setErrorIA] = useState(null)

  const abrirPanel = () => setMostrarPanel(true)
  const cerrarPanel = () => {
    setMostrarPanel(false)
    setMensajeWhatsApp('')
    setErrorIA(null)
  }

  const analizar = async () => {
    if (!mensajeWhatsApp.trim()) return
    setAnalizando(true)
    setErrorIA(null)
    try {
      const { data } = await analizarMensaje(mensajeWhatsApp)
      onDatosExtraidos(data.datos || {})
      cerrarPanel()
    } catch (err) {
      setErrorIA(err.response?.data?.error || 'Error al analizar el mensaje. Verificá la API key de Claude.')
    } finally {
      setAnalizando(false)
    }
  }

  return {
    mostrarPanel,
    mensajeWhatsApp,
    setMensajeWhatsApp,
    analizando,
    errorIA,
    abrirPanel,
    cerrarPanel,
    analizar,
  }
}
