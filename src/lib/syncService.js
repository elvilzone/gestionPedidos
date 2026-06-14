import db from './db';
import { v4 as uuidv4 } from 'uuid';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const SyncService = {
  // Inicializa los listeners de red
  init() {
    window.addEventListener('online', this.sync);
    // Intentar sincronizar al inicio si estamos online
    if (navigator.onLine) {
      this.sync();
    }
  },

  // Obtiene la última fecha de sincronización
  async getLastSyncTime() {
    const lastSync = localStorage.getItem('last_sync_time');
    return lastSync ? parseInt(lastSync, 10) : 0;
  },

  async setLastSyncTime(time) {
    localStorage.setItem('last_sync_time', time.toString());
  },

  // Proceso principal de sincronización
  async sync() {
    if (!navigator.onLine) return;

    try {
      console.log('Iniciando sincronización...');
      await this.pushChanges();
      await this.pullChanges();
      console.log('Sincronización completada.');
    } catch (error) {
      console.error('Error durante la sincronización:', error);
    }
  },

  // Enviar cambios locales al servidor
  async pushChanges() {
    // 1. Push Pedidos
    const pedidosPendientes = await db.pedidos
      .filter(p => p.sync_status !== 'synced')
      .toArray();

    if (pedidosPendientes.length > 0) {
      const response = await fetch(`${API_URL}/pedidos/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedidosPendientes)
      });

      if (!response.ok) throw new Error('Error al enviar pedidos locales');

      // Si tuvo éxito, marcamos como sincronizados localmente
      for (const pedido of pedidosPendientes) {
        await db.pedidos.update(pedido.cliente_id, { sync_status: 'synced' });
      }
    }

    // 2. Push Productos
    const productosPendientes = await db.productos
      .filter(p => p.sync_status !== 'synced')
      .toArray();

    if (productosPendientes.length > 0) {
      const responseProd = await fetch(`${API_URL}/productos/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productosPendientes)
      });
      if (!responseProd.ok) throw new Error('Error al enviar productos locales');
      
      for (const prod of productosPendientes) {
        await db.productos.update(prod.id, { sync_status: 'synced' });
      }
    }
  },

  // Traer cambios del servidor
  async pullChanges() {
    const lastSync = await this.getLastSyncTime();
    
    // Pull Pedidos
    const resPedidos = await fetch(`${API_URL}/pedidos/sync/pull?last_sync=${lastSync}`);
    if (resPedidos.ok) {
      const pedidosServer = await resPedidos.json();
      
      for (const pedido of pedidosServer) {
        const local = await db.pedidos.where({ id: pedido.id }).first();
        
        // Si no existe localmente o el del servidor es más reciente
        if (!local || pedido.updated_at > local.updated_at) {
          // Guardarlo en db local. Si no tiene cliente_id local, lo generamos para mantener el esquema local
          await db.pedidos.put({
            ...pedido,
            cliente_id: pedido.cliente_id || local?.cliente_id || uuidv4(),
            sync_status: 'synced'
          });
        }
      }
    }

    // Pull Productos
    const resProductos = await fetch(`${API_URL}/productos/sync/pull?last_sync=${lastSync}`);
    if (resProductos.ok) {
      const productosServer = await resProductos.json();
      for (const prod of productosServer) {
        await db.productos.put(prod);
      }
    }

    await this.setLastSyncTime(Date.now());
  }
};

export default SyncService;
