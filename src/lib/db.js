import Dexie from 'dexie';

export const db = new Dexie('TortasBODatabase');

// Esquema de la base de datos local
// cliente_id será la clave primaria local para pedidos (generada con UUID).
// sync_status indicará el estado de sincronización: 'synced', 'pending_create', 'pending_update', 'pending_delete'
db.version(3).stores({
  pedidos: 'cliente_id, id, fecha_entrega, entregado, is_deleted, sync_status, updated_at', 
  productos: 'id, nombre, is_deleted, sync_status, updated_at'
});

export default db;
