import { useEffect, useId, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { compressImage, validateImage } from '../../services/images.js'
import { useToast } from '../../context/ToastContext.jsx'
import { Photo } from './UI.jsx'

export function ImageUpload({ label, images, onChange, onPreview, onBusy, limit = 1, maxEdge }) {
  const notify = useToast()
  const id = useId()
  const [temporary, setTemporary] = useState([])
  const [error, setError] = useState('')
  const active = useRef(null)
  const handlers = useRef({ onPreview, onBusy })
  handlers.current = { onPreview, onBusy }
  useEffect(() => () => {
    active.current?.forEach(url => URL.revokeObjectURL(url))
    active.current = null
  }, [])

  async function choose(event) {
    const files = Array.from(event.target.files)
    event.target.value = ''
    if (!files.length || active.current) return
    setError('')
    let urls
    try {
      if (limit > 1 && images.length + files.length > limit) throw new Error('Puedes guardar hasta ' + limit + ' imágenes en la galería.')
      files.forEach(validateImage)
      urls = files.map(file => URL.createObjectURL(file))
      active.current = urls
      setTemporary(urls)
      handlers.current.onBusy?.(true)
      handlers.current.onPreview?.(urls[0])
      const saved = await Promise.all(files.map(file => compressImage(file, maxEdge)))
      if (active.current === urls) onChange(limit === 1 ? saved : [...images, ...saved])
    } catch (failure) {
      if (!urls || active.current === urls) {
        setError(failure.message)
        notify(failure.message, 'error')
      }
    } finally {
      if (urls && active.current === urls) {
        active.current = null
        setTemporary([])
        handlers.current.onBusy?.(false)
        handlers.current.onPreview?.('')
        urls.forEach(url => URL.revokeObjectURL(url))
      }
    }
  }
  const displayed = limit === 1 && temporary.length ? temporary : [...images, ...temporary]
  return <div className="image-upload">
    <label htmlFor={id} className="upload-label"><ImagePlus size={18} /> {label}</label>
    <input id={id} type="file" accept="image/jpeg,image/png,image/webp" multiple={limit > 1}
      disabled={Boolean(temporary.length) || (limit > 1 && images.length >= limit)} onChange={choose} />
    <small>JPG, PNG o WEBP · Hasta 2 MB por archivo</small>
    {error && <p className="error" role="alert">{error}</p>}
    {displayed.length > 0 && <div className="upload-previews">
      {displayed.map((source, index) => <div key={index}>
        <Photo src={source} alt={label + ' ' + (index + 1)} />
        {!temporary.length && <button type="button" className="icon-button" aria-label={'Quitar imagen ' + (index + 1)}
          onClick={() => onChange(images.filter((_, position) => position !== index))}><X size={16} /></button>}
      </div>)}
    </div>}
  </div>
}
