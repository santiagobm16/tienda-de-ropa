import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { accounts, createDemo, discount, variantKey } from '../src/data/demo.js'
import { cartLines, changeOrderStatus, deleteProduct, findProduct, orderTotal, patchProduct, placeOrder, readStore,
  saveCategory, saveProduct, selectProducts, setCartQuantity, setStock, STORE_KEY, writeStore } from '../src/services/store.js'
import { validateImage } from '../src/services/images.js'

const first = { productId: 'camisetas-1', size: 'S', color: 'Negro' }
const second = { ...first, color: 'Blanco' }
const firstKey = variantKey(first.size, first.color)
const customer = accounts.find(account => account.role === 'cliente')
const delivery = {
  name: 'Cliente de prueba', email: 'cliente@urbanmen.com', phone: '300 123 4567',
  department: 'Cundinamarca', city: 'Bogotá', address: 'Calle 1 # 2-34', payment: 'Pago contraentrega',
}
const currentStock = data => findProduct(data, first.productId).inventory[firstKey]

test('el catálogo inicial crea 27 referencias únicas y nueve categorías', () => {
  const data = createDemo()
  assert.equal(data.products.length, 27)
  assert.equal(new Set(data.products.map(product => product.id)).size, 27)
  assert.equal(data.categories.length, 9)
  assert.equal(new Set(data.products.map(product => product.image)).size, 27)
  for (const category of data.categories) assert.ok(existsSync('public' + category.image))
  for (const product of data.products) {
    assert.ok(data.categories.some(category => category.id === product.categoryId))
    assert.equal(Object.keys(product.inventory).length, product.sizes.length * product.colors.length)
    assert.ok(existsSync('public' + product.image))
  }
})

test('combina búsqueda de descripción, talla, color, precio, categoría y disponibilidad', () => {
  let data = createDemo()
  const filters = { q: 'ALGODON', category: 'camisetas', size: 'S', color: 'Negro', min: '65000', max: '70000', sort: 'low', available: '1' }
  assert.deepEqual(selectProducts(data, filters).map(product => product.id), [first.productId])
  assert.equal(selectProducts(data, { sort: '__proto__' }).length, 27)
  data = setStock(data, first.productId, firstKey, 0)
  assert.deepEqual(selectProducts(data, filters), [])
})

test('ordena alfabéticamente y por precio en ambas direcciones', () => {
  const data = createDemo()
  const category = 'camisetas'
  const names = sort => selectProducts(data, { category, sort }).map(product => product.name)
  assert.deepEqual(names('name'), ['Camiseta Boxy', 'Camiseta Core', 'Camiseta Essential'])
  assert.deepEqual(names('low'), ['Camiseta Core', 'Camiseta Essential', 'Camiseta Boxy'])
  assert.deepEqual(names('high'), ['Camiseta Boxy', 'Camiseta Essential', 'Camiseta Core'])
})

test('el carrito agrupa solo variantes iguales y limita las unidades', () => {
  let data = createDemo()
  data = setCartQuantity(data, first, 2, true)
  data = setCartQuantity(data, first, 1, true)
  data = setCartQuantity(data, second, 1, true)
  assert.deepEqual(cartLines(data).map(line => line.quantity), [3, 1])
  assert.equal(orderTotal(cartLines(data)), 279600)
  assert.throws(() => setCartQuantity(data, first, 3, true), /Solo hay 5/)
  data = setCartQuantity(data, first, 0)
  assert.equal(cartLines(data)[0].color, 'Blanco')
})

test('checkout descuenta inventario, conserva precios históricos y admite reintentos idempotentes', () => {
  let data = setCartQuantity(createDemo(), first, 2)
  const before = currentStock(data)
  assert.throws(() => placeOrder(data, accounts[0], delivery, 'blocked'), /sesión de cliente/)
  assert.throws(() => placeOrder(data, customer, { ...delivery, phone: 'xxx' }, 'bad'), /Revisa/)
  const { next, order } = placeOrder(data, customer, delivery, 'test-order')
  assert.equal(next.cart.length, 0)
  assert.equal(next.orders.length, 1)
  assert.equal(currentStock(next), before - 2)
  assert.equal(order.status, 'Pendiente')
  assert.equal(order.userId, customer.id)
  assert.equal(order.total, 139800)
  assert.equal(placeOrder(next, customer, delivery, 'test-order').next, next)
  data = patchProduct(next, first.productId, { name: 'Nuevo nombre', price: 1 })
  data = deleteProduct(data, first.productId)
  assert.equal(data.orders[0].items[0].price, 69900)
  assert.equal(data.orders[0].items[0].name, 'Camiseta Essential')
})

test('el checkout vuelve a comprobar el inventario y una cancelación devuelve unidades una vez', () => {
  let data = setCartQuantity(createDemo(), first, 4)
  const changed = setStock(data, first.productId, firstKey, 2)
  assert.throws(() => placeOrder(changed, customer, delivery, 'stale'), /Revisa las existencias/)
  assert.equal(changed.orders.length, 0)
  const { next, order } = placeOrder(data, customer, delivery, 'restore')
  data = changeOrderStatus(next, order.id, 'Enviado')
  assert.equal(currentStock(data), 1)
  data = changeOrderStatus(data, order.id, 'Cancelado')
  assert.equal(currentStock(data), 5)
  assert.equal(changeOrderStatus(data, order.id, 'Cancelado'), data)
  assert.throws(() => changeOrderStatus(data, order.id, 'Pendiente'), /no se puede reabrir/)
  const deleted = deleteProduct(next, first.productId)
  assert.equal(changeOrderStatus(deleted, order.id, 'Cancelado').orders[0].status, 'Cancelado')
})

test('categorías inactivas ocultan productos sin borrar la asociación ni el carrito', () => {
  let data = setCartQuantity(createDemo(), first, 1)
  const category = data.categories[0]
  assert.throws(() => saveCategory(data, { ...category, id: 'otra', name: ' camisétas ' }), /Ya existe/)
  data = saveCategory(data, { ...category, active: false })
  assert.equal(selectProducts(data, { category: category.id }).length, 0)
  assert.equal(cartLines(data)[0].available, 0)
  assert.equal(findProduct(data, first.productId).categoryId, category.id)
  data = saveCategory(data, { ...category, active: true })
  assert.equal(cartLines(data)[0].available, 5)
})

test('la edición valida precios y existencias, y conserva stock cambiado mientras el borrador estaba abierto', () => {
  const data = createDemo()
  const product = findProduct(data, first.productId)
  const draft = { ...product, name: 'Editada', originalInventory: product.inventory }
  assert.equal(discount({ price: '95000', previousPrice: '120000' }), 21)
  assert.throws(() => saveProduct(data, { ...draft, previousPrice: 300 }, true), /precio anterior/)
  assert.throws(() => saveProduct(data, { ...draft, inventory: { [firstKey]: -1 } }, true), /inventario/)
  const changed = setStock(data, product.id, firstKey, 2)
  const updated = saveProduct(changed, draft, true)
  assert.equal(currentStock(updated), 2)
  assert.equal(findProduct(updated, product.id).name, 'Editada')
  assert.equal(findProduct(changed, product.id).name, 'Camiseta Essential')
})

test('el almacenamiento conserva el estado y comunica problemas de lectura y cuota', () => {
  const storage = new Map()
  const api = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }
  assert.equal(readStore(api).fresh, true)
  const data = setCartQuantity(createDemo(), first, 1)
  writeStore(api, data)
  assert.deepEqual(readStore(api).data, data)
  storage.set(STORE_KEY, '{broken')
  assert.match(readStore(api).error, /No se pudo leer/)
  assert.throws(() => writeStore({ setItem() { throw new DOMException('lleno', 'QuotaExceededError') } }, data), /almacenamiento está lleno/)
})

test('la carga admite JPG, PNG y WEBP hasta 2 MB', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) assert.doesNotThrow(() => validateImage({ type, size: 2097152 }))
  assert.throws(() => validateImage({ type: 'image/gif', size: 23 }), /JPG, PNG o WEBP/)
  assert.throws(() => validateImage({ type: 'image/jpeg', size: 2097153 }), /2 MB/)
})
