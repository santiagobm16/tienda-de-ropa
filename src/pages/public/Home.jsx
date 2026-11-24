import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Package, RotateCcw, ShieldCheck } from 'lucide-react'
import { Photo } from '../../components/common/UI.jsx'
import { categoryLink } from '../../components/layout/StoreLayout.jsx'
import { ProductGrid } from '../../components/products/ProductCard.jsx'
import { useProducts } from '../../context/ProductsContext.jsx'

const banners = [
  { image: '/images/campana.webp', label: 'ESENCIALES URBANOS', title: ['Viste la', 'ciudad.'], text: 'Ropa masculina de líneas limpias, cortes cómodos y carácter urbano.', action: 'Explorar catálogo', link: '/productos' },
  { image: '/images/denim.webp', label: 'DENIM', title: ['El jean de', 'cada día.'], text: 'Elige entre siluetas rectas, amplias y ajustadas.', action: 'Comprar jeans', link: categoryLink('jeans') },
  { image: '/images/movimiento.webp', label: 'ROPA DEPORTIVA', title: ['En', 'movimiento.'], text: 'Prendas ligeras para entrenar y moverte por la ciudad.', action: 'Explorar deportiva', link: categoryLink('deportiva') },
]

function Carousel() {
  const [position, setPosition] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const banner = banners[position]
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  useEffect(() => {
    if (paused || hover || focused || reduced) return
    const timer = setTimeout(() => setPosition(value => (value + 1) % banners.length), 5000)
    return () => clearTimeout(timer)
  }, [position, paused, hover, focused, reduced])

  const move = delta => setPosition(value => (value + delta + banners.length) % banners.length)
  return <section className="hero" aria-label="Colecciones destacadas" aria-roledescription="carrusel"
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    <div className="hero-slide" key={banner.image}>
      <Photo src={banner.image} alt="" fetchPriority="high" />
      <div className="hero-shade" />
      <div className="wrap hero-content">
        <p className="eyebrow">{banner.label}</p>
        <h1>{banner.title[0]}<br />{banner.title[1]}</h1>
        <p className="hero-description">{banner.text}</p>
        <Link className="button light" to={banner.link}>{banner.action}</Link>
      </div>
    </div>
    <div className="wrap hero-controls">
      <div className="hero-dots">{banners.map(({ label }, index) => <button key={label} type="button"
        aria-label={'Mostrar ' + label.toLowerCase()} aria-current={index === position ? 'true' : undefined} onClick={() => setPosition(index)} />)}</div>
      <div className="carousel-actions">
        {!reduced && <button type="button" className="carousel-pause" onClick={() => setPaused(value => !value)}>{paused ? 'Reanudar' : 'Pausar'}</button>}
        <button type="button" className="icon-button" onClick={() => move(-1)} aria-label="Banner anterior"><ChevronLeft size={21} /></button>
        <button type="button" className="icon-button" onClick={() => move(1)} aria-label="Banner siguiente"><ChevronRight size={21} /></button>
      </div>
    </div>
  </section>
}

export default function Home() {
  const { categories, catalog } = useProducts()
  const featured = catalog.filter(product => product.featured).slice(0, 4)
  const newest = [...catalog].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
  const deals = catalog.filter(product => product.previousPrice > product.price).slice(0, 4)
  return <>
    <Carousel />
    <section className="service-strip"><div className="wrap service-grid">
      <span><Package size={20} /> Envíos en Colombia</span><span><RotateCcw size={20} /> Cambios y devoluciones</span>
      <span><ShieldCheck size={20} /> Compra de demostración</span>
    </div></section>
    <section className="wrap home-section">
      <div className="section-head"><h2>Compra por categoría</h2><Link to="/productos" className="text-link">Ver catálogo</Link></div>
      <div className="category-grid">{categories.filter(category => category.active).map(category =>
        <Link key={category.id} to={categoryLink(category.id)} className="category-card">
          <Photo src={category.image} alt="" loading="lazy" /><span>{category.name}</span>
        </Link>)}</div>
    </section>
    {[['Destacados', featured, '/productos'], ['Recién llegados', newest, '/productos?sort=recent'], ['Promociones', deals, '/productos?deal=1']].map(([title, products, href]) =>
      products.length > 0 && <section className="wrap home-section" key={title}>
        <div className="section-head"><h2>{title}</h2><Link to={href} className="text-link">Ver más</Link></div>
        <ProductGrid products={products} />
      </section>)}
    <section className="about-strip"><div className="wrap"><h2>Ropa para la vida en la ciudad</h2>
      <p>URBAN MEN reúne básicos, denim, prendas deportivas, calzado y accesorios masculinos. Consulta las variantes disponibles de cada prenda y arma tu pedido de demostración.</p>
      <Link className="button secondary" to="/contacto">Conoce la tienda</Link></div></section>
  </>
}
