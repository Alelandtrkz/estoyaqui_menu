# Menú digital de Estoy Aquí

Sitio estático del menú de **Estoy Aquí Bar & Restaurante**, preparado para publicarse directamente con GitHub Pages. No necesita compilación ni servidor para funcionar.

## Estructura

- `index.html`: estructura principal de la página.
- `css/styles.css`: presentación y diseño adaptable.
- `js/menu-data.js`: categorías, productos, precios y nombres de imágenes.
- `js/app.js`: navegación, galería y manejo de imágenes faltantes.
- `img/`: fotografías WebP e iconos optimizados que se publican.
- `image-source/`: fotografías originales locales; Git no las incluye.
- `scripts/optimize-images.mjs`: conversor automático de imágenes.

## Ver el menú

Abre `index.html` en el navegador. Las fotografías que todavía no existan mostrarán un marcador visual sin afectar el resto del menú.

## Preparar fotografías

1. Instala Node.js 18 o una versión posterior.
2. Ejecuta `npm install` la primera vez.
3. Coloca los originales JPG, JPEG, PNG o WebP dentro de `image-source/`.
4. Usa el nombre esperado del producto, con espacios o guiones. Por ejemplo, `carne plancha.jpg` producirá `img/carne-plancha.webp`.
5. Ejecuta:

   ```bash
   npm run images
   ```

El comando corrige la orientación, elimina metadatos y convierte las fotos a WebP. Los platos y bebidas se recortan a una proporción 4:3 de hasta 1200 × 900 px. La fuente `logo-ea.png` conserva su proporción, recibe esquinas transparentes y genera automáticamente el logotipo WebP, el favicon y el icono para dispositivos Apple.

Los originales no se borran y están excluidos por `.gitignore`. Revisa las advertencias del comando para conocer las fotos pendientes o los nombres que no coinciden con el menú.

Las fotografías reemplazadas pueden conservarse en `image-source/archive/`; el conversor ignora esa subcarpeta.

## Nombres esperados

### Identidad

- `logo-ea.webp`
- `favicon.png`
- `apple-touch-icon.png`

### Platos fuertes y entradas

- `carne-plancha.webp`
- `carne-grill.webp`
- `pollo-plancha.webp`
- `pollo-grill.webp`
- `ramen.webp`
- `tacos-pollo.webp`
- `papas-fritas.webp`

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
