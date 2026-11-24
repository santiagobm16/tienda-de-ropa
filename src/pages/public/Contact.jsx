import { useState } from 'react'
import { Accordion, Field } from '../../components/common/UI.jsx'
import { useStore } from '../../context/StoreContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { validEmail } from '../../services/store.js'

const questions = [
  ['¿Cómo se registra un pedido?', 'Agrega tus prendas al carrito, inicia sesión con la cuenta de cliente y completa los datos de entrega. Podrás consultar el pedido en Mis pedidos.'],
  ['¿Cómo funcionan los envíos?', 'Puedes indicar un departamento, ciudad y dirección de Colombia. La tienda registra el envío como parte de la simulación académica.'],
  ['¿Cómo solicito un cambio o devolución?', 'Usa el formulario de esta página para registrar una solicitud de demostración. Incluye el número de pedido y el artículo.'],
  ['¿Qué métodos de pago puedo elegir?', 'Contraentrega o transferencia simulada. Ambos registran la elección como parte del pedido de demostración.'],
]

export default function Contact() {
  const { update } = useStore()
  const notify = useToast()
  const [busy, setBusy] = useState(false)
  async function send(event) {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]))
    if (!values.name || !validEmail(values.email) || !values.subject || !values.message) {
      notify('Completa todos los campos con datos válidos.', 'error')
      return
    }
    setBusy(true)
    try {
      const contact = { ...values, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      await update(current => ({ ...current, contacts: [...current.contacts, contact] }))
      form.reset()
      notify('La solicitud de demostración quedó guardada en este navegador.')
    } catch (error) { notify(error.message, 'error') }
    finally { setBusy(false) }
  }
  return <div className="wrap page">
    <h1>Contacto</h1>
    <div className="contact-grid">
      <div><h2>¿En qué podemos ayudarte?</h2><p>Consulta información sobre tallas, pedidos, envíos y cambios de URBAN MEN.</p>
        <p className="muted">El formulario registra solicitudes de demostración en este navegador.</p></div>
      <form className="panel flow" onSubmit={send}>
        <div className="form-grid">
          <Field label="Nombre"><input name="name" autoComplete="name" required maxLength={100} /></Field>
          <Field label="Correo"><input name="email" type="email" autoComplete="email" required maxLength={150} /></Field>
          <Field label="Asunto" full><input name="subject" required maxLength={120} /></Field>
          <Field label="Mensaje" full><textarea name="message" required rows={5} maxLength={2000} /></Field>
        </div>
        <button className="button" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar solicitud'}</button>
      </form>
    </div>
    <section id="preguntas" className="faq"><h2>Preguntas frecuentes</h2><Accordion items={questions} /></section>
  </div>
}
