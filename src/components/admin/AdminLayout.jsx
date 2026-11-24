import { LayoutDashboard, ListTree, Package, Plus, ShoppingBag, Warehouse } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  ['/admin', 'Dashboard', LayoutDashboard],
  ['/admin/productos', 'Productos', Package],
  ['/admin/productos/nuevo', 'Registrar producto', Plus],
  ['/admin/categorias', 'Categorías', ListTree],
  ['/admin/inventario', 'Inventario', Warehouse],
  ['/admin/pedidos', 'Pedidos', ShoppingBag],
]

export default function AdminLayout() {
  return <div className="wrap page admin-layout">
    <aside className="admin-sidebar" aria-label="Panel administrativo">
      <p className="eyebrow">Administración</p>
      <nav>{links.map(([href, label, Icon]) => <NavLink key={href} to={href} end>
        <Icon size={18} />{label}</NavLink>)}</nav>
    </aside>
    <div className="admin-content"><Outlet /></div>
  </div>
}
