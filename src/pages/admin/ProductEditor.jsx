import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import ProductPreview from '../../components/admin/ProductPreview.jsx'
import { ImageUpload } from '../../components/common/ImageUpload.jsx'
import { Empty, Field } from '../../components/common/UI.jsx'
import { useProducts } from '../../context/ProductsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { colors, discount, normalize, variantKey } from '../../data/demo.js'

const baseSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única']

function VariantOptions({ title, options, selected, onChange }) {
  const [input, setInput] = useState('')
  function add() {
    const name = input.trim()
    if (!name) return
    const canonical = options.find(option => normalize(option) === normalize(name)) || name
    if (!selected.includes(canonical)) onChange([...selected, canonical])
    setInput('')
  }
  return <fieldset className="choices"><legend>{title}</legend>
    <div className="chips">{options.map(option => <label className="variant-chip" key={option}>
      <input type="checkbox" checked={selected.includes(option)} onChange={() => onChange(selected.includes(option)
        ? selected.filter(entry => entry !== option) : [...selected, option])} />{option}
    </label>)}</div>
    <div className="inline variant-add">
      <input aria-label={'Otra opción de ' + title.toLowerCase()} maxLength={35} value={input} onChange={event => setInput(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); add() } }} placeholder="Agregar otra opción" />
      <button type="button" className="icon-button" aria-label={'Agregar opción de ' + title.toLowerCase()} onClick={add}><Plus size={19} /></button>
    </div>
  </fieldset>
}

function newDraft(original) {
  return original ? { ...original, originalInventory: original.inventory } : {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), name: '', description: '', price: '', previousPrice: '',
    categoryId: '', sizes: [], colors: [], image: '', gallery: [], inventory: {}, active: true, featured: false,
  }
}

function Editor({ original }) {
  const navigate = useNavigate()
  const { categories, products, saveProduct } = useProducts()
  const notify = useToast()
  const [draft, setDraft] = useState(() => newDraft(original))
  const [temporary, setTemporary] = useState('')
  const [mainBusy, setMainBusy] = useState(false)
  const [galleryBusy, setGalleryBusy] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const busy = mainBusy || galleryBusy || pending
  const patch = fields => setDraft(current => ({ ...current, ...fields }))
  const items = draft.sizes.flatMap(size => draft.colors.map(color => [size, color, variantKey(size, color)]))
  const allSizes = [...new Set([...baseSizes, ...products.flatMap(product => product.sizes), ...draft.sizes])]
  const allColors = [...new Set([...Object.keys(colors), ...products.flatMap(product => product.colors), ...draft.colors])]
  const preview = { ...draft, inventory: Object.fromEntries(items.map(([, , key]) => [key, draft.inventory[key] ?? 0])) }
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setPending(true)
    setError('')
    try {
      await saveProduct(draft, Boolean(original))
      notify(original ? 'Producto actualizado.' : 'Producto registrado.')
      navigate('/admin/productos')
    } catch (failure) { setError(failure.message); notify(failure.message, 'error') }
    finally { setPending(false) }
  }
  return <>
    <h1>{original ? 'Editar producto' : 'Registrar producto'}</h1>
    <div className="editor-layout">
      <form className="panel flow" onSubmit={submit}>
        <div className="form-grid">
          <Field label="Nombre" full><input value={draft.name} onChange={event => patch({ name: event.target.value })} required maxLength={120} /></Field>
          <Field label="Descripción" full><textarea value={draft.description} onChange={event => patch({ description: event.target.value })} required rows={4} maxLength={1000} /></Field>
          <Field label="Categoría" full><select value={draft.categoryId} onChange={event => patch({ categoryId: event.target.value })} required>
            <option value="">Seleccionar categoría</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}{!category.active && ' (inactiva)'}</option>)}
          </select></Field>
          <Field label="Precio (COP)"><input type="number" min="1" step="1" value={draft.price} onChange={event => patch({ price: event.target.value })} required /></Field>
          <Field label="Precio anterior (opcional)"><input type="number" min="0" step="1" value={draft.previousPrice || ''} onChange={event => patch({ previousPrice: event.target.value })} /></Field>
        </div>
        <p className="muted" aria-live="polite">Descuento calculado: {discount({ price: Number(draft.price), previousPrice: Number(draft.previousPrice) })}%</p>
        <VariantOptions title="Tallas" options={allSizes} selected={draft.sizes} onChange={sizes => patch({ sizes })} />
        <VariantOptions title="Colores" options={allColors} selected={draft.colors} onChange={values => patch({ colors: values })} />
        <fieldset className="choices"><legend>Inventario por talla y color</legend>
          {!items.length && <p className="muted">Selecciona tallas y colores para asignar existencias.</p>}
          <div className="form-grid">{items.map(([size, color, key]) => <Field key={key} label={size + ' · ' + color}>
            <input type="number" min="0" step="1" required value={draft.inventory[key] ?? 0} onChange={event => {
              const value = event.target.value
              setDraft(current => ({ ...current, inventory: { ...current.inventory, [key]: value === '' ? '' : Number(value) } }))
            }} /></Field>)}</div>
        </fieldset>
        <ImageUpload label="Imagen principal" images={draft.image ? [draft.image] : []} onChange={images => patch({ image: images[0] ?? '' })}
          onPreview={setTemporary} onBusy={setMainBusy} />
        <ImageUpload label="Imágenes adicionales" images={draft.gallery} onChange={gallery => patch({ gallery })} onBusy={setGalleryBusy} limit={5} />
        <div className="inline">
          <label className="check"><input type="checkbox" checked={draft.active} onChange={event => patch({ active: event.target.checked })} /> Publicado</label>
          <label className="check"><input type="checkbox" checked={draft.featured} onChange={event => patch({ featured: event.target.checked })} /> Destacado</label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="action-row"><Link className="button secondary" to="/admin/productos">Cancelar</Link>
          <button className="button" type="submit" disabled={busy}>{pending ? 'Guardando…' : 'Guardar producto'}</button></div>
      </form>
      <ProductPreview draft={preview} temporary={temporary} />
    </div>
  </>
}

export default function ProductEditor() {
  const { id } = useParams()
  const { products } = useProducts()
  const original = products.find(product => product.id === id)
  if (id && !original) return <Empty title="Producto no encontrado"><Link to="/admin/productos" className="button">Ir a productos</Link></Empty>
  return <Editor key={id ?? 'new'} original={original} />
}
