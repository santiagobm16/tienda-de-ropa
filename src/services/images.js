const allowed = ['image/jpeg', 'image/png', 'image/webp']

export function validateImage(file) {
  if (!allowed.includes(file.type)) throw new Error('Selecciona una imagen JPG, PNG o WEBP.')
  if (file.size > 2 * 1024 * 1024) throw new Error('La imagen supera los 2 MB.')
}

export async function compressImage(file, maxEdge = 840) {
  validateImage(file)
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
  const image = new Image()
  image.src = source
  try { await image.decode() }
  catch { throw new Error('El archivo no contiene una imagen válida.') }
  const factor = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * factor))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * factor))
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
  let result = canvas.toDataURL('image/webp', 0.76)
  if (result.length > 260000) {
    const reduced = document.createElement('canvas')
    reduced.width = Math.max(1, Math.round(canvas.width * 0.65))
    reduced.height = Math.max(1, Math.round(canvas.height * 0.65))
    reduced.getContext('2d').drawImage(canvas, 0, 0, reduced.width, reduced.height)
    result = reduced.toDataURL('image/webp', 0.65)
  }
  return result
}
