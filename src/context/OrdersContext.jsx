import { createContext, useContext } from 'react'
import { changeOrderStatus, placeOrder } from '../services/store.js'
import { useAuth } from './AuthContext.jsx'
import { useStore } from './StoreContext.jsx'

const OrdersContext = createContext(null)
export const useOrders = () => useContext(OrdersContext)

export function OrdersProvider({ children }) {
  const { user } = useAuth()
  const { data, transact, update } = useStore()
  const value = {
    orders: user?.role === 'administrador' ? data.orders : data.orders.filter(order => user && order.userId === user.id),
    place: (fields, requestId) => transact(current => {
      const { next, order } = placeOrder(current, user, fields, requestId)
      return { next, result: order }
    }),
    changeStatus: (id, status) => user?.role === 'administrador'
      ? update(current => changeOrderStatus(current, id, status))
      : Promise.reject(new Error('Se requiere permiso de administrador.')),
  }
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
