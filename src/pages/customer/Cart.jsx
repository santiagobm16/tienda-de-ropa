import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { Confirm, Empty, Photo, Quantity } from '../../components/common/UI.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { money } from '../../data/demo.js'

export default function Cart() {
  const { user } = useAuth()
  const { lines, total, setQuantity, clear } = useCart()
  const notify = useToast()
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const invalid = lines.some(line => line.quantity > line.available)
  async function change(action, message) {
    setBusy(true)
    try { await action(); if (message) notify(message) }
    catch (error) { notify(error.message, 'error') }
    finally { setBusy(false) }
  }
  return <div className="wrap page">
    <div className="section-head"><h1>Tu carrito</h1>{lines.length > 0 &&
      <button type="button" className="text-link" onClick={() => setConfirm(true)}>Vaciar carrito</button>}</div>
    {!lines.length ? <Empty title="Tu carrito está vacío"><ShoppingBag /><Link className="button" to="/productos">Explorar catálogo</Link></Empty>
      : <div className="shopping-grid">
        <section className="panel cart-items" aria-label="Artículos">
          {lines.map(line => <article className="cart-line" key={line.key}>
            <Photo src={line.product?.image} alt={line.product?.name || 'Producto'} />
            <div className="cart-copy">
              {line.available ? <Link to={'/productos/' + line.productId}><h2>{line.product?.name}</h2></Link>
                : <h2>{line.product?.name || 'Producto retirado'}</h2>}
              <p className="muted">{line.size} · {line.color} · {money(line.price)} por unidad</p>
              {line.quantity > line.available && <p className="error">{line.available ? 'Existencias actuales: ' + line.available : 'Sin disponibilidad. Retira este artículo.'}</p>}
            </div>
            <Quantity label={'Cantidad de ' + line.product?.name + ' ' + line.size + ' ' + line.color} value={line.quantity} max={line.available}
              disabled={busy} onChange={value => change(() => setQuantity(line, value))} />
            <strong>{money(line.quantity * line.price)}</strong>
            <button type="button" className="icon-button" aria-label={'Eliminar ' + line.product?.name + ' ' + line.size + ' ' + line.color}
              disabled={busy} onClick={() => change(() => setQuantity(line, 0), 'Artículo eliminado del carrito.')}><Trash2 size={19} /></button>
          </article>)}
        </section>
        <aside className="panel flow summary"><h2>Resumen</h2>
          <div className="section-head total"><strong>Total</strong><strong>{money(total)}</strong></div>
          {invalid ? <p className="error">Ajusta las cantidades antes de continuar.</p>
            : user?.role === 'administrador' ? <p>La confirmación de pedidos requiere una cuenta de cliente.</p>
              : <Link className="button" to="/checkout">Confirmar pedido</Link>}
          <Link className="text-link" to="/productos">Continuar comprando</Link>
        </aside>
      </div>}
    {confirm && <Confirm title="¿Vaciar el carrito?" description="Se quitarán todos los artículos de tu carrito." action="Vaciar carrito"
      pending={busy} onClose={() => { if (!busy) setConfirm(false) }} onConfirm={() => change(async () => { await clear(); setConfirm(false) }, 'Carrito vaciado.')} />}
  </div>
}
