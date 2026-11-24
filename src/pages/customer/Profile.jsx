import { useState } from 'react'
import { UserRound } from 'lucide-react'
import { ImageUpload } from '../../components/common/ImageUpload.jsx'
import { Field, Photo } from '../../components/common/UI.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function Profile() {
  const { user, saveProfile } = useAuth()
  const notify = useToast()
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [image, setImage] = useState(user.image)
  const [temporary, setTemporary] = useState('')
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (busy || uploading) return
    setBusy(true)
    try { await saveProfile({ name, phone, image }); notify('Perfil actualizado.') }
    catch (error) { notify(error.message, 'error') }
    finally { setBusy(false) }
  }
  return <div className="wrap page narrow"><h1>Mi perfil</h1>
    <form className="panel flow" onSubmit={submit}>
      <div className="profile-header">
        <div className="avatar">{temporary || image ? <Photo src={temporary || image} alt="Vista previa de tu foto de perfil" /> : <UserRound size={33} />}</div>
        <div><h2>{user.name}</h2><p className="muted">{user.role === 'cliente' ? 'Cliente' : 'Administrador'} · {user.email}</p></div>
      </div>
      <div className="form-grid">
        <Field label="Nombre"><input value={name} onChange={event => setName(event.target.value)} required maxLength={120} /></Field>
        <Field label="Teléfono"><input value={phone} onChange={event => setPhone(event.target.value)} type="tel" maxLength={25} /></Field>
      </div>
      <ImageUpload label="Fotografía de perfil" images={image ? [image] : []} onChange={images => setImage(images[0] ?? '')}
        onPreview={setTemporary} onBusy={setUploading} maxEdge={400} />
      <button type="submit" className="button" disabled={busy || uploading}>Guardar perfil</button>
    </form>
  </div>
}
