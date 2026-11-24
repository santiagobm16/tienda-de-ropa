import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import { Empty, Field } from '../../components/common/UI.jsx'
import { OrderDetails } from '../../components/common/OrderDetails.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useOrders } from '../../context/OrdersContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { money, paymentMethods } from '../../data/demo.js'

export function Checkout() {
  const { user } = useAuth()
  const { lines, total } = useCart()
  const { place } = useOrders()
  const notify = useToast()
  const navigate = useNavigate()
  const requestId = useRef(null)
  const submitting = useRef(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const invalid = lines.some(line => line.quantity > line.available)
  async function submit(event) {
    event.preventDefault()
    if (submitting.current || invalid) return
    submitting.current = true
    setBusy(true)
    setMessage('')
    requestId.current ??= crypto.randomUUID()
    try {
      const order = await place(Object.fromEntries(new FormData(event.currentTarget)), requestId.current)
      notify('Pedido confirmado.')
      navigate('/pedido-exitoso/' + order.id, { replace: true })
    } catch (error) {
      setMessage(error.message)
      notify(error.message, 'error')
    } finally { submitting.current = false; setBusy(false) }
  }
  return <div className="wrap page"><h1>Finalizar pedido</h1>
    {!lines.length && !busy ? <Empty title="No hay artículos para confirmar"><Link className="button" to="/productos">Ver catálogo</Link></Empty>
      : <div className="shopping-grid">
        <form className="panel flow" onSubmit={submit}>
          <h2>Datos de entrega</h2>
          <div className="form-grid">
            <Field label="Nombre completo"><input name="name" autoComplete="name" required defaultValue={user.name} maxLength={120} /></Field>
            <Field label="Correo electrónico"><input name="email" type="email" autoComplete="email" required defaultValue={user.email} maxLength={150} /></Field>
            <Field label="Teléfono"><input name="phone" type="tel" autoComplete="tel" required defaultValue={user.phone} maxLength={25} /></Field>
            <Field label="Departamento"><input name="department" autoComplete="address-level1" required maxLength={80} /></Field>
            <Field label="Ciudad"><input name="city" autoComplete="address-level2" required maxLength={80} /></Field>
            <Field label="Dirección"><input name="address" autoComplete="street-address" required maxLength={160} /></Field>
            <Field label="Observaciones (opcional)" full><textarea name="notes" rows={3} maxLength={500} /></Field>
          </div>
          <fieldset className="choices"><legend>Método de pago simulado</legend>
            {paymentMethods.map((payment, index) => <label key={payment} className="check"><input type="radio" name="payment" value={payment} defaultChecked={index === 0} />{payment}</label>)}
          </fieldset>
          {message && <p className="error" role="alert">{message}</p>}
          <button className="button" type="submit" disabled={busy || invalid}>{busy ? 'Confirmando…' : 'Realizar pedido'}</button>
        </form>
        <aside className="panel flow summary">
          <h2>Tu pedido</h2>
          {lines.map(line => <div className="section-head summary-line" key={line.key}>
            <span>{line.product?.name} × {line.quantity}</span><strong>{money(line.price * line.quantity)}</strong>
          </div>)}
          <div className="section-head total"><strong>Total</strong><strong>{money(total)}</strong></div>
          {invalid && <p className="error">Algún artículo ya no cuenta con existencias suficientes.</p>}
          <Link to="/carrito" className="text-link">Volver al carrito</Link>
        </aside>
      </div>}
  </div>
}

export function OrderSuccess() {
  const { id } = useParams()
  const { orders } = useOrders()
  const order = orders.find(entry => entry.id === id)
  return <div className="wrap page narrow">
    {order ? <section className="panel flow"><div className="success-heading"><CircleCheck size={34} /><h1>Pedido confirmado</h1><p className="breakable">{order.id}</p></div>
      <OrderDetails order={order} /><Link className="button" to="/mis-pedidos">Ir a mis pedidos</Link></section>
      : <Empty title="Pedido no encontrado"><Link className="button" to="/mis-pedidos">Ir a mis pedidos</Link></Empty>}
  </div>
}
