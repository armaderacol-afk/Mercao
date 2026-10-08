// Prueba los catálogos públicos de cada tienda y muestra qué responde.
// Uso: node scripts/explorar-tiendas.mjs
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const VTEX = h => [
  `https://${h}/api/catalog_system/pub/products/search?ft=arroz&_from=0&_to=1`,
  `https://${h}/api/io/_v/api/intelligent-search/product_search/?query=arroz&count=2`,
];
const CANDIDATOS = {
  exito: [...VTEX("www.exito.com")],
  carulla: [...VTEX("www.carulla.com")],
  d1: [...VTEX("domicilios.tiendasd1.com"), "https://domicilios.tiendasd1.com/", "https://domicilios.tiendasd1.com/search?name=arroz"],
  ara: ["https://aratiendas.com/", "https://www.aratiendas.com/", "https://tiendasara.com/", "https://www.tiendasara.com/",
        "https://ara.com.co/", "https://www.ara.com.co/", ...VTEX("www.aratiendas.com")],
};
async function probar(url) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/json, text/html;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    const t = await r.text();
    const tipo = r.headers.get("content-type") || "";
    console.log(`\n### ${url}\n${r.status} ${tipo} ${t.length}b final=${r.url}`);
    if (tipo.includes("json")) { console.log(t.slice(0, 1500)); return; }
    const title = (t.match(/<title[^>]*>([^<]*)/i) || [])[1];
    console.log("title:", title);
    const pistas = ["vtex", "instaleap", "shopify", "magento", "graphql", "__NEXT_DATA__", "algolia", "apiKey", "salesforce", "commercetools", "prestashop", "woocommerce"]
      .filter(k => t.toLowerCase().includes(k.toLowerCase()));
    console.log("pistas:", pistas.join(", "));
    const urls = [...new Set((t.match(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}[^"'\s<>)]*/gi) || []).filter(u => /api|graphql|search|catalog|product/i.test(u)))].slice(0, 25);
    console.log("urls api:", urls.join("\n  "));
    const hosts = [...new Set((t.match(/src="https?:\/\/([^/"]+)/gi) || []).map(s => s.slice(5)))].slice(0, 20);
    console.log("hosts script:", hosts.join(" "));
  } catch (e) { console.log(`\n### ${url}\nERROR ${e.message}`); }
}
for (const [tienda, urls] of Object.entries(CANDIDATOS)) {
  console.log(`\n================ ${tienda} ================`);
  for (const u of urls) await probar(u);
}
