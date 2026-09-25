# Mercao

Dile cuánta plata tienes, cuánto pesas y qué hay en tu cocina. Mercao arma el mercado de la semana con precios reales de D1 y se asegura de que el almuerzo y la cena lleven la proteína que necesitas.

## Qué hay aquí

| Archivo | Qué hace |
| --- | --- |
| `index.html` | La app: estilos, controles y la ilustración de la cocina (SVG). |
| `js/engine.js` | El motor: ingredientes, empaques D1, recetas, proteína y planeación. Corre en el navegador y en Node. |
| `js/app.js` | La interfaz: lee los controles, pinta la cocina y el plan. |
| `test/engine.test.js` | Pruebas del motor. |

Para usarla, abre `index.html` en el navegador. No necesita servidor ni instalación.

```sh
npm test
```

## Novedades de la v0.2

- **Tu cocina ilustrada.** Tocas la estufa, el horno, el microondas, la airfryer, la olla a presión, la arrocera, la licuadora o la nevera. Cada electrodoméstico muestra cuántas recetas abre (`+4`) o cuántas perderías sin él.
- **Recetas con alternativas.** Una receta puede pedir «estufa o arrocera». Basta con tener una.
- **8 recetas nuevas** para airfryer, microondas y arrocera (30 en total). Se puede armar la semana solo con airfryer y microondas.
- **Qué proteínas comen.** Pollo, carne de res, salchicha, pescado y atún, huevo y granos. Lo que no comen no entra al menú ni a la lista.
- **Almuerzo siempre con carne** (activo por defecto). La regla es solo para el almuerzo; la cena puede ser de huevo o granos. En meal prep el almuerzo tiene sus propias tandas.
- **La nevera cuenta.** Sin nevera, el meal prep se apaga y el plan te avisa que compres la proteína para pocos días.
- **Se recuerda tu cocina** en el navegador (localStorage).
- Diseño nuevo siguiendo la dirección «A · Mercado» del rediseño, con modo oscuro.

## Pendiente (fase 1)

Comparar precios entre cadenas, despensa del usuario y cuentas.
