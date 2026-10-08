/* ==========================================================
   MERCAO — efectos de la cocina
   Vapor en bocanadas, destellos, sacudidas y la nubecita de polvo al
   apagar. Todo se dibuja una vez al cargar; el CSS lo anima.
   ========================================================== */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, padre) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  };
  const ESTRELLA = "M0 -9C.8 -2.6 2.6 -.8 9 0 2.6 .8 .8 2.6 0 9-.8 2.6-2.6 .8-9 0-2.6-.8-.8-2.6 0-9Z";
  // Una nube: tres o cuatro círculos. Primero el contorno grueso y encima
  // el relleno, así queda una sola silueta con trazo de tinta.
  const NUBE = [[0, 0, 7], [7, -3, 5.5], [-6, -4, 5], [1, -9, 5.5]];

  function bocanadas(g) {
    const x = +g.dataset.x, y = +g.dataset.y, s = +(g.dataset.s || 1);
    const color = g.dataset.c || "#fffdf6";
    const n = g.dataset.alto === "corto" ? 3 : 4;
    for (let i = 0; i < n; i++) {
      const lado = i % 2 ? 1 : -1;
      const pos = el("g", { transform: `translate(${(x + lado * 4 * s).toFixed(1)} ${y}) scale(${s})` }, g);
      const b = el("g", { class: "bocanada", style: `animation-delay:${-(i * 0.72).toFixed(2)}s;--dx:${lado * (8 + i * 2)}px` }, pos);
      for (const [cx, cy, r] of NUBE) el("circle", { class: "o", cx, cy, r: r + 1.4 }, b);
      for (const [cx, cy, r] of NUBE) el("circle", { class: "f", cx, cy, r, fill: color }, b);
      el("path", { class: "brillo", d: "M-3 -7q2-3 6-2" }, b);
    }
  }

  function caja(ap) {
    const h = ap.querySelector(".hit");
    return { x: +h.getAttribute("x"), y: +h.getAttribute("y"), w: +h.getAttribute("width"), h: +h.getAttribute("height") };
  }

  // Estrellitas que titilan alrededor de cada aparato prendido.
  function destellos(ap) {
    const on = ap.querySelector(".on"); if (!on) return;
    const c = caja(ap);
    const g = el("g", { class: "kiras" }, on);
    [[0.1, 0.14, 1], [0.94, 0.3, 0.8], [0.72, 0.04, 0.65]].forEach(([fx, fy, s], i) => {
      const t = el("g", { transform: `translate(${(c.x + c.w * fx).toFixed(1)} ${(c.y + c.h * fy).toFixed(1)}) scale(${s})` }, g);
      el("path", { class: "kira", d: ESTRELLA, style: `animation-delay:${(i * 1.2 + Math.random() * 0.8).toFixed(2)}s` }, t);
    });
  }

  // Nubecita de polvo para cuando se apaga.
  function polvo(ap) {
    const c = caja(ap);
    const g = el("g", { class: "puf", transform: `translate(${(c.x + c.w / 2).toFixed(1)} ${(c.y + c.h - 10).toFixed(1)})` }, ap);
    [[-28, 0, 9], [-12, -7, 12], [9, -6, 11], [26, 0, 8], [-2, 3, 10]].forEach(([cx, cy, r], i) =>
      el("circle", { cx, cy, r, style: `--i:${i}` }, g));
  }

  window.Escena = {
    preparar() {
      document.querySelectorAll(".humo").forEach(bocanadas);
      document.querySelectorAll(".ap").forEach(ap => { destellos(ap); polvo(ap); });
    },
    apagar(ap) {
      if (!ap) return;
      ap.classList.remove("apagando"); void ap.getBBox(); ap.classList.add("apagando");
      setTimeout(() => ap.classList.remove("apagando"), 900);
    },
  };
})();
