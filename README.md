# URBAN MEN

Tienda de moda masculina en pesos colombianos. Proyecto final de Aplicaciones Web de Ingeniería de Sistemas. El flujo de demostración permite comprar prendas por variante y administrar el catálogo, las existencias y los pedidos desde el mismo navegador.

## Instalación y ejecución

Requiere Node.js 22.12 o superior. Abre la carpeta que contiene `package.json` y ejecuta:

```sh
npm install
npm run dev
```

Abre la dirección que imprime Vite. Para compilar y revisar los archivos de producción:

```sh
npm run build
npm run preview
```

## Cuentas de demostración

| Rol | Correo | Contraseña | Acceso |
| --- | --- | --- | --- |
| Cliente | `cliente@urbanmen.com` | `Cliente123` | Checkout, perfil e historial propio |
| Administrador | `admin@urbanmen.com` | `Admin123` | Dashboard, productos, categorías, inventario y pedidos |

También se pueden cargar las credenciales desde `/login`. El catálogo, el carrito y el contacto son públicos. La autenticación y la autorización son simulaciones ejecutadas en React para la evaluación académica.

## Funcionalidades

- Inicio con tres banners, nueve categorías, 27 referencias iniciales, destacados, novedades y promociones.
- Catálogo con búsqueda por nombre y descripción, filtros combinables, ordenamiento y vista rápida. El detalle incluye galería cuando hay imágenes adicionales, pestañas, relacionados y selección de talla, color y unidades.
- Carrito por variante y checkout de demostración con contraentrega o transferencia simulada. El pedido completo, el descuento de unidades y el vaciado del carrito se guardan en una sola escritura.
- Historial propio, perfil con foto, contacto con registro local y preguntas frecuentes.
- Panel con indicadores, administración de productos y categorías, inventario por variante y estados de pedido.
- Editor de productos con vista previa en tiempo real, tallas y colores personalizados, descuento calculado, control de publicación y galería. Admite JPG, PNG y WEBP de hasta 2 MB por archivo, con compresión antes de guardar.
- Modal con foco administrado y cierre con Escape, Tabs navegables con teclado, Accordion, Dropdown y Toast. El diseño adapta el movimiento a la preferencia del navegador.

## Datos

Productos, categorías, inventario, carrito, perfiles, pedidos y contacto se guardan en `localStorage`. El catálogo de demostración se siembra al iniciar un almacenamiento vacío. La sesión se conserva en `sessionStorage` al recargar la misma pestaña.

El carrito se comparte en el mismo origen y perfil del navegador. Para demostrar el ciclo de compra y administración, cierra sesión y cambia de cuenta dentro del mismo navegador. Otro dispositivo, dominio o perfil tendrá su propio catálogo y sus propios registros. Usa datos ficticios de entrega al probar la aplicación.

Los pedidos conservan una copia del nombre, variante, precio y cantidad. Una cancelación es definitiva y devuelve las unidades una vez a las variantes que aún existen. Los productos eliminados desaparecen del catálogo y del carrito y sus datos históricos siguen disponibles.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `src/App.jsx` y `src/main.jsx` | Rutas y composición de proveedores |
| `src/pages/public/`, `src/pages/customer/`, `src/pages/admin/` | Vistas de la tienda, cliente y administración |
| `src/components/` | Componentes de interfaz, navegación, fichas y vista previa |
| `src/context/` | Estado compartido de autenticación, productos, carrito, pedidos y avisos |
| `src/services/` y `src/data/` | Reglas de negocio, persistencia, imágenes y datos de demostración |
| `src/styles/main.css` | Estilos, diseño responsive y animaciones |
| `public/images/` | Imágenes locales de demostración |
| `tests/` | Pruebas de lógica y de navegador |

React, JSX, Vite, React Router, Lucide y CSS. El documento de [cumplimiento académico](CUMPLIMIENTO_ACADEMICO.md) identifica los archivos por requisito.

### Imágenes de demostración

Se usó la herramienta integrada ImageGen y se exportaron los recortes como WebP en `public/images/`. Las solicitudes de generación describieron cinco composiciones:

- Campaña principal panorámica con modelo en una azotea de concreto de Bogotá, chaqueta de trabajo negra y fondo oscuro a la izquierda.
- Díptico de campañas urbanas, con un modelo en denim índigo en una escalera y un atleta con ropa oliva en una plaza de concreto.
- Mosaico de nueve fotografías de estudio sobre fondo gris cálido, con las prendas y accesorios representativos de las categorías.
- Mosaico de nueve fotografías del segundo grupo de referencias, con camiseta blanca boxy, camisa de lino, jean negro, chino oliva, chaqueta Transit, buzo negro, camiseta deportiva, tenis crema y riñonera.
- Mosaico de nueve fotografías del tercer grupo de referencias, con camiseta negra, camisa arena, denim oscuro, pantalón relajado, chaqueta oliva, hoodie negro, short deportivo, tenis grises y bolso compacto.

## Pruebas

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

La última orden inicia un servidor de producción local en un puerto libre. Puedes usar un Chrome o Chromium instalado configurando `URBAN_BROWSER_PATH` con la ruta al ejecutable. Con `URBAN_TEST_URL` puedes seleccionar un servidor existente. Cada ejecución crea un contexto de navegador aislado para sus registros de prueba.

## Publicar en Vercel

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta, incluidos `package-lock.json`, `public/images/` y `vercel.json`.
2. Importa el repositorio en Vercel. Selecciona la carpeta que contiene `package.json` como raíz del proyecto y usa el preset **Vite**.
3. Usa Node.js 22 o superior, el comando de compilación `npm run build` y el directorio de salida `dist`. La aplicación funciona sin variables de entorno.
4. Después del despliegue, abre y recarga `/productos/camisetas-1` y `/admin/inventario`. La primera ruta debe mostrar el detalle y la segunda debe aplicar el control de sesión. `vercel.json` incluye la regla de Vercel para navegación directa en una SPA.

[Documentación oficial de Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite)
