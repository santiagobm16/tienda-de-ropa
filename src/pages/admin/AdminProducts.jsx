import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Ellipsis, Plus, Star } from 'lucide-react'
import { Confirm, Dropdown, Empty, Field, Photo } from '../../components/common/UI.jsx'
import { useProducts } from '../../context/ProductsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { money, normalize, stock } from '../../data/demo.js'

export default function AdminProducts() {
  const { products, categories, patchProduct, deleteProduct } = useProducts()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const list = products.filter(product => normalize(product.name + ' ' + product.description).includes(normalize(query))
    && (!category || product.categoryId === category)
    && (!status || (status === 'active' ? product.active : status === 'inactive' ? !product.active : product.featured)))

  async function run(action, message) {
    setBusy(true)
    try { await action(); notify(message) }
    catch (error) { notify(error.message, 'error') }
    finally { setBusy(false) }
  }
  return <>
    <div className="section-head"><h1>Productos</h1><Link className="button" to="/admin/productos/nuevo"><Plus size={18} /> Registrar producto</Link></div>
    <div className="admin-filters">
      <Field label="Buscar producto"><input type="search" value={query} onChange={event => setQuery(event.target.value)} /></Field>
      <Field label="Categoría"><select value={category} onChange={event => setCategory(event.target.value)}>
        <option value="">Todas</option>{categories.map(entry => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></Field>
      <Field label="Estado"><select value={status} onChange={event => setStatus(event.target.value)}>
        <option value="">Todos</option><option value="active">Activo</option><option value="inactive">Inactivo</option><option value="featured">Destacado</option>
      </select></Field>
    </div>
    {list.length ? <div className="table-wrap"><table>
      <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Unidades</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>{list.map(product => <tr key={product.id}>
        <td data-label="Producto"><div className="table-product"><Photo src={product.image} /><strong>{product.name}</strong>
          {product.featured && <Star size={15} aria-label="Destacado" />}</div></td>
        <td data-label="Categoría">{categories.find(entry => entry.id === product.categoryId)?.name}</td>
        <td data-label="Precio">{money(product.price)}</td><td data-label="Unidades">{stock(product)}</td>
        <td data-label="Estado"><span className="status">{product.active ? 'Activo' : 'Inactivo'}</span></td>
        <td data-label="Acciones"><Dropdown icon={<Ellipsis size={20} />} title={'Acciones de ' + product.name} disabled={busy}>{close => <>
          <Link to={'/admin/productos/editar/' + product.id} onClick={close}>Editar</Link>
          <button type="button" onClick={() => { close(); run(() => patchProduct(product.id, { active: !product.active }), product.active ? 'Producto desactivado.' : 'Producto activado.') }}>
            {product.active ? 'Desactivar' : 'Activar'}</button>
          <button type="button" onClick={() => { close(); run(() => patchProduct(product.id, { featured: !product.featured }), 'Destacado actualizado.') }}>
            {product.featured ? 'Quitar destacado' : 'Marcar como destacado'}</button>
          <button className="error" type="button" onClick={() => { close(); setSelected(product) }}>Eliminar</button>
        </>}</Dropdown></td>
      </tr>)}</tbody>
    </table></div> : <Empty title="No hay productos con esos filtros" />}
    {selected && <Confirm title="¿Eliminar el producto?" description={'Se retirará ' + selected.name + ' del catálogo y del carrito. Los pedidos históricos conservarán sus datos.'}
      action="Eliminar producto" pending={busy} onClose={() => { if (!busy) setSelected(null) }} onConfirm={() =>
        run(async () => { await deleteProduct(selected.id); setSelected(null) }, 'Producto eliminado.')} />}
  </>
}
