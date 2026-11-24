import { ProductCard } from '../products/ProductCard.jsx'

export default function ProductPreview({ draft, temporary }) {
  return <aside className="preview-column" aria-label="Vista previa del catálogo">
    <h2>Vista previa en tiempo real</h2>
    <ProductCard preview product={{
      ...draft, image: temporary || draft.image,
      inventory: Object.fromEntries(Object.entries(draft.inventory).map(([key, units]) => [key, Math.max(0, Number(units) || 0)])),
    }} />
  </aside>
}
