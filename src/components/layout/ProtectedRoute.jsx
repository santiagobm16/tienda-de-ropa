import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Empty } from '../common/UI.jsx'

export default function ProtectedRoute({ role }) {
  const { user } = useAuth()
  const { pathname, search, hash } = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: pathname + search + hash }} />
  if (role && user.role !== role) return <div className="wrap page">
    <Empty title="Acceso denegado"><p>Tu cuenta no tiene permiso para abrir esta sección.</p>
      <Link className="button" to="/">Volver al inicio</Link></Empty>
  </div>
  return <Outlet />
}
