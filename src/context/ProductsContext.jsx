import { createContext, useContext } from 'react'
import { deleteProduct, patchProduct, publicProducts, saveCategory, saveProduct, setStock } from '../services/store.js'
import { useStore } from './StoreContext.jsx'
import { useAuth } from './AuthContext.jsx'

const ProductsContext = createContext(null)
export const useProducts = () => useContext(ProductsContext)

export function ProductsProvider({ children }) {
  const { data, update } = useStore()
  const { user } = useAuth()
  function adminUpdate(operation) {
    if (user?.role !== 'administrador') return Promise.reject(new Error('Se requiere permiso de administrador.'))
    return update(operation)
  }
  const value = {
    products: data.products, categories: data.categories, catalog: publicProducts(data),
    saveProduct: (product, editing) => adminUpdate(current => saveProduct(current, product, editing)),
    patchProduct: (id, fields) => adminUpdate(current => patchProduct(current, id, fields)),
    deleteProduct: id => adminUpdate(current => deleteProduct(current, id)),
    saveCategory: category => adminUpdate(current => saveCategory(current, category)),
    setStock: (id, key, value) => adminUpdate(current => setStock(current, id, key, value)),
  }
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
