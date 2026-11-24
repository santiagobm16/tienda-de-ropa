import { useState } from 'react'
import { Confirm, dateLabel, Dropdown, Empty, Field, Modal } from '../../components/common/UI.jsx'
import { OrderDetails, OrderStatus } from '../../components/common/OrderDetails.jsx'
import { useOrders } from '../../context/OrdersContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { money, normalize, orderStatuses } from '../../data/demo.js'

export default function AdminOrders() {
  const { orders, changeStatus } = useOrders()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState('')
  const [cancel, setCancel] = useState(null)
  const [busy, setBusy] = useState(false)
  const list = orders.filter(order => (!filter || order.status === filter) &&
    normalize([order.id, order.customer.name, order.customer.email].join(' ')).includes(normalize(query)))
  const order = orders.find(entry => entry.id === selected)
  async function update(id, status) {
    setBusy(true)
    try { await changeStatus(id, status); setCancel(null); notify('Estado del pedido actualizado.') }
    catch (error) { notify(error.message, 'error') }
    finally { setBusy(false) }
  }
  return <>
    <h1>Pedidos</h1>
    <div className="admin-filters">
      <Field label="Buscar por número o cliente"><input type="search" value={query} onChange={event => setQuery(event.target.value)} /></Field>
      <Field label="Filtrar por estado"><select value={filter} onChange={event => setFilter(event.target.value)}>
        <option value="">Todos</option>{orderStatuses.map(status => <option key={status}>{status}</option>)}</select></Field>
    </div>
    {list.length ? <div className="table-wrap"><table>
      <thead><tr><th>Número</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Detalles</th></tr></thead>
      <tbody>{list.map(entry => <tr key={entry.id}>
        <td data-label="Número" className="breakable">{entry.id}</td><td data-label="Cliente">{entry.customer.name}</td>
        <td data-label="Fecha">{dateLabel(entry.createdAt)}</td><td data-label="Total">{money(entry.total)}</td>
        <td data-label="Estado">{entry.status === 'Cancelado' ? <OrderStatus status={entry.status} /> :
          <Dropdown label={entry.status} title={'Cambiar estado de ' + entry.id} disabled={busy}>{close =>
            orderStatuses.filter(status => status !== entry.status).map(status => <button type="button" key={status} onClick={() => {
              close()
              if (status === 'Cancelado') setCancel(entry)
              else update(entry.id, status)
            }}>{status}</button>)}</Dropdown>}</td>
        <td data-label="Detalles"><button className="text-link" type="button" onClick={() => setSelected(entry.id)}>Ver detalles</button></td>
      </tr>)}</tbody>
    </table></div> : <Empty title="No hay pedidos con esos filtros" />}
    {order && <Modal title={order.id} wide onClose={() => setSelected('')}><OrderDetails order={order} /></Modal>}
    {cancel && <Confirm title="¿Cancelar el pedido?" description="Las unidades se devolverán una vez a las variantes que sigan en el inventario. El pedido quedará finalizado."
      action="Cancelar pedido" pending={busy} onClose={() => { if (!busy) setCancel(null) }} onConfirm={() => update(cancel.id, 'Cancelado')} />}
  </>
}
