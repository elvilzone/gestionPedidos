// Base de datos SQLite con better-sqlite3 (síncrona, sin servidor)
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

// Ruta de la base de datos en el directorio del servidor
const DB_PATH = path.join(__dirname, 'data', 'tortasbo.db')

// Crear directorio data/ si no existe
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(DB_PATH)

// Activar WAL para mejor rendimiento con múltiples lecturas
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_cliente    TEXT    NOT NULL,
    whatsapp          TEXT    NOT NULL,
    tipo_producto     TEXT    NOT NULL,
    descripcion       TEXT    NOT NULL,
    foto_url          TEXT,
    precio_total      REAL    NOT NULL DEFAULT 0,
    sena_recibida     REAL    NOT NULL DEFAULT 0,
    fecha_entrega     TEXT    NOT NULL,
    modalidad         TEXT    NOT NULL DEFAULT 'retiro',
    direccion_entrega TEXT,
    notas             TEXT,
    entregado         INTEGER NOT NULL DEFAULT 0,
    fecha_creacion    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL
  );
`)

// Insertar productos por defecto si la tabla está vacía
const count = db.prepare('SELECT COUNT(*) as count FROM productos').get();
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO productos (nombre) VALUES (?)');
  insert.run('💍 Torta matrimonial');
  insert.run('🎂 Torta de cumpleaños');
  insert.run('🍪 Masitas');
  insert.run('✨ Personalizado');
}

module.exports = db
