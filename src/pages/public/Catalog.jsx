import { useMemo } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../../context/StoreContext.jsx'
import { useProducts } from '../../context/ProductsContext.jsx'
import { selectProducts } from '../../services/store.js'
import { Empty, Field } from '../../components/common/UI.jsx'
import { ProductGrid } from '../../components/products/ProductCard.jsx'

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const { data } = useStore()
  const { catalog, categories } = useProducts()
  const sizeOptions = [...new Set(catalog.flatMap(product => product.sizes))]
  const colorOptions = [...new Set(catalog.flatMap(product => product.colors))]
  const filters = Object.fromEntries(params)
  const results = useMemo(() => selectProducts(data, Object.fromEntries(params)), [data, params])
  const title = filters.deal ? 'Promociones' : categories.find(category => category.active && category.id === filters.category)?.name ?? 'Catálogo'

  function change(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  function select(label, key, options, first = 'Todas') {
    return <Field label={label}><select value={filters[key] ?? ''} onChange={event => change(key, event.target.value)}>
      <option value="">{first}</option>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
    </select></Field>
  }
  return <div className="wrap page">
    <h1>{title}</h1>
    <div className="catalog-layout">
      <aside className="filters" aria-label="Filtros del catálogo">
        <div className="section-head"><h2><SlidersHorizontal size={18} /> Filtros</h2>
          <button type="button" className="text-link" onClick={() => setParams({})}>Limpiar</button></div>
        <Field label="Buscar"><input type="search" value={filters.q ?? ''} onChange={event => change('q', event.target.value)} placeholder="Nombre o descripción" /></Field>
        {select('Categoría', 'category', categories.filter(category => category.active).map(({ id, name }) => [id, name]))}
        {select('Talla', 'size', sizeOptions.map(size => [size, size]))}
        {select('Color', 'color', colorOptions.map(color => [color, color]), 'Todos')}
        <div className="form-grid">
          <Field label="Desde (COP)"><input type="number" min="0" value={filters.min ?? ''} onChange={event => change('min', event.target.value)} /></Field>
          <Field label="Hasta (COP)"><input type="number" min="0" value={filters.max ?? ''} onChange={event => change('max', event.target.value)} /></Field>
        </div>
        <label className="check"><input type="checkbox" checked={Boolean(filters.available)} onChange={event => change('available', event.target.checked ? '1' : '')} /> Solo disponibles</label>
      </aside>
      <section className="catalog-results">
        <div className="section-head catalog-toolbar"><p aria-live="polite">{results.length} {results.length === 1 ? 'producto' : 'productos'}</p>
          {select('Ordenar', 'sort', [['name', 'Nombre A–Z'], ['low', 'Menor precio'], ['high', 'Mayor precio']], 'Más recientes')}</div>
        {results.length ? <ProductGrid products={results} /> : <Empty title="No encontramos productos"><p>Prueba otros términos o cambia los filtros.</p></Empty>}
      </section>
    </div>
  </div>
}
