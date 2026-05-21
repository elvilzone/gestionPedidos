// Ruta para análisis de mensajes con Claude AI
const express = require('express')
const router = express.Router()
const Anthropic = require('@anthropic-ai/sdk')

// ── POST /api/analizar-mensaje ───────────────────────────────────────────────
// Analiza un mensaje de WhatsApp y extrae datos del pedido usando Claude
router.post('/', async (req, res) => {
  const { mensaje } = req.body

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'El campo "mensaje" es requerido' })
  }

  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'CLAUDE_API_KEY no está configurada en el servidor' })
  }

  try {
    const client = new Anthropic({ apiKey })

    const prompt = `Analizá este mensaje de WhatsApp de un cliente de una pastelería en Bolivia y extraé los datos del pedido. Respondé SOLO en JSON con este formato exacto:
{
  "nombre": "string o null",
  "tipoProducto": "string o null",
  "descripcion": "string o null",
  "fechaEntrega": "YYYY-MM-DD" o null,
  "modalidad": "delivery" | "retiro" | "salon" | null,
  "direccion": "string o null",
  "notas": "string o null"
}

Mensaje del cliente: ${mensaje}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const textoRespuesta = response.content[0].text.trim()

    // Extraer JSON de la respuesta (puede venir con markdown)
    const jsonMatch = textoRespuesta.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(422).json({ error: 'Claude no devolvió JSON válido', raw: textoRespuesta })
    }

    const datos = JSON.parse(jsonMatch[0])
    res.json({ datos })
  } catch (err) {
    console.error('Error Claude API:', err.message)
    res.status(500).json({ error: `Error al llamar a Claude: ${err.message}` })
  }
})

module.exports = router
