# Mercao

Dile cuánta plata tienes, cuánto pesas, qué hay en tu cocina y dónde compras. Mercao arma el mercado de la semana con precios reales de Éxito, Carulla o D1 y se asegura de que el almuerzo y la cena lleven la proteína que necesitas.

## Qué hay aquí

| Archivo | Qué hace |
| --- | --- |
| `index.html` | La app: estilos, controles y la ilustración de la cocina (SVG). |
| `js/engine.js` | El motor: ingredientes, proteína, costo por empaques y planeación. Corre en el navegador y en Node. |
| `js/app.js` | La interfaz: lee los controles, pinta la cocina, las tiendas y el plan. |
| `data/recetas.js` | Las recetas (105). Cantidades por porción. |
| `data/precios-<tienda>.js` | Presentaciones y precios de cada tienda. Los genera el descargador; no se editan a mano. |
| `data/reporte-precios.md` | Qué producto escogió el descargador para cada ingrediente, para revisarlo. |
| `scripts/descargar-precios.mjs` | Descarga precios de Éxito, Carulla y D1 desde su catálogo público (VTEX). |
| `scripts/explorar-tiendas.mjs` | Diagnóstico: muestra qué responde el catálogo de cada tienda. |
| `.github/workflows/precios.yml` | Corre el descargador cada lunes y guarda los precios en el repo. |
| `test/engine.test.js` | Pruebas del motor. |

Para usarla, abre `index.html` en el navegador. No necesita servidor ni instalación.

```sh
npm test
node scripts/descargar-precios.mjs --tiendas exito,carulla,d1   # necesita salida a internet
```

## Precios

- **Éxito, Carulla y D1** se descargan de su buscador público. Por cada ingrediente el descargador busca, filtra por nombre (por ejemplo, descarta «arroz con leche»), lee el contenido neto, descarta precios por kilo fuera de un rango razonable y guarda hasta 4 presentaciones de tamaños distintos.
- **Ara** no tiene catálogo con precios en línea (`aratiendas.com` es un sitio informativo), así que aparece sin precios.
- Una receta solo entra al plan si todos sus ingredientes tienen precio en la tienda elegida.
- Para actualizar a mano: en GitHub, *Actions → Precios de las tiendas → Run workflow*, con modo `descargar`.

## Novedades

- **v0.5 · tiendas y recetas.** Eliges entre Éxito, Carulla, D1 y Ara; Mercao arma el plan en cada una y marca la más barata. 105 recetas (antes 30) y el cerdo como proteína.

### v0.2

- **Tu cocina ilustrada.** Tocas la estufa, el horno, el microondas, la airfryer, la olla a presión, la arrocera, la licuadora o la nevera. Cada electrodoméstico muestra cuántas recetas abre (`+4`) o cuántas perderías sin él.
- **Recetas con alternativas.** Una receta puede pedir «estufa o arrocera». Basta con tener una.
- **8 recetas nuevas** para airfryer, microondas y arrocera (30 en total). Se puede armar la semana solo con airfryer y microondas.
- **Qué proteínas comen.** Pollo, carne de res, salchicha, pescado y atún, huevo y granos. Lo que no comen no entra al menú ni a la lista.
- **Almuerzo siempre con carne** (activo por defecto). La regla es solo para el almuerzo; la cena puede ser de huevo o granos. En meal prep el almuerzo tiene sus propias tandas.
- **La nevera cuenta.** Sin nevera, el meal prep se apaga y el plan te avisa que compres la proteína para pocos días.
- **Se recuerda tu cocina** en el navegador (localStorage).
- **v0.4 · la cocina de noche.** Diseño oscuro. Prender un aparato lo enciende en la ilustración: llamas en la estufa, pollo en el horno, plato girando en el microondas, vapor en la olla y la arrocera, jugo batiéndose en la licuadora. Las cifras corren hasta su valor, la cuenta flota abajo y la lista de mercado sale como un tiquete que se puede copiar.

## Pendiente (fase 1)

Comparar precios entre cadenas, despensa del usuario y cuentas.
