/* ==========================================================
   MERCAO — interfaz
   ========================================================== */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const money = n => "$" + Math.round(n).toLocaleString("es-CO");
const SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const nombreDia = d => d < 7 ? SEMANA[d] : `Día ${d + 1}`;
const CLAVE = "mercao.v2";
const APARATOS_INICIALES = ["estufa", "olla_presion", "nevera"];
const QUIETO = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- estado ---------- */
let aparatos = new Set(APARATOS_INICIALES);
let enfocado = null;
let proteinas = new Set(Object.keys(PROTEINAS));
let firmaPlan = "", ultimoTotal = null, ultimo = null;
let tienda = tieneDatos(TIENDA_DEF) ? TIENDA_DEF : (tiendasConDatos()[0] || TIENDA_DEF);
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaCorta = f => { if (!f) return ""; const [a, m, d] = f.split("-").map(Number); return `${d} ${MESES[m - 1]} ${a}`; };
const nombreTienda = t => TIENDAS[t] ? TIENDAS[t].n : t;
const hayCarne = () => [...proteinas].some(g => PROTEINAS[g].carne);
const pressed = el => el.getAttribute("aria-pressed") === "true";
const icono = (id, extra = "") => `<svg class="ico" ${extra}><use href="#${id}"/></svg>`;

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ aparatos: [...aparatos], crudo: leerCrudo() }));
  } catch (e) { /* sin almacenamiento: la página sigue funcionando */ }
}
function restaurar() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CLAVE) || "null"); } catch (e) { d = null; }
  if (!d) return;
  if (Array.isArray(d.aparatos)) aparatos = new Set(d.aparatos.filter(a => APARATOS[a]));
  const c = d.crudo || {};
  const set = (sel, v) => { if (v != null && $(sel)) $(sel).value = v; };
  set("#presu", c.presupuesto); set("#personas", c.personas); set("#dias", c.dias);
  set("#comidas", c.comidasDia); set("#maxmin", c.maxMinutos); set("#reps", c.maxRepeticiones);
  set("#platos", c.platos); set("#peso", c.peso);
  if (c.modo) elegirSeg("#modo", c.modo);
  if (c.actividad) elegirSeg("#actividad", c.actividad);
  if (Array.isArray(c.restricciones))
    $$("#restricciones .pill").forEach(b => b.setAttribute("aria-pressed", String(c.restricciones.includes(b.dataset.v))));
  if (c.mealPrep) $("#mealprep").setAttribute("aria-pressed", "true");
  if (Array.isArray(c.proteinas)) proteinas = new Set(c.proteinas.filter(g => PROTEINAS[g]));
  if (c.almuerzoCarnePedido != null) $("#alm-carne").setAttribute("aria-pressed", String(!!c.almuerzoCarnePedido));
  if (c.tienda && tieneDatos(c.tienda)) tienda = c.tienda;
}

/* ---------- lectura de controles ---------- */
function leerCrudo() {
  const ent = (sel, min, max) => Math.min(max, Math.max(min, Math.round(+$(sel).value) || min));
  return {
    presupuesto: +$("#presu").value,
    personas: ent("#personas", 1, 8),
    dias: ent("#dias", 1, 30),
    comidasDia: ent("#comidas", 1, 3),
    aparatos: [...aparatos],
    tienda,
    restricciones: $$('#restricciones .pill[aria-pressed="true"]').map(b => b.dataset.v),
    proteinas: [...proteinas],
    almuerzoCarnePedido: pressed($("#alm-carne")),
    almuerzoConCarne: pressed($("#alm-carne")) && hayCarne(),
    modo: $('#modo button[aria-pressed="true"]').dataset.v,
    maxMinutos: +$("#maxmin").value,
    maxRepeticiones: +$("#reps").value,
    mealPrep: pressed($("#mealprep")) && aparatos.has("nevera"),
    platos: +$("#platos").value,
    peso: +$("#peso").value,
    actividad: ($('#actividad button[aria-pressed="true"]') || { dataset: { v: "activo" } }).dataset.v,
  };
}
function leerOpciones() {
  const o = leerCrudo();
  if (!ACTIVIDAD[o.actividad]) o.actividad = "activo";
  o.objetivoDia = o.peso * ACTIVIDAD[o.actividad].f;
  const franjas = FRANJAS[o.comidasDia] || FRANJAS[2];
  const nPrin = franjas.filter(f => PRINCIPALES.includes(f)).length || 1;
  const hayDes = franjas.includes("desayuno");
  o.objetivoDesayuno = hayDes ? o.objetivoDia * 0.25 : 0;
  o.pisoComida = (o.objetivoDia - o.objetivoDesayuno) / nPrin;
  return o;
}
function elegirSeg(sel, v) {
  $$(sel + " button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
}

/* ---------- cifras que corren ---------- */
function correr(el, to, fmt = n => Math.round(n)) {
  const from = el._cur ?? 0;
  el._cur = to;
  cancelAnimationFrame(el._raf);
  if (QUIETO || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 560;
  const paso = t => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) el._raf = requestAnimationFrame(paso);
  };
  el._raf = requestAnimationFrame(paso);
}
function pintarRango(el) {
  el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min) * 100) + "%");
}

/* ==========================================================
   LA COCINA
   ========================================================== */
const QUEMADORES = [[412, 352, 26, 4], [528, 352, 26, 4], [400, 362, 32, 5], [540, 362, 32, 5]];
function construirLlamas() {
  let html = "";
  QUEMADORES.forEach(([cx, cy, rx, ry], b) => {
    const n = rx > 28 ? 13 : 11;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      const x = cx + rx * 0.8 * Math.cos(a), y = cy + ry * 0.8 * Math.sin(a);
      const h = (6 + ((i * 7 + b * 3) % 5)) * (rx / 28);
      const d = `M0 0C-2.4 -1.4 -1.9 -${(h * 0.6).toFixed(1)} 0 -${h.toFixed(1)}C1.9 -${(h * 0.6).toFixed(1)} 2.4 -1.4 0 0Z`;
      html += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><path class="fl" style="animation-delay:-${((i * 0.13 + b * 0.07) % 0.5).toFixed(2)}s" d="${d}" fill="url(#g-flame)"/></g>`;
    }
  });
  $("#llamas").innerHTML = html;
}

function construirChips() {
  $("#aparatos").innerHTML = Object.entries(APARATOS).map(([k, a]) =>
    `<button type="button" class="apchip" data-v="${k}" aria-pressed="false">${icono("i-" + k, 'aria-hidden="true"')}${a.n}<em></em></button>`).join("");
}
function construirProteinas() {
  $("#proteinas").innerHTML = Object.entries(PROTEINAS).map(([k, p]) =>
    `<button type="button" class="token" data-p="${k}" aria-pressed="true"><span class="st"></span>${icono("p-" + k, 'aria-hidden="true"')}<span class="tn">${p.n}</span><span class="tc"></span></button>`).join("");
}

function pintarProteinas(o) {
  const imp = impactoProteinas(o);
  for (const [k, p] of Object.entries(imp)) {
    const c = $(`.token[data-p="${k}"]`);
    c.setAttribute("aria-pressed", String(p.come));
    c.querySelector(".tc").textContent = p.come ? `en ${p.usan} receta${p.usan === 1 ? "" : "s"}` : (p.delta > 0 ? `fuera · +${p.delta} si vuelve` : "fuera del menú");
  }
  const carnes = Object.entries(PROTEINAS).filter(([k, p]) => p.carne && proteinas.has(k)).map(([, p]) => p.n.toLowerCase());
  $("#alm-carne").disabled = !carnes.length;
  $("#alm-hint").textContent = !carnes.length ? "Marca al menos una carne para usar esta opción."
    : o.almuerzoConCarne ? `Todos los almuerzos llevan ${carnes.length > 1 ? carnes.slice(0, -1).join(", ") + " o " + carnes.at(-1) : carnes[0]}.`
    : "El almuerzo puede ser de huevo o granos. La cena no cambia.";
}

function textoImpacto(k, imp) {
  const a = APARATOS[k], p = imp.porAparato[k];
  if (k === "nevera") return p.tiene
    ? `<b>${a.n}</b> prendida. Puedes cocinar en tandas y guardar para varios días.`
    : `<b>${a.n}</b> apagada. Sin nevera no conviene el meal prep: la comida cocinada no aguanta fuera del frío.`;
  const n = p.delta, la = a.g === "m" ? "lo" : "la", ella = a.g === "m" ? "él" : "ella";
  if (p.tiene) return n > 0
    ? `<b>${a.n}</b> · ${a.d}. Sin ${ella} pierdes ${n} receta${n === 1 ? "" : "s"}.`
    : `<b>${a.n}</b> · ${a.d}. Con lo demás que tienes, ninguna receta depende solo de esto.`;
  return n > 0
    ? `<b>${a.n}</b> · ${a.d}. Si ${la} tienes, prénde${la}: abre <b>${n} receta${n === 1 ? "" : "s"} más</b>.`
    : `<b>${a.n}</b> · ${a.d}. Con lo que ya tienes no suma recetas nuevas.`;
}

function pintarCocina(o) {
  const imp = impactoAparatos(o);
  for (const [k, p] of Object.entries(imp.porAparato)) {
    const g = $(`.ap[data-v="${k}"]`);
    if (g) {
      g.setAttribute("aria-pressed", String(p.tiene));
      g.setAttribute("aria-label", `${APARATOS[k].n}: ${p.tiene ? "lo tienes" : "no lo tienes"}`);
      const badge = g.querySelector(".badge");
      badge.querySelector("text").textContent = "+" + p.delta;
      badge.classList.toggle("none", !p.tiene && p.delta === 0);
    }
    const c = $(`.apchip[data-v="${k}"]`);
    c.setAttribute("aria-pressed", String(p.tiene));
    c.querySelector("em").textContent = k === "nevera" ? (p.tiene ? "tandas" : "")
      : p.tiene ? `${p.usan}` : (p.delta > 0 ? `+${p.delta}` : "");
  }
  correr($("#k-count"), imp.hoy);
  $("#k-total").textContent = "/" + imp.total;
  const prendidos = [...aparatos].map(a => APARATOS[a].n.toLowerCase());
  $("#k-info").innerHTML = enfocado ? textoImpacto(enfocado, imp)
    : prendidos.length
      ? `Prendiste ${prendidos.length > 1 ? prendidos.slice(0, -1).join(", ") + " y " + prendidos.at(-1) : prendidos[0]}. Pasa el cursor o toca un aparato para ver qué cambia.`
      : "Todo apagado. Toca en la ilustración lo que tienes en tu cocina.";
}

function alternar(k) {
  const prende = !aparatos.has(k);
  prende ? aparatos.add(k) : aparatos.delete(k);
  enfocado = k;
  render();
  if (prende) encender($(`.ap[data-v="${k}"]`));
}
function encender(g) {
  if (!g || QUIETO) return;
  g.classList.remove("pop"); void g.getBBox(); g.classList.add("pop");
  setTimeout(() => g.classList.remove("pop"), 850);
}
/* Al abrir, los aparatos prendidos arrancan uno tras otro. */
function arrancar() {
  if (QUIETO) return;
  let i = 0;
  for (const g of $$(".ap")) {
    if (!pressed(g)) continue;
    g.classList.add("dormido");
    setTimeout(() => { g.classList.remove("dormido"); encender(g); }, 380 + i++ * 190);
  }
}

/* ==========================================================
   TIENDAS
   ========================================================== */
function construirTiendas() {
  $("#tiendas").innerHTML = Object.keys(TIENDAS).map(t => `
    <button type="button" class="store" role="radio" data-t="${t}" aria-checked="false">
      <span class="flag" hidden></span>
      <span class="sn">${nombreTienda(t)}</span>
      <span class="sv num">—</span>
      <span class="ss"></span>
    </button>`).join("");
  $$("#tiendas .store").forEach(b => b.addEventListener("click", () => {
    if (b.disabled) return;
    tienda = b.dataset.t; render();
  }));
}
let reloj = null;
function programarTiendas(o) {
  clearTimeout(reloj);
  reloj = setTimeout(() => pintarTiendas(o), 150);
}
function pintarTiendas(o) {
  const comp = compararTiendas(o);
  const completas = comp.filter(c => c.ok && c.diasCubiertos >= c.diasPedidos);
  const barata = completas.length ? completas.reduce((a, b) => b.costoTotal < a.costoTotal ? b : a).tienda : null;
  for (const c of comp) {
    const b = $(`.store[data-t="${c.tienda}"]`);
    b.disabled = !c.datos;
    b.setAttribute("aria-checked", String(c.tienda === tienda));
    const sv = b.querySelector(".sv"), ss = b.querySelector(".ss"), flag = b.querySelector(".flag");
    if (!c.datos) {
      sv._cur = 0; sv.textContent = "sin precios";
      ss.textContent = c.nota || "Todavía no hay precios descargados.";
      flag.hidden = true; continue;
    }
    if (c.ok) correr(sv, c.costoTotal, money); else { sv._cur = 0; sv.textContent = "no alcanza"; }
    ss.innerHTML = `${c.ok ? `<b>${c.diasCubiertos}/${c.diasPedidos} días</b> · ` : ""}${c.recetas} recetas<br>precios del ${fechaCorta(c.fecha)}`;
    flag.hidden = !(c.tienda === tienda || c.tienda === barata);
    flag.className = "flag" + (c.tienda === tienda ? " pick" : "");
    flag.textContent = c.tienda === tienda ? (c.tienda === barata ? "aquí · la más barata" : "aquí compras") : "la más barata";
  }
  const sin = recetasSinPrecio(o);
  const faltan = new Map();
  for (const r of sin) for (const i of Object.keys(r.ing)) if (!skusDeIng(tienda, i)) faltan.set(i, (faltan.get(i) || 0) + 1);
  const top = [...faltan.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([i]) => ING[i].n.toLowerCase());
  $("#tiendas-nota").innerHTML = sin.length
    ? `En <b>${nombreTienda(tienda)}</b> quedan por fuera <b>${sin.length} recetas</b> que tu cocina sí permite, porque la tienda no tiene precio para algún ingrediente: ${top.join(", ")}${faltan.size > 5 ? " y otros" : ""}.`
    : `En <b>${nombreTienda(tienda)}</b> todas las recetas que tu cocina permite tienen precio.`;
}
const skusDeIng = (t, i) => ((PRECIOS[t] && PRECIOS[t].skus) || []).some(s => s.ing === i);

/* ==========================================================
   SUGERENCIAS
   ========================================================== */
function sugerencias(r, o) {
  const s = [];
  if (r.modo === "presupuesto" && r.diasCubiertos < r.diasPedidos) {
    const completo = (o.mealPrep ? planearMealPrep : planear)({ ...o, modo: "dias" });
    if (completo.ok) s.push(`Con ${money(r.presupuesto)} cubres <b>${r.diasCubiertos} de ${r.diasPedidos} días</b>. Para los ${r.diasPedidos} completos necesitas ${money(completo.costoTotal)}: te faltan <b>${money(completo.costoTotal - r.presupuesto)}</b>.`);
  }
  if (r.diasCubiertos < r.diasPedidos && r.limitadoPorCatalogo) {
    const falt = Object.entries(impactoAparatos(o).porAparato).filter(([, p]) => !p.tiene && p.delta > 0)
      .sort((a, b) => b[1].delta - a[1].delta)[0];
    s.push(`<b>El límite es el recetario, no la plata.</b> Hay ${r.candidatas} recetas posibles y cada una se repite máximo ${r.maxRepeticiones} ${r.maxRepeticiones === 1 ? "vez" : "veces"}: alcanzan para ${r.topeCatalogo} comidas.${falt ? ` Si tienes <b>${APARATOS[falt[0]].n.toLowerCase()}</b>, prénde${APARATOS[falt[0]].g === "m" ? "lo" : "la"} en la cocina: abre ${falt[1].delta} recetas más.` : " Sube las repeticiones o dale más tiempo por receta."}`);
  } else if (r.modo === "dias" && r.diasCubiertos < r.diasPedidos) {
    s.push(`Solo se llenaron <b>${r.comidasAsignadas} de ${r.diasPedidos * r.comidasDia} comidas</b>. Sube las repeticiones o prende más cosas en la cocina.`);
  }
  if (r.modo === "dias" && r.costoTotal > r.presupuesto)
    s.push(`El plan completo cuesta <b>${money(r.costoTotal - r.presupuesto)} más</b> de lo que pusiste. Cambia a «Estirar la plata» para ver hasta dónde alcanza.`);
  if (!r.objetivoCumplido)
    s.push(`El plan queda en <b>${r.proteinaDia} g al día</b> y el objetivo es ${r.objetivoDia} g para ${r.peso} kg. Almuerzo y cena sí llegan a su mínimo (${r.pisoComida} g); lo que falta tendría que venir del desayuno o de un algo.`);
  if (r.factorMax >= 2.4)
    s.push(`Para llegar a ${r.pisoComida} g por plato, algunas recetas llevan <b>${r.factorMax} veces</b> la porción de proteína de la receta base. Ese es el máximo que se permite.`);
  if (r.mealPrep && r.platos < r.diasPedidos * r.comidasDia)
    s.push(`Cocinas <b>${r.platos} ${r.platos === 1 ? "vez" : "veces"}</b> en lugar de ${r.comidasAsignadas}. Si te aburres del mismo plato, sube «platos distintos» y compara el total.`);
  if (!aparatos.has("nevera"))
    s.push(`<b>Sin nevera</b>, compra el pollo, la carne y la leche para uno o dos días a la vez, y cocina solo lo de cada comida. Por eso el meal prep queda apagado.`);
  const caro = r.canasta[0];
  if (caro && r.costoTotal > 0) {
    const pct = Math.round(caro.costo / r.costoTotal * 100);
    if (pct >= 15) s.push(`<b>${caro.nombre}</b> es el ${pct} % del mercado (${money(caro.costo)}). Es lo primero para recortar si necesitas bajar el total.`);
  }
  if (r.sobranteValor > r.costoTotal * 0.2)
    s.push(`Quedan <b>${money(r.sobranteValor)}</b> en sobrantes: producto que pagas ahora y te sirve la otra semana. Pasa con los empaques grandes.`);
  if (r.personas === 1)
    s.push(`Cocinar para una persona sale más caro por porción porque los empaques no se parten. Cocinar doble y congelar la mitad es lo que más baja este número.`);
  return s;
}

/* ==========================================================
   RENDER
   ========================================================== */
function render() {
  const o = leerOpciones();
  pintarCocina(o);
  pintarProteinas(o);
  guardar();

  const sinNevera = !aparatos.has("nevera");
  $("#mealprep").disabled = sinNevera;
  if (sinNevera) $("#mealprep").setAttribute("aria-pressed", "false");
  $("#f-platos").hidden = !o.mealPrep;
  $("#f-reps").hidden = o.mealPrep;
  $("#prep-hint").textContent = sinNevera ? "Necesita la nevera prendida en la cocina."
    : o.mealPrep ? "Cocinas pocos platos en tandas grandes y los repites." : "Menú variado: cada día algo distinto.";
  correr($("#presu-lbl"), o.presupuesto, money);
  $("#peso-lbl").textContent = o.peso;
  $("#platos-lbl").textContent = o.platos;
  $("#reps-lbl").textContent = o.maxRepeticiones;
  $("#maxmin-lbl").textContent = o.maxMinutos;
  $("#comidas-hint").textContent = (FRANJAS[o.comidasDia] || []).map(f => FRANJA_NOM[f]).join(", ").replace(/, ([^,]*)$/, " y $1") + ".";
  $("#prot-hint").innerHTML = `${ACTIVIDAD[o.actividad].d[0].toUpperCase() + ACTIVIDAD[o.actividad].d.slice(1)}. Objetivo <b>${Math.round(o.objetivoDia)} g al día</b>, mínimo <b>${Math.round(o.pisoComida)} g</b> por almuerzo y cena.`;
  $$('input[type="range"]').forEach(pintarRango);

  const r = o.mealPrep ? planearMealPrep(o) : planear(o);
  ultimo = r;
  $("#reps-hint").textContent = r.ok && !r.mealPrep
    ? `${r.candidatas} recetas × ${r.maxRepeticiones} = ${r.topeCatalogo} comidas como máximo.` : "";
  const tabTandas = $('.tabs button[data-t="tandas"]');
  tabTandas.hidden = !(r.ok && r.mealPrep);
  if (tabTandas.hidden && tabTandas.getAttribute("aria-selected") === "true") seleccionarTab("plan");

  pintarMarcador(r, o);
  pintarCuenta(r);
  programarTiendas(o);
  if (!r.ok) { renderError(r, o); return; }
  renderStats(r, o);
  renderPlan(r);
  renderTandas(r, o);
  renderLista(r);
  renderRecetas(r);
}

function pintarMarcador(r, o) {
  const m = $("#presu-marker"), el = $("#presu");
  m.hidden = !r.ok;
  if (!r.ok) return;
  const p = Math.max(0, Math.min(100, (r.costoTotal - el.min) / (el.max - el.min) * 100));
  m.style.setProperty("--m", p + "%");
  m.textContent = `plan ${money(r.costoTotal)}`;
  m.classList.toggle("bad", r.costoTotal > o.presupuesto);
}

function pintarCuenta(r) {
  const tot = $("#c-total");
  $("#c-lab").textContent = `mercado en ${nombreTienda(tienda)}`;
  if (!r.ok) {
    tot._cur = 0; tot.textContent = "—";
    $("#c-dias").textContent = "sin plan"; $("#c-dias-dot").className = "dot bad";
    $("#c-prot").textContent = "revisa la cuenta"; $("#c-prot-dot").className = "dot bad";
    return;
  }
  correr(tot, r.costoTotal, money);
  if (ultimoTotal !== null && ultimoTotal !== r.costoTotal && !QUIETO) {
    const c = $("#cuenta"); c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash");
  }
  ultimoTotal = r.costoTotal;
  const cubre = r.diasCubiertos >= r.diasPedidos;
  $("#c-dias").textContent = `${r.diasCubiertos}/${r.diasPedidos} días`;
  $("#c-dias-dot").className = "dot " + (cubre ? "ok" : "bad");
  $("#c-prot").textContent = `${r.proteinaDia} g/día`;
  $("#c-prot-dot").className = "dot " + (r.objetivoCumplido ? "ok" : "bad");
}

function notas(titulo, items, bien) {
  return `<div class="notes ${bien ? "" : "bad"}"><div class="head"><span class="dot ${bien ? "ok" : "bad"}"></span>${titulo}</div><ul>${items.map(x => `<li>${x}</li>`).join("")}</ul></div>`;
}

function renderError(r, o) {
  $("#kpis").hidden = true;
  ["plan", "tandas", "lista", "recetas"].forEach(t => $("#pane-" + t).innerHTML = "");
  firmaPlan = "";
  const sinCocina = r.diag && Object.values(r.diag).every(d => d.sinPiso === 0);
  const sinAlmCarne = o.almuerzoConCarne && r.vacias.includes("almuerzo") && r.diag && r.diag.almuerzo && r.diag.almuerzo.sinPiso === 0;
  let items;
  if (sinAlmCarne && !sinCocina) {
    items = [`Pediste <b>almuerzo siempre con carne</b>, pero con tu cocina y las proteínas que marcaste no hay ningún almuerzo con carne posible.`,
      `Qué hacer: vuelve a marcar otra carne, prende más cosas en la cocina (la airfryer y el horno suman almuerzos con pollo) o apaga «Almuerzo siempre con carne».`];
  } else if (sinCocina) {
    items = [`Con lo que está prendido en la cocina no hay ${r.vacias.map(v => v === "comida" ? "cenas" : v === "almuerzo" ? "almuerzos" : v).join(" ni ")} posibles.`,
      `Prende al menos uno de estos: estufa, airfryer, microondas, arrocera u horno. También puedes subir el tiempo máximo por receta o quitar alguna restricción.`];
  } else {
    items = [`Pides <b>${Math.round(r.pisoComida)} g de proteína</b> por almuerzo y por cena (${o.peso} kg, ${ACTIVIDAD[o.actividad].n.toLowerCase()}), y ninguna receta disponible llega ahí ni subiendo la porción al máximo.`,
      ...Object.entries(r.diag || {}).map(([f, d]) => `<b>${FRANJA_NOM[f]}:</b> ${d.sinPiso} receta${d.sinPiso === 1 ? "" : "s"} posible${d.sinPiso === 1 ? "" : "s"}, ${d.conPiso} llega${d.conPiso === 1 ? "" : "n"} al mínimo. Lo máximo en esa comida son ${d.techoProteina} g por porción.`),
      `Qué hacer: baja el nivel de actividad, pasa a 3 comidas al día para repartir el objetivo, prende más cosas en la cocina o quita alguna restricción.`];
  }
  $("#alerta").innerHTML = notas("No se puede armar el plan", items, false);
}

function construirStats() {
  $("#kpis").innerHTML = `
    <div class="stat total"><div class="k"><span class="dot" id="s-total-dot"></span>Total del mercado</div><div class="v num" id="s-total">$0</div><div class="s" id="s-total-sub"></div></div>
    <div class="stat"><div class="k"><span class="dot" id="s-dias-dot"></span>Días cubiertos</div><div class="v num" id="s-dias">0</div><div class="s" id="s-dias-sub"></div></div>
    <div class="stat"><div class="k"><span class="dot"></span>Por porción</div><div class="v num" id="s-porc">$0</div><div class="s" id="s-porc-sub"></div></div>
    <div class="stat"><div class="k"><span class="dot" id="s-prot-dot"></span>Proteína al día</div><div class="v num" id="s-prot">0</div><div class="s" id="s-prot-sub"></div></div>`;
}

function renderStats(r, o) {
  $("#kpis").hidden = false;
  const dentro = r.costoTotal <= r.presupuesto, cubre = r.diasCubiertos >= r.diasPedidos;
  correr($("#s-total"), r.costoTotal, money);
  $("#s-total-dot").className = "dot " + (dentro ? "ok" : "bad");
  $("#s-total-sub").textContent = dentro ? `te sobran ${money(r.presupuesto - r.costoTotal)} de ${money(r.presupuesto)}` : `te pasas por ${money(r.costoTotal - r.presupuesto)}`;
  correr($("#s-dias"), r.diasCubiertos, n => `${Math.round(n)}/${r.diasPedidos}`);
  $("#s-dias-dot").className = "dot " + (cubre ? "ok" : "bad");
  $("#s-dias-sub").textContent = `${r.comidasAsignadas} comidas · ${r.porciones} porciones`;
  correr($("#s-porc"), r.costoPorPorcion, money);
  $("#s-porc-sub").textContent = `${r.personas} ${r.personas === 1 ? "persona" : "personas"}`;
  correr($("#s-prot"), r.proteinaDia, n => `${Math.round(n)} g`);
  $("#s-prot-dot").className = "dot " + (r.objetivoCumplido ? "ok" : "bad");
  $("#s-prot-sub").textContent = `objetivo ${r.objetivoDia} g · ${r.objetivoCumplido ? "cumple" : "no llega"}`;

  const sg = sugerencias(r, o);
  const todoBien = dentro && cubre && r.pisoComidaCumplido && r.objetivoCumplido;
  $("#alerta").innerHTML = sg.length
    ? notas(todoBien ? "Notas del plan" : "Lo que hay que saber", sg, todoBien)
    : notas("Plan viable", [`Cubre los ${r.diasPedidos} días dentro del presupuesto y con la proteína completa.`], true);
}

function iconosUsa(R) {
  const usa = R.usa || [];
  if (!usa.length) return `<span class="usa" title="Sin cocción">sin cocción</span>`;
  const nombres = usa.map(a => APARATOS[a].n.toLowerCase()).join(", ");
  return `<span class="usa" title="${nombres}" aria-label="Se hace con ${nombres}">${usa.map(a => icono("i-" + a, 'aria-hidden="true"')).join("")}</span>`;
}

function renderPlan(r) {
  const firma = r.elegidas.map(e => e.receta.id).join("|");
  const animar = firma !== firmaPlan && !QUIETO;
  firmaPlan = firma;
  let html = "", k = 0;
  for (let d = 0; d < r.diasCubiertos; d++) {
    let cs = "", protDia = 0;
    for (let c = 0; c < r.comidasDia; c++, k++) {
      const e = r.elegidas[k]; if (!e) break;
      const pr = Math.round(proteinaReceta(e.receta)); protDia += pr;
      const cumple = !PRINCIPALES.includes(e.franja) || pr >= r.pisoComida - 0.5;
      cs += `<div class="comida"><div class="slot">${FRANJA_NOM[e.franja] || "Comida"}</div>
        <div class="nom">${e.receta.n}</div>
        <div class="meta">${iconosUsa(e.receta)}<span>${e.receta.min} min</span><span class="p ${cumple ? "ok" : "bad"}">${pr} g proteína</span></div></div>`;
    }
    html += `<article class="dia${animar ? " enter" : ""}" style="--i:${d}"><header><h4>${nombreDia(d)}</h4><span class="num ${protDia >= r.objetivoDia - 1 ? "ok" : ""}">${protDia} g</span></header>${cs}</article>`;
  }
  const sobra = r.elegidas.length - r.diasCubiertos * r.comidasDia;
  $("#pane-plan").innerHTML = (html ? `<div class="dias">${html}</div>` : "") +
    (sobra > 0 ? `<p class="note">Sobran <b>${sobra}</b> comidas sueltas que no completan un día. Quedan de reserva.</p>` : "") +
    (r.diasCubiertos === 0 ? `<p class="note">Con ese presupuesto no alcanza ni para un día completo. Sube la plata o baja las comidas por día.</p>` : "");
}

function renderTandas(r, o) {
  if (!r.mealPrep) { $("#pane-tandas").innerHTML = ""; return; }
  const diasPorTanda = r.tandas.map(t => Math.ceil(t.comidas / r.comidasDia));
  const barrido = [];
  for (let n = 1; n <= 6; n++) {
    const p = planearMealPrep({ ...o, platos: n });
    if (p.ok && p.diasCubiertos > 0) barrido.push({ n, costo: p.costoTotal, porc: p.costoPorPorcion, prot: p.proteinaDia, ok: p.objetivoCumplido, dias: p.diasCubiertos });
  }
  let comparativo = "";
  if (barrido.length > 1) {
    const validos = barrido.filter(b => b.ok && b.dias >= r.diasCubiertos);
    const mejor = (validos.length ? validos : barrido).reduce((a, b) => b.costo < a.costo ? b : a);
    const max = Math.max(...barrido.map(b => b.costo));
    comparativo = `<h3 class="sec">¿Cuántos platos conviene?</h3>
      <p class="note" style="margin:0 0 0.9rem">Menos platos no siempre sale más barato: con pocos platos el sobrante de un empaque no lo aprovecha otra receta.</p>
      <div class="scroll"><table><thead><tr><th>Platos</th><th>Costo total</th><th class="n">Por porción</th><th class="n">Proteína/día</th><th class="n">Días</th></tr></thead>
      <tbody>${barrido.map(b => `<tr class="${b.n === r.platos ? "mine" : ""}">
        <td><b>${b.n}</b>${b.n === r.platos ? ' <span class="sub">el tuyo</span>' : ""}${b.n === mejor.n ? ' <span class="tag">más barato</span>' : ""}</td>
        <td><div class="barcell"><i class="${b.n === mejor.n ? "best" : ""}" style="width:${Math.round(b.costo / max * 60)}%"></i><span class="num">${money(b.costo)}</span></div></td>
        <td class="n">${money(b.porc)}</td><td class="n" style="${b.ok ? "" : "color:var(--bad)"}">${b.prot} g</td><td class="n">${b.dias}</td></tr>`).join("")}</tbody></table></div>
      ${mejor.n !== r.platos ? `<p class="note">Con <b>${mejor.n} platos</b> el mismo plan cuesta ${money(mejor.costo)}, ${money(r.costoTotal - mejor.costo)} menos que con ${r.platos}.</p>` : ""}`;
  }
  $("#pane-tandas").innerHTML = `
    <div class="scroll"><table>
      <thead><tr><th>Cocinas una vez</th><th class="n">Proteína/porción</th><th class="n">Porciones</th><th class="n">Cubre</th><th class="n">Tiempo</th><th class="n">Costo</th></tr></thead>
      <tbody>${r.tandas.map(t => `<tr>
        <td><b>${t.receta.n}</b><div class="sub">${{ desayuno: "desayuno", almuerzo: "almuerzo", comida: "cena" }[t.grupo] || "almuerzo y cena"}</div></td>
        <td class="n">${Math.round(proteinaReceta(t.receta))} g</td><td class="n">${t.porciones}</td>
        <td class="n">${t.comidas} ${t.comidas === 1 ? "comida" : "comidas"}</td><td class="n">${t.receta.min} min</td>
        <td class="n">${money(t.costoMarginal)}</td></tr>`).join("")}
        <tr class="total"><td>Total</td><td class="n">—</td><td class="n">${r.porciones}</td><td class="n">${r.comidasAsignadas}</td>
          <td class="n">${Math.round(r.minutosCocina / 6) / 10} h</td><td class="n">${money(r.costoTotal)}</td></tr>
      </tbody></table></div>
    <p class="note">Son <b>${r.platos} sesiones de cocina</b> para ${r.diasCubiertos} días.</p>
    ${comparativo}
    ${Math.max(...diasPorTanda) > 4 ? notas("Conservación", [`Alguna tanda tiene que durar <b>${Math.max(...diasPorTanda)} días</b>. En nevera la comida cocinada aguanta 3 o 4; lo demás <b>congélalo en porciones</b> el mismo día y sácalo la noche anterior. El arroz cocido es lo más delicado: enfríalo rápido.`], false) : ""}`;
}

const CATS = ["Proteína", "Granos", "Verduras", "Lácteos"];
const cantidad = (n, u) => `${(Math.round(n * 10) / 10).toLocaleString("es-CO")} ${u}`;

function renderLista(r) {
  const semana = r.canasta.filter(f => !f.desp), desp = r.canasta.filter(f => f.desp);
  const item = f => `<div class="r-item"><div class="r-line"><span class="r-name">${f.nombre}</span><span class="r-dots"></span><span class="r-price">${money(f.costo)}</span></div>
    <div class="r-sub">${f.sku}</div>
    <div class="r-sub">usas ${cantidad(f.necesita, f.unidad)}${f.sobrante > 0 ? ` · <span class="left">sobran ${cantidad(f.sobrante, f.unidad)}</span>` : ""}</div></div>`;
  let cuerpo = "";
  for (const cat of CATS) {
    const g = semana.filter(f => f.cat === cat); if (!g.length) continue;
    cuerpo += `<div class="r-cat">${cat.toUpperCase()}</div>` + g.map(item).join("");
  }
  if (desp.length) cuerpo += `<div class="r-cat">DESPENSA · DURA VARIAS SEMANAS</div>` + desp.map(item).join("");
  const nProd = r.canasta.length;
  $("#pane-lista").innerHTML = `<div class="lista-wrap">
    <div class="receipt-shadow"><div class="receipt">
      <div class="r-head"><strong>MERCAO</strong><span>lista de mercado</span><span>${r.personas} ${r.personas === 1 ? "persona" : "personas"} · ${r.diasCubiertos} días · ${r.comidasAsignadas} comidas</span><span>precios ${nombreTienda(tienda)} de referencia · ${PRECIOS[tienda] ? PRECIOS[tienda].fecha : ""}</span></div>
      <div class="r-sep"></div>${cuerpo}<div class="r-sep"></div>
      <div class="r-line"><span>${nProd} productos</span><span class="r-dots"></span><span></span></div>
      <div class="r-line"><span>Sobrante para la otra semana</span><span class="r-dots"></span><span>${money(r.sobranteValor)}</span></div>
      <div class="r-line"><span>De eso, despensa</span><span class="r-dots"></span><span>${money(r.costoDespensa)}</span></div>
      <div class="r-sep"></div>
      <div class="r-total"><span>TOTAL</span><span class="num">${money(r.costoTotal)}</span></div>
      <div class="r-bar" aria-hidden="true"></div>
      <div class="r-foot">verifica precios en tienda</div>
    </div></div>
    <div class="side">
      <p>Esta es la combinación de empaques más barata para tu plan, no solo el empaque más grande. Lo que dice «sobran» lo pagas ahora y te sirve la otra semana.</p>
      <button type="button" class="btn" id="copiar">Copiar la lista</button>
      <p class="toast" id="copiar-ok" aria-live="polite"></p>
      <textarea class="copybox" id="copiar-txt" hidden readonly aria-label="Lista de mercado en texto"></textarea>
    </div></div>`;
  $("#copiar").addEventListener("click", () => copiarLista(r));
}

function textoLista(r) {
  const lineas = [`Mercao · lista de mercado en ${nombreTienda(tienda)}`, `${r.personas} ${r.personas === 1 ? "persona" : "personas"} · ${r.diasCubiertos} días`, ""];
  const grupos = [...CATS.map(c => [c, r.canasta.filter(f => !f.desp && f.cat === c)]), ["Despensa", r.canasta.filter(f => f.desp)]];
  for (const [cat, g] of grupos) {
    if (!g.length) continue;
    lineas.push(cat.toUpperCase());
    g.forEach(f => lineas.push(`- ${f.nombre}: ${f.sku} (${money(f.costo)})`));
    lineas.push("");
  }
  lineas.push(`Total: ${money(r.costoTotal)} (precios ${nombreTienda(tienda)} de referencia, ${fechaCorta(PRECIOS[tienda] && PRECIOS[tienda].fecha)})`);
  return lineas.join("\n");
}
function copiarLista(r) {
  const txt = textoLista(r), ok = $("#copiar-ok"), area = $("#copiar-txt");
  const mostrar = () => { area.hidden = false; area.value = txt; area.focus(); area.select(); ok.textContent = "Selecciona el texto y cópialo."; };
  try {
    navigator.clipboard.writeText(txt).then(() => { ok.textContent = "Lista copiada. Pégala en WhatsApp o en tus notas."; }, mostrar);
  } catch (e) { mostrar(); }
}

function renderRecetas(r) {
  const vistos = new Set(); let rec = "";
  for (const e of r.elegidas) {
    if (vistos.has(e.receta.id)) continue; vistos.add(e.receta.id);
    const R = e.receta;
    const ings = Object.entries(R.ing).map(([i, q]) => `<span>${ING[i].n} ${Math.round(q * r.personas * 10) / 10} ${ING[i].u}</span>`).join("");
    rec += `<details class="rec"><summary><span class="rn">${R.n}</span>${iconosUsa(R)}
      <span class="rm num">${R.min} min · ${Math.round(proteinaReceta(R))} g proteína${R.f && R.f !== 1 ? ` · porción ×${R.f}` : ""}</span></summary>
      <div class="recbody"><div class="ing">${ings}</div>
      <ol>${R.pasos.map(p => `<li>${p}</li>`).join("")}</ol></div></details>`;
  }
  $("#pane-recetas").innerHTML = rec ? `<p class="note" style="margin:0 0 1rem">Cantidades para ${r.personas} ${r.personas === 1 ? "porción" : "porciones"}.</p>${rec}` : `<p class="note">No hay recetas en el plan.</p>`;
}

function seleccionarTab(t) {
  $$(".tabs button").forEach(x => x.setAttribute("aria-selected", String(x.dataset.t === t)));
  ["plan", "tandas", "lista", "recetas"].forEach(p => $("#pane-" + p).hidden = p !== t);
}

/* ==========================================================
   EVENTOS
   ========================================================== */
construirLlamas();
construirChips();
construirProteinas();
construirStats();
construirTiendas();
restaurar();

$$(".ap").forEach(g => {
  const k = g.dataset.v;
  g.addEventListener("click", () => alternar(k));
  g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(k); } });
  g.addEventListener("mouseenter", () => { enfocado = k; pintarCocina(leerOpciones()); });
  g.addEventListener("focus", () => { enfocado = k; pintarCocina(leerOpciones()); });
});
$("#scene").addEventListener("mouseleave", () => { enfocado = null; pintarCocina(leerOpciones()); });
$$("#aparatos .apchip").forEach(c => {
  c.addEventListener("click", () => alternar(c.dataset.v));
  c.addEventListener("mouseenter", () => { enfocado = c.dataset.v; pintarCocina(leerOpciones()); });
});
$("#k-todo").addEventListener("click", () => {
  const nuevos = Object.keys(APARATOS).filter(a => !aparatos.has(a));
  aparatos = new Set(Object.keys(APARATOS)); enfocado = null; render();
  nuevos.forEach((a, i) => setTimeout(() => encender($(`.ap[data-v="${a}"]`)), i * 120));
});
$("#k-basico").addEventListener("click", () => { aparatos = new Set(["estufa", "nevera"]); enfocado = null; render(); });

["#presu", "#peso", "#platos", "#reps", "#maxmin", "#personas", "#dias", "#comidas"].forEach(s => $(s).addEventListener("input", render));
$$(".stepper button").forEach(b => b.addEventListener("click", () => {
  const inp = $("#" + b.dataset.for);
  const v = Math.min(+inp.max, Math.max(+inp.min, (Math.round(+inp.value) || +inp.min) + +b.dataset.step));
  inp.value = v; render();
}));
$$("#actividad button").forEach(b => b.addEventListener("click", () => { elegirSeg("#actividad", b.dataset.v); render(); }));
$$("#restricciones .pill").forEach(b => b.addEventListener("click", () => {
  b.setAttribute("aria-pressed", String(!pressed(b))); render();
}));
$$("#proteinas .token").forEach(c => c.addEventListener("click", () => {
  const g = c.dataset.p;
  proteinas.has(g) ? proteinas.delete(g) : proteinas.add(g);
  render();
}));
$("#alm-carne").addEventListener("click", () => { const b = $("#alm-carne"); b.setAttribute("aria-pressed", String(!pressed(b))); render(); });
$("#mealprep").addEventListener("click", () => { const b = $("#mealprep"); b.setAttribute("aria-pressed", String(!pressed(b))); render(); });
const pistaModo = () => { $("#modo-hint").textContent = $('#modo button[aria-pressed="true"]').dataset.v === "dias"
  ? "Calcula cuánto cuesta cubrir los días que pides."
  : "Llena hasta donde alcance la plata y te dice hasta qué día llegas."; };
$$("#modo button").forEach(b => b.addEventListener("click", () => { elegirSeg("#modo", b.dataset.v); pistaModo(); render(); }));
$$(".tabs button").forEach(b => b.addEventListener("click", () => seleccionarTab(b.dataset.t)));
$("#c-ver").addEventListener("click", () => {
  if (ultimo && ultimo.ok) seleccionarTab("lista");
  $("#resultado").scrollIntoView({ behavior: QUIETO ? "auto" : "smooth", block: "start" });
});

$("#stat-cat").textContent = `${RECETAS.length} recetas · ${tiendasConDatos().map(nombreTienda).join(", ")}`;
$("#fuentes").textContent = Object.keys(TIENDAS).map(t => `${nombreTienda(t)}: ${tieneDatos(t) ? `${PRECIOS[t].skus.length} presentaciones, ${fechaCorta(PRECIOS[t].fecha)}` : ((PRECIOS[t] && PRECIOS[t].nota) || "sin precios").replace(/\.$/, "")}`).join(" · ") + ".";
pistaModo();
render();
arrancar();
