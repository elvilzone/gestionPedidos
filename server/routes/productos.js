const express = require('express')
const router = express.Router()
const db = require('../db')

// Obtener todos los productos
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM productos WHERE is_deleted = 0 ORDER BY id ASC`).all()
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
    const updated_at = Date.now()
    const info = db.prepare(`INSERT INTO productos (nombre, updated_at) VALUES (?, ?)`).run(nombre, updated_at)
    res.status(201).json({ id: info.lastInsertRowid, nombre, updated_at })
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'El producto ya existe' })
    }
    res.status(500).json({ error: err.message })
  }
})

// ── GET /api/productos/sync/pull ─────────────────────────────────────────────
router.get('/sync/pull', (req, res) => {
  try {
    const last_sync = parseInt(req.query.last_sync) || 0;
    const rows = db.prepare(`SELECT * FROM productos WHERE updated_at > ?`).all(last_sync);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/productos/sync/push ────────────────────────────────────────────
router.post('/sync/push', (req, res) => {
  try {
    const cambios = req.body;
    if (!Array.isArray(cambios)) return res.status(400).json({ error: 'Body must be an array' });

    const pushTransaction = db.transaction((cambios) => {
      for (const record of cambios) {
        let existente = db.prepare(`SELECT * FROM productos WHERE id = ?`).get(record.id);

        if (existente) {
          if (record.updated_at > existente.updated_at) {
            db.prepare(`
              UPDATE productos SET
                nombre = ?, is_deleted = ?, updated_at = ?
              WHERE id = ?
            `).run(record.nombre, record.is_deleted, record.updated_at, record.id);
          }
        } else {
          db.prepare(`
            INSERT INTO productos (id, nombre, is_deleted, updated_at)
            VALUES (?, ?, ?, ?)
          `).run(record.id, record.nombre, record.is_deleted, record.updated_at || Date.now());
        }
      }
    });

    pushTransaction(cambios);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router
