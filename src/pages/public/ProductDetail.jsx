import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { Accordion, Empty, Field, Photo, Quantity, Tabs } from '../../components/common/UI.jsx'
import { categoryLink } from '../../components/layout/StoreLayout.jsx'
import { Price, ProductGrid } from '../../components/products/ProductCard.jsx'
import { useProducts } from '../../context/ProductsContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { discount, stock, variantKey } from '../../data/demo.js'

function Detail({ product, related, category }) {
  const [size, setSize] = useState(product.sizes.includes('Única') && product.sizes.length === 1 ? 'Única' : '')
  const [color, setColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const { add, lines } = useCart()
  const notify = useToast()
  const photos = [product.image, ...product.gallery]
  const units = product.inventory[variantKey(size, color)] ?? 0
  const inCart = lines.find(line => line.productId === product.id && line.size === size && line.color === color)?.quantity ?? 0
  const remaining = Math.max(0, units - inCart)
  const shownQuantity = Math.min(quantity, Math.max(1, remaining))
  const percent = discount(product)

  async function addToCart(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      await add({ productId: product.id, size, color }, shownQuantity)
      notify(product.name + ' agregado al carrito.')
    } catch (error) { notify(error.message, 'error') }
    finally { setBusy(false) }
  }
  return <div className="wrap page">
    <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link to="/">Inicio</Link><span>/</span>
      <Link to="/productos">Catálogo</Link><span>/</span><Link to={categoryLink(category.id)}>{category.name}</Link></nav>
    <div className="detail-grid">
      <div className="detail-media">
        <Photo src={photos[photoIndex] ?? photos[0]} alt={product.name} className="detail-photo" />
        {photos.length > 1 && <div className="thumbnails">{photos.map((image, index) => <button type="button" key={index}
          aria-label={'Ver imagen ' + (index + 1)} aria-pressed={photoIndex === index} onClick={() => setPhotoIndex(index)}><Photo src={image} /></button>)}</div>}
      </div>
      <div className="detail-copy">
        <p className="eyebrow">{category.name}</p>
        <h1>{product.name}</h1>
        <div className="inline"><Price product={product} />{percent > 0 && <span className="status">−{percent}%</span>}</div>
        <p>{product.description}</p>
        <form className="flow" onSubmit={addToCart}>
          <div className="form-grid">
            <Field label="Talla"><select required value={size} onChange={event => { setSize(event.target.value); setQuantity(1) }}>
              <option value="">Seleccionar</option>{product.sizes.map(option => <option key={option}>{option}</option>)}
            </select></Field>
            <Field label="Color"><select required value={color} onChange={event => { setColor(event.target.value); setQuantity(1) }}>
              <option value="">Seleccionar</option>{product.colors.map(option => <option key={option}>{option}</option>)}
            </select></Field>
          </div>
          <p className={units ? 'muted' : 'stock-message'} aria-live="polite">{!stock(product) ? 'Producto agotado.'
            : !size || !color ? 'Selecciona una talla y un color.'
            : !units ? 'Combinación agotada.' : units + ' unidades disponibles' + (inCart ? ' · ' + inCart + ' en tu carrito' : '')}</p>
          <div className="purchase-row">
            <Quantity value={shownQuantity} onChange={setQuantity} max={remaining} disabled={!remaining || busy} />
            <button className="button" type="submit" disabled={!remaining || busy}><ShoppingBag size={18} /> Agregar al carrito</button>
          </div>
        </form>
      </div>
    </div>
    <Tabs label="Información de producto" items={[
      ['Descripción', <p>{product.description}</p>],
      ['Características', <dl className="definition"><dt>Categoría</dt><dd>{category.name}</dd><dt>Colores</dt><dd>{product.colors.join(', ')}</dd><dt>Tallas</dt><dd>{product.sizes.join(', ')}</dd></dl>],
      ['Guía de tallas', <><p>Tallas disponibles para esta referencia: {product.sizes.join(', ')}.</p><p>Compara la etiqueta de una prenda o un par de tu talla con las opciones del selector. Si tienes dudas, consulta con la tienda.</p></>],
      ['Envíos y cambios', <Accordion items={[
        ['Envíos', 'El formulario de pedido permite indicar una dirección colombiana para simular el envío.'],
        ['Cambios y devoluciones', <Link to="/contacto#preguntas" className="text-link">Consulta las preguntas frecuentes</Link>],
      ]} />],
    ]} />
    {related.length > 0 && <section className="related"><h2>También te puede interesar</h2><ProductGrid products={related} /></section>}
  </div>
}

export default function ProductDetail() {
  const { id } = useParams()
  const { catalog, categories } = useProducts()
  const product = catalog.find(entry => entry.id === id)
  if (!product) return <div className="wrap page"><Empty title="Producto no disponible"><Link className="button" to="/productos">Volver al catálogo</Link></Empty></div>
  const category = categories.find(entry => entry.id === product.categoryId)
  const related = catalog.filter(entry => entry.categoryId === product.categoryId && entry.id !== id).slice(0, 4)
  return <Detail key={id} product={product} category={category} related={related} />
}
