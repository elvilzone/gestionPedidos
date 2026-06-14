# Reglas de Frontend — Pabel's Repostería

## ✅ Siempre hacer
- Leer `frontend-architect.md` antes de cualquier cambio de UI
- Después de editar cualquier archivo en `src/`, ejecutar `npm run build && npx cap sync android`
- Escapar apóstrofes en archivos XML de Android: `'` → `\'`
- Detectar si es nativo con `window.Capacitor?.isNativePlatform?.()` antes de usar APIs nativas

## ❌ Nunca hacer
- Poner `capture="environment"` en inputs de archivo (bloquea la galería)
- Usar `window.location.href = 'intent://...'` para abrir WhatsApp (no funciona en WebView)
- Usar `html2canvas` para generar imágenes en el contexto nativo de Capacitor (falla silenciosamente)
- Instalar paquetes sin `--legacy-peer-deps`
- Modificar archivos en `android/` directamente para lógica de UI (usar `src/`)

## Patrones aprobados

### Abrir WhatsApp desde Capacitor
```js
const isNative = window.Capacitor?.isNativePlatform?.()
if (isNative) {
  window.open(`whatsapp://send?phone=591${numero}&text=${texto}`, '_system')
} else {
  window.open(`https://wa.me/591${numero}?text=${texto}`, '_blank')
}
```

### Selector de archivo que permite galería Y cámara
```jsx
<input type="file" accept="image/*" onChange={handleChange} />
// SIN capture="environment"
```

### Instalar dependencia
```bash
npm install <paquete> --legacy-peer-deps --strict-ssl=false
```
