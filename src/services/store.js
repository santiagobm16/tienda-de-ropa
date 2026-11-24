import { createDemo, normalize, orderStatuses, paymentMethods, variantKey } from '../data/demo.js'

export const STORE_KEY = 'urban-men.store.v1'
export const SESSION_KEY = 'urban-men.session.v1'

export function readStore(storage) {
  try {
    const raw = storage.getItem(STORE_KEY)
    if (!raw) return { data: createDemo(), fresh: true }
    const data = JSON.parse(raw)
    if (!data || !['categories', 'products', 'cart', 'orders', 'contacts'].every(key => Array.isArray(data[key]))
      || !data.profiles || typeof data.profiles !== 'object') throw new Error()
    return { data }
  } catch {
    return { data: createDemo(), error: 'No se pudo leer el almacenamiento de la tienda.' }
  }
}

export function writeStore(storage, data) {
  try {
    storage.setItem(STORE_KEY, JSON.stringify(data))
  } catch (error) {
    throw new Error(error?.name === 'QuotaExceededError'
      ? 'El almacenamiento está lleno. Quita algunas imágenes o utiliza archivos más pequeños.'
      : 'No se pudo guardar la operación en este navegador.')
  }
}

export const findProduct = (data, id) => data.products.find(product => product.id === id)
export const isPublished = (data, product) => Boolean(product?.active && data.categories.some(category => category.id === product.categoryId && category.active))
export const publicProducts = data => data.products.filter(product => isPublished(data, product))
export const availableUnits = (data, product, size, color) => isPublished(data, product)
  ? (product.inventory[variantKey(size, color)] ?? 0) : 0
export const itemKey = ({ productId, size, color }) => JSON.stringify([productId, size, color])
export const orderTotal = items => items.reduce((total, item) => total + item.price * item.quantity, 0)

export function cartLines(data) {
  return data.cart.map(item => {
    const product = findProduct(data, item.productId)
    return {
      ...item, key: itemKey(item), product, price: product?.price ?? 0,
      available: availableUnits(data, product, item.size, item.color),
    }
  })
}

export function setCartQuantity(data, item, quantity, add = false) {
  const key = itemKey(item)
  const current = data.cart.find(entry => itemKey(entry) === key)?.quantity ?? 0
  const next = add ? current + quantity : quantity
  const { productId, size, color } = item
  if (!Number.isSafeInteger(quantity) || !Number.isSafeInteger(next) || next < 0 || (add && quantity < 1)) {
    throw new Error('Ingresa una cantidad válida.')
  }
  const available = availableUnits(data, findProduct(data, productId), size, color)
  if (next > available && next >= current) throw new Error(available > 0
    ? 'Solo hay ' + available + ' unidades de esta combinación.'
    : 'Esta combinación ya no está disponible.')
  const entry = { productId, size, color, quantity: next }
  const cart = next === 0 ? data.cart.filter(line => itemKey(line) !== key)
    : current ? data.cart.map(line => itemKey(line) === key ? entry : line) : [...data.cart, entry]
  return { ...data, cart }
}

export function selectProducts(data, filters) {
  const query = normalize(filters.q ?? '')
  const matches = publicProducts(data).filter(product => {
    const sizes = filters.size ? product.sizes.filter(size => size === filters.size) : product.sizes
    const colors = filters.color ? product.colors.filter(color => color === filters.color) : product.colors
    return normalize(product.name + ' ' + product.description).includes(query)
      && (!filters.category || product.categoryId === filters.category)
      && (!filters.min || product.price >= Number(filters.min))
      && (!filters.max || product.price <= Number(filters.max))
      && sizes.length > 0 && colors.length > 0
      && (!filters.deal || product.previousPrice > product.price)
      && (!filters.available || sizes.some(size => colors.some(color => product.inventory[variantKey(size, color)] > 0)))
  })
  const sorts = {
    name: (a, b) => a.name.localeCompare(b.name, 'es'),
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
  }
  return matches.sort(Object.hasOwn(sorts, filters.sort) ? sorts[filters.sort] : sorts.recent)
}

export const validEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const validPhone = phone => /^[+\d() .-]+$/.test(phone) && phone.replace(/\D/g, '').length >= 7 && phone.replace(/\D/g, '').length <= 15

export function placeOrder(data, user, fields, requestId) {
  if (user?.role !== 'cliente') throw new Error('Se requiere una sesión de cliente.')
  const existing = data.orders.find(order => order.requestId === requestId && order.userId === user.id)
  if (existing) return { next: data, order: existing }
  const customer = Object.fromEntries(['name', 'email', 'phone', 'department', 'city', 'address', 'notes']
    .map(key => [key, (fields[key] ?? '').trim()]))
  if (!customer.name || !validEmail(customer.email) || !validPhone(customer.phone)
    || !customer.department || !customer.city || !customer.address || !paymentMethods.includes(fields.payment)) {
    throw new Error('Revisa el nombre, correo, teléfono, datos de envío y forma de pago.')
  }
  const lines = cartLines(data)
  if (!lines.length) throw new Error('El carrito está vacío.')
  const invalid = lines.find(line => line.quantity > line.available)
  if (invalid) throw new Error('Revisa las existencias de ' + (invalid.product?.name ?? 'un artículo') + ' en el carrito.')
  const items = lines.map(({ productId, product, size, color, quantity, price }) => ({
    productId, name: product.name, image: product.image.startsWith('/images/') ? product.image : '',
    size, color, quantity, price,
  }))
  const order = {
    id: 'UM-' + requestId.toUpperCase().replaceAll('-', ''), requestId,
    userId: user.id, customer, items, total: orderTotal(items),
    payment: fields.payment, createdAt: new Date().toISOString(), status: 'Pendiente',
  }
  const products = adjustStock(data.products, items, -1)
  return { next: { ...data, products, cart: [], orders: [order, ...data.orders] }, order }
}

function adjustStock(products, items, direction) {
  return products.map(product => {
    const affected = items.filter(item => item.productId === product.id)
    if (!affected.length) return product
    const inventory = { ...product.inventory }
    for (const item of affected) {
      const key = variantKey(item.size, item.color)
      if (Object.hasOwn(inventory, key)) inventory[key] += item.quantity * direction
    }
    return { ...product, inventory }
  })
}

export function changeOrderStatus(data, id, status) {
  const order = data.orders.find(entry => entry.id === id)
  if (!order || !orderStatuses.includes(status)) throw new Error('El estado del pedido no es válido.')
  if (order.status === status) return data
  if (order.status === 'Cancelado') throw new Error('Un pedido cancelado no se puede reabrir.')
  const products = status === 'Cancelado' ? adjustStock(data.products, order.items, 1) : data.products
  const orders = data.orders.map(entry => entry.id === id ? { ...entry, status } : entry)
  return { ...data, products, orders }
}

export function saveCategory(data, category) {
  const name = category.name.trim()
  if (!name) throw new Error('Ingresa el nombre de la categoría.')
  if (data.categories.some(entry => entry.id !== category.id && normalize(entry.name) === normalize(name))) {
    throw new Error('Ya existe una categoría con ese nombre.')
  }
  const saved = { ...category, name }
  const categories = data.categories.some(entry => entry.id === saved.id)
    ? data.categories.map(entry => entry.id === saved.id ? saved : entry) : [...data.categories, saved]
  return { ...data, categories }
}

export function saveProduct(data, draft, editing) {
  const name = draft.name.trim()
  const description = draft.description.trim()
  const price = Number(draft.price)
  const previousPrice = draft.previousPrice ? Number(draft.previousPrice) : 0
  if (!name || !description || !data.categories.some(category => category.id === draft.categoryId)
    || !Number.isSafeInteger(price) || price < 1 || !Number.isSafeInteger(previousPrice)
    || (previousPrice !== 0 && previousPrice <= price) || !draft.sizes.length || !draft.colors.length || !draft.image) {
    throw new Error('Completa los campos obligatorios. El precio anterior, si se indica, debe superar el actual.')
  }
  const existing = findProduct(data, draft.id)
  if (editing && !existing) throw new Error('El producto fue eliminado.')
  const pairs = draft.sizes.flatMap(size => draft.colors.map(color => variantKey(size, color)))
  const inventory = Object.fromEntries(pairs.map(key => {
    const edited = !existing || draft.inventory[key] !== draft.originalInventory?.[key]
    const value = edited ? draft.inventory[key] : existing.inventory[key] ?? draft.inventory[key]
    const units = value === '' ? NaN : Number(value ?? 0)
    if (!Number.isSafeInteger(units) || units < 0) throw new Error('El inventario debe contener enteros mayores o iguales a cero.')
    return [key, units]
  }))
  const { originalInventory, ...fields } = draft
  const product = { ...fields, name, description, price, previousPrice, inventory }
  return {
    ...data,
    products: editing ? data.products.map(entry => entry.id === product.id ? product : entry) : [product, ...data.products],
  }
}

export function patchProduct(data, id, fields) {
  if (!findProduct(data, id)) throw new Error('El producto fue eliminado.')
  return { ...data, products: data.products.map(product => product.id === id ? { ...product, ...fields } : product) }
}

export function deleteProduct(data, id) {
  return { ...data, products: data.products.filter(product => product.id !== id), cart: data.cart.filter(item => item.productId !== id) }
}

export function setStock(data, id, key, value) {
  const product = findProduct(data, id)
  const units = value === '' ? NaN : Number(value)
  if (!product || !Object.hasOwn(product.inventory, key)) throw new Error('Esta variante ya no existe.')
  if (!Number.isSafeInteger(units) || units < 0) throw new Error('Ingresa un número entero mayor o igual a cero.')
  return patchProduct(data, id, { inventory: { ...product.inventory, [key]: units } })
}
