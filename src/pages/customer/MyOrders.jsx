import { useState } from 'react'
import { Link } from 'react-router-dom'
import { dateLabel, Empty, Modal, Tabs } from '../../components/common/UI.jsx'
import { OrderDetails, OrderStatus } from '../../components/common/OrderDetails.jsx'
import { useOrders } from '../../context/OrdersContext.jsx'
import { money } from '../../data/demo.js'

export default function MyOrders() {
  const { orders } = useOrders()
  const [selected, setSelected] = useState('')
  const order = orders.find(entry => entry.id === selected)
  const complete = entry => ['Entregado', 'Cancelado'].includes(entry.status)
  function list(entries) {
    if (!entries.length) return <Empty title="Aún no hay pedidos aquí"><Link to="/productos" className="text-link">Explorar el catálogo</Link></Empty>
    return <div className="order-list">{entries.map(entry => <article key={entry.id} className="panel flow">
      <div className="section-head"><h2 className="breakable">{entry.id}</h2><OrderStatus status={entry.status} /></div>
      <p className="muted">{dateLabel(entry.createdAt)} · {money(entry.total)}</p>
      <p>{entry.items.map(item => item.name + ' × ' + item.quantity).join(' · ')}</p>
      <button type="button" className="button secondary" onClick={() => setSelected(entry.id)}>Ver detalles</button>
    </article>)}</div>
  }
  return <div className="wrap page"><h1>Mis pedidos</h1>
    <Tabs label="Estado de mis pedidos" items={[
      ['Activos', list(orders.filter(entry => !complete(entry)))],
      ['Finalizados', list(orders.filter(complete))],
    ]} />
    {order && <Modal title={order.id} wide onClose={() => setSelected('')}><OrderDetails order={order} /></Modal>}
  </div>
}
