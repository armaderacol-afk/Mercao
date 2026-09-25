/* ==========================================================
   MERCAO — interfaz
   ========================================================== */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const money = n => "$" + Math.round(n).toLocaleString("es-CO");
const SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const nombreDia = d => d < 7 ? SEMANA[d] : `Día ${d + 1}`;
const CLAVE = "mercao.v2";
const APARATOS_INICIALES = ["estufa", "olla_presion", "nevera"];

/* ---------- estado de la cocina ---------- */
let aparatos = new Set(APARATOS_INICIALES);
let enfocado = null;

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
  if (c.modo) $$("#modo button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === c.modo)));
  if (c.actividad) $$("#actividad .chip").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === c.actividad)));
  if (Array.isArray(c.restricciones))
    $$("#restricciones .chip").forEach(b => b.setAttribute("aria-pressed", String(c.restricciones.includes(b.dataset.v))));
  if (c.mealPrep) $("#mealprep").setAttribute("aria-pressed", "true");
}

/* ---------- lectura de controles ---------- */
function leerCrudo() {
  return {
    presupuesto: +$("#presu").value,
    personas: Math.max(1, +$("#personas").value || 1),
    dias: Math.max(1, +$("#dias").value || 1),
    comidasDia: Math.min(3, Math.max(1, +$("#comidas").value || 1)),
    aparatos: [...aparatos],
    restricciones: $$('#restricciones .chip[aria-pressed="true"]').map(b => b.dataset.v),
    modo: $('#modo button[aria-pressed="true"]').dataset.v,
    maxMinutos: +$("#maxmin").value,
    maxRepeticiones: +$("#reps").value,
    mealPrep: $("#mealprep").getAttribute("aria-pressed") === "true" && aparatos.has("nevera"),
    platos: +$("#platos").value,
    peso: +$("#peso").value,
    actividad: ($('#actividad .chip[aria-pressed="true"]') || { dataset: { v: "activo" } }).dataset.v,
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

/* ==========================================================
   LA COCINA
   ========================================================== */
function construirChips() {
  $("#aparatos").innerHTML = Object.entries(APARATOS).map(([k, a]) =>
    `<button type="button" class="apchip" data-v="${k}" aria-pressed="false"><span class="dot"></span>${a.n}<em></em></button>`).join("");
}

function textoImpacto(k, imp) {
  const a = APARATOS[k], p = imp.porAparato[k];
  if (k === "nevera") return p.tiene
    ? `<b>${a.n}</b> · Puedes cocinar en tandas y guardar para varios días.`
    : `<b>${a.n}</b> · Sin nevera no conviene el meal prep: la comida cocinada no aguanta fuera del frío.`;
  const n = p.delta, la = a.g === "m" ? "lo" : "la", ella = a.g === "m" ? "él" : "ella";
  if (p.tiene) return n > 0
    ? `<b>${a.n}</b> · ${a.d}. Sin ${ella} perderías ${n} receta${n === 1 ? "" : "s"}.`
    : `<b>${a.n}</b> · ${a.d}. Con lo demás que tienes, ninguna receta depende solo de esto.`;
  return n > 0
    ? `<b>${a.n}</b> · ${a.d}. Si ${la} tienes, abre <b>${n} receta${n === 1 ? "" : "s"} más</b>.`
    : `<b>${a.n}</b> · ${a.d}. Con lo que ya tienes no suma recetas nuevas.`;
}

function pintarCocina(o) {
  const imp = impactoAparatos(o);
  for (const [k, p] of Object.entries(imp.porAparato)) {
    const pressed = String(p.tiene);
    const g = $(`.ap[data-v="${k}"]`);
    if (g) {
      g.setAttribute("aria-pressed", pressed);
      g.setAttribute("aria-label", `${APARATOS[k].n}: ${p.tiene ? "lo tienes" : "no lo tienes"}`);
      const badge = g.querySelector(".badge");
      badge.querySelector("text").textContent = "+" + p.delta;
      badge.classList.toggle("none", !p.tiene && p.delta === 0);
    }
    const c = $(`.apchip[data-v="${k}"]`);
    c.setAttribute("aria-pressed", pressed);
    c.querySelector("em").textContent = k === "nevera" ? (p.tiene ? "tandas" : "")
      : p.tiene ? `${p.usan} rec.` : (p.delta > 0 ? `+${p.delta}` : "");
  }
  $("#k-count").innerHTML = `${imp.hoy}<small>de ${imp.total} recetas</small>`;
  $("#k-bar").style.width = Math.round(imp.hoy / imp.total * 100) + "%";
  $("#k-info").innerHTML = enfocado ? textoImpacto(enfocado, imp)
    : aparatos.size
      ? `Tienes ${[...aparatos].map(a => APARATOS[a].n.toLowerCase()).join(", ")}. Pasa el cursor o toca un electrodoméstico para ver qué cambia.`
      : "No marcaste nada. Toca en la ilustración lo que tienes en tu cocina.";
}

function alternar(k) {
  aparatos.has(k) ? aparatos.delete(k) : aparatos.add(k);
  enfocado = k;
  render();
}

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
    const falt = Object.entries(impactoAparatos(o).porAparato).filter(([k, p]) => !p.tiene && p.delta > 0)
      .sort((a, b) => b[1].delta - a[1].delta)[0];
    s.push(`<b>El límite es el recetario, no la plata.</b> Hay ${r.candidatas} recetas posibles y cada una se repite máximo ${r.maxRepeticiones} ${r.maxRepeticiones === 1 ? "vez" : "veces"}: alcanzan para ${r.topeCatalogo} comidas.${falt ? ` Si tienes <b>${APARATOS[falt[0]].n.toLowerCase()}</b>, márcal${APARATOS[falt[0]].g === "m" ? "o" : "a"} en la cocina: abre ${falt[1].delta} recetas más.` : " Sube las repeticiones o dale más tiempo por receta."}`);
  } else if (r.modo === "dias" && r.diasCubiertos < r.diasPedidos) {
    s.push(`Solo se llenaron <b>${r.comidasAsignadas} de ${r.diasPedidos * r.comidasDia} comidas</b>. Sube las repeticiones o marca más cosas en la cocina.`);
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
  guardar();

  const sinNevera = !aparatos.has("nevera");
  $("#mealprep").disabled = sinNevera;
  if (sinNevera) $("#mealprep").setAttribute("aria-pressed", "false");
  $("#f-platos").hidden = !o.mealPrep;
  $("#f-reps").hidden = o.mealPrep;
  $("#prep-hint").textContent = sinNevera ? "Necesita nevera: márcala en la cocina."
    : o.mealPrep ? "Cocinas pocos platos en tandas grandes y los repites." : "Menú variado: cada día algo distinto.";
  $("#presu-lbl").textContent = money(o.presupuesto);
  $("#peso-lbl").textContent = o.peso;
  $("#platos-lbl").textContent = o.platos;
  $("#reps-lbl").textContent = o.maxRepeticiones;
  $("#maxmin-lbl").textContent = o.maxMinutos;
  $("#prot-hint").innerHTML = `${ACTIVIDAD[o.actividad].d}. Objetivo <b>${Math.round(o.objetivoDia)} g al día</b>, mínimo <b>${Math.round(o.pisoComida)} g</b> en cada almuerzo y cena.`;

  const r = o.mealPrep ? planearMealPrep(o) : planear(o);
  $("#reps-hint").textContent = r.ok && !r.mealPrep
    ? `${r.candidatas} recetas × ${r.maxRepeticiones} = ${r.topeCatalogo} comidas como máximo.` : "";
  const tabTandas = $('.tabs button[data-t="tandas"]');
  tabTandas.hidden = !(r.ok && r.mealPrep);
  if (tabTandas.hidden && tabTandas.getAttribute("aria-selected") === "true") seleccionarTab("plan");

  if (!r.ok) { renderError(r, o); return; }
  renderKpis(r, o);
  renderPlan(r);
  renderTandas(r, o);
  renderLista(r);
  renderRecetas(r);
}

function renderError(r, o) {
  $("#kpis").innerHTML = "";
  ["plan", "tandas", "lista", "recetas"].forEach(t => $("#pane-" + t).innerHTML = "");
  const sinCocina = r.diag && Object.values(r.diag).every(d => d.sinPiso === 0);
  let items;
  if (sinCocina) {
    items = [`Con lo que marcaste en la cocina no hay ${r.vacias.map(v => v === "comida" ? "cenas" : v === "almuerzo" ? "almuerzos" : v).join(" ni ")} posibles.`,
      `Marca al menos uno de estos: estufa, airfryer, microondas, arrocera u horno. También puedes subir el tiempo máximo por receta o quitar alguna restricción.`];
  } else {
    items = [`Pides <b>${Math.round(r.pisoComida)} g de proteína</b> por almuerzo y por cena (${o.peso} kg, ${ACTIVIDAD[o.actividad].n.toLowerCase()}), y ninguna receta disponible llega ahí ni subiendo la porción al máximo.`,
      ...Object.entries(r.diag || {}).map(([f, d]) => `<b>${FRANJA_NOM[f]}:</b> ${d.sinPiso} receta${d.sinPiso === 1 ? "" : "s"} posible${d.sinPiso === 1 ? "" : "s"}, ${d.conPiso} llega${d.conPiso === 1 ? "" : "n"} al mínimo. Lo máximo en esa comida son ${d.techoProteina} g por porción.`),
      `Qué hacer: baja el nivel de actividad, pasa a 3 comidas al día para repartir el objetivo, marca más cosas en la cocina o quita alguna restricción.`];
  }
  $("#alerta").innerHTML = `<div class="alert"><div class="head">No se puede armar el plan</div><ul>${items.map(x => `<li>${x}</li>`).join("")}</ul></div>`;
}

function renderKpis(r, o) {
  const dentro = r.costoTotal <= r.presupuesto, cubre = r.diasCubiertos >= r.diasPedidos;
  $("#kpis").innerHTML = `
    <div class="kpi hero">
      <div class="k">Total del mercado</div>
      <div class="v num">${money(r.costoTotal)}</div>
      <div class="s">${dentro ? `Te sobran ${money(r.presupuesto - r.costoTotal)} del presupuesto` : `Te pasas por ${money(r.costoTotal - r.presupuesto)}`}</div>
    </div>
    <div class="kpi">
      <div class="k">Días cubiertos</div>
      <div class="v num">${r.diasCubiertos} de ${r.diasPedidos}</div>
      <span class="tag ${cubre ? "ok" : "bad"}">${r.comidasAsignadas} comidas · ${r.porciones} porciones</span>
    </div>
    <div class="kpi">
      <div class="k">Por porción</div>
      <div class="v num">${money(r.costoPorPorcion)}</div>
      <div class="s">${r.personas} ${r.personas === 1 ? "persona" : "personas"}</div>
    </div>
    <div class="kpi">
      <div class="k">Proteína al día</div>
      <div class="v num">${r.proteinaDia} g</div>
      <span class="tag ${r.objetivoCumplido ? "ok" : "bad"}">objetivo ${r.objetivoDia} g · ${r.objetivoCumplido ? "cumple" : "no llega"}</span>
    </div>`;
  const sg = sugerencias(r, o);
  const todoBien = dentro && cubre && r.pisoComidaCumplido && r.objetivoCumplido;
  $("#alerta").innerHTML = sg.length
    ? `<div class="alert ${todoBien ? "okmode" : ""}"><div class="head">${todoBien ? "Notas del plan" : "Lo que hay que saber"}</div><ul>${sg.map(x => `<li>${x}</li>`).join("")}</ul></div>`
    : `<div class="alert okmode"><div class="head">Plan viable</div><ul><li>Cubre los ${r.diasPedidos} días dentro del presupuesto y con la proteína completa.</li></ul></div>`;
}

function renderPlan(r) {
  let html = "", k = 0;
  for (let d = 0; d < r.diasCubiertos; d++) {
    let cs = "", protDia = 0;
    for (let c = 0; c < r.comidasDia; c++, k++) {
      const e = r.elegidas[k]; if (!e) break;
      const pr = Math.round(proteinaReceta(e.receta)); protDia += pr;
      const cumple = !PRINCIPALES.includes(e.franja) || pr >= r.pisoComida - 0.5;
      cs += `<div class="comida"><div class="slot">${FRANJA_NOM[e.franja] || "Comida"}</div>
        <div class="nom">${e.receta.n}</div>
        <div class="meta num">${e.receta.min} min · <b class="${cumple ? "ok" : "bad"}">${pr} g proteína</b>${e.receta.usa && e.receta.usa.length ? " · " + e.receta.usa.map(a => APARATOS[a].n.toLowerCase()).join(", ") : ""}</div></div>`;
    }
    html += `<div class="dia"><h4>${nombreDia(d)} <span class="num ${protDia >= r.objetivoDia - 1 ? "ok" : ""}">${protDia} g</span></h4>${cs}</div>`;
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
      <p class="note" style="margin:0 0 0.8rem">Menos platos no siempre sale más barato: con pocos platos el sobrante de un empaque no lo aprovecha otra receta.</p>
      <div class="scroll"><table><thead><tr><th>Platos</th><th>Costo total</th><th class="n">Por porción</th><th class="n">Proteína/día</th><th class="n">Días</th></tr></thead>
      <tbody>${barrido.map(b => `<tr class="${b.n === r.platos ? "mine" : ""}">
        <td><b>${b.n}</b>${b.n === r.platos ? ' <span class="sub">el tuyo</span>' : ""}${b.n === mejor.n ? ' <span class="tag warn">más barato</span>' : ""}</td>
        <td><div class="barcell"><i class="${b.n === mejor.n ? "best" : ""}" style="width:${Math.round(b.costo / max * 60)}%"></i><span class="num">${money(b.costo)}</span></div></td>
        <td class="n">${money(b.porc)}</td><td class="n" style="${b.ok ? "" : "color:var(--achiote-ink)"}">${b.prot} g</td><td class="n">${b.dias}</td></tr>`).join("")}</tbody></table></div>
      ${mejor.n !== r.platos ? `<p class="note">Con <b>${mejor.n} platos</b> el mismo plan cuesta ${money(mejor.costo)}, ${money(r.costoTotal - mejor.costo)} menos que con ${r.platos}.</p>` : ""}`;
  }
  $("#pane-tandas").innerHTML = `
    <div class="scroll"><table>
      <thead><tr><th>Cocinas una vez</th><th class="n">Proteína/porción</th><th class="n">Porciones</th><th class="n">Cubre</th><th class="n">Tiempo</th><th class="n">Costo</th></tr></thead>
      <tbody>${r.tandas.map(t => `<tr>
        <td><b>${t.receta.n}</b><div class="sub">${t.grupo === "desayuno" ? "desayuno" : "almuerzo y cena"}</div></td>
        <td class="n">${Math.round(proteinaReceta(t.receta))} g</td><td class="n">${t.porciones}</td>
        <td class="n">${t.comidas} ${t.comidas === 1 ? "comida" : "comidas"}</td><td class="n">${t.receta.min} min</td>
        <td class="n">${money(t.costoMarginal)}</td></tr>`).join("")}
        <tr class="total"><td>Total</td><td class="n">—</td><td class="n">${r.porciones}</td><td class="n">${r.comidasAsignadas}</td>
          <td class="n">${Math.round(r.minutosCocina / 6) / 10} h</td><td class="n">${money(r.costoTotal)}</td></tr>
      </tbody></table></div>
    <p class="note">Son <b>${r.platos} sesiones de cocina</b> para ${r.diasCubiertos} días.</p>
    ${comparativo}
    ${Math.max(...diasPorTanda) > 4 ? `<div class="alert" style="margin-top:1rem"><div class="head">Conservación</div><ul><li>Alguna tanda tiene que durar <b>${Math.max(...diasPorTanda)} días</b>. En nevera la comida cocinada aguanta 3 o 4; lo demás <b>congélalo en porciones</b> el mismo día y sácalo la noche anterior. El arroz cocido es lo más delicado: enfríalo rápido.</li></ul></div>` : ""}`;
}

function renderLista(r) {
  const semana = r.canasta.filter(f => !f.desp), desp = r.canasta.filter(f => f.desp);
  const fila = f => `<tr><td><b>${f.nombre}</b><div class="sub">necesitas ${f.necesita} ${f.unidad}</div></td>
    <td class="sku">${f.sku}</td><td class="n">${money(f.costo)}</td>
    <td class="n ${f.sobrante > 0 ? "leftover" : ""}">${f.sobrante > 0 ? "+" + f.sobrante + " " + f.unidad : "—"}</td></tr>`;
  let filas = "";
  for (const cat of ["Proteína", "Granos", "Verduras", "Lácteos"]) {
    const g = semana.filter(f => f.cat === cat); if (!g.length) continue;
    filas += `<tr class="cat"><td colspan="4">${cat}</td></tr>` + g.map(fila).join("");
  }
  if (desp.length) filas += `<tr class="cat"><td colspan="4">Despensa · dura varias semanas</td></tr>` + desp.map(fila).join("");
  $("#pane-lista").innerHTML = `<div class="scroll"><table>
    <thead><tr><th>Ingrediente</th><th>Qué compras</th><th class="n">Costo</th><th class="n">Sobra</th></tr></thead>
    <tbody>${filas}<tr class="total"><td colspan="2">Total</td><td class="n">${money(r.costoTotal)}</td><td></td></tr></tbody></table></div>
    <p class="note">De ese total, <b>${money(r.costoDespensa)}</b> es despensa (aceite, sal, ajo, harina, pasta de tomate) que no se compra cada semana. El motor escoge la combinación de empaques más barata, no solo el más grande.</p>`;
}

function renderRecetas(r) {
  const vistos = new Set(); let rec = "";
  for (const e of r.elegidas) {
    if (vistos.has(e.receta.id)) continue; vistos.add(e.receta.id);
    const R = e.receta;
    const ings = Object.entries(R.ing).map(([i, q]) => `<span>${ING[i].n} ${Math.round(q * r.personas * 10) / 10} ${ING[i].u}</span>`).join("");
    const usa = (R.usa || []).length ? R.usa.map(a => `<span>${APARATOS[a].n}</span>`).join("") : "<span>Sin cocción</span>";
    rec += `<details class="rec"><summary><span class="rn">${R.n}</span><span class="usa">${usa}</span>
      <span class="rm num">${R.min} min · ${Math.round(proteinaReceta(R))} g proteína${R.f && R.f !== 1 ? ` · porción ×${R.f}` : ""}</span></summary>
      <div class="recbody"><div class="ing">Para ${r.personas} ${r.personas === 1 ? "porción" : "porciones"}: ${ings}</div>
      <ol>${R.pasos.map(p => `<li>${p}</li>`).join("")}</ol></div></details>`;
  }
  $("#pane-recetas").innerHTML = rec || `<p class="note">No hay recetas en el plan.</p>`;
}

function seleccionarTab(t) {
  $$(".tabs button").forEach(x => x.setAttribute("aria-selected", String(x.dataset.t === t)));
  ["plan", "tandas", "lista", "recetas"].forEach(p => $("#pane-" + p).hidden = p !== t);
}

/* ==========================================================
   EVENTOS
   ========================================================== */
construirChips();
restaurar();

$$(".ap").forEach(g => {
  const k = g.dataset.v;
  g.addEventListener("click", () => alternar(k));
  g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(k); } });
  g.addEventListener("mouseenter", () => { enfocado = k; pintarCocina(leerOpciones()); });
  g.addEventListener("focus", () => { enfocado = k; pintarCocina(leerOpciones()); });
});
$("#scene").addEventListener("mouseleave", () => { enfocado = null; pintarCocina(leerOpciones()); });
$$(".apchip").forEach(c => {
  c.addEventListener("click", () => alternar(c.dataset.v));
  c.addEventListener("mouseenter", () => { enfocado = c.dataset.v; pintarCocina(leerOpciones()); });
});
$("#k-todo").addEventListener("click", () => { aparatos = new Set(Object.keys(APARATOS)); enfocado = null; render(); });
$("#k-basico").addEventListener("click", () => { aparatos = new Set(["estufa", "nevera"]); enfocado = null; render(); });

["#presu", "#peso", "#platos", "#reps", "#maxmin", "#personas", "#dias", "#comidas"].forEach(s => $(s).addEventListener("input", render));
$$("#actividad .chip").forEach(b => b.addEventListener("click", () => {
  $$("#actividad .chip").forEach(x => x.setAttribute("aria-pressed", "false"));
  b.setAttribute("aria-pressed", "true"); render();
}));
$$("#restricciones .chip").forEach(b => b.addEventListener("click", () => {
  b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); render();
}));
$("#mealprep").addEventListener("click", () => {
  const b = $("#mealprep");
  b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); render();
});
$$("#modo button").forEach(b => b.addEventListener("click", () => {
  $$("#modo button").forEach(x => x.setAttribute("aria-pressed", "false"));
  b.setAttribute("aria-pressed", "true");
  $("#modo-hint").textContent = b.dataset.v === "dias"
    ? "Calcula cuánto cuesta cubrir los días que pides."
    : "Llena hasta donde alcance la plata y te dice hasta qué día llegas.";
  render();
}));
$$(".tabs button").forEach(b => b.addEventListener("click", () => seleccionarTab(b.dataset.t)));

$("#stat-cat").textContent = `${RECETAS.length} recetas · ${SKUS.length} presentaciones`;
render();
