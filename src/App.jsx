import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom'
import { Home, Clock } from 'lucide-react'
import Inicio from './pages/Inicio.jsx'
import NuevoPedido from './pages/NuevoPedido.jsx'
import EditarPedido from './pages/EditarPedido.jsx'
import DetallePedido from './pages/DetallePedido.jsx'
import Historial from './pages/Historial.jsx'
import { App as CapacitorApp } from '@capacitor/app'
import { pedirPermisoNotificaciones, reprogramarNotificaciones } from './lib/notifications'

function AppLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const ruta = location.pathname

  // Ocultar nav en páginas de formulario
  const esFormulario = ruta.startsWith('/nuevo') || ruta.startsWith('/editar') || ruta.startsWith('/pedido/')

  // Manejar el botón de atrás en Android
  useEffect(() => {
    const handleBackButton = async () => {
      if (ruta === '/') {
        await CapacitorApp.exitApp()
      } else {
        navigate(-1)
      }
    }
    const backListener = CapacitorApp.addListener('backButton', handleBackButton)
    return () => {
      backListener.then(listener => listener.remove())
    }
  }, [ruta, navigate])

  return (
    <div className="app-container">
      {/* Navegación de Escritorio */}
      <header className="desktop-nav">
        <div className="desktop-nav-content">
          <Link to="/" className="logo">🎂 Pabel's Repostería</Link>
          <nav className="desktop-links">
            <Link to="/" className={ruta === '/' ? 'activo' : ''}>Pedidos</Link>
            <Link to="/historial" className={ruta === '/historial' ? 'activo' : ''}>Historial</Link>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="main-content">
        {children}
      </main>

      {/* Badge de estado de red/sync */}
      <NetworkBadge />

      {/* Navegación Móvil (Oculto en escritorio y en formularios) */}
      {!esFormulario && (
        <nav className="bottom-nav">
          <button className={`bottom-nav-item ${ruta === '/' ? 'activo' : ''}`} onClick={() => navigate('/')}>
            <Home size={22} />
            <span>Pedidos</span>
          </button>
          <button className={`bottom-nav-item ${ruta === '/historial' ? 'activo' : ''}`} onClick={() => navigate('/historial')}>
            <Clock size={22} />
            <span>Historial</span>
          </button>
        </nav>
      )}
    </div>
  )
}

export default function App() {
  // Inicializar notificaciones al abrir la app
  useEffect(() => {
    const iniciarNotificaciones = async () => {
      const permitido = await pedirPermisoNotificaciones();
      if (permitido) {
        await reprogramarNotificaciones();
      }
    };
    iniciarNotificaciones();
  }, []);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/nuevo" element={<NuevoPedido />} />
          <Route path="/editar/:id" element={<EditarPedido />} />
          <Route path="/pedido/:id" element={<DetallePedido />} />
          <Route path="/historial" element={<Historial />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
