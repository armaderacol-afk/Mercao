// Pruebas del motor: node --test test/
const test = require("node:test");
const assert = require("node:assert");
const M = require("../js/engine.js");

const base = { presupuesto: 150000, personas: 2, dias: 5, comidasDia: 2, modo: "dias",
  maxMinutos: 90, maxRepeticiones: 2, restricciones: [], peso: 70, actividad: "activo",
  objetivoDia: 98, objetivoDesayuno: 0, pisoComida: 49 };

test("una alternativa del grupo basta", () => {
  const r = M.RECETAS.find(x => x.id === "arepa_queso_leche");
  assert.deepStrictEqual(M.aparatosUsados(r, ["microondas"]), ["microondas"]);
  assert.deepStrictEqual(M.aparatosUsados(r, ["airfryer", "estufa"]), ["estufa"]);
  assert.strictEqual(M.aparatosUsados(r, ["horno"]), null);
});

test("cada receta usa aparatos conocidos", () => {
  for (const r of M.RECETAS)
    for (const q of r.ap)
      for (const a of (Array.isArray(q) ? q : [q]))
        assert.ok(M.APARATOS[a], `${r.id} usa ${a}`);
});

test("cada ingrediente de receta existe", () => {
  for (const r of M.RECETAS)
    for (const i of Object.keys(r.ing)) assert.ok(M.ING[i], `${r.id}: ${i}`);
});

test("hay al menos 90 recetas y los ids no se repiten", () => {
  assert.ok(M.RECETAS.length >= 90, `solo ${M.RECETAS.length}`);
  assert.strictEqual(new Set(M.RECETAS.map(r => r.id)).size, M.RECETAS.length);
});

test("los precios de cada tienda apuntan a ingredientes conocidos y son positivos", () => {
  for (const t of Object.keys(M.PRECIOS))
    for (const s of M.PRECIOS[t].skus) {
      assert.ok(M.ING[s.ing], `${t}: ${s.ing}`);
      assert.ok(s.size > 0 && s.precio > 0, `${t}: ${s.nom}`);
    }
});

test("una receta sin precio en la tienda no entra al plan", () => {
  for (const t of M.tiendasConDatos()) {
    const r = M.planear({ ...base, tienda: t, aparatos: Object.keys(M.APARATOS) });
    if (!r.ok) continue;
    for (const e of r.elegidas) assert.ok(M.conPrecio(e.receta, t), `${t}: ${e.receta.id}`);
  }
});

test("con todo prendido, ninguna receta queda por fuera por la tienda", () => {
  const todo = { ...base, aparatos: Object.keys(M.APARATOS), maxMinutos: 999, restricciones: [] };
  for (const t of M.tiendasConDatos()) {
    assert.equal(M.recetasPosibles({ ...todo, tienda: t }).length, M.RECETAS.length, t);
    // Lo que la tienda no publica va con precio de otra y queda marcado.
    const r = M.planear({ ...todo, tienda: t });
    for (const f of r.canasta) if (f.ref) {
      assert.notEqual(f.ref, t);
      assert.ok(!M.PRECIOS[t].skus.some(s => s.ing === f.ing), `${t}: ${f.ing}`);
    }
  }
  assert.ok(M.tiendaRef("d1", "limon"), "D1 no publica limón: debe tomar el precio de otra tienda");
});

test("comparar tiendas devuelve todas las tiendas, con o sin datos", () => {
  const c = M.compararTiendas({ ...base, aparatos: ["estufa", "olla_presion", "nevera"] });
  assert.deepStrictEqual(c.map(x => x.tienda), Object.keys(M.TIENDAS));
  for (const x of c.filter(x => x.datos && x.ok)) assert.ok(x.costoTotal > 0);
});

test("solo con airfryer y microondas también se arma un plan", () => {
  const r = M.planear({ ...base, aparatos: ["airfryer", "microondas"] });
  assert.ok(r.ok);
  assert.ok(r.comidasAsignadas > 0);
  for (const e of r.elegidas) assert.ok(e.receta.usa.every(a => ["airfryer", "microondas"].includes(a)));
});

test("marcar un aparato nunca quita recetas", () => {
  const imp = M.impactoAparatos({ ...base, aparatos: ["estufa"] });
  for (const v of Object.values(imp.porAparato)) assert.ok(v.delta >= 0);
});

test("el plan clásico con estufa sigue cubriendo la semana", () => {
  const r = M.planear({ ...base, aparatos: ["estufa", "olla_presion"] });
  assert.ok(r.ok);
  assert.strictEqual(r.diasCubiertos, 5);
  assert.ok(r.pisoComidaCumplido);
});

const conPiso = { ...base, aparatos: ["estufa", "olla_presion", "horno", "airfryer"] };

test("almuerzo siempre con carne, en menú variado", () => {
  const r = M.planear({ ...conPiso, almuerzoConCarne: true });
  assert.ok(r.ok);
  for (const e of r.elegidas.filter(e => e.franja === "almuerzo"))
    assert.ok(M.llevaCarne(e.receta), `${e.receta.id} sin carne`);
});

test("almuerzo siempre con carne, en meal prep", () => {
  for (const comidasDia of [1, 2, 3]) {
    const r = M.planearMealPrep({ ...conPiso, comidasDia, platos: 3, almuerzoConCarne: true });
    assert.ok(r.ok, `comidasDia ${comidasDia}`);
    const alm = r.elegidas.filter(e => e.franja === "almuerzo");
    assert.strictEqual(alm.length, r.diasCubiertos);
    for (const e of alm) assert.ok(M.llevaCarne(e.receta), `${e.receta.id} sin carne`);
  }
});

test("sin res ni pescado no aparece ni carne de res ni atún", () => {
  const proteinas = ["pollo", "embutidos", "huevo", "granos"];
  for (const plan of [M.planear, M.planearMealPrep]) {
    const r = plan({ ...conPiso, proteinas, almuerzoConCarne: true });
    assert.ok(r.ok);
    for (const e of r.elegidas) {
      assert.ok(!("carne_res" in e.receta.ing), e.receta.id);
      assert.ok(!("atun" in e.receta.ing), e.receta.id);
    }
  }
});

test("si no comen ninguna carne, el almuerzo con carne no se puede armar", () => {
  const r = M.planear({ ...conPiso, proteinas: ["huevo", "granos"], almuerzoConCarne: true });
  assert.ok(!r.ok);
  assert.deepStrictEqual(r.vacias, ["almuerzo"]);
});

test("cada ingrediente tiene datos de nutrición", () => {
  for (const i of Object.keys(M.ING)) assert.ok(M.NUTRI[i], `sin nutrición: ${i}`);
});

test("los acompañantes usan ingredientes conocidos y aportan verdura", () => {
  for (const a of M.ACOMPANANTES) {
    for (const i of Object.keys(a.ing)) assert.ok(M.ING[i], `${a.id}: ${i}`);
    assert.ok(M.nutrientes(a.ing).verd >= 90, `${a.id} aporta poca verdura`);
  }
});

test("cada comida principal llega a su meta de verdura o lleva acompañante", () => {
  for (const t of M.tiendasConDatos()) {
    const r = M.planear({ ...base, tienda: t, aparatos: Object.keys(M.APARATOS) });
    if (!r.ok) continue;
    for (const e of r.elegidas) {
      const meta = M.metaVerduraFranja(e.franja, r.franjas);
      const verd = M.nutrientesPlato(e).verd;
      assert.ok(verd >= meta - 25 || r.balance.sinAcomp > 0, `${t}: ${e.receta.id} queda en ${Math.round(verd)} g`);
    }
  }
});

test("todo plato lleva acompañante, también con desayuno y en meal prep", () => {
  for (const t of M.tiendasConDatos())
    for (const mealPrep of [false, true])
      for (const semilla of [1, 2, 3]) {
        const o = { ...base, comidasDia: 3, presupuesto: 300000, tienda: t, aparatos: Object.keys(M.APARATOS), mealPrep, platos: 3, semilla };
        const r = mealPrep ? M.planearMealPrep(o) : M.planear(o);
        assert.ok(r.ok, `${t}`);
        for (const e of r.elegidas) {
          assert.ok(e.acomp, `${t}${mealPrep ? " meal prep" : ""}: ${e.franja} ${e.receta.id} sin acompañante`);
          if (e.franja === "desayuno") assert.match(e.acomp.id, /^fruta_/);
        }
        assert.equal(r.balance.sinAcomp, 0);
      }
});

test("el acompañante no repite la fruta del desayuno", () => {
  const r = M.planear({ ...base, comidasDia: 3, presupuesto: 300000, aparatos: Object.keys(M.APARATOS) });
  for (const e of r.elegidas) if (e.franja === "desayuno")
    for (const i of Object.keys(e.acomp.ing)) assert.ok(!e.receta.ing[i], `${e.receta.id} + ${e.acomp.id}`);
});

test("el balance del día suma 100 % entre proteína, carbohidratos y grasa", () => {
  const r = M.planear({ ...base, aparatos: ["estufa", "olla_presion", "nevera"] });
  const p = r.balance.pct;
  assert.ok(Math.abs(p.prot + p.carb + p.gra - 100) <= 2);
  assert.ok(r.balance.kcal > 800 && r.balance.kcal < 4000);
});

test("una receta repetida no cae al día siguiente", () => {
  for (const t of M.tiendasConDatos())
    for (const semilla of [1, 2, 3]) {
      const r = M.planear({ ...base, dias: 7, tienda: t, semilla, aparatos: Object.keys(M.APARATOS) });
      if (!r.ok) continue;
      const ultimo = {};
      r.elegidas.forEach((e, k) => {
        const d = Math.floor(k / r.comidasDia);
        if (ultimo[e.receta.id] != null) assert.ok(d - ultimo[e.receta.id] >= 2, `${t}: ${e.receta.id} en días ${ultimo[e.receta.id]} y ${d}`);
        ultimo[e.receta.id] = d;
      });
    }
});

test("la misma semilla da el mismo menú y otra semilla puede cambiarlo", () => {
  const o = { ...base, tienda: "exito", aparatos: Object.keys(M.APARATOS) };
  const ids = s => M.planear({ ...o, semilla: s }).elegidas.map(e => e.receta.id).join();
  assert.strictEqual(ids(5), ids(5));
  assert.ok([6, 7, 8, 9, 10].some(s => ids(s) !== ids(5)));
});
