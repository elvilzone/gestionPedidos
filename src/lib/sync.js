import localforage from 'localforage';
import api from './api';

// Configurar bases de datos locales
export const dbLocal = localforage.createInstance({ name: 'TortasBO_DB' });
export const syncQueue = localforage.createInstance({ name: 'TortasBO_SyncQueue' });

/**
 * Agrega una acción a la cola de sincronización para enviarse cuando haya internet
 */
export async function queueAction(action, payload) {
  const id = Date.now().toString();
  await syncQueue.setItem(id, { action, payload, timestamp: id });
  console.log(`[Sync] Acción encolada: ${action}`);
  triggerSync();
}

// Helper para convertir Base64 a Blob
function base64ToBlob(base64Data) {
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const type = matches[1];
    const b64 = matches[2];
    const byteCharacters = atob(b64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  } catch (err) {
    console.error('Error convirtiendo base64 a blob', err);
    return null;
  }
}

/**
 * Intenta enviar toda la cola al servidor si hay conexión
 */
export async function triggerSync() {
  if (!navigator.onLine) return;

  const keys = await syncQueue.keys();
  if (keys.length === 0) return;

  console.log(`[Sync] Procesando ${keys.length} acciones pendientes...`);

  // Ordenamos las llaves por timestamp (ya que la llave es el Date.now())
  keys.sort();

  for (const key of keys) {
    const item = await syncQueue.getItem(key);
    try {
      let reqData = item.payload;

      // Reconstruir FormData si había imagen
      if (item.payload && item.payload.foto_base64) {
        reqData = new FormData();
        for (const k in item.payload) {
          if (k === 'foto_base64') {
            const blob = base64ToBlob(item.payload.foto_base64);
            if (blob) {
              const ext = blob.type.split('/')[1] || 'jpg';
              reqData.append('foto', blob, `foto_offline.${ext}`);
            }
          } else {
            reqData.append(k, item.payload[k]);
          }
        }
      }

      // Procesar cada acción según el tipo
      switch (item.action) {
        case 'CREAR_PEDIDO': {
          const res = await api.post('/pedidos', reqData);
          // Reemplazar entrada temporal en el caché local con los datos reales del servidor
          // De lo contrario el pedido "desaparece" cuando getPedidos() trae el id real
          const locales = await dbLocal.getItem('pedidos_activos') || [];
          const idx = locales.findIndex(
            p => p.cliente_id === item.payload.cliente_id
          );
          if (idx !== -1) {
            locales[idx] = res.data;
          } else {
            locales.push(res.data);
          }
          await dbLocal.setItem('pedidos_activos', locales);
          await dbLocal.setItem(`pedido_${res.data.id}`, res.data);
          // Limpiar entradas temporales del caché individual (pedido_temp_XXXXX)
          const allKeys = await dbLocal.keys();
          for (const k of allKeys) {
            if (k.startsWith('pedido_temp_')) await dbLocal.removeItem(k);
          }
          break;
        }
        case 'ACTUALIZAR_PEDIDO':
          await api.put(`/pedidos/${item.payload.id}`, reqData);
          break;
        case 'MARCAR_ENTREGADO':
          await api.patch(`/pedidos/${item.payload.id}/entregar`);
          break;
        case 'ELIMINAR_PEDIDO':
          await api.delete(`/pedidos/${item.payload.id}`);
          break;
        case 'CREAR_PRODUCTO': {
          const resP = await api.post('/productos', item.payload);
          // Actualizar caché de productos con el id real del servidor
          const prods = await dbLocal.getItem('productos') || [];
          const idxP = prods.findIndex(p => p.nombre === item.payload.nombre && typeof p.id !== 'number');
          if (idxP !== -1) prods[idxP] = resP.data;
          else if (!prods.some(p => p.id === resP.data.id)) prods.push(resP.data);
          await dbLocal.setItem('productos', prods);
          break;
        }
        default:
          console.warn(`[Sync] Acción desconocida: ${item.action}`);
      }

      // Marcar como procesado (eliminar de la cola)
      await syncQueue.removeItem(key);
      console.log(`[Sync] Acción ${item.action} procesada con éxito.`);
      
    } catch (error) {
      console.error(`[Sync] Error procesando acción ${item.action} (${key}):`, error);
      // Si falla por 4xx o similar que no sea red, podríamos evaluar si borrarlo.
      // Por ahora lo dejamos en la cola para intentar luego.
      break; // Detener la cola para mantener orden si hay dependencias
    }
  }
}

// Escuchar cuando el internet vuelve
window.addEventListener('online', triggerSync);
