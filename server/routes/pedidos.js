// Rutas para gestión de pedidos
const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const db = require('../db')

// Configuración de multer para guardar fotos en uploads/
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `foto_${Date.now()}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'))
  },
})

// ── GET /api/pedidos/resumen ─────────────────────────────────────────────────
// Resumen semanal: pedidos pendientes e ingresos de la semana
router.get('/resumen', (req, res) => {
  try {
    const pendientes = db.prepare(
      `SELECT COUNT(*) as total FROM pedidos WHERE entregado = 0`
    ).get()

    const ingresos = db.prepare(
      `SELECT COALESCE(SUM(precio_total), 0) as total
       FROM pedidos
       WHERE entregado = 1
         AND fecha_entrega >= date('now', '-7 days', 'localtime')`
    ).get()

    res.json({
      pendientes: pendientes.total,
      ingresos_semana: ingresos.total,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/pedidos/historial ───────────────────────────────────────────────
// Pedidos entregados filtrados por mes (YYYY-MM)
router.get('/historial', (req, res) => {
  try {
    const { mes } = req.query
    let rows

    if (mes) {
      rows = db.prepare(
        `SELECT * FROM pedidos
         WHERE entregado = 1
           AND strftime('%Y-%m', fecha_entrega) = ?
         ORDER BY fecha_entrega DESC`
      ).all(mes)
    } else {
      rows = db.prepare(
        `SELECT * FROM pedidos WHERE entregado = 1 ORDER BY fecha_entrega DESC`
      ).all()
    }
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/pedidos ─────────────────────────────────────────────────────────
// Lista de pedidos activos ordenados por fecha de entrega
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(
      `SELECT * FROM pedidos
       WHERE entregado = 0
       ORDER BY fecha_entrega ASC`
    ).all()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/pedidos/:id ─────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`SELECT * FROM pedidos WHERE id = ?`).get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Pedido no encontrado' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/pedidos ────────────────────────────────────────────────────────
// Crea un nuevo pedido
router.post('/', upload.single('foto'), (req, res) => {
  try {
    const {
      nombre_cliente, whatsapp, tipo_producto, descripcion,
      precio_total, sena_recibida, fecha_entrega,
      modalidad, direccion_entrega, notas,
    } = req.body

    // Validaciones básicas
    if (!nombre_cliente || !whatsapp || !tipo_producto || !descripcion || !fecha_entrega) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    const foto_url = req.file ? req.file.filename : null

    const stmt = db.prepare(`
      INSERT INTO pedidos
        (nombre_cliente, whatsapp, tipo_producto, descripcion, foto_url,
         precio_total, sena_recibida, fecha_entrega, modalidad, direccion_entrega, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const info = stmt.run(
      nombre_cliente, whatsapp, tipo_producto, descripcion, foto_url,
      parseFloat(precio_total) || 0,
      parseFloat(sena_recibida) || 0,
      fecha_entrega, modalidad || 'retiro',
      direccion_entrega || null,
      notas || null
    )

    const nuevo = db.prepare(`SELECT * FROM pedidos WHERE id = ?`).get(info.lastInsertRowid)
    res.status(201).json(nuevo)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PUT /api/pedidos/:id ─────────────────────────────────────────────────────
// Actualiza un pedido existente
router.put('/:id', upload.single('foto'), (req, res) => {
  try {
    const pedido = db.prepare(`SELECT * FROM pedidos WHERE id = ?`).get(req.params.id)
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })

    const {
      nombre_cliente, whatsapp, tipo_producto, descripcion,
      precio_total, sena_recibida, fecha_entrega,
      modalidad, direccion_entrega, notas,
    } = req.body

    // Si se subió nueva foto, borrar la anterior
    let foto_url = pedido.foto_url
    if (req.file) {
      if (pedido.foto_url) {
        const rutaAnterior = path.join(uploadsDir, pedido.foto_url)
        if (fs.existsSync(rutaAnterior)) fs.unlinkSync(rutaAnterior)
      }
      foto_url = req.file.filename
    }

    db.prepare(`
      UPDATE pedidos SET
        nombre_cliente = ?, whatsapp = ?, tipo_producto = ?, descripcion = ?,
        foto_url = ?, precio_total = ?, sena_recibida = ?, fecha_entrega = ?,
        modalidad = ?, direccion_entrega = ?, notas = ?
      WHERE id = ?
    `).run(
      nombre_cliente, whatsapp, tipo_producto, descripcion, foto_url,
      parseFloat(precio_total) || 0,
      parseFloat(sena_recibida) || 0,
      fecha_entrega, modalidad || 'retiro',
      direccion_entrega || null,
      notas || null,
      req.params.id
    )

    const actualizado = db.prepare(`SELECT * FROM pedidos WHERE id = ?`).get(req.params.id)
    res.json(actualizado)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PATCH /api/pedidos/:id/entregar ─────────────────────────────────────────
// Marca un pedido como entregado
router.patch('/:id/entregar', (req, res) => {
  try {
    const info = db.prepare(
      `UPDATE pedidos SET entregado = 1 WHERE id = ?`
    ).run(req.params.id)

    if (info.changes === 0) return res.status(404).json({ error: 'Pedido no encontrado' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /api/pedidos/:id ──────────────────────────────────────────────────
// Elimina un pedido y su foto si existe
router.delete('/:id', (req, res) => {
  try {
    const pedido = db.prepare(`SELECT foto_url FROM pedidos WHERE id = ?`).get(req.params.id)
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })

    // Borrar foto del filesystem si existe
    if (pedido.foto_url) {
      const ruta = path.join(uploadsDir, pedido.foto_url)
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta)
    }

    db.prepare(`DELETE FROM pedidos WHERE id = ?`).run(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
