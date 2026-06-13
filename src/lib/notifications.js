import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { dbLocal } from './sync';

// Solo funciona en Android nativo (no en web/navegador)
const esNativo = () => Capacitor.isNativePlatform();

/**
 * Pedir permiso para notificaciones al usuario.
 * Solo se muestra el diálogo la primera vez.
 */
export async function pedirPermisoNotificaciones() {
  if (!esNativo()) return false;
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'granted') return true;
    const { display: resultado } = await LocalNotifications.requestPermissions();
    return resultado === 'granted';
  } catch (e) {
    console.warn('[Notif] Error pidiendo permiso:', e);
    return false;
  }
}

/**
 * Genera IDs de notificación únicos y reproducibles para un pedido.
 * Usamos el id numérico del pedido multiplicado para evitar colisiones:
 *   - 2 días antes:  pedidoId * 10 + 1
 *   - 1 día antes:   pedidoId * 10 + 2
 */
function notifIds(pedidoId) {
  // Los IDs de LocalNotifications deben ser enteros de 32 bits
  // Usamos módulo para mantenernos en rango seguro
  const base = Math.abs(parseInt(String(pedidoId).replace('temp_', '')) % 100000);
  return {
    dosDias: base * 10 + 1,
    unDia:   base * 10 + 2,
  };
}

/**
 * Dado un pedido, programa las notificaciones de recordatorio.
 * Si la fecha ya pasó o es hoy mismo, no programa nada.
 */
async function programarParaPedido(pedido) {
  if (!pedido?.fecha_entrega || pedido.entregado || pedido.is_deleted) return [];

  const ids = notifIds(pedido.id);
  const nombre = pedido.nombre_cliente || 'un cliente';
  const producto = pedido.tipo_producto || 'pedido';

  // Calcular fechas de notificación a las 8:00 AM
  const [anio, mes, dia] = pedido.fecha_entrega.split('-').map(Number);
  const fechaEntrega = new Date(anio, mes - 1, dia, 8, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const notifs = [];

  // 2 días antes
  const dosDiasAntes = new Date(fechaEntrega);
  dosDiasAntes.setDate(dosDiasAntes.getDate() - 2);
  if (dosDiasAntes > new Date()) {
    notifs.push({
      id: ids.dosDias,
      title: '🎂 Pedido en 2 días',
      body: `${nombre} espera su ${producto} el ${pedido.fecha_entrega}. ¡Prepara con tiempo!`,
      schedule: { at: dosDiasAntes },
      sound: 'default',
      smallIcon: 'ic_launcher_foreground',
      iconColor: '#D4537E',
    });
  }

  // 1 día antes
  const unDiaAntes = new Date(fechaEntrega);
  unDiaAntes.setDate(unDiaAntes.getDate() - 1);
  if (unDiaAntes > new Date()) {
    notifs.push({
      id: ids.unDia,
      title: '⚠️ Pedido mañana',
      body: `¡Mañana entregan! ${nombre} espera su ${producto}. Saldo pendiente: Bs ${pedido.precio_total - pedido.sena_recibida || 0}`,
      schedule: { at: unDiaAntes },
      sound: 'default',
      smallIcon: 'ic_launcher_foreground',
      iconColor: '#EF4444',
    });
  }

  return notifs;
}

/**
 * Función principal: cancela todas las notificaciones anteriores
 * y reprograma una notificación 2 días antes y 1 día antes
 * para cada pedido activo.
 * Llamar al iniciar la app y cada vez que se crea/edita/elimina un pedido.
 */
export async function reprogramarNotificaciones() {
  if (!esNativo()) return;

  try {
    // 1. Obtener pedidos activos del caché local
    const pedidos = await dbLocal.getItem('pedidos_activos') || [];
    if (pedidos.length === 0) return;

    // 2. Cancelar TODAS las notificaciones pendientes anteriores para evitar duplicados
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    // 3. Construir lista de nuevas notificaciones
    const todasLasNotifs = [];
    for (const pedido of pedidos) {
      const notifs = await programarParaPedido(pedido);
      todasLasNotifs.push(...notifs);
    }

    if (todasLasNotifs.length === 0) {
      console.log('[Notif] No hay pedidos futuros para notificar.');
      return;
    }

    // 4. Programar todas de una vez
    await LocalNotifications.schedule({ notifications: todasLasNotifs });
    console.log(`[Notif] ${todasLasNotifs.length} notificaciones programadas para ${pedidos.length} pedidos.`);

  } catch (err) {
    console.error('[Notif] Error programando notificaciones:', err);
  }
}
