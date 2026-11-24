# Cumplimiento académico · URBAN MEN

## 1. Estructura y navegación

- `src/App.jsx` declara rutas públicas, privadas y rutas administrativas anidadas. `src/main.jsx` monta React, React Router y los proveedores.
- `src/components/layout/StoreLayout.jsx` contiene el logotipo, navegación responsive, buscador, acceso por rol, contador del carrito y pie de página.
- `src/pages/public/`, `src/pages/customer/` y `src/pages/admin/` organizan las vistas. `src/data/demo.js` contiene las nueve categorías y 27 referencias de demostración.

## 2. Diseño responsive y animaciones

- `src/styles/main.css` usa cuadrículas adaptables para el catálogo, formularios, carrito y panel. En pantallas pequeñas la vista previa queda debajo del formulario y las tablas administrativas se organizan en tarjetas.
- `src/pages/public/Home.jsx` implementa el carrusel de tres banners, la rotación automática de cinco segundos, la pausa y los controles. El CSS contiene las transiciones, efectos de tarjetas, modales y avisos, y la regla `prefers-reduced-motion`.

## 3. Modal, Tabs, Accordion, Dropdown y Toast

| Componente | Implementación y uso |
| --- | --- |
| Modal | `src/components/common/UI.jsx` usa `dialog` nativo con Escape, foco y retorno de foco. Se usa en confirmaciones, pedidos y vista rápida. |
| Tabs | `UI.jsx` declara pestañas y paneles accesibles. Se usa en `ProductDetail.jsx` y `MyOrders.jsx`. |
| Accordion | `UI.jsx` usa `details` y `summary`. Se usa en F.A.Q., envíos, cambios y credenciales. |
| Dropdown | `UI.jsx` usa un botón con estado expandido, cierre exterior y Escape. Se usa en navegación y administración. |
| Toast | `src/context/ToastContext.jsx` gestiona avisos de confirmación y error, duración y cierre manual. |

## 4. Gestión de archivos

- `src/components/common/ImageUpload.jsx` valida la selección, genera vistas previas con `URL.createObjectURL` y libera cada URL temporal.
- `src/services/images.js` valida formato y tamaño, lee con `FileReader`, decodifica, redimensiona y comprime antes de persistir. `src/services/store.js` comunica errores de cuota.
- `src/pages/admin/ProductEditor.jsx` mantiene el borrador en estados controlados. `src/components/admin/ProductPreview.jsx` proyecta ese borrador mediante `ProductCard`. Ambas rutas del editor muestran la tarjeta mientras se escriben los datos. El catálogo se actualiza al guardar.
- `src/pages/customer/Profile.jsx` y `src/pages/admin/AdminCategories.jsx` reutilizan la carga de imágenes.

## 5. Login

- `src/pages/public/Login.jsx` muestra el formulario, alterna la visibilidad de la contraseña y permite cargar las cuentas de prueba.
- `src/context/AuthContext.jsx` valida las credenciales, conserva la sesión por pestaña en `sessionStorage`, cierra sesión y persiste los campos editables del perfil.

## 6. Roles y protección

- `src/components/layout/ProtectedRoute.jsx` redirige a login si falta sesión y comunica acceso denegado ante un rol incorrecto.
- `src/App.jsx` protege todas las rutas de administración, el perfil, el checkout, el historial y la confirmación. `src/context/ProductsContext.jsx` y `src/context/OrdersContext.jsx` aplican el rol antes de modificar los registros.
- `OrdersContext.jsx` muestra al cliente solo registros cuyo identificador de usuario coincide con su sesión.

## 7. Manejo de estados y consistencia

- `AuthContext`, `ProductsContext`, `CartContext`, `OrdersContext` y `ToastContext` exponen las operaciones de sus módulos. `src/context/StoreContext.jsx` concentra los registros persistentes y sincroniza el almacenamiento entre pestañas del mismo origen.
- `src/services/store.js` valida el catálogo, variantes, disponibilidad, datos de entrega y transiciones de pedido. El checkout vuelve a leer las existencias, usa un identificador por intento y guarda pedido, inventario y carrito juntos. La cancelación es definitiva y restituye las variantes que aún existen.
- El historial mantiene instantáneas de datos de compra. Cambiar o eliminar un producto del catálogo conserva el nombre, la variante y el precio asociados a pedidos anteriores.

## 8. Pruebas

| Comando | Cobertura |
| --- | --- |
| `npm test` | Datos iniciales, filtros combinados, variantes, totales, reintentos, existencias, cancelación, historial, validación y errores de almacenamiento. |
| `npm run test:browser` | Interacción con la compilación local en Chrome o Chromium. Incluye rutas y permisos, compra, administración, vista previa, imágenes, navegación con teclado, contacto, persistencia y diseño responsive. |
| `npm run build` | Compilación de JSX y CSS, importaciones y archivos estáticos en `dist`. |

La verificación local obtuvo diez pruebas de lógica y cinco escenarios de Chrome aprobados. Se probó la compilación de producción con entradas directas, recargas y tamaños de pantalla de 320, 390 y 768 píxeles. También se comprobó que Vite responde en modo de desarrollo. La prueba entre dos pestañas redujo las existencias desde administración mientras el cliente estaba en checkout y simuló una cuota agotada para verificar que el pedido, el carrito y el inventario conservaran su estado anterior.

Quedan para verificación manual el dominio publicado en Vercel, los equipos físicos y los navegadores distintos de Chrome. La guía de ejecución está en [README](README.md).

## 9. Despliegue

- `vercel.json` declara preset Vite, comando de compilación, directorio `dist` y reescritura de rutas internas a `/index.html`.
- `package-lock.json` fija las dependencias para instalaciones reproducibles y `.gitignore` excluye resultados de compilación y dependencias locales.
