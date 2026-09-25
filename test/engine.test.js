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

test("cada ingrediente de receta existe y tiene empaque", () => {
  for (const r of M.RECETAS)
    for (const i of Object.keys(r.ing)) {
      assert.ok(M.ING[i], `${r.id}: ${i}`);
      assert.ok(M.SKUS.some(s => s.ing === i), `sin empaque: ${i}`);
    }
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
