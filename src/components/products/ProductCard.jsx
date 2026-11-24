import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Star } from 'lucide-react'
import { colors, discount, hasDiscount, money, stock } from '../../data/demo.js'
import { useProducts } from '../../context/ProductsContext.jsx'
import { Modal, Photo } from '../common/UI.jsx'

export function Price({ product }) {
  return <div className="price"><strong>{money(Number(product.price) || 0)}</strong>
    {hasDiscount(product) && <del>{money(Number(product.previousPrice))}</del>}</div>
}

export function Swatches({ values }) {
  return <div className="swatches">{values.map(color => <span key={color} title={color}>
    <i aria-hidden="true" style={{ background: colors[color] || '#b9aca0' }} />{color}
  </span>)}</div>
}

export function ProductCard({ product, preview = false }) {
  const { categories } = useProducts()
  const [quickView, setQuickView] = useState(false)
  const category = categories.find(entry => entry.id === product.categoryId)
  const availability = !product.active || (category && !category.active) ? 'Inactivo' : stock(product) ? 'Disponible' : 'Agotado'
  const name = product.name || 'Nombre del producto'
  const percent = discount(product)
  const to = '/productos/' + product.id
  const photo = <Photo src={product.image} alt={name} loading="lazy" />
  return <article className="product-card">
    <div className="product-image">
      {preview ? photo : <Link to={to} aria-label={'Ver ' + name}>{photo}</Link>}
      {percent > 0 && <span className="sale-label">−{percent}%</span>}
      {!preview && <button type="button" className="icon-button quick-button" aria-label={'Vista rápida de ' + name}
        onClick={() => setQuickView(true)}><Eye size={18} /></button>}
    </div>
    <div className="product-copy">
      <span className="product-category">{category?.name || 'Categoría'}</span>
      <h3>{preview ? name : <Link to={to}>{name}</Link>}</h3>
      <Price product={product} />
      <span className={'availability ' + (availability === 'Disponible' ? 'available' : '')}>{availability}</span>
      {preview ? <div className="preview-details">
        <p>{product.description || 'La descripción aparecerá aquí.'}</p>
        <p>Tallas {product.sizes.join(', ') || 'por seleccionar'}</p>
        <Swatches values={product.colors} />
        {product.featured && <span className="status"><Star size={14} /> Destacado</span>}
      </div> : <Link className="product-link" to={to}>Ver producto</Link>}
    </div>
    {quickView && <Modal title={name} wide onClose={() => setQuickView(false)}>
      <div className="quick-view"><Photo src={product.image} alt={name} />
        <div className="flow"><span className="product-category">{category?.name}</span><Price product={product} />
          <p>{product.description}</p><p>{availability}</p><Swatches values={product.colors} />
          <Link to={to} className="button" onClick={() => setQuickView(false)}>Ver producto</Link>
        </div>
      </div>
    </Modal>}
  </article>
}

export function ProductGrid({ products }) {
  return <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>
}
