import { Link, Route, Routes } from 'react-router-dom'
import { Empty } from './components/common/UI.jsx'
import { StoreLayout } from './components/layout/StoreLayout.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import Home from './pages/public/Home.jsx'
import Catalog from './pages/public/Catalog.jsx'
import ProductDetail from './pages/public/ProductDetail.jsx'
import Contact from './pages/public/Contact.jsx'
import Login from './pages/public/Login.jsx'
import Cart from './pages/customer/Cart.jsx'
import { Checkout, OrderSuccess } from './pages/customer/Checkout.jsx'
import MyOrders from './pages/customer/MyOrders.jsx'
import Profile from './pages/customer/Profile.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import ProductEditor from './pages/admin/ProductEditor.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminInventory from './pages/admin/AdminInventory.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'

export default function App() {
  return <Routes>
    <Route element={<StoreLayout />}>
      <Route index element={<Home />} />
      <Route path="productos" element={<Catalog />} />
      <Route path="productos/:id" element={<ProductDetail />} />
      <Route path="contacto" element={<Contact />} />
      <Route path="carrito" element={<Cart />} />
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="perfil" element={<Profile />} />
      </Route>
      <Route element={<ProtectedRoute role="cliente" />}>
        <Route path="checkout" element={<Checkout />} />
        <Route path="mis-pedidos" element={<MyOrders />} />
        <Route path="pedido-exitoso/:id" element={<OrderSuccess />} />
      </Route>
      <Route element={<ProtectedRoute role="administrador" />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="productos/nuevo" element={<ProductEditor />} />
          <Route path="productos/editar/:id" element={<ProductEditor />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="inventario" element={<AdminInventory />} />
          <Route path="pedidos" element={<AdminOrders />} />
        </Route>
      </Route>
      <Route path="*" element={<div className="wrap page"><Empty title="Página no encontrada">
        <Link className="button" to="/">Volver al inicio</Link></Empty></div>} />
    </Route>
  </Routes>
}
