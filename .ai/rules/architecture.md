# Arquitectura — Pabel's Repostería

## Tipo de aplicación
**Hybrid Offline-First PWA + Android (Capacitor)**

La misma base de código React funciona como:
- App web (PWA) accesible desde el navegador
- App Android nativa (APK) empaquetada con Capacitor

## Backend
- **URL**: `https://gestionpedidos-g5sj.onrender.com/api`
- **Framework**: Express.js (Node)
- **BD**: SQLite (en Render, archivo persistente)
- **Rutas**: `/api/pedidos`, `/api/productos`, `/api/analizar-mensaje`, `/api/health`
- **Imágenes**: servidas desde `/uploads/`

## Capas del sistema (de arriba a abajo)
```
[UI — React Pages]
     ↓
[src/lib/api.js]  ← intercepta todas las llamadas
     ↓         ↓
[localforage]  [Render API]   ← según si hay internet
     ↓
[src/lib/sync.js]  ← al reconectar, sube la cola offline
```

## Estructura de directorios
```
src/
  pages/         ← pantallas: Inicio, NuevoPedido, EditarPedido, DetallePedido, Historial
  components/    ← TarjetaPedido, SelectorFoto, etc.
  lib/
    api.js       ← HTTP + offline-first logic
    sync.js      ← cola de sincronización + dbLocal
    formato.js   ← helpers de formato (precio, fecha, etc.)
server/
  index.js       ← servidor Express
  routes/        ← pedidos.js, productos.js, claude.js
android/
  app/src/main/
    AndroidManifest.xml  ← permisos, queries de apps externas
    res/values/strings.xml  ← nombre de la app
```

## Dependencias clave del proyecto
```json
"@capacitor/core": "^8.3.4"
"@capacitor/android": "^8.3.4"
"@capacitor/app": "^8.1.0"    ← botón Atrás, exitApp
"localforage": "^1.10.0"      ← IndexedDB offline
"axios": "^1.9.0"
"react-router-dom": "^7.6.0"
```

## Decisiones técnicas importantes
1. **Sin SQLite local en Android** — se usa localforage (IndexedDB del WebView) en vez de SQLite nativo para simplificar
2. **Render como master** — la BD en Render es la fuente de verdad; localforage es caché temporal
3. **AGP 8.10.1** — no actualizar (8.13+ incompatible con la versión de Android Studio instalada)
4. **Gradle JVM: 1024m** — el equipo tiene poca RAM disponible para el daemon Gradle
