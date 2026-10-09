/* ==========================================================
   MERCAO — ilustraciones
   Cada plato se pinta a partir de sus ingredientes: el tipo de vajilla
   sale del nombre (sopa → tazón, batido → vaso) y lo que va encima sale
   de la receta (pollo, arroz, maduro, ensalada…). Así las 105 recetas
   tienen su dibujo sin guardar 105 imágenes. Todo es SVG en texto.
   ========================================================== */
(function (g) {
  const T = 'stroke="#2e2a20" stroke-opacity=".42" stroke-width="1" stroke-linejoin="round"';
  const brillo = (d, op = 0.45) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${op}" stroke-width="1.6" stroke-linecap="round"/>`;
  const at = (x, y, s, cuerpo, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${cuerpo}</g>`;

  // Ruido determinista para que un mismo plato salga siempre igual.
  const semilla = str => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 1000) / 1000; };

  /* ---------------- piezas de comida (centradas en 0,0, ~36 px) ---------------- */
  const P = {
    arroz: r => `<path d="M-19 6Q-17-11 0-13 17-11 19 6 0 11-19 6Z" fill="#fbf7ee" ${T}/>` +
      Array.from({ length: 9 }, () => `<ellipse cx="${(r() * 28 - 14).toFixed(1)}" cy="${(r() * 12 - 7).toFixed(1)}" rx="1.6" ry=".8" fill="#e6dcc6"/>`).join("") +
      brillo("M-10-6q6-4 12-4"),
    arrozMixto: (r, c = ["#e98a35", "#7ea24a", "#c8743a"]) => `<path d="M-21 7Q-19-12 0-14 19-12 21 7 0 12-21 7Z" fill="#f3d37e" ${T}/>` +
      Array.from({ length: 14 }, (_, i) => `<circle cx="${(r() * 32 - 16).toFixed(1)}" cy="${(r() * 14 - 8).toFixed(1)}" r="${(1.3 + r() * 1.3).toFixed(1)}" fill="${c[i % c.length]}"/>`).join("") +
      brillo("M-11-7q6-4 12-4"),
    papa: r => [[-8, 3, 7], [5, -3, 7.5], [9, 6, 6]].map(([x, y, s]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${s}" ry="${s * 0.8}" fill="#e8c46a" ${T}/><circle cx="${x - 2}" cy="${y - 1}" r="1" fill="#c39a45"/>${brillo(`M${x - 4} ${y - 3}q3-2 6-1`, 0.5)}`).join(""),
    criolla: () => [[-9, 2], [-2, -4], [5, 3], [10, -3], [0, 6]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="4.6" fill="#f0c43c" ${T}/><circle cx="${x - 1.4}" cy="${y - 1.4}" r="1.2" fill="#fff6c8"/>`).join(""),
    maduro: () => [[-9, 0, -25], [0, 2, -20], [9, 0, -15]].map(([x, y, a]) =>
      `<g transform="translate(${x} ${y}) rotate(${a})"><ellipse rx="5.5" ry="11" fill="#d9822e" ${T}/><ellipse rx="3.6" ry="8.5" fill="#eaa645"/></g>`).join(""),
    patacon: () => [[-7, -1], [8, 3]].map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="11" ry="7" fill="#e3b24c" ${T}/><path d="M${x - 6} ${y - 1}q3 2 6 0t6 0M${x - 5} ${y + 2}q3 2 6 0" stroke="#b9822e" fill="none"/>`).join(""),
    yuca: () => [[-8, -2, -12], [0, 1, 4], [8, -1, 18]].map(([x, y, a]) =>
      `<rect x="${x - 4}" y="${y - 10}" width="8" height="20" rx="3" transform="rotate(${a} ${x} ${y})" fill="#f2e8cb" ${T}/>`).join(""),
    arepa: (r, queso) => `<ellipse cx="0" cy="2" rx="17" ry="9" fill="#d7b268" ${T}/><ellipse cx="0" cy="0" rx="16" ry="8" fill="#f0d898" ${T}/>` +
      `<g fill="#c99a50" opacity=".8"><circle cx="-7" cy="-2" r="1.6"/><circle cx="4" cy="2" r="1.4"/><circle cx="8" cy="-3" r="1.2"/></g>` +
      (queso ? `<path d="M-9-1q4-4 9-3t8 2q-2 4-8 4t-9-3Z" fill="#fbf3d4" ${T}/>` : ""),
    pasta: (r, salsa) => `<path d="M-18 5Q-17-9 0-10 17-9 18 5 0 10-18 5Z" fill="#f3d77a" ${T}/>` + Array.from({ length: 11 }, (_, i) => `<path d="M${-17 + i * 2.4} ${-4 + (i % 3) * 2}q6 -${5 + (i % 3)} 12 0t12 ${i % 2 ? 2 : -2}" fill="none" stroke="${i % 2 ? "#e9c35c" : "#f6dc8a"}" stroke-width="2.6" stroke-linecap="round"/>`).join("") +
      (salsa ? `<path d="M-8-4q8-6 16 0t-2 7q-7 3-14-7Z" fill="#c4432c" ${T}/><circle cx="-2" cy="-2" r="2" fill="#7a3b22"/><circle cx="4" cy="0" r="1.8" fill="#7a3b22"/>` : ""),
    pan: () => [[-6, -1, -8], [7, 2, 10]].map(([x, y, a]) =>
      `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-9" y="-10" width="18" height="18" rx="6" fill="#c98a45" ${T}/><rect x="-6.5" y="-7" width="13" height="12.5" rx="4" fill="#f1d9a2"/></g>`).join(""),
    // proteínas
    muslo: () => `<path d="M-15 5Q-17-8-4-11 10-12 12-2 13 7 2 9-9 11-15 5Z" fill="#c26c2b" ${T}/>` +
      `<path d="M-9 2Q-10-5-2-7" stroke="#e9a45a" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
      `<path d="M10-3 19-9" stroke="#f3e9d6" stroke-width="4.5" stroke-linecap="round"/><circle cx="20" cy="-11" r="2.6" fill="#f3e9d6"/><circle cx="21.5" cy="-8" r="2.4" fill="#f3e9d6"/>`,
    pechuga: () => [[-9, 0], [0, -1], [9, 0]].map(([x, y]) =>
      `<g transform="translate(${x} ${y}) rotate(14)"><rect x="-4.5" y="-10" width="9" height="20" rx="3.5" fill="#e3b06a" ${T}/><path d="M-3-5h6M-3 0h6M-3 5h6" stroke="#a8662c" stroke-opacity=".7"/></g>`).join(""),
    desmechado: (r, c = "#d79a5a") => Array.from({ length: 12 }, () => { const x = r() * 26 - 13, y = r() * 12 - 6, a = r() * 60 - 30; return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(6 * Math.cos(a / 57)).toFixed(1)} ${(6 * Math.sin(a / 57)).toFixed(1)}" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`; }).join(""),
    res: () => `<path d="M-16 0Q-15-10-2-10 13-11 16-2 17 8 4 9-12 10-16 0Z" fill="#7a3b22" ${T}/><path d="M-12 2Q-10-6-1-7" stroke="#a65a36" stroke-width="2" fill="none"/>` +
      `<path d="M-9 4 7-6M-3 6 12-3" stroke="#4e2414" stroke-width="1.6" opacity=".7"/><path d="M13-4q3 4 0 8" stroke="#ead2b4" stroke-width="2" fill="none"/>`,
    molida: r => Array.from({ length: 16 }, () => `<circle cx="${(r() * 26 - 13).toFixed(1)}" cy="${(r() * 12 - 6).toFixed(1)}" r="${(1.6 + r() * 1.6).toFixed(1)}" fill="${r() > 0.5 ? "#7a4428" : "#93583a"}"/>`).join(""),
    albondigas: () => [[-8, 1], [3, -3], [9, 5], [-1, 6]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="6" fill="#7a4226" ${T}/>${brillo(`M${x - 3} ${y - 3}q2-2 4-1`, 0.4)}`).join("") + `<path d="M-14 8q14 6 28 0" stroke="#c4432c" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    cerdo: () => [[-9, 1], [0, -2], [9, 1]].map(([x, y]) =>
      `<g transform="translate(${x} ${y}) rotate(-12)"><ellipse rx="7" ry="10" fill="#c98a5e" ${T}/><ellipse rx="5" ry="7.6" fill="#e2b08a"/><path d="M-4-6q4-2 7 1" stroke="#a8643a" fill="none"/></g>`).join(""),
    costillas: () => [[-10, 0], [0, -2], [10, 0]].map(([x, y]) =>
      `<g transform="translate(${x} ${y}) rotate(8)"><rect x="-4.5" y="-11" width="9" height="22" rx="3" fill="#6b2e18" ${T}/><rect x="-1.4" y="-14" width="2.8" height="5" rx="1.4" fill="#f1e6d0"/>${brillo("M-2-7v10", 0.35)}</g>`).join(""),
    salchicha: () => [[-4, -3, -14], [5, 4, -8]].map(([x, y, a]) =>
      `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-15" y="-4.5" width="30" height="9" rx="4.5" fill="#b8472e" ${T}/>${brillo("M-10-2h18", 0.4)}</g>`).join(""),
    salchichaRodajas: () => [[-8, 0], [0, -3], [8, 1], [2, 5]].map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="3.6" fill="#b8472e" ${T}/><ellipse cx="${x}" cy="${y}" rx="2.8" ry="2.1" fill="#e3876a"/>`).join(""),
    huevoFrito: () => `<path d="M-14 1Q-16-9-5-10 3-14 11-7 18-1 12 6 4 11-5 9-13 8-14 1Z" fill="#fffdf6" ${T}/><circle cx="0" cy="-1" r="5.4" fill="#f2b432" ${T}/>${brillo("M-2-4q2-1 3 0", 0.7)}`,
    huevoCocido: () => [[-7, 0], [7, 1]].map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="7.5" ry="9.5" fill="#fffdf6" ${T}/><circle cx="${x}" cy="${y + 1}" r="4" fill="#f3c444"/>`).join(""),
    perico: r => `<path d="M-15 3Q-14-8-2-9 13-9 15 0 15 8 2 9-12 10-15 3Z" fill="#f4d25e" ${T}/>` +
      Array.from({ length: 8 }, (_, i) => `<circle cx="${(r() * 22 - 11).toFixed(1)}" cy="${(r() * 10 - 5).toFixed(1)}" r="1.4" fill="${i % 2 ? "#c9452e" : "#5f8a3a"}"/>`).join(""),
    tortilla: () => `<ellipse cx="0" cy="1" rx="19" ry="10" fill="#e6b54a" ${T}/><ellipse cx="0" cy="0" rx="17" ry="8.5" fill="#f2cf63"/><path d="M0 0 19 1M0 0 9-8" stroke="#c99a3a" stroke-width="1"/><circle cx="-6" cy="2" r="1.6" fill="#5f8a3a"/><circle cx="6" cy="-3" r="1.4" fill="#c9452e"/>`,
    atun: r => Array.from({ length: 10 }, () => `<ellipse cx="${(r() * 22 - 11).toFixed(1)}" cy="${(r() * 10 - 5).toFixed(1)}" rx="${(2.6 + r() * 2).toFixed(1)}" ry="2" fill="${r() > 0.5 ? "#e5b4a0" : "#d8a08a"}" ${T}/>`).join(""),
    sardina: () => `<path d="M-16 2q14-8 28 0" stroke="#c4432c" stroke-width="7" stroke-linecap="round" fill="none"/>` + [[-6, -1], [6, 1]].map(([x, y]) =>
      `<g transform="translate(${x} ${y})"><path d="M-9 0Q-3-5 6 0-3 5-9 0Z" fill="#9aa7a8" ${T}/><path d="M6 0l5-4v8Z" fill="#7f8c8d"/></g>`).join(""),
    pescado: () => `<path d="M-18 0Q-8-11 8-6 14-3 14 0 14 3 8 6-8 11-18 0Z" fill="#cf9440" ${T}/><path d="M14 0l7-7v14Z" fill="#b97a30" ${T}/>` +
      `<path d="M-6-6q-2 6 0 12M0-7q-2 7 0 14" stroke="#9b6324" fill="none"/><circle cx="-13" cy="-1.5" r="1.4" fill="#3b3024"/>${brillo("M-12-5q8-4 16-2", 0.5)}`,
    legumbre: (r, c) => `<path d="M-17 5Q-16-8 0-9 16-8 17 5 0 10-17 5Z" fill="${c}" ${T}/>` +
      Array.from({ length: 12 }, () => `<ellipse cx="${(r() * 26 - 13).toFixed(1)}" cy="${(r() * 9 - 5).toFixed(1)}" rx="2.2" ry="1.6" fill="#fff" fill-opacity=".18"/>`).join(""),
    hamburguesa: () => `<path d="M-17 4h34q0 7-17 7T-17 4Z" fill="#d79a4e" ${T}/><rect x="-18" y="-2" width="36" height="6" rx="3" fill="#6b3320"/>` +
      `<path d="M-17-2q4-3 8 0t8 0 8 0 9 0" stroke="#7ea24a" stroke-width="2.6" fill="none"/><path d="M-16-4Q-15-16 0-16 15-16 16-4Z" fill="#e3a957" ${T}/>` +
      `<g fill="#fbf1d6"><ellipse cx="-6" cy="-11" rx="1.4" ry=".8"/><ellipse cx="2" cy="-13" rx="1.4" ry=".8"/><ellipse cx="8" cy="-9" rx="1.4" ry=".8"/></g>`,
    perro: () => `<rect x="-20" y="-6" width="40" height="13" rx="6.5" fill="#e3a957" ${T}/><rect x="-21" y="-3" width="42" height="7" rx="3.5" fill="#b8472e" ${T}/>` +
      `<path d="M-16-3q4 3 8 0t8 0 8 0 8 0" stroke="#f2c43c" stroke-width="1.8" fill="none"/>`,
    sanduche: () => `<path d="M-16 8 0-12 16 8Z" fill="#f1d9a2" ${T}/><path d="M-13 5h26" stroke="#f2c43c" stroke-width="3"/><path d="M-11 2h22" stroke="#fffdf6" stroke-width="2.4"/>`,
    lasana: () => `<rect x="-17" y="-10" width="34" height="20" rx="3" fill="#e9c35c" ${T}/><path d="M-17-4h34M-17 3h34" stroke="#b8472e" stroke-width="3"/><path d="M-17-10h34" stroke="#f5e3a8" stroke-width="3"/>`,
    // verduras y frutas
    ahuyama: () => [[-7, 0, -10], [6, 1, 14]].map(([x, y, a]) =>
      `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-8 6Q-9-6 0-10 9-6 8 6Z" fill="#e8892f" ${T}/><path d="M-8 6Q0 9 8 6" stroke="#5d7a3a" stroke-width="2.4" fill="none"/>${brillo("M-4-3q2-3 4-4", 0.5)}</g>`).join(""),
    zanahoria: () => [[-8, 0], [0, -3], [8, 1], [1, 5]].map(([x, y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="4.6" ry="3.6" fill="#ec8a2c" ${T}/><ellipse cx="${x}" cy="${y}" rx="2" ry="1.5" fill="#f6b25e"/>`).join(""),
    habichuela: () => Array.from({ length: 6 }, (_, i) => `<path d="M${-14 + i * 4} ${6 - (i % 2) * 3}l${10 + (i % 3) * 2} -12" stroke="#6f9a3a" stroke-width="3.2" stroke-linecap="round"/>`).join("") +
      `<path d="M-6 4l10-11" stroke="#9cc25a" stroke-width="1" stroke-linecap="round"/>`,
    brocoli: () => [[-7, 0], [3, -4], [8, 4]].map(([x, y]) =>
      `<path d="M${x} ${y + 3}v6" stroke="#9cbf5e" stroke-width="3" stroke-linecap="round"/><g fill="#4f7d34" ${T}><circle cx="${x - 3}" cy="${y}" r="3.6"/><circle cx="${x + 3}" cy="${y}" r="3.6"/><circle cx="${x}" cy="${y - 3}" r="3.8"/></g>`).join(""),
    tomate: () => [[-6, 0], [6, -1], [0, 5]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="5.6" fill="#d5432c" ${T}/><circle cx="${x}" cy="${y}" r="3.6" fill="#ef8a72"/><g fill="#fbe1a8"><circle cx="${x - 1.4}" cy="${y}" r=".8"/><circle cx="${x + 1.4}" cy="${y}" r=".8"/></g>`).join(""),
    aguacate: () => `<g transform="rotate(-18)"><path d="M-6 9Q-12-2-4-10 4-14 7-4 10 6 2 11Z" fill="#4b6b2a" ${T}/><path d="M-4 7Q-9-2-3-8 3-11 5-3 7 5 1 9Z" fill="#c3d677"/></g>`,
    hojas: (r, c = ["#8fbf5a", "#6f9f45", "#b5d27a"]) => Array.from({ length: 6 }, (_, i) => { const x = r() * 22 - 11, y = r() * 10 - 5, a = r() * 180; return `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})" d="M-7 0Q0-6 7 0 0 6-7 0Z" fill="${c[i % c.length]}" ${T}/>`; }).join(""),
    repollo: r => Array.from({ length: 12 }, (_, i) => `<path d="M${(r() * 24 - 12).toFixed(1)} ${(r() * 10 - 5).toFixed(1)}q4 -${(2 + r() * 2).toFixed(1)} 8 0" stroke="${i % 3 ? "#dfe9bc" : "#ec8a2c"}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`).join(""),
    pepino: () => [[-7, 1], [3, -3], [8, 4]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="5" fill="#4f7d34" ${T}/><circle cx="${x}" cy="${y}" r="4" fill="#d6e8b0"/><circle cx="${x}" cy="${y}" r="1.4" fill="#b9d48a"/>`).join(""),
    arveja: r => Array.from({ length: 10 }, () => `<circle cx="${(r() * 20 - 10).toFixed(1)}" cy="${(r() * 9 - 4.5).toFixed(1)}" r="2.2" fill="#7ea24a" ${T}/>`).join(""),
    pimenton: () => [[-6, -12], [0, 4], [6, 18]].map(([x, a]) => `<path transform="translate(${x} 0) rotate(${a})" d="M0-9q3 9 0 18" stroke="#c9352b" stroke-width="3.4" fill="none" stroke-linecap="round"/>`).join(""),
    banano: () => [[-8, 0], [0, -3], [8, 1], [1, 5]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="4.6" fill="#f6e7b0" ${T}/><g fill="#c9a85a"><circle cx="${x}" cy="${y - 1}" r=".7"/><circle cx="${x - 1}" cy="${y + 1}" r=".7"/><circle cx="${x + 1}" cy="${y + 1}" r=".7"/></g>`).join(""),
    queso: () => [[-6, 0], [5, -2], [1, 5]].map(([x, y]) =>
      `<path d="M${x - 5} ${y - 2}l5-3 5 3v5l-5 3-5-3Z" fill="#fbf1d0" ${T}/><path d="M${x - 5} ${y - 2}l5 3 5-3M${x} ${y + 1}v5" stroke="#d9c58f" fill="none"/>`).join(""),
    limon: () => `<circle r="5.5" fill="#7ea24a" ${T}/><circle r="4.3" fill="#d8e8a0"/><path d="M0-4V4M-4 0H4M-3-3l6 6M3-3l-6 6" stroke="#b5cd70" stroke-width=".8"/>`,
    cilantro: () => [[-3, -1], [2, -3], [3, 2]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 0q-2-3 0-4 2 1 0 4Z" fill="#4f8a34"/>`).join(""),
    mandarina: () => `<circle r="8" fill="#ee8f24" ${T}/><path d="M0-8v-2" stroke="#5d7a3a" stroke-width="1.6"/><path d="M-1-9q4-3 6 0" fill="#6f9a3a"/>${brillo("M-4-4q2-2 4-2", 0.5)}`,
    manzana: () => `<path d="M0-6Q-9-10-9 0-8 9 0 8 8 9 9 0 9-10 0-6Z" fill="#c9352b" ${T}/><path d="M0-6q0-4 2-5" stroke="#6b4a2e" stroke-width="1.4" fill="none"/>${brillo("M-5-3q1-3 3-3", 0.5)}`,
    papaya: () => [[-6, 0, -10], [6, 1, 10]].map(([x, y, a]) =>
      `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-6 8Q-8-4 0-9 8-4 6 8Z" fill="#ef7f45" ${T}/><path d="M-3 4Q-4-2 0-5 4-2 3 4Z" fill="#f6a173"/></g>`).join(""),
  };

  const PROT = ["pollo_muslo", "pollo_surt", "pollo_pechuga", "carne_res", "carne_molida", "cerdo", "salchicha", "atun", "sardina", "tilapia", "huevo"];
  const ALMIDON = ["arroz", "espagueti", "arepa", "harina_maiz", "pan", "papa", "papa_criolla", "platano", "yuca", "lenteja", "frijol", "garbanzo", "arveja_seca"];
  const VERDE = ["ahuyama", "zanahoria", "habichuela", "brocoli", "tomate", "aguacate", "lechuga", "espinaca", "repollo", "pepino", "arveja_cong", "pimenton", "banano", "mandarina", "manzana", "papaya", "queso", "queso_campesino"];
  const LEG_COLOR = { lenteja: "#7d4f2a", frijol: "#6b2e20", garbanzo: "#d0a35c", arveja_seca: "#9a9a4a" };

  // Qué pieza dibuja cada ingrediente, mirando también el nombre del plato.
  function pieza(ing, n, r) {
    switch (ing) {
      case "pollo_muslo": case "pollo_surt": return /desmech|sopa|sancocho|ajiaco|quesadilla|rellen/.test(n) ? P.desmechado(r) : P.muslo();
      case "pollo_pechuga": return /desmech|salsa blanca|sopa/.test(n) ? P.desmechado(r) : P.pechuga();
      case "carne_res": return /desmech|sobrebarriga/.test(n) ? P.desmechado(r, "#8e4a2a") : /costilla/.test(n) ? P.costillas() : P.res();
      case "carne_molida": return /albóndiga/.test(n) ? P.albondigas() : /hamburguesa/.test(n) ? P.hamburguesa() : /lasaña/.test(n) ? P.lasana() : P.molida(r);
      case "cerdo": return /costilla/.test(n) ? P.costillas() : P.cerdo();
      case "salchicha": return /perro/.test(n) ? P.perro() : /arroz|arepa/.test(n) ? P.salchichaRodajas() : P.salchicha();
      case "atun": return P.atun(r);
      case "sardina": return P.sardina();
      case "tilapia": return P.pescado();
      case "huevo": return /perico|revuelt|calentado|omelette|ranchero/.test(n) ? P.perico(r) : /tortilla|torta/.test(n) ? P.tortilla() : /cocid/.test(n) ? P.huevoCocido() : /sánduche/.test(n) ? P.sanduche() : P.huevoFrito();
      case "arroz": return P.arroz(r);
      case "espagueti": return P.pasta(r, /boloñesa|salsa|sardina|atún/.test(n));
      case "arepa": case "harina_maiz": return P.arepa(r, /queso|quesadilla/.test(n));
      case "pan": return P.pan();
      case "papa": return P.papa(r);
      case "papa_criolla": return P.criolla();
      case "platano": return /patac/.test(n) ? P.patacon() : P.maduro();
      case "yuca": return P.yuca();
      case "lenteja": case "frijol": case "garbanzo": case "arveja_seca": return P.legumbre(r, LEG_COLOR[ing]);
      case "ahuyama": return P.ahuyama();
      case "zanahoria": return P.zanahoria();
      case "habichuela": return P.habichuela();
      case "brocoli": return P.brocoli();
      case "tomate": return P.tomate();
      case "aguacate": return P.aguacate();
      case "lechuga": return P.hojas(r);
      case "espinaca": return P.hojas(r, ["#3f6b2c", "#4f7d34", "#5f8a3a"]);
      case "repollo": return P.repollo(r);
      case "pepino": return P.pepino();
      case "arveja_cong": return P.arveja(r);
      case "pimenton": return P.pimenton();
      case "banano": return P.banano();
      case "mandarina": return P.mandarina();
      case "manzana": return P.manzana();
      case "papaya": return P.papaya();
      case "queso": case "queso_campesino": return P.queso();
    }
    return "";
  }

  const TAZON = /sopa|crema|caldo|sancocho|ajiaco|sudado|changua|avena|yogur|chocolate|guisad|fríjoles con|frijoles con|lentejas con/i;
  const VASO = /batido/i;

  // Huecos del plato, de atrás hacia adelante; el último es el del frente.
  const HUECOS = {
    1: [[60, 56, 1.8]],
    2: [[41, 53, 1.45], [79, 58, 1.5]],
    3: [[36, 49, 1.25], [85, 50, 1.2], [60, 65, 1.4]],
    4: [[33, 52, 1.12], [60, 43, 1.02], [88, 52, 1.08], [58, 67, 1.28]],
  };

  function plato(R, acomp) {
    const n = R.n.toLowerCase(), r = semilla(R.id || R.n), ing = R.ing || {};
    const top = (lista, k) => lista.filter(i => ing[i]).sort((a, b) => ing[b] - ing[a]).slice(0, k);
    const verdesAcomp = acomp ? Object.keys(acomp.ing).filter(i => VERDE.includes(i)).sort((a, b) => acomp.ing[b] - acomp.ing[a]) : [];

    if (VASO.test(n)) return vaso(n);
    if (TAZON.test(n)) return tazon(R, n, r, ing, top);

    // Plato plano: proteína al frente, almidón atrás, verduras a los lados.
    let prot = top(PROT, 1)[0];
    let almidon = top(ALMIDON, 2);
    const especial = /hamburguesa|perro|sánduche|lasaña/.test(n);
    const mixto = /^arroz (con|chino|salteado)|arroz con/.test(n) && almidon.includes("arroz");
    const piezas = [];
    if (mixto) {
      almidon = almidon.filter(i => i !== "arroz");
      const colores = [prot && /pollo/.test(prot) ? "#d79a5a" : prot === "carne_molida" || prot === "cerdo" ? "#8e5634" : prot === "salchicha" ? "#b8472e" : prot === "atun" ? "#e5b4a0" : "#e98a35", "#e98a35", "#7ea24a"];
      piezas.push(P.arrozMixto(r, colores));
      if (prot !== "huevo") prot = null;
    }
    almidon.slice(0, especial ? 0 : mixto ? 1 : 2).forEach(i => piezas.push(pieza(i, n, r)));
    const verdes = [...new Set([...top(VERDE, 2), ...verdesAcomp])].slice(0, Math.max(1, 3 - piezas.length));
    verdes.forEach(i => piezas.push(pieza(i, n, r)));
    if (prot) piezas.push(pieza(prot, n, r));
    const usados = piezas.filter(Boolean).slice(-4);
    const huecos = HUECOS[usados.length] || HUECOS[1];
    const cuerpo = usados.map((p, i) => at(huecos[i][0], huecos[i][1], huecos[i][2], p)).join("");
    const extra = ing.limon ? at(96, 64, 0.9, P.limon()) : ing.cilantro ? at(56, 40, 1.2, P.cilantro()) : "";
    return svg(`<ellipse cx="60" cy="84" rx="52" ry="9" fill="#2a2a1e" opacity=".14"/>
      <ellipse cx="60" cy="58" rx="56" ry="30" fill="#f4efe3" ${T}/>
      <ellipse cx="60" cy="56" rx="47" ry="23.5" fill="#fbf8f1" stroke="#9fb8a8" stroke-width="1.6"/>
      ${brillo("M18 52q4-16 30-20", 0.7)}${cuerpo}${extra}`);
  }

  function tazon(R, n, r, ing, top) {
    let liquido = "#e3c06a", flotan = [];
    const leg = Object.keys(LEG_COLOR).find(i => ing[i]);
    if (/avena|yogur/.test(n)) liquido = "#efe3c8";
    else if (/chocolate/.test(n)) liquido = "#6b3a22";
    else if (/changua/.test(n)) liquido = "#f4efe2";
    else if (/crema de zanahoria|crema de ahuyama/.test(n)) liquido = "#e8892f";
    else if (/crema de arveja/.test(n)) liquido = "#9bb55a";
    else if (/sudado|salsa/.test(n)) liquido = "#c4552e";
    else if (/ajiaco/.test(n)) liquido = "#e8cf72";
    else if (leg) liquido = LEG_COLOR[leg];
    // Lo que se asoma encima: proteína, una verdura y algo de almidón.
    const prot = top(PROT, 1)[0];
    if (prot) flotan.push(pieza(prot, n, r));
    const v = top(["banano", "papa", "papa_criolla", "zanahoria", "ahuyama", "platano", "arveja_cong", "aguacate", "pan", "queso", "queso_campesino", "yuca"], 2);
    v.forEach(i => flotan.push(pieza(i, n, r)));
    flotan = flotan.filter(Boolean).slice(0, 3);
    const pos = [[42, 47, 0.85], [79, 49, 0.85], [60, 54, 0.9]];
    const crema = /crema/.test(n) ? `<path d="M48 50q8-6 16 0t14 0" stroke="#fffaf0" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/>` : "";
    const avena = /avena/.test(n) ? Array.from({ length: 10 }, () => `<ellipse cx="${(32 + r() * 56).toFixed(1)}" cy="${(46 + r() * 10).toFixed(1)}" rx="2" ry="1.2" fill="#d9c49a"/>`).join("") : "";
    const leg2 = leg && !/sopa|crema/.test(n) ? Array.from({ length: 16 }, () => `<ellipse cx="${(30 + r() * 60).toFixed(1)}" cy="${(45 + r() * 12).toFixed(1)}" rx="2.2" ry="1.6" fill="#fff" fill-opacity=".16"/>`).join("") : "";
    return svg(`<ellipse cx="60" cy="88" rx="44" ry="8" fill="#2a2a1e" opacity=".14"/>
      <path d="M8 50Q11 90 60 90 109 90 112 50Z" fill="#f2ede1" ${T}/>
      <path d="M14 66Q60 86 106 66" stroke="#9fb8a8" stroke-width="2.4" fill="none"/>
      <path d="M22 76q6 4 12 3M86 79q6-1 12-3" stroke="#9fb8a8" stroke-width="1.4" fill="none"/>
      <ellipse cx="60" cy="50" rx="52" ry="15" fill="#fbf8f1" ${T}/>
      <ellipse cx="60" cy="51" rx="45" ry="11.5" fill="${liquido}"/>
      ${brillo("M22 50q10-8 30-9", 0.35)}${avena}${leg2}${crema}
      ${flotan.map((p, i) => at(pos[i][0], pos[i][1], pos[i][2], p)).join("")}
      ${/sopa|caldo|sancocho|ajiaco|sudado/.test(n) ? at(58, 44, 1, P.cilantro()) : ""}`);
  }

  function vaso() {
    return svg(`<ellipse cx="60" cy="90" rx="26" ry="6" fill="#2a2a1e" opacity=".14"/>
      <path d="M38 14h44l-5 74H43Z" fill="#e9e6dc" fill-opacity=".6" ${T}/>
      <path d="M40 34h40l-4 52H44Z" fill="#efd9a6"/><path d="M40 34q20 5 40 0" stroke="#f8ecc8" stroke-width="2" fill="none"/>
      ${brillo("M46 20l-2 62", 0.6)}<path d="M66 6l-6 40" stroke="#c9352b" stroke-width="3" stroke-linecap="round"/>
      ${at(86, 76, 0.9, P.banano())}`);
  }

  const svg = (cuerpo, vb = "0 0 120 100") => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${cuerpo}</svg>`;

  /* ---------------- proteínas para las tarjetas ---------------- */
  const tabla = `<ellipse cx="70" cy="74" rx="56" ry="11" fill="#2a2a1e" opacity=".12"/><path d="M18 64q52-12 104 0v6q-52 12-104 0Z" fill="#b98250" ${T}/><path d="M18 64q52-12 104 0" stroke="#d6a674" stroke-width="2" fill="none"/>`;
  const ramita = (x, y, a = 0) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0q8-6 16-4" stroke="#4f7d34" stroke-width="1.4" fill="none"/>${[[4, -2, -30], [9, -4, 10], [13, -4, -40]].map(([px, py, r]) => `<path transform="translate(${px} ${py}) rotate(${r})" d="M0 0q3-5 7-1-3 5-7 1Z" fill="#6f9f45"/>`).join("")}</g>`;
  const PROTE = {
    pollo: () => tabla + `<path d="M40 60Q34 34 64 30 96 28 102 52 100 66 70 66 46 68 40 60Z" fill="#f0d3a8" ${T}/>` +
      `<path d="M50 52Q52 40 66 38" stroke="#fbe9cc" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<path d="M98 50q12-4 16 4-6 6-14 2Z" fill="#ead0a4" ${T}/><path d="M42 58q-12 0-12 6 8 4 14-1Z" fill="#ead0a4" ${T}/>` +
      `<circle cx="116" cy="54" r="2.6" fill="#f6efe2" ${T}/><circle cx="29" cy="64" r="2.6" fill="#f6efe2" ${T}/>` + ramita(26, 50, -20) + ramita(100, 66, 10),
    res: () => tabla + `<path d="M34 60Q30 36 60 34 96 30 106 50 108 64 78 66 46 70 34 60Z" fill="#b8423a" ${T}/>` +
      `<path d="M44 50q14-6 26 2t24-4M50 60q10-4 22 0" stroke="#f2d6cf" stroke-width="1.6" fill="none" opacity=".8"/><path d="M100 46q8 8 2 16" stroke="#f4e3cc" stroke-width="4" fill="none" stroke-linecap="round"/>` + ramita(28, 46, -30) + ramita(104, 64, 0),
    cerdo: () => tabla + [[54, 52, -8], [86, 50, 10]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-22 6Q-24-12 0-14 24-14 24 2 22 14 0 14-20 16-22 6Z" fill="#f0e2d4" ${T}/><path d="M-18 5Q-19-8 0-10 19-10 19 2 18 10 0 10-16 12-18 5Z" fill="#e8a596"/><path d="M-10-2q8-4 18 0" stroke="#f6d2c8" stroke-width="2" fill="none"/></g>`).join("") + ramita(24, 54, -20),
    embutidos: () => tabla + [[48, 50, -10], [80, 44, -4]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-26" y="-7" width="52" height="14" rx="7" fill="#b8502e" ${T}/>${brillo("M-18-3h30", 0.4)}</g>`).join("") +
      [[92, 62], [104, 58], [100, 66]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.6" fill="#b8502e" ${T}/><ellipse cx="${x}" cy="${y}" rx="4.2" ry="3" fill="#e3876a"/>`).join("") + ramita(26, 60, -10),
    pescado: () => `<ellipse cx="70" cy="74" rx="56" ry="9" fill="#2a2a1e" opacity=".12"/>` +
      `<path d="M14 46Q36 22 74 32 92 38 94 46 92 54 74 60 36 70 14 46Z" fill="#9fb0b8" ${T}/><path d="M18 48Q40 56 72 54" stroke="#e9eef0" stroke-width="3" fill="none"/>` +
      `<path d="M94 46l16-14v28Z" fill="#8193a0" ${T}/><path d="M50 30q6-10 16-6l-4 8Z" fill="#8193a0" ${T}/><circle cx="26" cy="43" r="2.6" fill="#2e2a20"/>` +
      `<g transform="translate(104 58)"><ellipse cx="0" cy="12" rx="16" ry="5" fill="#a9aeaa" ${T}/><rect x="-16" y="0" width="32" height="12" fill="#c9cdc8" ${T}/><rect x="-16" y="2" width="32" height="8" fill="#b8472e"/><ellipse cx="0" cy="0" rx="16" ry="5" fill="#dfe2dc" ${T}/></g>`,
    huevo: () => `<ellipse cx="70" cy="74" rx="50" ry="9" fill="#2a2a1e" opacity=".12"/>` +
      `<ellipse cx="48" cy="44" rx="22" ry="28" fill="#c98a55" ${T}/>${brillo("M36 30q4-10 12-12", 0.5)}` +
      `<path d="M74 52q0 20 22 20t22-20q-6 3-11-1-5 4-11 0-6 4-11 0-6 4-11 1Z" fill="#f6efe2" ${T}/><ellipse cx="96" cy="52" rx="20" ry="6" fill="#fbf6ec" ${T}/><circle cx="96" cy="52" r="7" fill="#f2b432"/>`,
    granos: () => `<ellipse cx="70" cy="76" rx="58" ry="9" fill="#2a2a1e" opacity=".12"/>` +
      [[36, 56, "#7a2f22"], [104, 56, "#d0a35c"], [70, 48, "#8a5a32"]].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><path d="M-24 0Q-22 22 0 22 22 22 24 0Z" fill="#b9a27a" ${T}/><ellipse cx="0" cy="0" rx="24" ry="7" fill="${c}" ${T}/>` +
        [[-12, -1], [-5, -3], [3, -2], [10, 0], [-8, 2], [6, 3], [0, 1]].map(([px, py]) => `<ellipse cx="${px}" cy="${py}" rx="2.4" ry="1.7" fill="#fff" fill-opacity=".2"/>`).join("") + `</g>`).join(""),
  };
  const proteina = k => PROTE[k] ? svg(PROTE[k](), "0 0 140 86") : "";

  /* ---------------- fachadas de tienda ---------------- */
  const TIENDA_ESTILO = {
    exito: { banda: "#f2c230", texto: "#2f2c24", pared: "#efe6cf", toldo: "#e2b22a", nombre: "Éxito" },
    carulla: { banda: "#2f6b3a", texto: "#f5f2e8", pared: "#b9785a", toldo: "#2f6b3a", nombre: "Carulla" },
    d1: { banda: "#c8352b", texto: "#fffdf6", pared: "#f1eee6", toldo: "#c8352b", nombre: "D1" },
  };
  const arbol = (x, y, s) => at(x, y, s, `<path d="M0 0v-26" stroke="#6b4a2e" stroke-width="4"/><g ${T}><circle cx="-10" cy="-30" r="14" fill="#6f9a45"/><circle cx="10" cy="-32" r="15" fill="#5f8a3a"/><circle cx="0" cy="-46" r="15" fill="#7ea24a"/></g>${brillo("M-6-52q6-6 12-4", 0.3)}`);
  const carrito = (x, y) => at(x, y, 1, `<path d="M0 0h4l3 10h14l3-8H6" stroke="#8a8d86" stroke-width="1.6" fill="none"/><circle cx="9" cy="13" r="1.6" fill="#6b6e68"/><circle cx="19" cy="13" r="1.6" fill="#6b6e68"/>`);
  function tienda(t) {
    const e = TIENDA_ESTILO[t]; if (!e) return "";
    const ventanas = Array.from({ length: 5 }, (_, i) => `<rect x="${74 + i * 34}" y="96" width="28" height="30" fill="#f6dd96" ${T}/><path d="M${88 + i * 34} 96v30" stroke="#d9b65a"/>`).join("");
    return svg(`<rect x="0" y="128" width="300" height="22" fill="#d9d2bd"/><path d="M0 132h300" stroke="#c9c1aa" stroke-width="2"/>
      <rect x="58" y="44" width="200" height="86" fill="${e.pared}" ${T}/>
      <rect x="58" y="44" width="200" height="8" fill="#000" opacity=".06"/>
      <rect x="92" y="54" width="132" height="26" rx="3" fill="${e.banda}" ${T}/>
      <text x="158" y="73" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="700" font-size="17" fill="${e.texto}">${e.nombre}</text>
      <path d="M62 84h192l-6 10H68Z" fill="${e.toldo}" ${T}/><path d="M62 84h192" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
      ${ventanas}
      ${arbol(36, 132, 1)}${arbol(276, 132, 0.9)}
      <g ${T}><circle cx="84" cy="130" r="6" fill="#6f9a45"/><circle cx="232" cy="130" r="6" fill="#6f9a45"/><circle cx="160" cy="131" r="5" fill="#7ea24a"/></g>
      ${carrito(104, 118)}${carrito(126, 118)}`, "0 34 300 116");
  }

  /* ---------------- ramitas para las tarjetas de día ---------------- */
  const RAMAS = [
    `<path d="M20 38V8" stroke="#4f7d34" stroke-width="1.6"/>${[[20, 30, -1], [20, 24, 1], [20, 18, -1], [20, 12, 1]].map(([x, y, l]) => `<path transform="translate(${x} ${y}) rotate(${l * 35})" d="M0 0q${l * 4} -7 ${l * 10} -6 ${-l * 2} 6 ${-l * 10} 6Z" fill="#6f9f45" ${T}/>`).join("")}`,
    `<path d="M20 38V16" stroke="#4f7d34" stroke-width="1.6"/><path d="M20 30q-8-2-10-8 8 0 10 8ZM20 26q8-2 10-8-8 0-10 8Z" fill="#6f9f45" ${T}/>${Array.from({ length: 8 }, (_, i) => `<ellipse transform="translate(20 12) rotate(${i * 45})" cx="0" cy="-5.5" rx="2.2" ry="5" fill="#fffaf0" ${T}/>`).join("")}<circle cx="20" cy="12" r="3.2" fill="#e8b23a" ${T}/>`,
    `<path d="M14 38Q18 20 30 8" stroke="#4f7d34" stroke-width="1.6" fill="none"/>${[[17, 28, -60], [21, 22, 20], [24, 16, -50], [28, 11, 30], [12, 32, 40]].map(([x, y, a]) => `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0q4-6 9-4-2 6-9 4Z" fill="#5f8a3a" ${T}/>`).join("")}`,
  ];
  const rama = i => svg(RAMAS[i % RAMAS.length], "0 0 40 40");

  /* ---------------- decoración de página ---------------- */
  const hojaGrande = (x, y, a, s, c) => at(x, y, s, `<path d="M0 0Q-18-20-6-44 4-58 14-44 26-20 0 0Z" fill="${c}" ${T}/><path d="M0 0Q2-24 4-46" stroke="#fff" stroke-opacity=".25" stroke-width="1.6" fill="none"/>`, a);
  const hojasEsquina = lado => svg(
    [[60, 210, -40, 1.6, "#4f7d34"], [100, 220, -10, 1.3, "#6f9f45"], [30, 180, -70, 1.2, "#5f8a3a"], [130, 230, 20, 1.1, "#3f6b2c"], [80, 160, -25, 0.9, "#7ea24a"]]
      .map(([x, y, a, s, c]) => hojaGrande(lado === "der" ? 200 - x : x, y, lado === "der" ? -a : a, s, c)).join(""), "0 0 200 240");

  const repisa = () => svg(`<rect x="10" y="96" width="250" height="9" rx="2" fill="#a0723f" ${T}/><path d="M30 105l8 12M230 105l-8 12" stroke="#8a6440" stroke-width="5"/>
    ${[[40, "#8a4a2a"], [66, "#e3c06a"], [90, "#c4552e"]].map(([x, c], i) => `<g transform="translate(${x} 96)"><rect x="-10" y="-${30 - i * 4}" width="20" height="${30 - i * 4}" rx="4" fill="#e8ece6" fill-opacity=".8" ${T}/><rect x="-8" y="-${22 - i * 4}" width="16" height="${20 - i * 4}" rx="3" fill="${c}"/><rect x="-11" y="-${34 - i * 4}" width="22" height="6" rx="2" fill="#b98250" ${T}/></g>`).join("")}
    <rect x="120" y="44" width="46" height="52" fill="#c9a06a" ${T}/><rect x="126" y="50" width="34" height="40" fill="#f4efe0"/>${at(143, 84, 1.4, `<path d="M0 0V-22" stroke="#4f7d34" stroke-width="1"/>${[[-1, -6], [1, -10], [-1, -14], [1, -18]].map(([l, y]) => `<path transform="translate(0 ${y}) rotate(${l * 40})" d="M0 0q${l * 3} -4 ${l * 7} -3 ${-l} 4 ${-l * 7} 3Z" fill="#6f9f45"/>`).join("")}`)}
    <g transform="translate(206 96)"><path d="M-18 0Q-20-26 0-28 20-26 18 0Z" fill="#f4efe3" ${T}/><path d="M18-18q10 2 8 10" stroke="#2e2a20" stroke-opacity=".45" stroke-width="2.4" fill="none"/><path d="M-18-14l-10-6" stroke="#2e2a20" stroke-opacity=".45" stroke-width="3"/><circle cx="0" cy="-30" r="3" fill="#b98250"/><path d="M-6-14q6-6 12 0-6 6-12 0Z" fill="#5f8fb0"/></g>
    <g transform="translate(248 96)"><path d="M-12 0l2-18h20l2 18Z" fill="#c4552e" ${T}/>${hojaGrande(-4, -18, -30, 0.45, "#5f8a3a")}${hojaGrande(4, -18, 25, 0.5, "#6f9f45")}</g>
    ${[[24, 8], [48, 30], [70, 14]].map(([x, l]) => `<path d="M${x} 96q-6 ${l} 2 ${l * 2}" stroke="#4f7d34" stroke-width="1.2" fill="none"/>` + Array.from({ length: 3 }, (_, i) => `<path transform="translate(${x - 2 + (i % 2) * 4} ${100 + i * l * 0.6}) rotate(${i % 2 ? 30 : -30})" d="M0 0q4-6 8-2-3 5-8 2Z" fill="${i % 2 ? "#6f9f45" : "#5f8a3a"}" ${T}/>`).join("")).join("")}`, "0 0 270 150");

  const canasta = () => svg(`<ellipse cx="140" cy="128" rx="120" ry="12" fill="#2a2a1e" opacity=".12"/>
    <g transform="translate(40 30)"><path d="M0 70q-6-40 10-56h20q16 16 10 56Z" fill="#f4efe3" ${T}/><path d="M30 26q14 0 12 16" stroke="#2e2a20" stroke-opacity=".4" stroke-width="3" fill="none"/>
    ${[[6, -20], [18, -30], [28, -18], [12, -8]].map(([x, y]) => `<path d="M20 14L${x} ${y}" stroke="#4f7d34" stroke-width="1.2"/>` + Array.from({ length: 8 }, (_, i) => `<ellipse transform="translate(${x} ${y}) rotate(${i * 45})" cx="0" cy="-4" rx="1.8" ry="4" fill="#fffaf0" ${T}/>`).join("") + `<circle cx="${x}" cy="${y}" r="2.6" fill="#e8b23a"/>`).join("")}</g>
    <g transform="translate(170 60)"><g ${T}>${[[-50, -10, 14, "#5f8a3a"], [-30, -22, 16, "#6f9f45"], [-6, -26, 15, "#4f7d34"], [18, -18, 14, "#7ea24a"], [40, -8, 12, "#5f8a3a"]].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join("")}
    <circle cx="-34" cy="-2" r="10" fill="#d5432c"/><circle cx="-14" cy="-6" r="9" fill="#e8b23a"/><circle cx="6" cy="-2" r="10" fill="#c9352b"/><path d="M14-14l26-16 4 4-24 18Z" fill="#ec8a2c"/><path d="M26-10l22-8 2 4-22 10Z" fill="#ec8a2c"/></g>
    <path d="M-64 0h128l-12 44h-104Z" fill="#c9965c" ${T}/>${Array.from({ length: 5 }, (_, i) => `<path d="M-60 ${8 + i * 8}h120" stroke="#9c6e3e" stroke-width="2" opacity=".6"/>`).join("")}<path d="M-64 0h128" stroke="#9c6e3e" stroke-width="5"/></g>`, "0 0 280 140");

  g.Ilus = { plato, proteina, tienda, rama, hojasEsquina, repisa, canasta, TIENDA_ESTILO };
})(typeof globalThis !== "undefined" ? globalThis : this);
