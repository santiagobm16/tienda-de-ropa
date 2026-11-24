import { Link } from 'react-router-dom'
import { BadgeDollarSign, Boxes, CircleAlert, ClipboardList, Clock, Package, Store } from 'lucide-react'
import { dateLabel, Empty } from '../../components/common/UI.jsx'
import { OrderStatus } from '../../components/common/OrderDetails.jsx'
import { useProducts } from '../../context/ProductsContext.jsx'
import { useOrders } from '../../context/OrdersContext.jsx'
import { money, stock } from '../../data/demo.js'

export default function Dashboard() {
  const { products } = useProducts()
  const { orders } = useOrders()
  const metrics = [
    ['Total de productos', products.length, Package],
    ['Productos activos', products.filter(product => product.active).length, Store],
    ['Productos agotados', products.filter(product => stock(product) === 0).length, CircleAlert],
    ['Productos con variantes de inventario bajo', products.filter(product => Object.values(product.inventory).some(units => units > 0 && units <= 3)).length, Boxes],
    ['Pedidos registrados', orders.length, ClipboardList],
    ['Pedidos pendientes', orders.filter(order => order.status === 'Pendiente').length, Clock],
    ['Valor de pedidos vigentes', money(orders.filter(order => order.status !== 'Cancelado').reduce((sum, order) => sum + order.total, 0)), BadgeDollarSign],
  ]
  return <>
    <h1>Dashboard</h1>
    <div className="metric-grid">{metrics.map(([name, value, Icon]) => <article key={name} className="panel metric">
      <Icon size={24} /><strong>{value}</strong><h2>{name}</h2>
    </article>)}</div>
    <section className="recent-orders">
      <div className="section-head"><h2>Pedidos recientes</h2><Link className="text-link" to="/admin/pedidos">Ver pedidos</Link></div>
      {orders.length ? <div className="panel">
        {orders.slice(0, 5).map(order => <div key={order.id} className="dashboard-order">
          <div><strong>{order.customer.name}</strong><p>{dateLabel(order.createdAt)} · {money(order.total)}</p></div>
          <OrderStatus status={order.status} />
        </div>)}
      </div> : <Empty title="Aún no hay pedidos registrados" />}
    </section>
  </>
}
