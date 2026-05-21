// Servidor Express principal — TortasBO
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const pedidosRouter = require('./routes/pedidos')
const claudeRouter = require('./routes/claude')
const productosRouter = require('./routes/productos')

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ───────────────────────────────────────────────────────────────
// CORS: en producción, definir CORS_ORIGIN con los orígenes permitidos (separados por coma)
// Ejemplo: CORS_ORIGIN=http://192.168.1.10:5173,http://localhost:5173
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : '*'
app.use(cors({ origin: corsOrigin }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir imágenes subidas estáticamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Servir frontend compilado (React/Vite)
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

// ── Rutas API ────────────────────────────────────────────────────────────────
app.use('/api/pedidos', pedidosRouter)
app.use('/api/analizar-mensaje', claudeRouter)
app.use('/api/productos', productosRouter)

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, servicio: 'TortasBO API', version: '1.0.0' }))

// Catch-all: Redirigir cualquier otra ruta al index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// ── Inicio del servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎂 TortasBO API corriendo en http://localhost:${PORT}`)
  console.log(`   Claude API Key: ${process.env.CLAUDE_API_KEY ? '✓ configurada' : '✗ NO configurada (necesaria para IA)'}`)
  console.log(`   Base de datos:  ${path.join(__dirname, 'data', 'tortasbo.db')}`)
  console.log(`   CORS origen:    ${corsOrigin}\n`)
})
