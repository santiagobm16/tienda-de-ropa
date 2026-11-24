import { dateLabel, Photo } from './UI.jsx'
import { money } from '../../data/demo.js'

export function OrderStatus({ status }) {
  return <span className="status" data-status={status}>{status}</span>
}

export function OrderDetails({ order }) {
  const { customer } = order
  return <div className="flow">
    <div className="section-head"><span>{dateLabel(order.createdAt)}</span><OrderStatus status={order.status} /></div>
    <dl className="definition">
      <dt>Cliente</dt><dd>{customer.name}</dd><dt>Correo</dt><dd>{customer.email}</dd>
      <dt>Teléfono</dt><dd>{customer.phone}</dd><dt>Entrega</dt><dd>{customer.address}, {customer.city}, {customer.department}</dd>
      <dt>Pago</dt><dd>{order.payment}</dd>{customer.notes && <><dt>Observaciones</dt><dd>{customer.notes}</dd></>}
    </dl>
    <div>{order.items.map(item => <div className="order-line" key={JSON.stringify([item.productId, item.size, item.color])}>
      <Photo src={item.image} alt="" /><div><strong>{item.name}</strong><p>{item.size} · {item.color} · {item.quantity} × {money(item.price)}</p></div>
      <strong>{money(item.price * item.quantity)}</strong>
    </div>)}</div>
    <div className="section-head total"><strong>Total</strong><strong>{money(order.total)}</strong></div>
  </div>
}
