export const accounts = [
  { id: 'admin', email: 'admin@urbanmen.com', password: 'Admin123', role: 'administrador', name: 'Administrador Urban Men' },
  { id: 'cliente', email: 'cliente@urbanmen.com', password: 'Cliente123', role: 'cliente', name: 'Cliente Urban Men' },
]

export const orderStatuses = ['Pendiente', 'En preparación', 'Enviado', 'Entregado', 'Cancelado']
export const paymentMethods = ['Pago contraentrega', 'Transferencia simulada']
export const colors = {
  Negro: '#232323', Blanco: '#f7f6f1', Arena: '#c5ad8e', Gris: '#a4a3a4',
  Índigo: '#36445a', Oliva: '#68704e', Crema: '#eae0cc',
}

const groups = [
  ['camisetas', 'Camisetas', ['S', 'M', 'L', 'XL'], ['Negro', 'Blanco'], [
    ['Camiseta Essential', 69900, 89900, 'Algodón suave de alto gramaje con cuello redondo.'],
    ['Camiseta Boxy', 79900, 0, 'Silueta amplia de hombros caídos y terminaciones reforzadas.'],
    ['Camiseta Core', 59900, 0, 'Corte recto, tacto ligero y comodidad para todos los días.'],
  ]],
  ['camisas', 'Camisas', ['S', 'M', 'L', 'XL'], ['Blanco', 'Arena'], [
    ['Camisa Oxford', 129900, 0, 'Tejido Oxford de algodón con cuello abotonado.'],
    ['Camisa Lino Studio', 149900, 179900, 'Mezcla de lino fresco y mangas largas con puño.'],
    ['Camisa Weekend', 119900, 0, 'Corte relajado con bolsillo frontal y botones mate.'],
  ]],
  ['jeans', 'Jeans', ['28', '30', '32', '34', '36'], ['Índigo', 'Negro'], [
    ['Jean Straight 01', 149900, 179900, 'Denim índigo con cinco bolsillos y pierna recta.'],
    ['Jean Slim Downtown', 159900, 0, 'Denim con ligera elasticidad y ajuste estrecho.'],
    ['Jean Loose Raw', 169900, 0, 'Denim oscuro con tiro medio y pernera de corte amplio.'],
  ]],
  ['pantalones', 'Pantalones', ['28', '30', '32', '34', '36'], ['Arena', 'Oliva'], [
    ['Cargo Utility', 159900, 189900, 'Sarga resistente con bolsillos laterales de tapa.'],
    ['Chino Daily', 129900, 0, 'Pantalón recto de algodón con bolsillos discretos.'],
    ['Pantalón Relax', 139900, 0, 'Corte holgado de cintura flexible para uso diario.'],
  ]],
  ['chaquetas', 'Chaquetas', ['S', 'M', 'L', 'XL'], ['Negro', 'Oliva'], [
    ['Chaqueta Workshop', 219900, 269900, 'Chaqueta de trabajo en algodón firme con bolsillos amplios.'],
    ['Chaqueta Transit', 239900, 0, 'Capa urbana de cremallera y forro ligero.'],
    ['Chaqueta Block', 199900, 0, 'Corte cuadrado de media estación con cuello clásico.'],
  ]],
  ['buzos', 'Buzos y hoodies', ['S', 'M', 'L', 'XL'], ['Gris', 'Negro'], [
    ['Hoodie Distrito', 139900, 169900, 'Felpa afelpada con capucha y bolsillo canguro.'],
    ['Buzo Crew', 109900, 0, 'Cuello redondo, puños acanalados y felpa suave.'],
    ['Hoodie Niebla', 149900, 0, 'Capucha doble y silueta amplia para usar en capas.'],
  ]],
  ['deportiva', 'Ropa deportiva', ['S', 'M', 'L', 'XL'], ['Oliva', 'Negro'], [
    ['Camiseta Pace', 74900, 0, 'Tejido deportivo liviano con tacto suave.'],
    ['Short Track', 84900, 99900, 'Pantaloneta de secado rápido con cintura ajustable.'],
    ['Conjunto Move', 149900, 0, 'Camiseta y pantaloneta combinadas para entrenar.'],
  ]],
  ['calzado', 'Calzado', ['38', '39', '40', '41', '42', '43'], ['Crema', 'Gris'], [
    ['Tenis Metro', 229900, 259900, 'Perfil bajo con suela de goma y paneles en contraste.'],
    ['Tenis Court', 199900, 0, 'Silueta clásica, cordones planos y plantilla acolchada.'],
    ['Tenis Nómada', 249900, 0, 'Construcción ligera con materiales de textura mate.'],
  ]],
  ['accesorios', 'Accesorios', ['Única'], ['Negro', 'Arena'], [
    ['Bolso Crossbody', 89900, 109900, 'Bolso compacto en lona con correa regulable.'],
    ['Riñonera Axis', 69900, 0, 'Bolsillo principal con cremallera y correa ajustable.'],
    ['Bolso Compact', 79900, 0, 'Bolso ligero con compartimentos para lo esencial.'],
  ]],
]

export const imagePlaceholder = '/images/placeholder.svg'
export const variantKey = (size, color) => JSON.stringify([size, color])
export const money = value => '$' + new Intl.NumberFormat('es-CO').format(value)
export const stock = product => Object.values(product?.inventory ?? {}).reduce((total, units) => total + units, 0)
export const hasDiscount = product => Number(product.previousPrice) > Number(product.price) && Number(product.price) > 0
export const discount = product => hasDiscount(product)
  ? Math.round((1 - Number(product.price) / Number(product.previousPrice)) * 100) : 0
export const normalize = value => value.trim().toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '')

export function createDemo() {
  const categories = groups.map(([id, name]) => ({ id, name, image: '/images/' + id + '.webp', active: true }))
  const products = groups.flatMap(([categoryId, , sizes, palette, items], groupIndex) =>
    items.map(([name, price, previousPrice, description], index) => ({
      id: categoryId + '-' + (index + 1),
      categoryId, name, description, price, previousPrice, sizes, colors: palette,
      image: '/images/' + categoryId + ((categoryId === 'deportiva' ? index === 2 : index === 0) ? '' : '-' + (index + 1)) + '.webp',
      gallery: [],
      active: true, featured: index === 0 && [0, 2, 4, 7].includes(groupIndex),
      createdAt: new Date(Date.UTC(2025, 4, groupIndex * 3 + index + 1)).toISOString(),
      inventory: Object.fromEntries(sizes.flatMap((size, s) => palette.map((color, c) => [
        variantKey(size, color), groupIndex === 8 && index === 2 ? 0 : (s + c + index + groupIndex + 5) % 10,
      ]))),
    })),
  )
  return { categories, products, cart: [], orders: [], profiles: {}, contacts: [] }
}
