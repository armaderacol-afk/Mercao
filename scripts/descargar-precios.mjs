// Descarga precios de Éxito, Carulla y D1 (todas usan VTEX) y escribe
// data/precios-<tienda>.js más data/reporte-precios.md.
//
// Uso:  node scripts/descargar-precios.mjs --tiendas exito,carulla,d1
//
// Para cada ingrediente de Mercao busca en la tienda, se queda con los
// productos cuyo nombre corresponde (incluye/excluye), lee el contenido neto
// del nombre o de la ficha, descarta precios por kilo fuera de un rango
// razonable y guarda hasta 4 presentaciones de tamaños distintos.
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const TIENDAS = {
  exito:   { n: "Éxito",   host: "www.exito.com" },
  carulla: { n: "Carulla", host: "www.carulla.com" },
  d1:      { n: "D1",      host: "www.d1.com.co" },
  ara:     { n: "Ara",     host: null, nota: "aratiendas.com no publica un catálogo con precios en línea." },
};

// u: unidad del ingrediente en Mercao (g, ml, und). rango: COP por kg, L o unidad.
// pu: gramos por unidad, para convertir cuando la tienda vende por peso.
const BUSQUEDAS = {
  arroz:        { u: "g",   q: ["arroz blanco"], inc: /^arroz\b/, exc: /(leche|integral|chino|precoc|parbo|sushi|mix|con |paella|basmati|jazmin|vitamin|instant|listo|bebida|galleta|pop|tostad|harina|salvaje|cocido|para preparar)/, rango: [2500, 15000], max: 5000 },
  lenteja:      { u: "g",   q: ["lenteja"], inc: /^lenteja/, exc: /(precoc|lata|lista|sopa|harina|crema|snack|pasta|con |zanahoria|vidrio|frasco|tostad|cocid)/, rango: [2500, 25000], max: 3000 },
  frijol:       { u: "g",   q: ["frijol"], inc: /^frijol/, exc: /(lata|precoc|refrit|listo|enlatad|con |snack|pasta|antioque|zenu|sabor|verde|vidrio|frasco)/, rango: [6000, 35000], max: 3000 },
  garbanzo:     { u: "g",   q: ["garbanzo"], inc: /^garbanzo/, exc: /(lata|precoc|harina|snack|hummus|pasta|crocante|vidrio|frasco|al fresco)/, rango: [5000, 30000], max: 3000 },
  arveja_seca:  { u: "g",   q: ["arveja seca", "arveja verde seca", "arveja"], inc: /^arveja/, exc: /(congel|lata|conserva|zanahoria|con |desgranad|\bfresca\b|snack|pasta|to eat|vidrio|frasco|mc cain|cooltivo|zenu)/, rango: [2500, 25000], max: 3000 },
  espagueti:    { u: "g",   q: ["spaghetti", "espagueti", "pasta spaghetti"], inc: /(espagueti|spaghetti|spagueti|espaghetti)/, exc: /(integral|salsa|sin gluten|instant|con |lenteja|garbanzo|de arroz|quinua|sabor|tomate|maiz|negra|tinta)/, rango: [3000, 30000], max: 3000 },
  harina_maiz:  { u: "g",   q: ["harina de maiz"], inc: /harina.*maiz|^harina pan\b/, exc: /(trigo|pancake|arepa lista|integral? |chocolo|sin gluten|tamal|natilla|mazamorra)/, rango: [3000, 15000], max: 3000 },
  arepa:        { u: "und", q: ["arepa blanca", "arepa"], inc: /^arepa/, exc: /(harina|rellena|queso|chocolo|choclo|integral|boyacense|huevo|mini|congel|yuca|platano)/, rango: [200, 3000], pu: 80 },
  avena_hojuelas:{ u: "g",  q: ["avena en hojuelas", "avena hojuelas"], inc: /^avena/, exc: /(bebida|liquid|tetra|leche|galleta|barra|polvo|sabor|cereal|ml\b|con )/, rango: [4000, 30000], max: 3000 },
  pan:          { u: "g",   q: ["pan tajado"], inc: /^pan (tajado|blanco|campesino|integral|mantequilla|de molde|artesanal|sandwich)/, exc: /(rallado|perro|hamburgues|tostad|pita|arabe|queso|bono|yuca|sin gluten|mini|pandebono)/, rango: [4000, 35000], max: 1200 },
  huevo:        { u: "und", q: ["huevo rojo", "huevos"], inc: /^huevo/, exc: /(codorniz|pascua|chocolat|kinder|liquid|deshidr|polvo|cocid|sorpresa)/, rango: [300, 1500] },
  pollo_surt:   { u: "g",   q: ["pollo en presas", "presas de pollo", "pollo despresado", "pollo entero"], inc: /pollo/, inc2: /(presa|surtid|despres|entero|cuartos|marinad|bandeja mix)/, exc: /(apanad|nugget|salchich|caldo|consom|empanad|deli|ahumad|jamon|asado listo|sopa|croqueta|alas? bbq|cocid|pechuga|muslo|ala\b|alitas)/, rango: [6000, 40000], max: 3000, pu: 1200 },
  pollo_muslo:  { u: "g",   q: ["muslo de pollo", "contramuslo de pollo"], inc: /(muslo|pernil)/, inc2: /pollo/, exc: /(apanad|nugget|bbq|cocid|deli|ahumad|asado listo|sopa)/, rango: [8000, 40000], max: 3000 },
  pollo_pechuga:{ u: "g",   q: ["pechuga de pollo"], inc: /pechuga/, inc2: /pollo/, exc: /(apanad|nugget|jamon|deli|ahumad|tajad|cocid|salchich|lonchas|desmechad|asad|bbq|sopa|caldo|en lata)/, rango: [12000, 45000], max: 3000 },
  atun:         { u: "g",   q: ["atun en agua", "atun lomitos"], inc: /(^|lomitos de |filete de |trozos de )atun/, exc: /(salsa|ensalada|con |picante|ahumad|tomate|mexican|maiz|lata x|galleta)/, rango: [20000, 120000], max: 2000 },
  sardina:      { u: "g",   q: ["sardinas"], inc: /^sardina/, exc: /(picante|galleta)/, rango: [8000, 80000], max: 2000 },
  salchicha:    { u: "g",   q: ["salchicha"], inc: /^salchich/, exc: /(vegetal|soya|veggie|coctel|mini)/, rango: [8000, 50000], max: 2000 },
  carne_res:    { u: "g",   q: ["carne de res para guisar", "carne de res bistec", "carne de res"], inc: /(res|bovin)/, inc2: /(guisar|goulash|sudar|bistec|murillo|cadera|bola|posta|sobrebarriga|lomo|punta|muchacho|pecho|falda|carne de res)/, exc: /(molida|hamburgues|salchich|cerdo|pollo|caldo|consom|caldo|desmechada lista|deshidr|para perro|mascota|jamon|chorizo|sopa|empanad|lasa|apanad)/, rango: [18000, 90000], max: 3000 },
  carne_molida: { u: "g",   q: ["carne molida de res", "carne molida"], inc: /molida/, inc2: /(res|carne)/, exc: /(cerdo|pollo|mixta|vegetal|soya|pavo)/, rango: [15000, 60000], max: 3000 },
  cerdo:        { u: "g",   q: ["carne de cerdo", "lomo de cerdo", "costilla de cerdo"], inc: /cerdo/, inc2: /(lomo|costilla|chuleta|pierna|brazo|goulash|guisar|carne|bondiola|solomito|tocino)/, exc: /(salchich|chorizo|jamon|tocineta|chicharron|piel|manteca|ahumad|tajad|molida|empanad|deli|cocid|bbq listo)/, rango: [12000, 60000], max: 3000 },
  tilapia:      { u: "g",   q: ["filete de tilapia", "mojarra", "filete de basa"], inc: /(tilapia|mojarra|basa|merluza|filete de pescado|pescado blanco)/, exc: /(apanad|nugget|empaniz|lata|deditos|croqueta|salsa)/, rango: [10000, 70000], max: 3000 },
  papa:         { u: "g",   q: ["papa pastusa", "papa"], inc: /^papa\b/, exc: /(criolla|frit|congel|chips|snack|francesa|precoc|rellen|cabello|amarilla|pringles|deshidr|pure|en polvo|ripio)/, rango: [1000, 8000], max: 5000 },
  papa_criolla: { u: "g",   q: ["papa criolla"], inc: /papa criolla/, exc: /(congel|precoc|frit|chips|lata|snack)/, rango: [2000, 14000], max: 3000 },
  platano:      { u: "g",   q: ["platano verde", "platano"], inc: /^platano/, exc: /(chips|frit|congel|patacon|harina|tostad|snack|madurito)/, rango: [1500, 9000], max: 3000 },
  cebolla:      { u: "g",   q: ["cebolla cabezona", "cebolla blanca", "cebolla"], inc: /^cebolla (cabezona|blanca|roja|morada|ocanera|x\b|\d)/, exc: /(polvo|deshidr|encurt|frita|salsa|caramel|larga|junca)/, rango: [1500, 14000], max: 3000, pu: 200 },
  cebolla_larga:{ u: "g",   q: ["cebolla larga", "cebolla junca", "cebollin"], inc: /^cebolla (larga|junca|de rama)|^cebollin/, exc: /(polvo|deshidr|pasta|mezcla)/, rango: [2000, 35000], max: 2000, pu: 250 },
  tomate:       { u: "g",   q: ["tomate chonto", "tomate"], inc: /^tomate( chonto| larga vida| milano| perita| redondo| x| \(|$)/, exc: /(salsa|pasta|cherry|deshidr|lata|pure|frito|seco|arbol|cocido|ketchup)/, rango: [1500, 12000], max: 3000 },
  zanahoria:    { u: "g",   q: ["zanahoria"], inc: /^zanahoria/, exc: /(rallad|baby|congel|lata|jugo|con |trozos)/, rango: [1000, 9000], max: 3000 },
  arveja_cong:  { u: "g",   q: ["arveja congelada", "arveja desgranada", "arveja mc cain"], inc: /arveja/, inc2: /(congel|desgranad|\bfresca\b|mc cain|cooltivo|vegetal arveja)/, exc: /(seca|lata|zanahoria|con |snack|zenu)/, rango: [5000, 35000], max: 2000 },
  ajo:          { u: "und", q: ["ajo", "ajo malla", "ajo blanco"], inc: /^ajo\b/, exc: /(polvo|molido|pasta|deshidr|sal |en aceite|negro|picado|granulad|salsa|mezcla)/, rango: [150, 3500], pu: 40 },
  banano:       { u: "und", q: ["banano"], inc: /^banano/, exc: /(chips|deshidr|bocadillo|bebida|harina|bocadito|congel|uraba? x? caja)/, rango: [100, 1200], pu: 150 },
  yuca:         { u: "g",   q: ["yuca"], inc: /^yuca/, exc: /(congel|frita|chips|harina|almidon|precoc|pan|snack|bites|mini|rellena|tarro|artesanal|180 cm|gourmet)/, rango: [1000, 16000], max: 3000, pu: 600 },
  ahuyama:      { u: "g",   q: ["ahuyama", "zapallo"], inc: /^(ahuyama|zapallo|auyama)/, exc: /(crema|sopa|congel|semilla|harina|arepa)/, rango: [1000, 21000], max: 3000, pu: 1500 },
  habichuela:   { u: "g",   q: ["habichuela"], inc: /habichuela/, exc: /(lata|conserva|snack)/, rango: [2000, 18000], max: 2000 },
  pimenton:     { u: "g",   q: ["pimenton rojo", "pimenton"], inc: /^pimenton/, exc: /(polvo|molido|asad|lata|deshidr|paprika|ahumado|conserva|salsa|rodajas|tarrina|vera)/, rango: [3000, 25000], max: 2000, pu: 160 },
  cilantro:     { u: "g",   q: ["cilantro"], inc: /^cilantro/, exc: /(deshidr|polvo|semilla|molido)/, rango: [4000, 80000], pu: 50, max: 1000 },
  limon:        { u: "und", q: ["limon tahiti", "limon"], inc: /^limon/, exc: /(jugo|zumo|\bte\b|bebida|galleta|sabor|concentr|sal|salsa|esencia|limonada|aromatica)/, rango: [100, 1500], pu: 60 },
  aguacate:     { u: "g",   q: ["aguacate"], inc: /^aguacate/, exc: /(salsa|guacamole|aceite|pulpa|congel|crema)/, rango: [3000, 30000], pu: 250, max: 3000 },
  leche:        { u: "ml",  q: ["leche entera"], inc: /^leche (entera|uht|larga vida|pasteurizada|fresca)/, exc: /(polvo|condensad|deslact|descremad|semi|almendra|soya|avena|coco|sabor|chocolat|fresa|evaporad|arroz|kumis|lactosa|infantil|crecimiento|light|vainilla|cafe)/, rango: [2500, 9000], max: 6000 },
  queso:        { u: "g",   q: ["queso mozzarella"], inc: /queso (mozzarella|mozarella|mozarela)/, exc: /(light|vegano|sin lactosa|untable|crema|palitos?|palo|snack|apanad)/, rango: [15000, 100000], max: 2500 },
  queso_campesino:{ u: "g", q: ["queso campesino"], inc: /queso (campesino|blanco|fresco|costeno|criollo)|^cuajada/, exc: /(crema|rallad|untable|light|vegano|sin lactosa)/, rango: [12000, 70000], max: 2500 },
  avena_beb:    { u: "ml",  q: ["avena bebida", "bebida de avena", "avena liquida", "avena alpina"], inc: /avena/, inc2: /(bebida|liquid|tetra|uht|latti|colanta|alpina|alqueria|finesse|klarens|vaso|bolsa|botella|caja)/, exc: /(hojuela|molida|instant|polvo|en grano|galleta|barra|cereal|jabon|shampoo|crema|fresa|vainilla|barista|pancake|mezcla|nature heart|almendra)/, gml: true, rango: [3000, 18000], max: 6000 },
  yogur:        { u: "ml",  q: ["yogur", "yogurt natural", "yogurt"], inc: /^yog(h)?urt?\b/, exc: /(cereal|vegano|helado|sin lactosa|kumis|snack|galleta|granola|pop|congel)/, gml: true, rango: [4000, 30000], max: 2500 },
  aceite:       { u: "ml",  q: ["aceite vegetal", "aceite de soya", "aceite de girasol"], inc: /^aceite (vegetal|de soya|de girasol|de canola|mezcla|de palma|premium|puro|100%)/, exc: /(oliva|coco|aguacate|spray|aerosol|ajonjoli|bebe|corporal|motor|esencial|cabello|almendra|sesamo|trufa)/, rango: [5000, 28000], max: 5000 },
  sal:          { u: "g",   q: ["sal refinada", "sal"], inc: /^sal (refinada|marina|de mesa|yodada|refisal|blanca)|^sal\b.*refin/, exc: /(rosada|parrill|ajo|condiment|light|baja|himalaya|hierbas|limon|frutas|de nitro|de higuera|gruesa)/, rango: [800, 9000], max: 3000 },
  panela:       { u: "g",   q: ["panela"], inc: /^panela/, exc: /(liquid|bebida|limonada|instant|aromat|jengibre|con |limon|sabor)/, rango: [3000, 16000], max: 3000 },
  azucar:       { u: "g",   q: ["azucar blanca", "azucar"], inc: /^azucar/, exc: /(morena|light|stevia|glass|pulveriz|impalpable|organica|endulzante|sustituto|vainilla|canela|sachet|sobres)/, rango: [2500, 11000], max: 3000 },
  pasta_tomate: { u: "g",   q: ["pasta de tomate"], inc: /(pasta de tomate|pure de tomate|tomate triturado)/, exc: /(ketchup|salsa para|con )/, rango: [5000, 50000], max: 1500 },
  chocolate:    { u: "g",   q: ["chocolate de mesa", "chocolate en pastilla"], inc: /^chocolate/, exc: /(bebida|leche|barra|confite|galleta|chocolatina|polvo|instant|cobertura|helado|relleno|blanco|mani|almendra|caja|bomb|wafer)/, rango: [10000, 80000], max: 1500 },
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const pausa = ms => new Promise(r => setTimeout(r, ms));
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

async function buscar(host, q) {
  const url = `https://${host}/api/io/_v/api/intelligent-search/product_search/?query=${encodeURIComponent(q)}&count=50&page=1&locale=es-CO&hideUnavailableItems=true`;
  for (let intento = 0; intento < 3; intento++) {
    try {
      const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(25000) });
      const t = await r.text();
      if (t.trim().startsWith("{")) return JSON.parse(t).products || [];
      console.log(`  ${host} "${q}": respuesta no JSON (${r.status})`);
    } catch (e) { console.log(`  ${host} "${q}": ${e.message}`); }
    await pausa(1500 * (intento + 1));
  }
  return [];
}

const UNID = { kg: ["g", 1000], kilo: ["g", 1000], kilos: ["g", 1000], kilogramo: ["g", 1000], kilogramos: ["g", 1000],
  g: ["g", 1], gr: ["g", 1], grs: ["g", 1], gramos: ["g", 1], gramo: ["g", 1],
  ml: ["ml", 1], cc: ["ml", 1], l: ["ml", 1000], lt: ["ml", 1000], lts: ["ml", 1000], litro: ["ml", 1000], litros: ["ml", 1000],
  und: ["und", 1], unds: ["und", 1], un: ["und", 1], u: ["und", 1], unidad: ["und", 1], unidades: ["und", 1] };

// Contenido neto desde el nombre: "(1000 gr)", "2500 G", "x 30 und", "6 x 200 ml".
function contenidoDelNombre(nombre) {
  const n = norm(nombre).replace(/(\d),(\d)/g, "$1.$2");
  const multi = n.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|kilos?|g|gr|grs|gramos?|ml|cc|l|lt|lts|litros?)\b/);
  if (multi) { const [u, f] = UNID[multi[3]]; return { u, cant: +multi[1] * +multi[2] * f }; }
  const todos = [...n.matchAll(/(\d+(?:\.\d+)?)\s*(kg|kilogramos?|kilos?|g|gr|grs|gramos?|ml|cc|l|lt|lts|litros?|und|unds|unidades|unidad|un|u)\b/g)];
  const und = n.match(/x\s*(\d+)\s*(und|unds|unidades|un|u)?\b/);
  if (todos.length) { const m = todos[todos.length - 1]; const [u, f] = UNID[m[2]]; return { u, cant: +m[1] * f }; }
  if (und) return { u: "und", cant: +und[1] };
  if (/\bunidad\b/.test(n)) return { u: "und", cant: 1 };
  return null;
}
function especificacion(p, nombre) {
  for (const g of p.specificationGroups || []) for (const s of g.specifications || [])
    if (norm(s.name) === norm(nombre)) return (s.values || [])[0];
  return null;
}
function contenidoDeFicha(p) {
  const f = parseFloat(String(especificacion(p, "Factor Neto PUM") || "").replace(",", "."));
  const u = norm(especificacion(p, "Unidad de Medida PUM Calculado") || especificacion(p, "Unidad de Medida") || "");
  if (!f || !u) return null;
  if (u.startsWith("gram")) return { u: "g", cant: f };
  if (u.startsWith("kilo")) return { u: "g", cant: f * 1000 };
  if (u.startsWith("mili")) return { u: "ml", cant: f };
  if (u.startsWith("litro")) return { u: "ml", cant: f * 1000 };
  if (u.startsWith("unid")) return { u: "und", cant: f };
  return null;
}
function precioDe(p) {
  for (const it of p.items || []) for (const s of it.sellers || []) {
    const o = s.commertialOffer || {};
    if (o.AvailableQuantity > 0 && o.Price > 0) return o.Price;
  }
  const pr = p.priceRange && p.priceRange.sellingPrice && p.priceRange.sellingPrice.lowPrice;
  return pr > 0 && (p.items || []).length ? pr : null;
}
// Lleva el contenido a la unidad del ingrediente.
function enUnidad(c, b) {
  if (!c) return null;
  if (c.u === b.u) return c.cant;
  if (b.u === "und" && c.u === "g" && b.pu) return c.cant / b.pu;
  if (b.u === "g" && c.u === "und" && b.pu) return c.cant * b.pu;
  if (b.u === "ml" && c.u === "g" && b.gml) return c.cant;
  return null;
}

const arg0 = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DEPURAR = new Set((arg0("--depurar", "") || "").split(",").filter(Boolean));
const dbg = (ing, ...m) => { if (DEPURAR.has(ing)) console.log("   ", ...m); };

async function descargarTienda(clave) {
  const t = TIENDAS[clave];
  const skus = [], reporte = [];
  for (const [ing, b] of Object.entries(BUSQUEDAS)) {
    if (DEPURAR.size && !DEPURAR.has(ing)) continue;
    const vistos = new Map();
    for (const q of b.q) {
      for (const p of await buscar(t.host, q)) if (!vistos.has(p.productId)) vistos.set(p.productId, p);
      await pausa(350);
    }
    const candidatos = [];
    for (const p of vistos.values()) {
      const nombre = norm(p.productName || "");
      if (!b.inc.test(nombre) || (b.inc2 && !b.inc2.test(nombre))) { dbg(ing, "no coincide:", p.productName); continue; }
      if (b.exc && b.exc.test(nombre)) { dbg(ing, "excluido:", p.productName); continue; }
      const precio = precioDe(p); if (!precio) { dbg(ing, "sin precio/agotado:", p.productName); continue; }
      const desdeNombre = contenidoDelNombre(p.productName), desdeFicha = contenidoDeFicha(p);
      if (b.soloUnidad && desdeNombre && desdeNombre.u !== b.soloUnidad) continue;
      const size = enUnidad(desdeNombre, b) ?? enUnidad(desdeFicha, b);
      if (!size || size <= 0) { dbg(ing, "sin contenido:", p.productName, JSON.stringify(desdeNombre), JSON.stringify(desdeFicha)); continue; }
      if (b.max && b.u !== "und" && size > b.max) { dbg(ing, "muy grande:", p.productName, size); continue; }
      const porBase = b.u === "und" ? precio / size : precio / size * 1000;
      if (porBase < b.rango[0] || porBase > b.rango[1]) { dbg(ing, "fuera de rango:", p.productName, precio, size, Math.round(porBase)); continue; }
      candidatos.push({ ing, nom: p.productName.replace(/\s+/g, " ").trim(), size: Math.round(size * 100) / 100, precio: Math.round(precio), porBase: Math.round(porBase),
                        url: p.link && p.link.startsWith("http") ? p.link : `https://${t.host}${p.link || ""}` });
    }
    // Hasta 4 presentaciones: la más barata por unidad de cada tamaño.
    candidatos.sort((a, b) => a.porBase - b.porBase);
    const porTam = new Map();
    for (const c of candidatos) if (!porTam.has(c.size)) porTam.set(c.size, c);
    const elegidos = [...porTam.values()].slice(0, 4);
    elegidos.forEach(({ porBase, ...s }) => skus.push(s));
    reporte.push({ ing, encontrados: vistos.size, validos: candidatos.length, elegidos });
    console.log(`${clave} ${ing}: ${vistos.size} resultados, ${candidatos.length} válidos, ${elegidos.length} elegidos`);
  }
  return { skus, reporte };
}

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const pedidas = arg("--tiendas", "exito,carulla,d1,ara").split(",").map(s => s.trim()).filter(Boolean);
const fecha = new Date().toISOString().slice(0, 10);
let md = `# Reporte de precios · ${fecha}\n\nGenerado por \`scripts/descargar-precios.mjs\`. Precio por kg, litro o unidad entre paréntesis.\n`;
const anterior = existsSync("data/reporte-precios.md") ? readFileSync("data/reporte-precios.md", "utf8") : "";

for (const clave of pedidas) {
  const t = TIENDAS[clave];
  if (!t) { console.log(`Tienda desconocida: ${clave}`); continue; }
  md += `\n## ${t.n}\n\n`;
  if (!t.host) { console.log(`${t.n}: ${t.nota}`); md += `${t.nota}\n`; continue; }
  const { skus, reporte } = await descargarTienda(clave);
  if (DEPURAR.size) continue;
  if (skus.length < 20) {
    console.log(`${t.n}: solo ${skus.length} presentaciones; no reemplazo el archivo existente.`);
    md += `Descarga incompleta (${skus.length} presentaciones). Se conservan los precios anteriores.\n`;
    continue;
  }
  const datos = { tienda: clave, n: t.n, fecha, fuente: `https://${t.host}`, skus };
  writeFileSync(`data/precios-${clave}.js`,
    `// Generado por scripts/descargar-precios.mjs el ${fecha}. No editar a mano.\n` +
    `(function (g) { (g.PRECIOS_DATA = g.PRECIOS_DATA || {})[${JSON.stringify(clave)}] = ${JSON.stringify(datos, null, 0)}; })(typeof globalThis !== "undefined" ? globalThis : this);\n`);
  const faltan = reporte.filter(r => !r.elegidos.length).map(r => r.ing);
  md += `${skus.length} presentaciones para ${reporte.length - faltan.length} de ${reporte.length} ingredientes.` +
        (faltan.length ? ` Sin precio: ${faltan.join(", ")}.` : "") + `\n\n| Ingrediente | Presentaciones |\n| --- | --- |\n`;
  for (const r of reporte) md += `| ${r.ing} | ${r.elegidos.map(e => `${e.nom} · $${e.precio.toLocaleString("es-CO")} (${e.porBase.toLocaleString("es-CO")})`).join("<br>") || "—"} |\n`;
}
if (!DEPURAR.size) writeFileSync("data/reporte-precios.md", md);
if (!md.trim() && anterior) writeFileSync("data/reporte-precios.md", anterior);
