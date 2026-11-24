import { createContext, useContext } from 'react'
import { cartLines, orderTotal, setCartQuantity } from '../services/store.js'
import { useStore } from './StoreContext.jsx'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const { data, update } = useStore()
  const lines = cartLines(data)
  const value = {
    lines, total: orderTotal(lines), count: lines.reduce((total, line) => total + line.quantity, 0),
    add: (item, quantity) => update(current => setCartQuantity(current, item, quantity, true)),
    setQuantity: (item, quantity) => update(current => setCartQuantity(current, item, quantity)),
    clear: () => update(current => ({ ...current, cart: [] })),
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
