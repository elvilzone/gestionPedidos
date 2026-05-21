const express = require('express')
const router = express.Router()
const db = require('../db')

// Obtener todos los productos
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM productos ORDER BY id ASC`).all()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Crear un nuevo producto
router.post('/', (req, res) => {
  try {
    const { nombre } = req.body
    if (!nombre) return res.status(400).json({ error: 'Nombre es requerido' })
    const info = db.prepare(`INSERT INTO productos (nombre) VALUES (?)`).run(nombre)
    res.status(201).json({ id: info.lastInsertRowid, nombre })
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'El producto ya existe' })
    }
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
