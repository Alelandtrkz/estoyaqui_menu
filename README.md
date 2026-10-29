# Menú digital de Estoy Aquí

Sitio estático del menú de **Estoy Aquí Bar & Restaurante**, preparado para publicarse directamente con GitHub Pages. No necesita compilación ni servidor para funcionar.

## Estructura

- `index.html`: estructura principal de la página.
- `css/styles.css`: presentación y diseño adaptable.
- `js/menu-data.js`: categorías, productos, precios y nombres de imágenes.
- `js/app.js`: categorías, tarjetas, detalle del producto y manejo de imágenes faltantes.
- `img/`: fotografías WebP e iconos optimizados que se publican.
- `img-source/`: fotografías originales locales; Git no las incluye. También se admite la carpeta anterior `image-source/`.
- `scripts/optimize-images.mjs`: conversor automático de imágenes.

## Ver el menú

Abre `index.html` en el navegador. Las fotografías que todavía no existan mostrarán un marcador visual sin afectar el resto del menú.

## Preparar fotografías

1. Instala Node.js 18 o una versión posterior.
2. Ejecuta `npm install` la primera vez.
3. Coloca los originales JPG, JPEG, PNG o WebP dentro de `img-source/`.
4. Usa el nombre esperado del producto, con espacios o guiones. Por ejemplo, `carne plancha.jpg` producirá `img/carne-plancha.webp`.
5. Ejecuta:

   ```bash
   npm run images
   ```

El comando corrige la orientación, elimina metadatos y convierte las fotos a WebP. Conserva la proporción original, la transparencia y el plato completo, con un tamaño máximo de 1200 × 1200 px y sin ampliar fotos pequeñas. La fuente `logo-ea.png` conserva su proporción, recibe esquinas transparentes y genera automáticamente el logotipo WebP, el favicon y el icono para dispositivos Apple.

También reconoce `carne a la plancha.png` y `pollo a la plancha.png`, que actualizan `carne-plancha.webp` y `pollo-plancha.webp` sin cambiar las referencias del menú ni del carrito.

Para las tarjetas de comida, usa fotos cenitales (desde arriba), con el plato centrado y margen alrededor. Un PNG con fondo transparente permite que el plato destaque sobre la tarjeta. Las fotos actuales son provisionales: el diseño no cambia el ángulo de la fotografía. Las bebidas usan un recorte circular que llena el marco, con borde claro y sombra, sobresaliendo de la tarjeta igual que los platos.

Las fotos se conservan completas para el detalle. En las tarjetas de bebidas puedes ajustar el centro del recorte con el campo opcional `imagePosition` de cada producto, por ejemplo `"25% 50%"` para favorecer el lado izquierdo de la fotografía.

Si existe el mismo nombre normalizado en ambas carpetas, se usa el original de `img-source/`.

Los originales no se borran y están excluidos por `.gitignore`. Revisa las advertencias del comando para conocer las fotos pendientes o los nombres que no coinciden con el menú.

Las fotografías reemplazadas pueden conservarse en `img-source/archive/`; el conversor ignora esa subcarpeta en ambas carpetas de originales.

## Nombres esperados

### Identidad

- `logo-ea.webp`
- `favicon.png`
- `apple-touch-icon.png`

### Platos fuertes y entradas

- `carne-plancha.webp`
- `carne-al-grill.webp`
- `pollo-plancha.webp`
- `pollo-grill.webp`
- `ramen.webp`
- `tacos.webp`
- `napolitana.webp`
- `pho-bo.webp`
- `papas-fritas.webp`
- `salchipapa.webp`

### Cócteles

- `buchanans.webp`
- `jack-honey-cola.webp`
- `jack-coke.webp`
- `jagerbomb.webp`
- `blue-margarita.webp`
- `jw-red-cola.webp`
- `tequila-sunrise.webp`
- `jw-red-rocas.webp`
- `whisky-cola.webp`
- `cuba-libre.webp`
- `mojito.webp`

### Shots

- `shot-jack-honey.webp`
- `shot-jack-daniels.webp`
- `shot-jw-red.webp`
- `shot-jager.webp`
- `shot-rojo.webp`
- `shot-azul.webp`
- `shot-tequila.webp`
- `shot-passport.webp`

### Cervezas

- `michelada-corona.webp`
- `michelada-heineken.webp`
- `heineken.webp`
- `corona.webp`
- `club-verde.webp`
- `pilsener-botella.webp`
- `pilsener-lata.webp`

### Cafés y refrescos

- `latte-doble.webp`
- `capuccino.webp`
- `coca-cherry.webp`
- `coca-lata.webp`
- `coca-personal.webp`

### Sin alcohol y jugos

- `red-bull.webp`
- `sunrise-sin-alcohol.webp`
- `gatorade.webp`
- `guitig.webp`
- `power-mini.webp`
- `agua.webp`
- `jarra-limon.webp`
- `jarra-naranja.webp`
- `jarra-coca-cola.webp`
- `jarra-sprite.webp`

## Editar el menú

Deslizar a la izquierda o derecha sobre el contenido del menú cambia a la siguiente o anterior categoría. Un toque en una tarjeta sigue abriendo el detalle, donde los mismos gestos recorren únicamente los platillos de esa categoría. El desplazamiento vertical y el desplazamiento horizontal de las etiquetas siguen disponibles.

El botón **+** de cada tarjeta agrega el producto al carrito. Tocar cualquier otra parte de la tarjeta abre la fotografía y los detalles, con un botón compacto para agregar al carrito junto al precio. Dentro del detalle puedes deslizar a izquierda o derecha, usar las flechas o el teclado para recorrer los productos de la misma categoría. La bolsa junto a las categorías muestra la cantidad total de unidades y permite cambiar cantidades, quitar productos y abrir WhatsApp con el pedido completo (cantidades, precios, subtotales y total). El cliente confirma el envío del mensaje en WhatsApp. El pedido se conserva en el mismo navegador al recargar la página, cuando el almacenamiento local está disponible.

Modifica `js/menu-data.js`. Cada producto usa esta estructura:

```js
{
  name: "Nombre del producto",
  price: "6,50",
  description: "Ingredientes o descripción",
  tag: "Opcional",
  image: "nombre-del-producto.webp"
}
```

Mantén los precios como texto para conservar la coma decimal y usa nombres de archivo en minúsculas, sin espacios ni tildes.

## Publicar en GitHub Pages

Repositorio: [Alelandtrkz/estoyaqui_menu](https://github.com/Alelandtrkz/estoyaqui_menu)

Menú publicado: [https://alelandtrkz.github.io/estoyaqui_menu/](https://alelandtrkz.github.io/estoyaqui_menu/)

La publicación usa la rama `main` y la carpeta `/ (root)`:

1. En GitHub, abre **Settings > Pages**.
2. En **Build and deployment**, selecciona **Deploy from a branch**.
3. Elige la rama `main`, la carpeta `/ (root)` y guarda la configuración.
4. Espera a que finalice la ejecución **pages build and deployment**.

Antes de subir cambios puedes comprobar la sintaxis con:

```bash
npm run check
```

Para publicar futuras modificaciones:

```bash
npm run images
npm run check
git add .
git commit -m "chore: update menu"
git push
```

GitHub Pages volverá a desplegar el sitio automáticamente después de cada `push` a `main`.
