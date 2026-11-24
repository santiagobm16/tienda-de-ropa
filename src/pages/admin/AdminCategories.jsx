import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Confirm, Field, Modal, Photo } from '../../components/common/UI.jsx'
import { ImageUpload } from '../../components/common/ImageUpload.jsx'
import { useProducts } from '../../context/ProductsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

function CategoryEditor({ category, onClose }) {
  const { saveCategory } = useProducts()
  const notify = useToast()
  const [name, setName] = useState(category.name)
  const [image, setImage] = useState(category.image)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (uploading || pending) return
    if (!image) { setMessage('Agrega una imagen representativa.'); return }
    setPending(true)
    try {
      await saveCategory({ ...category, name, image })
      notify('Categoría guardada.')
      onClose()
    } catch (error) { setMessage(error.message); notify(error.message, 'error') }
    finally { setPending(false) }
  }
  return <Modal title={category.name ? 'Editar categoría' : 'Registrar categoría'} onClose={() => { if (!pending) onClose() }}>
    <form className="flow" onSubmit={submit}>
      <Field label="Nombre de categoría"><input value={name} onChange={event => setName(event.target.value)} required maxLength={80} /></Field>
      <ImageUpload label="Imagen de categoría" images={image ? [image] : []} onChange={images => setImage(images[0] ?? '')} onBusy={setUploading} />
      {message && <p role="alert" className="error">{message}</p>}
      <button className="button" type="submit" disabled={pending || uploading}>Guardar categoría</button>
    </form>
  </Modal>
}

export default function AdminCategories() {
  const { categories, products, saveCategory } = useProducts()
  const notify = useToast()
  const [draft, setDraft] = useState(null)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  async function toggle(category) {
    setBusy(true)
    try {
      await saveCategory({ ...category, active: !category.active })
      notify(category.active ? 'Categoría desactivada.' : 'Categoría activada.')
      setSelected(null)
    } catch (error) { notify(error.message, 'error') }
    finally { setBusy(false) }
  }
  return <>
    <div className="section-head"><h1>Categorías</h1><button type="button" className="button" onClick={() =>
      setDraft({ id: crypto.randomUUID(), name: '', image: '', active: true })}><Plus size={18} /> Registrar categoría</button></div>
    <div className="admin-category-grid">{categories.map(category => <article className="panel flow" key={category.id}>
      <Photo src={category.image} loading="lazy" />
      <div className="section-head"><h2>{category.name}</h2><span className="status">{category.active ? 'Activa' : 'Inactiva'}</span></div>
      <p className="muted">{products.filter(product => product.categoryId === category.id).length} productos asociados</p>
      <div className="action-row"><button type="button" className="button secondary small" onClick={() => setDraft(category)}>Editar</button>
        <button type="button" className="text-link" disabled={busy} onClick={() => category.active ? setSelected(category) : toggle(category)}>
          {category.active ? 'Desactivar' : 'Activar'}</button></div>
    </article>)}</div>
    {draft && <CategoryEditor category={draft} onClose={() => setDraft(null)} />}
    {selected && <Confirm title="¿Desactivar la categoría?" description="La categoría y sus productos se ocultarán del catálogo hasta que la actives."
      action="Desactivar" onClose={() => { if (!busy) setSelected(null) }} pending={busy} onConfirm={() => toggle(selected)} />}
  </>
}
