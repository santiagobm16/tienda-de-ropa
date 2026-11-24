import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useProducts } from '../../context/ProductsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { Dropdown } from '../common/UI.jsx'

export function Brand() {
  return <Link className="brand" to="/" aria-label="Urban Men, inicio">URBAN<span>MEN</span><i /></Link>
}

export const categoryLink = id => '/productos?category=' + encodeURIComponent(id)

function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const { categories } = useProducts()
  const { pathname, search, key } = useLocation()
  const navigate = useNavigate()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const visibleCategories = categories.filter(category => category.active)
  useEffect(() => {
    setMenu(false)
    setShowSearch(false)
    setQuery(pathname === '/productos' ? new URLSearchParams(search).get('q') ?? '' : '')
  }, [key, pathname, search])

  function searchProducts(event) {
    event.preventDefault()
    navigate(query.trim() ? '/productos?q=' + encodeURIComponent(query.trim()) : '/productos')
    setShowSearch(false)
  }
  function signOut(close) {
    close()
    try {
      logout()
      notify('Sesión cerrada.')
      navigate('/')
    } catch (error) { notify(error.message, 'error') }
  }
  return <header className="site-header">
    <div className="announcement">TIENDA COLOMBIANA DE MODA MASCULINA</div>
    <div className="nav-shell wrap">
      <button type="button" className="icon-button mobile-menu" aria-label={menu ? 'Cerrar navegación' : 'Abrir navegación'}
        aria-expanded={menu} aria-controls="main-navigation" onClick={() => { setMenu(!menu); setShowSearch(false) }}>
        {menu ? <X size={23} /> : <Menu size={23} />}
      </button>
      <Brand />
      <nav id="main-navigation" aria-label="Navegación principal" className={menu ? 'main-nav open' : 'main-nav'}>
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/productos">Catálogo</NavLink>
        <Dropdown label="Categorías" align="left">{close => visibleCategories.map(category =>
          <Link key={category.id} to={categoryLink(category.id)} onClick={close}>{category.name}</Link>)}</Dropdown>
        <NavLink to="/contacto">Contacto</NavLink>
      </nav>
      <div className="nav-tools">
        <form className={showSearch ? 'nav-search open' : 'nav-search'} role="search" onSubmit={searchProducts}>
          <button type="submit" className="icon-button" aria-label="Buscar"><Search size={17} /></button>
          <input aria-label="Buscar productos" placeholder="Buscar productos" value={query} onChange={event => setQuery(event.target.value)} />
        </form>
        <button type="button" className="icon-button search-toggle" aria-label="Abrir buscador" aria-expanded={showSearch}
          onClick={() => { setShowSearch(!showSearch); setMenu(false) }}><Search size={21} /></button>
        {user ? <Dropdown icon={<UserRound size={21} />} title="Menú de usuario">{close => <>
          <span className="dropdown-caption">{user.name}</span>
          <Link to="/perfil" onClick={close}>Mi perfil</Link>
          {user.role === 'cliente' ? <Link to="/mis-pedidos" onClick={close}>Mis pedidos</Link>
            : <Link to="/admin" onClick={close}>Panel administrativo</Link>}
          <button type="button" onClick={() => signOut(close)}>Cerrar sesión</button>
        </>}</Dropdown> : <Link className="icon-button" to="/login" aria-label="Iniciar sesión"><UserRound size={21} /></Link>}
        <Link className="icon-button bag" to="/carrito" aria-label={'Carrito, ' + count + (count === 1 ? ' unidad' : ' unidades')}>
          <ShoppingBag size={21} /><span>{count}</span>
        </Link>
      </div>
    </div>
  </header>
}

function Footer() {
  return <footer className="site-footer">
    <div className="wrap footer-grid">
      <div><Brand /><p>Ropa, calzado y accesorios masculinos para la vida en la ciudad.</p></div>
      <div><h2>Tienda</h2><Link to="/productos">Catálogo</Link><Link to="/productos?deal=1">Promociones</Link><Link to="/carrito">Carrito</Link></div>
      <div><h2>Ayuda</h2><Link to="/contacto">Contacto</Link><Link to="/contacto#preguntas">Preguntas frecuentes</Link><Link to="/mis-pedidos">Mis pedidos</Link></div>
    </div>
    <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Urban Men</span><span>Proyecto académico · Colombia</span></div>
  </footer>
}

export function StoreLayout() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return <div className="site"><a className="skip-link" href="#main-content">Saltar al contenido</a><Navbar />
    <main id="main-content" tabIndex={-1}><Outlet /></main><Footer /></div>
}
