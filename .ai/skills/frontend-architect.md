# Frontend Architect — Pabel's Repostería

## Stack
- **Framework**: React 19 + Vite 8
- **Mobile**: Capacitor 8 (Android WebView)
- **Offline**: localforage (IndexedDB) — instancias `TortasBO_DB` y `TortasBO_SyncQueue`
- **Routing**: react-router-dom v7
- **UI Icons**: lucide-react
- **HTTP**: axios (interceptado por `src/lib/api.js` para modo offline)
- **Styles**: Vanilla CSS en `src/index.css`

## Archivos clave — leer SIEMPRE antes de editar UI

| Archivo | Propósito |
|---|---|
| `src/App.jsx` | Router, layout, barra de navegación, botón Atrás Android |
| `src/lib/api.js` | Capa HTTP + lógica offline-first (caché + cola) |
| `src/lib/sync.js` | Motor de sincronización offline→Render |
| `src/pages/DetallePedido.jsx` | Detalle del pedido + envío de comprobante por WhatsApp |
| `src/components/SelectorFoto.jsx` | Selector de foto (galería/cámara) |
| `android/app/src/main/AndroidManifest.xml` | Permisos Android, queries WhatsApp |
| `android/app/src/main/res/values/strings.xml` | Nombre de la app en Android (usar `\'` para apóstrofes) |
| `.env.production` | URL del backend: `https://gestionpedidos-g5sj.onrender.com/api` |

## Colores de la marca
```css
--color-rosa: #D4537E       /* Principal */
--color-rosa-claro: #F9D0DF /* Fondo suave */
--color-fondo: #FFF5F8      /* Fondo de página */
```

## Flujo offline-first
1. Lectura → primero `dbLocal` (localforage), luego servidor en background
2. Escritura online → servidor + actualiza `dbLocal`
3. Escritura offline → guarda en `dbLocal` + encola en `syncQueue`
4. Reconexión → `triggerSync()` procesa la cola y sube a Render

## Reglas críticas para no romper nada
- **NUNCA** poner `capture="environment"` en `<input type="file">` — bloquea la galería
- **Apóstrofes en strings.xml** → escapar como `\'` (ej: `Pabel\'s`)
- **WhatsApp en Android nativo** → usar `window.open('whatsapp://send?phone=...', '_system')`
- **WhatsApp en web** → usar `window.open('https://wa.me/...', '_blank')`
- **Detectar nativo** → `window.Capacitor?.isNativePlatform?.()`
- **Botón Atrás Android** → manejado en `App.jsx` con `@capacitor/app`

## Comando de despliegue (ejecutar en orden)
```bash
npm run build
npx cap sync android
# Luego en Android Studio: Build → Clean Project → Build APK
```

## Packages instalados con --legacy-peer-deps (obligatorio)
```bash
npm install <paquete> --legacy-peer-deps --strict-ssl=false
```
(El equipo tiene SSL corporativo que falla sin `--strict-ssl=false`)
