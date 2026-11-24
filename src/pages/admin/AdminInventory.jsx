import { useState } from 'react'
import { Empty, Field, Photo } from '../../components/common/UI.jsx'
import { useProducts } from '../../context/ProductsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { normalize } from '../../data/demo.js'

function InventoryRow({ product, category, variant, units }) {
  const { setStock } = useProducts()
  const notify = useToast()
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [size, color] = JSON.parse(variant)
  async function save(event) {
    event.preventDefault()
    setBusy(true)
    try { await setStock(product.id, variant, draft ?? units); setDraft(null); notify('Inventario actualizado.') }
    catch (error) { notify(error.message, 'error') }
    finally { setBusy(false) }
  }
  return <tr>
    <td data-label="Producto"><div className="table-product"><Photo src={product.image} loading="lazy" /><strong>{product.name}</strong></div></td>
    <td data-label="Categoría">{category}</td><td data-label="Talla">{size}</td><td data-label="Color">{color}</td>
    <td data-label="Existencias"><span data-status={units === 0 ? 'Cancelado' : units <= 3 ? 'Pendiente' : 'Entregado'} className="status">
      {units} · {units === 0 ? 'Agotado' : units <= 3 ? 'Bajo' : 'Disponible'}</span></td>
    <td data-label="Actualizar"><form className="inventory-form" onSubmit={save}>
      <input type="number" min="0" step="1" required aria-label={'Existencias de ' + product.name + ' ' + size + ' ' + color}
        value={draft ?? units} onChange={event => setDraft(event.target.value)} />
      <button type="submit" className="button secondary small" disabled={busy || draft === null || draft === String(units)}>Guardar</button>
    </form></td>
  </tr>
}

export default function AdminInventory() {
  const { products, categories } = useProducts()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  const [limit, setLimit] = useState(25)
  const rows = products.filter(product => normalize(product.name).includes(normalize(query))).flatMap(product =>
    Object.entries(product.inventory).filter(([, units]) => !filter || (filter === 'empty' ? units === 0 : units > 0 && units <= 3))
      .map(([variant, units]) => ({ product, variant, units })))
  return <>
    <h1>Inventario</h1>
    <div className="admin-filters">
      <Field label="Buscar producto"><input type="search" value={query} onChange={event => { setQuery(event.target.value); setLimit(25) }} /></Field>
      <Field label="Existencias"><select value={filter} onChange={event => { setFilter(event.target.value); setLimit(25) }}>
        <option value="">Todas</option><option value="low">Inventario bajo</option><option value="empty">Agotado</option></select></Field>
    </div>
    {rows.length ? <>
      <div className="table-wrap"><table>
        <thead><tr><th>Producto</th><th>Categoría</th><th>Talla</th><th>Color</th><th>Existencias</th><th>Actualizar</th></tr></thead>
        <tbody>{rows.slice(0, limit).map(({ product, variant, units }) => <InventoryRow key={product.id + variant}
          product={product} category={categories.find(category => category.id === product.categoryId)?.name} variant={variant} units={units} />)}</tbody>
      </table></div>
      {rows.length > limit && <div className="load-more"><button type="button" className="button secondary" onClick={() => setLimit(value => value + 25)}>Mostrar más variantes</button></div>}
    </> : <Empty title="No hay variantes con esos filtros" />}
  </>
}
