/* ==========================================================
   MERCAO — motor de planeación
   Corre igual en el navegador (globales) y en Node (module.exports).
   ========================================================== */

/* Electrodomésticos que el usuario puede marcar en la cocina.
   En una receta, `ap` es la lista de requisitos: cada requisito es un
   aparato ("estufa") o un grupo de alternativas (["horno","airfryer"]),
   y basta con tener UNA de las alternativas del grupo. */
const APARATOS = {
  estufa:      {n:"Estufa",         g:"f", d:"Fogones para ollas y sartenes"},
  horno:       {n:"Horno",          g:"m", d:"Asados y gratinados"},
  microondas:  {n:"Microondas",     g:"m", d:"Calentar y cocinar rápido"},
  airfryer:    {n:"Airfryer",       g:"f", d:"Freír con poco aceite"},
  olla_presion:{n:"Olla a presión", g:"f", d:"Granos en la mitad del tiempo"},
  arrocera:    {n:"Arrocera",       g:"f", d:"Arroz y platos de una olla"},
  licuadora:   {n:"Licuadora",      g:"f", d:"Cremas, jugos y salsas"},
  nevera:      {n:"Nevera",         g:"f", d:"Guardar tandas y congelar"},
};
const ING = {
  arroz:{n:"Arroz",u:"g",prot:7.0,cat:"Granos"},
  lenteja:{n:"Lenteja",u:"g",prot:24.0,cat:"Granos"},
  frijol:{n:"Fríjol",u:"g",prot:21.0,cat:"Granos"},
  garbanzo:{n:"Garbanzo",u:"g",prot:19.0,cat:"Granos"},
  arveja_seca:{n:"Arveja seca",u:"g",prot:22.0,cat:"Granos"},
  espagueti:{n:"Espagueti",u:"g",prot:12.0,cat:"Granos"},
  harina_maiz:{n:"Harina de maíz",u:"g",prot:7.0,desp:true,cat:"Granos"},
  arepa:{n:"Arepa lista",u:"und",prot:2.0,cat:"Granos"},
  huevo:{n:"Huevo",u:"und",prot:6.3,cat:"Proteína"},
  pollo_surt:{n:"Pollo en presas",u:"g",prot:20.0,cat:"Proteína"},
  pollo_muslo:{n:"Muslos de pollo",u:"g",prot:18.0,cat:"Proteína"},
  atun:{n:"Atún",u:"g",prot:24.0,cat:"Proteína"},
  salchicha:{n:"Salchicha",u:"g",prot:12.0,cat:"Proteína"},
  carne_res:{n:"Carne de res",u:"g",prot:17.0,cat:"Proteína"},
  papa:{n:"Papa",u:"g",prot:2.0,cat:"Verduras"},
  papa_criolla:{n:"Papa criolla",u:"g",prot:2.0,cat:"Verduras"},
  platano:{n:"Plátano",u:"g",prot:1.3,cat:"Verduras"},
  cebolla:{n:"Cebolla cabezona",u:"g",prot:1.0,cat:"Verduras"},
  cebolla_larga:{n:"Cebolla larga",u:"g",prot:1.0,cat:"Verduras"},
  tomate:{n:"Tomate chonto",u:"g",prot:0.9,cat:"Verduras"},
  zanahoria:{n:"Zanahoria",u:"g",prot:0.9,cat:"Verduras"},
  arveja_cong:{n:"Arveja congelada",u:"g",prot:5.0,cat:"Verduras"},
  ajo:{n:"Ajo",u:"und",prot:0.0,desp:true,cat:"Verduras"},
  banano:{n:"Banano",u:"und",prot:1.3,cat:"Verduras"},
  leche:{n:"Leche entera",u:"ml",prot:3.1,cat:"Lácteos"},
  queso:{n:"Queso mozzarella",u:"g",prot:22.0,cat:"Lácteos"},
  avena_beb:{n:"Avena en bebida",u:"ml",prot:1.5,cat:"Lácteos"},
  aceite:{n:"Aceite vegetal",u:"ml",prot:0.0,desp:true,cat:"Despensa"},
  sal:{n:"Sal",u:"g",prot:0.0,desp:true,cat:"Despensa"},
  panela:{n:"Panela",u:"g",prot:0.0,desp:true,cat:"Despensa"},
  azucar:{n:"Azúcar",u:"g",prot:0.0,desp:true,cat:"Despensa"},
  pasta_tomate:{n:"Pasta de tomate",u:"g",prot:4.0,desp:true,cat:"Despensa"},
  chocolate:{n:"Chocolate de mesa",u:"g",prot:5.0,desp:true,cat:"Despensa"},
  pollo_pechuga:{n:"Pechuga de pollo",u:"g",prot:23.0,cat:"Proteína"},
  carne_molida:{n:"Carne molida",u:"g",prot:20.0,cat:"Proteína"},
  cerdo:{n:"Carne de cerdo",u:"g",prot:21.0,cat:"Proteína"},
  tilapia:{n:"Filete de pescado",u:"g",prot:20.0,cat:"Proteína"},
  sardina:{n:"Sardinas",u:"g",prot:21.0,cat:"Proteína"},
  queso_campesino:{n:"Queso campesino",u:"g",prot:18.0,cat:"Lácteos"},
  yogur:{n:"Yogur",u:"ml",prot:3.5,cat:"Lácteos"},
  avena_hojuelas:{n:"Avena en hojuelas",u:"g",prot:13.0,cat:"Granos"},
  pan:{n:"Pan",u:"g",prot:9.0,cat:"Granos"},
  yuca:{n:"Yuca",u:"g",prot:1.4,cat:"Verduras"},
  ahuyama:{n:"Ahuyama",u:"g",prot:1.0,cat:"Verduras"},
  habichuela:{n:"Habichuela",u:"g",prot:1.8,cat:"Verduras"},
  pimenton:{n:"Pimentón",u:"g",prot:1.0,cat:"Verduras"},
  cilantro:{n:"Cilantro",u:"g",prot:2.0,cat:"Verduras"},
  limon:{n:"Limón",u:"und",prot:0.3,cat:"Verduras"},
  aguacate:{n:"Aguacate",u:"g",prot:2.0,cat:"Verduras"},
  repollo:{n:"Repollo",u:"g",prot:1.3,cat:"Verduras"},
  lechuga:{n:"Lechuga",u:"g",prot:1.4,cat:"Verduras"},
  pepino:{n:"Pepino cohombro",u:"g",prot:0.7,cat:"Verduras"},
  brocoli:{n:"Brócoli",u:"g",prot:2.8,cat:"Verduras"},
  espinaca:{n:"Espinaca",u:"g",prot:2.9,cat:"Verduras"},
  mandarina:{n:"Mandarina",u:"und",prot:0.8,cat:"Frutas"},
  manzana:{n:"Manzana",u:"und",prot:0.4,cat:"Frutas"},
  papaya:{n:"Papaya",u:"g",prot:0.5,cat:"Frutas"},
};

/* Composición aproximada por 100 g (o 100 ml; por unidad si u es "und"):
   [kcal, carbohidratos g, grasa g, fibra g]. Valores de referencia de
   tablas de composición (USDA FoodData Central y la Tabla de Composición
   de Alimentos Colombianos del ICBF), redondeados. Granos y pasta en seco. */
const NUTRI={
  arroz:[360,79,0.6,1.3], lenteja:[352,63,1.1,10.7], frijol:[333,60,1.2,15.2], garbanzo:[364,61,6,17],
  arveja_seca:[341,60,1.2,25], espagueti:[371,75,1.5,3.2], harina_maiz:[360,77,1.5,5], arepa:[150,31,1.5,2.5],
  huevo:[72,0.4,4.8,0], pollo_surt:[215,0,15,0], pollo_muslo:[210,0,15,0], pollo_pechuga:[120,0,2.6,0],
  atun:[116,0,1,0], sardina:[186,1,10.5,0], salchicha:[280,3,25,0], carne_res:[170,0,9,0],
  carne_molida:[215,0,15,0], cerdo:[200,0,12,0], tilapia:[96,0,1.7,0],
  papa:[77,17,0.1,2.2], papa_criolla:[95,21,0.1,2], platano:[122,32,0.4,2.3], yuca:[160,38,0.3,1.8],
  cebolla:[40,9,0.1,1.7], cebolla_larga:[32,7,0.2,2.6], tomate:[18,3.9,0.2,1.2], zanahoria:[41,10,0.2,2.8],
  arveja_cong:[81,14,0.4,5.1], ajo:[60,13,0.2,0.8], banano:[107,27,0.4,3.1], ahuyama:[26,6.5,0.1,1.5],
  habichuela:[31,7,0.2,2.7], pimenton:[26,6,0.3,2.1], cilantro:[23,3.7,0.5,2.8], limon:[10,3,0,0.2],
  aguacate:[160,8.5,14.7,6.7], repollo:[25,5.8,0.1,2.5], lechuga:[15,2.9,0.2,1.3], pepino:[15,3.6,0.1,0.5],
  brocoli:[34,6.6,0.4,2.6], espinaca:[23,3.6,0.4,2.2], mandarina:[53,13,0.3,1.8], manzana:[78,21,0.3,3.6],
  papaya:[43,11,0.3,1.7],
  leche:[61,4.8,3.3,0], queso:[300,2.2,22,0], queso_campesino:[260,3,20,0], avena_beb:[70,11,1.5,0.5],
  yogur:[70,9,2.5,0], avena_hojuelas:[380,66,7,10], pan:[265,49,3.5,2.7],
  aceite:[828,0,92,0], sal:[0,0,0,0], panela:[380,95,0,0], azucar:[387,100,0,0], pasta_tomate:[82,19,0.5,4.1],
  chocolate:[450,65,20,6],
};
/* Gramos de fruta o verdura que aporta cada unidad de medida. Papa, yuca y
   plátano no cuentan: son almidones, van con los carbohidratos. */
const VERDURA={cebolla:1,cebolla_larga:1,tomate:1,zanahoria:1,arveja_cong:1,ahuyama:1,habichuela:1,
  pimenton:1,cilantro:1,aguacate:1,repollo:1,lechuga:1,pepino:1,brocoli:1,espinaca:1,papaya:1,
  banano:120,mandarina:100,manzana:150};
/* Metas diarias por persona: 400 g de frutas y verduras (OMS) y 25 g de
   fibra (OMS/EFSA). Rangos de calorías: proteína 10–35 %, carbohidratos
   45–65 %, grasa 20–35 % (rangos AMDR de referencia). */
const META_VERDURA=400, META_FIBRA=25;
const RANGOS_MACRO={prot:[10,35],carb:[45,65],gra:[20,35]};

/* Precios y recetas viven en data/. En el navegador los carga index.html;
   en Node se cargan aquí. */
if(typeof require==="function"&&typeof module!=="undefined"){
  require("../data/recetas.js");
  for(const t of ["exito","carulla","d1"])
    try{require(`../data/precios-${t}.js`);}catch(e){/* tienda sin archivo */}
}
const RECETAS=globalThis.RECETAS_DATA||[];
const ACOMPANANTES=globalThis.ACOMPANANTES_DATA||[];
const PRECIOS=globalThis.PRECIOS_DATA||{};

/* Tiendas. Una tienda sin presentaciones descargadas aparece en la
   interfaz pero no se puede elegir. */
const TIENDAS={
  exito:  {n:"Éxito"},
  carulla:{n:"Carulla"},
  d1:     {n:"D1"},
};
const TIENDA_DEF="d1";
const indiceSkus={};
function skusPropios(tienda,ing){
  if(!indiceSkus[tienda]){
    const m={};
    for(const s of (PRECIOS[tienda]&&PRECIOS[tienda].skus)||[])(m[s.ing]=m[s.ing]||[]).push(s);
    indiceSkus[tienda]=m;
  }
  return indiceSkus[tienda][ing]||[];
}
/* Si la tienda no publica precio de un ingrediente (D1 no vende limón en
   línea, por ejemplo), se usa el de la tienda más barata que sí lo tenga,
   marcado con `ref` para avisarlo en la lista. Así ninguna receta queda
   por fuera solo porque falta un ingrediente menor en el catálogo web. */
const indiceRef={};
function tiendaRef(tienda,ing){
  const k=tienda+"|"+ing;
  if(!(k in indiceRef)){
    let mejor=null,pu=Infinity;
    if(tieneDatos(tienda))for(const t of Object.keys(TIENDAS)){
      if(t===tienda)continue;
      const op=skusPropios(t,ing); if(!op.length)continue;
      const m=Math.min(...op.map(s=>s.precio/s.size));
      if(m<pu){pu=m;mejor=t;}
    }
    indiceRef[k]=mejor;
  }
  return indiceRef[k];
}
function skusDe(tienda,ing){
  const propios=skusPropios(tienda,ing);
  if(propios.length)return propios;
  const t=tiendaRef(tienda,ing);
  if(!t)return [];
  const k="ref|"+tienda;
  indiceSkus[k]=indiceSkus[k]||{};
  return indiceSkus[k][ing]=indiceSkus[k][ing]||skusPropios(t,ing).map(s=>({...s,ref:t}));
}
function tieneDatos(t){return !!(PRECIOS[t]&&PRECIOS[t].skus&&PRECIOS[t].skus.length);}
function tiendasConDatos(){return Object.keys(TIENDAS).filter(tieneDatos);}
/* Una receta se puede comprar en una tienda si todos sus ingredientes
   tienen al menos una presentación con precio ahí. */
function conPrecio(r,tienda){return Object.keys(r.ing).every(i=>skusDe(tienda,i).length>0);}
/* Ingredientes de la receta que en esta tienda van con precio de otra. */
function ingredientesRef(r,tienda){return Object.keys(r.ing).filter(i=>!skusPropios(tienda,i).length&&tiendaRef(tienda,i));}


const CARNES=["pollo_surt","pollo_muslo","pollo_pechuga","atun","sardina","tilapia","salchicha","carne_res","carne_molida","cerdo"];

/* Proteínas que la casa come o no come. Una receta queda fuera si lleva
   algún ingrediente de un grupo que no se come. Los grupos marcados como
   `carne` son los que cuentan para «almuerzo siempre con carne». */
const PROTEINAS={
  pollo:    {n:"Pollo",               ing:["pollo_surt","pollo_muslo","pollo_pechuga"], carne:true},
  res:      {n:"Carne de res",        ing:["carne_res","carne_molida"], carne:true},
  cerdo:    {n:"Cerdo",               ing:["cerdo"],                   carne:true},
  embutidos:{n:"Salchicha",           ing:["salchicha"],               carne:true},
  pescado:  {n:"Pescado y atún",      ing:["atun","sardina","tilapia"], carne:true},
  huevo:    {n:"Huevo",               ing:["huevo"]},
  granos:   {n:"Granos",              ing:["lenteja","frijol","garbanzo","arveja_seca"]},
};
const TODAS_PROTEINAS=Object.keys(PROTEINAS);
function comeTodo(r,proteinas){
  const no=TODAS_PROTEINAS.filter(g=>!proteinas.includes(g)).flatMap(g=>PROTEINAS[g].ing);
  return !Object.keys(r.ing).some(i=>no.includes(i));
}
function llevaCarne(r,proteinas=TODAS_PROTEINAS){
  const si=TODAS_PROTEINAS.filter(g=>PROTEINAS[g].carne&&proteinas.includes(g)).flatMap(g=>PROTEINAS[g].ing);
  return Object.keys(r.ing).some(i=>si.includes(i));
}
/* ¿Esta receta puede ir en esta franja? El almuerzo con carne es una regla
   de franja: la misma receta sin carne sigue sirviendo para la cena. */
function sirveEnFranja(r,f,o){
  if(!r.tipo.includes(f))return false;
  if(f==="almuerzo"&&o.almuerzoConCarne&&!llevaCarne(r,o.proteinas||TODAS_PROTEINAS))return false;
  return true;
}
const LACTEOS=["leche","queso","avena_beb","queso_campesino","yogur"];
const GLUTEN=["espagueti","pan"];

/* Ingredientes que se escalan cuando la persona necesita más (o menos)
   proteína. El resto de la receta —arroz, papa, verduras, aliños— se queda
   igual: nadie duplica la cebolla porque va al gimnasio. */
const ESCALABLES=["huevo","pollo_surt","pollo_muslo","pollo_pechuga","atun","sardina","tilapia",
                  "salchicha","carne_res","carne_molida","cerdo",
                  "lenteja","frijol","garbanzo","arveja_seca","queso","queso_campesino"];
const F_MIN=0.7, F_MAX=2.5;

/* Factores de proteína por kg de peso corporal y día. */
const ACTIVIDAD={
  sedentario:{f:0.9, n:"Poco activo",   d:"trabajo de escritorio, poco ejercicio"},
  activo:    {f:1.4, n:"Activo",        d:"entrenas 3-5 veces por semana"},
  fuerte:    {f:1.8, n:"Entrenas duro", d:"fuerza o resistencia, casi a diario"},
};

/* Genera la variante de una receta ajustada al objetivo de proteína por
   porción. Devuelve null si ni estirando al máximo alcanza. */
function variante(r,objetivo){
  const escal={},fijo={};
  for(const[i,q]of Object.entries(r.ing))(ESCALABLES.includes(i)?escal:fijo)[i]=q;
  const protDe=(m)=>Object.entries(m).reduce((a,[i,q])=>{
    const t=ING[i]; return a+(t?(t.u==="und"?t.prot*q:t.prot*q/100):0);},0);
  const pFijo=protDe(fijo), pEscal=protDe(escal);
  if(pEscal<=0){ // receta sin proteína escalable (p. ej. avena con banano)
    return{...r,f:1,prot:pFijo,alcanza:pFijo>=objetivo-1e-6};
  }
  let f=(objetivo-pFijo)/pEscal;
  f=Math.max(F_MIN,Math.min(F_MAX,f));
  const ing={...fijo};
  for(const[i,q]of Object.entries(escal)){
    const v=q*f;
    // Se redondea hacia arriba: mejor pasarse por medio huevo que quedar
    // por debajo del mínimo que el usuario pidió.
    ing[i]=ING[i].u==="und"?Math.max(0.5,Math.ceil(v*2)/2):Math.ceil(v*10)/10;
  }
  const prot=protDe(ing);
  return{...r,ing,f:Math.round(f*100)/100,prot,alcanza:prot>=objetivo-1e-6};
}

/* Franjas del día. El desayuno puede ser liviano; almuerzo y cena NO. */
const FRANJAS={1:["almuerzo"],2:["almuerzo","comida"],3:["desayuno","almuerzo","comida"]};
const PRINCIPALES=["almuerzo","comida"];
const FRANJA_NOM={desayuno:"Desayuno",almuerzo:"Almuerzo",comida:"Cena"};

/* ¿La cocina tiene lo que pide la receta? Devuelve los aparatos que se
   usarían (el primero disponible de cada grupo) o null si falta alguno. */
function aparatosUsados(r,aparatos){
  const usa=[];
  for(const req of r.ap){
    const alts=Array.isArray(req)?req:[req];
    const a=alts.find(x=>aparatos.includes(x));
    if(!a)return null;
    usa.push(a);
  }
  return usa;
}
function recetaPosible(r,o){
  const{aparatos=["estufa"],restricciones=[],maxMinutos=90,proteinas=TODAS_PROTEINAS,
        tienda=TIENDA_DEF,ignorarPrecio=false}=o;
  return !!aparatosUsados(r,aparatos)&&cumpleRestricciones(r,restricciones)&&
    comeTodo(r,proteinas)&&r.min<=maxMinutos&&(ignorarPrecio||conPrecio(r,tienda));
}

function cumpleRestricciones(r,restr){
  const i=Object.keys(r.ing);
  if(restr.includes("vegetariano")&&i.some(x=>CARNES.includes(x)))return false;
  if(restr.includes("sin_lacteos")&&i.some(x=>LACTEOS.includes(x)))return false;
  if(restr.includes("sin_gluten")&&i.some(x=>GLUTEN.includes(x)))return false;
  if(restr.includes("sin_huevo")&&i.includes("huevo"))return false;
  return true;
}

/* Se compran EMPAQUES, no gramos. Busca la mejor COMBINACIÓN de presentaciones. */
const cacheCosto=new Map();
function costoIngrediente(ingId,cantidad,tienda=TIENDA_DEF){
  const op=skusDe(tienda,ingId);
  if(!op.length||cantidad<=0)return null;
  const clave=tienda+"|"+ingId+"|"+cantidad.toFixed(3);
  if(cacheCosto.has(clave))return cacheCosto.get(clave);
  const res=costoIngredienteSinCache(op,cantidad);
  cacheCosto.set(clave,res);
  return res;
}
function costoIngredienteSinCache(op,cantidad){
  const need=cantidad-1e-9;
  let mejor=null;
  const rec=(i,counts,cant,costo)=>{
    if(mejor&&costo>=mejor.costo)return;
    if(cant>=need){mejor={counts:counts.slice(),costo,cantidad:cant};return;}
    if(i>=op.length)return;
    const sku=op[i], max=Math.ceil((need-cant)/sku.size);
    for(let k=max;k>=0;k--){counts[i]=k;rec(i+1,counts,cant+k*sku.size,costo+k*sku.precio);}
    counts[i]=0;
  };
  rec(0,new Array(op.length).fill(0),0,0);
  if(!mejor)return null;
  const packs=op.map((sku,i)=>({sku,unidades:mejor.counts[i]})).filter(p=>p.unidades>0);
  const sobrante=mejor.cantidad-cantidad;
  return {packs,sku:packs[0].sku,unidades:packs.reduce((a,p)=>a+p.unidades,0),
          costo:mejor.costo,sobrante,
          sobranteValor:mejor.cantidad>0?(sobrante/mejor.cantidad)*mejor.costo:0,
          etiqueta:packs.map(p=>`${p.unidades} × ${p.sku.nom}`).join(" + ")};
}
function costoCanasta(c,tienda){let t=0;for(const[i,q]of Object.entries(c)){const x=costoIngrediente(i,q,tienda);if(x)t+=x.costo;}return t;}
function detalleCanasta(c,tienda){
  const f=[];
  for(const[i,q]of Object.entries(c)){
    const x=costoIngrediente(i,q,tienda); if(!x)continue;
    f.push({ing:i,nombre:ING[i].n,cat:ING[i].cat,unidad:ING[i].u,
      necesita:Math.round(q*10)/10,sku:x.etiqueta,costo:x.costo,
      sobrante:Math.round(x.sobrante*10)/10,sobranteValor:x.sobranteValor,desp:!!ING[i].desp,ref:x.sku.ref||null});
  }
  return f.sort((a,b)=>b.costo-a.costo);
}
function proteinaReceta(r){
  let p=0;
  for(const[i,q]of Object.entries(r.ing)){const m=ING[i];if(!m)continue;
    p+=(m.u==="und")?m.prot*q:m.prot*q/100;}
  return p;
}
/* Azar con semilla: el mismo menú mientras no pidas otro. */
function azar(semilla){
  let a=(semilla>>>0)||1;
  return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
}

/* Nutrientes de una lista de ingredientes (una porción). */
function nutrientes(ing){
  const n={kcal:0,prot:0,carb:0,gra:0,fib:0,verd:0};
  for(const[i,q]of Object.entries(ing||{})){
    const t=ING[i]; if(!t)continue;
    const f=t.u==="und"?q:q/100, v=NUTRI[i];
    n.prot+=t.prot*f;
    if(v){n.kcal+=v[0]*f;n.carb+=v[1]*f;n.gra+=v[2]*f;n.fib+=v[3]*f;}
    n.verd+=(VERDURA[i]||0)*q;
  }
  return n;
}
function sumarNut(a,b){const n={...a};for(const k in b)n[k]=(n[k]||0)+b[k];return n;}
/* Plato completo: la receta más su acompañante. */
function nutrientesPlato(e){
  return e.acomp?sumarNut(nutrientes(e.receta.ing),nutrientes(e.acomp.ing)):nutrientes(e.receta.ing);
}
/* Cuánta fruta y verdura le toca a cada comida para llegar a 400 g al día. */
function metaVerduraFranja(franja,franjas){
  const hayDes=franjas.includes("desayuno");
  if(franja==="desayuno")return 100;
  const nPrin=franjas.filter(f=>PRINCIPALES.includes(f)).length||1;
  return Math.min(250,(META_VERDURA-(hayDes?100:0))/nPrin);
}
/* Acompañantes que se pueden hacer en esta cocina y comprar en esta tienda. */
function acompanantesPosibles(o,franja){
  const tipo=franja==="desayuno"?"desayuno":"principal";
  return ACOMPANANTES.filter(a=>a.tipo.includes(tipo)&&recetaPosible(a,o))
    .map(a=>({...a,usa:aparatosUsados(a,o.aparatos||["estufa"])}));
}
/* Elige el acompañante que completa la fruta y verdura del plato al menor
   costo, sin repetir el de las dos comidas anteriores si hay otro. */
function elegirAcomp(r,franja,carrito,o,pool,recientes,franjas){
  if(!pool.length)return null;
  const falta=metaVerduraFranja(franja,franjas)-nutrientes(r.ing).verd;
  if(falta<=15)return null;
  const personas=o.personas||2;
  const base=sumar(carrito,r,personas), costoBase=costoCanasta(base,o.tienda);
  let mejor=null;
  for(const evitar of [true,false]){
    for(const a of pool){
      if(evitar&&recientes.includes(a.id))continue;
      const cubre=nutrientes(a.ing).verd>=falta-10;
      const delta=costoCanasta(sumar(base,a,personas),o.tienda)-costoBase;
      // Primero los que cubren lo que falta; entre ellos, el más barato.
      const score=(cubre?0:1e7)+delta;
      if(!mejor||score<mejor.score)mejor={a,score};
    }
    if(mejor)break;
  }
  return mejor?mejor.a:null;
}

function sumar(c,r,por){const n={...c};for(const[i,q]of Object.entries(r.ing))n[i]=(n[i]||0)+q*por;return n;}

/* Filtra el catálogo y lo parte por franja. El piso por comida es DURO en
   almuerzo y cena: una receta que no lo alcanza simplemente no es candidata
   para esa franja (aunque siga sirviendo de desayuno). */
function catalogoPorFranja(o){
  const{aparatos=["estufa"],pisoComida=20,objetivoDesayuno=0}=o;
  const base=RECETAS.filter(r=>recetaPosible(r,o))
    .map(r=>({...r,usa:aparatosUsados(r,aparatos)}));
  const porFranja={};
  for(const f of ["desayuno","almuerzo","comida"]){
    const meta=PRINCIPALES.includes(f)?pisoComida:objetivoDesayuno;
    porFranja[f]=base.filter(r=>sirveEnFranja(r,f,o))
      .map(r=>variante(r,meta))
      .filter(v=>!PRINCIPALES.includes(f)||v.alcanza);
  }
  const vistos=new Set(), principales=[];
  for(const f of PRINCIPALES)for(const v of porFranja[f])
    if(!vistos.has(v.id)){vistos.add(v.id);principales.push(v);}
  return{base,porFranja,principales};
}

/* Diagnóstico cuando una franja se queda sin recetas: distingue "el piso es
   muy alto" de "los filtros dejaron el catálogo vacío". */
function diagnostico(o,franjasUsadas){
  const{pisoComida=20}=o;
  const base=RECETAS.filter(r=>recetaPosible(r,o));
  const out={};
  for(const f of franjasUsadas){
    const sinPiso=base.filter(r=>sirveEnFranja(r,f,o));
    const vars=sinPiso.map(r=>variante(r,pisoComida));
    const conPiso=vars.filter(v=>!PRINCIPALES.includes(f)||v.alcanza);
    const techo=vars.length?Math.max(...vars.map(v=>v.prot)):0;
    out[f]={sinPiso:sinPiso.length,conPiso:conPiso.length,techoProteina:Math.round(techo)};
  }
  return out;
}

/* ==========================================================
   MOTOR — menú variado, planificado FRANJA POR FRANJA
   ========================================================== */
function planear(o){
  const{presupuesto=200000,personas=2,dias=5,comidasDia=2,modo="dias",
        maxRepeticiones=2,pisoComida=20}=o;
  const franjas=FRANJAS[comidasDia]||FRANJAS[2];
  const{porFranja}=catalogoPorFranja(o);

  const vacias=franjas.filter(f=>porFranja[f].length===0);
  if(vacias.length)
    return{ok:false,motivo:"franja_vacia",vacias,diag:diagnostico(o,franjas),
           pisoComida,candidatas:0};

  const conteo={}; franjas.forEach(f=>conteo[f]=(conteo[f]||0)+1);
  const diasMax=Math.min(...Object.entries(conteo)
    .map(([f,k])=>Math.floor(porFranja[f].length*maxRepeticiones/k)));

  const pools={}; for(const f of franjas)pools[f]=acompanantesPosibles(o,f);
  let carrito={},elegidas=[],usos={},ultimoDia={},recientes=[];
  const rnd=azar(o.semilla||1), ruido={};
  // Entre opciones de precio parecido decide el azar: hasta 20 % de margen.
  const jitter=(id,d,f)=>{const k=id+"|"+d+"|"+f;return ruido[k]??(ruido[k]=1+rnd()*0.2);};
  for(let d=0;d<dias;d++){
    for(const franja of franjas){
      let mejor=null;
      // Una receta repetida necesita días de por medio: primero 3, luego 2,
      // luego 1; nunca dos veces el mismo día. El costo incluye el acompañante.
      for(const separacion of [3,2,1]){
        for(const r of porFranja[franja]){
          if((usos[r.id]||0)>=maxRepeticiones)continue;
          if(ultimoDia[r.id]!=null&&d-ultimoDia[r.id]<separacion)continue;
          const acomp=elegirAcomp(r,franja,carrito,o,pools[franja],recientes,franjas);
          let nuevo=sumar(carrito,r,personas);
          if(acomp)nuevo=sumar(nuevo,acomp,personas);
          const delta=costoCanasta(nuevo,o.tienda)-costoCanasta(carrito,o.tienda);
          const score=delta/personas*jitter(r.id,d,franja);
          if(!mejor||score<mejor.score)mejor={r,acomp,score,delta,nuevo};
        }
        if(mejor)break;
      }
      if(!mejor){d=dias;break;}
      if(modo==="presupuesto"&&costoCanasta(mejor.nuevo,o.tienda)>presupuesto){d=dias;break;}
      carrito=mejor.nuevo;
      elegidas.push({receta:mejor.r,acomp:mejor.acomp,franja,costoMarginal:mejor.delta});
      usos[mejor.r.id]=(usos[mejor.r.id]||0)+1; ultimoDia[mejor.r.id]=d;
      if(mejor.acomp)recientes=[mejor.acomp.id,...recientes].slice(0,2);
    }
  }
  return empaquetar(o,{carrito,elegidas,porFranja,franjas,diasMax,maxRepeticiones});
}

/* Resultado común a los dos modos */
function empaquetar(o,st){
  const{presupuesto=200000,personas=2,dias=5,comidasDia=2,modo="dias",
        pisoComida=20,objetivoDia=0,peso=70,actividad="activo"}=o;
  const{carrito,elegidas,porFranja,franjas,diasMax}=st;
  const costoTotal=costoCanasta(carrito,o.tienda), canasta=detalleCanasta(carrito,o.tienda);
  const diasCubiertos=Math.floor(elegidas.length/comidasDia);
  const porciones=elegidas.length*personas;

  const principalesPlan=elegidas.filter(e=>PRINCIPALES.includes(e.franja));
  const protPrincipales=principalesPlan.map(e=>proteinaReceta(e.receta));
  const proteinaMinComida=protPrincipales.length?Math.round(Math.min(...protPrincipales)):0;
  // Balance del día: promedio por persona de los días del plan.
  const nDias=Math.max(1,elegidas.length/comidasDia);
  const total=elegidas.reduce((a,e)=>sumarNut(a,nutrientesPlato(e)),{kcal:0,prot:0,carb:0,gra:0,fib:0,verd:0});
  const dia={};for(const k in total)dia[k]=total[k]/nDias;
  const proteinaDia=dia.prot;
  const kcalMacro=dia.prot*4+dia.carb*4+dia.gra*9||1;
  const balance={kcal:Math.round(dia.kcal),prot:Math.round(dia.prot),carb:Math.round(dia.carb),
    gra:Math.round(dia.gra),fib:Math.round(dia.fib),verd:Math.round(dia.verd),
    pct:{prot:Math.round(dia.prot*4/kcalMacro*100),carb:Math.round(dia.carb*4/kcalMacro*100),
         gra:Math.round(dia.gra*9/kcalMacro*100)},
    metaFibra:META_FIBRA,metaVerdura:META_VERDURA,rangos:RANGOS_MACRO,
    sinAcomp:elegidas.filter(e=>!e.acomp&&nutrientes(e.receta.ing).verd<metaVerduraFranja(e.franja,franjas)-15).length};

  const disponibles=new Set();
  franjas.forEach(f=>porFranja[f].forEach(r=>disponibles.add(r.id)));

  return{ok:true,modo,personas,comidasDia,diasPedidos:dias,franjas,
    diasCubiertos,comidasAsignadas:elegidas.length,porciones,costoTotal,presupuesto,
    costoPorPorcion:porciones?Math.round(costoTotal/porciones):0,
    proteinaDia:Math.round(proteinaDia),
    proteinaMinComida,pisoComida:Math.round(pisoComida),
    objetivoDia:Math.round(objetivoDia),peso,actividad,
    objetivoCumplido:proteinaDia>=objetivoDia-1,
    pisoComidaCumplido:!principalesPlan.length||
      Math.min(...protPrincipales)>=pisoComida-1e-6,
    balance,elegidas,canasta,carrito,
    sobranteValor:canasta.reduce((a,f)=>a+(f.sobranteValor||0),0),
    costoDespensa:canasta.filter(f=>f.desp).reduce((a,f)=>a+f.costo,0),
    candidatas:disponibles.size,
    factorMax:elegidas.length?Math.max(...elegidas.map(e=>e.receta.f||1)):1,
    recetasPorFranja:Object.fromEntries(franjas.map(f=>[f,porFranja[f].length])),
    maxRepeticiones:st.maxRepeticiones??null,
    topeCatalogo:diasMax!=null?diasMax*comidasDia:null,
    diasMaxCatalogo:diasMax??null,
    limitadoPorCatalogo:diasMax!=null&&diasCubiertos<dias&&diasCubiertos>=diasMax,
    ...(st.extra||{})};
}

/* ==========================================================
   MEAL PREP — pocos platos en tandas grandes. El desayuno y las
   comidas principales se reparten por separado para que ninguna
   tanda de almuerzo o cena quede sin proteína.
   ========================================================== */
function planearMealPrep(o){
  const{presupuesto=200000,personas=2,dias=5,comidasDia=2,modo="dias",
        platos=3,pisoComida=20}=o;
  const franjas=FRANJAS[comidasDia]||FRANJAS[2];
  const{porFranja,principales}=catalogoPorFranja(o);

  const hayDesayuno=franjas.includes("desayuno");
  const prinFranjas=franjas.filter(f=>PRINCIPALES.includes(f));
  const nPrin=prinFranjas.length;
  // Con «almuerzo con carne» el almuerzo tiene su propia tanda: si se
  // mezclara con la cena, una tanda sin carne podría caer al mediodía.
  const separar=!!o.almuerzoConCarne&&prinFranjas.includes("almuerzo");
  const vacias=[];
  if(hayDesayuno&&!porFranja.desayuno.length)vacias.push("desayuno");
  if(separar){ for(const f of prinFranjas) if(!porFranja[f].length)vacias.push(f); }
  else if(nPrin&&!principales.length)vacias.push("almuerzo/cena");
  if(vacias.length)
    return{ok:false,motivo:"franja_vacia",vacias,diag:diagnostico(o,franjas),
           pisoComida,candidatas:0};

  const kDes=hayDesayuno?Math.min(1,porFranja.desayuno.length):0;
  const kPrin=Math.max(1,Math.min(platos-kDes,principales.length));

  const pools={}; for(const f of franjas)pools[f]=acompanantesPosibles(o,f);
  const armar=(d)=>{
    let carrito={},elegidos=[];
    const grupos=[];
    if(kDes)grupos.push({tipo:"desayuno",pool:porFranja.desayuno,comidas:d,k:kDes});
    if(separar){
      const kAlm=nPrin>1?Math.max(1,Math.ceil(kPrin/2)):kPrin;
      grupos.push({tipo:"almuerzo",pool:porFranja.almuerzo,comidas:d,k:kAlm});
      if(nPrin>1)grupos.push({tipo:"comida",pool:porFranja.comida,comidas:d,k:Math.max(1,kPrin-kAlm)});
    }
    else if(nPrin)grupos.push({tipo:"principal",pool:principales,comidas:d*nPrin,k:kPrin});
    for(const g of grupos){
      const K=Math.min(g.k,g.pool.length);
      const base=Math.floor(g.comidas/K),extra=g.comidas%K;
      for(let i=0;i<K;i++){
        const comidas=base+(i<extra?1:0); if(comidas<=0)continue;
        const porc=comidas*personas;
        let mejor=null;
        // Primero sin repetir ningún plato; si no queda, se permite repetir
        // uno que ya salió en OTRA franja (nunca dos tandas iguales en la misma).
        for(const evitarTodo of [true,false]){
          for(const r of g.pool){
            if(elegidos.some(e=>e.receta.id===r.id&&(evitarTodo||e.grupo===g.tipo)))continue;
            const nuevo=sumar(carrito,r,porc);
            const delta=costoCanasta(nuevo,o.tienda)-costoCanasta(carrito,o.tienda);
            const score=delta/porc;
            if(!mejor||score<mejor.score)mejor={r,score,delta,nuevo,comidas,porc};
          }
          if(mejor)break;
        }
        if(!mejor)break;
        carrito=mejor.nuevo;
        elegidos.push({receta:mejor.r,comidas:mejor.comidas,porciones:mejor.porc,
                       grupo:g.tipo,costoMarginal:mejor.delta});
      }
    }
    // Rotación: cada día toma su desayuno de la tanda de desayuno y sus
    // principales de las tandas principales, intercaladas. Los acompañantes
    // se preparan frescos para cada comida.
    // Cada comida toma la tanda que lleve más tiempo sin servirse (y que
    // no haya salido ese mismo día), así un plato no cae dos días seguidos.
    const rnd=azar((o.semilla||1)+d);
    const cola=g=>elegidos.filter(e=>e.grupo===g).map(e=>({r:e.receta,quedan:e.comidas,ultimo:-99,des:rnd()}));
    const colas={desayuno:cola("desayuno"),principal:cola("principal"),
                 almuerzo:cola("almuerzo"),comida:cola("comida")};
    let diaActual=0;
    const tomar=(q)=>{
      const vivas=q.filter(c=>c.quedan>0); if(!vivas.length)return null;
      // Prioridad: más días desde la última vez, luego más porciones pendientes.
      vivas.sort((a,b)=>(a.ultimo===diaActual)-(b.ultimo===diaActual)||a.ultimo-b.ultimo||b.quedan-a.quedan||a.des-b.des);
      const c=vivas[0]; c.quedan--; c.ultimo=diaActual; return c.r;
    };
    const secuencia=[]; let recientes=[];
    for(let dd=0;dd<d;dd++)for(const f of franjas){
      diaActual=dd;
      const r=tomar(f==="desayuno"?colas.desayuno:separar?colas[f]:colas.principal);
      if(!r)continue;
      const acomp=elegirAcomp(r,f,carrito,o,pools[f],recientes,franjas);
      if(acomp){carrito=sumar(carrito,acomp,personas);recientes=[acomp.id,...recientes].slice(0,2);}
      secuencia.push({receta:r,acomp,franja:f});
    }
    return{carrito,elegidos,secuencia,dias:d};
  };

  // En modo presupuesto se recortan DÍAS, no platos: el sentido del meal prep
  // es cocinar poco, así que lo que cede es la cobertura.
  let st=armar(dias);
  if(modo==="presupuesto"){
    let d=dias;
    while(d>1&&costoCanasta(st.carrito,o.tienda)>presupuesto){ d--; st=armar(d); }
  }

  const res=empaquetar(o,{carrito:st.carrito,elegidas:st.secuencia,porFranja,franjas,
    diasMax:null,maxRepeticiones:null,
    extra:{mealPrep:true,tandas:st.elegidos,platos:st.elegidos.length,
           minutosCocina:st.elegidos.reduce((a,e)=>a+e.receta.min,0)}});
  res.diasCubiertos=st.dias;
  res.limitadoPorCatalogo=false; res.topeCatalogo=null;
  return res;
}

/* ==========================================================
   COCINA — qué abre cada electrodoméstico
   ========================================================== */
/* Recetas que se pueden hacer con la cocina actual (sin mirar proteína). */
function recetasPosibles(o){
  return RECETAS.filter(r=>recetaPosible(r,o));
}
/* Para cada aparato: cuántas recetas usa hoy y cuántas se ganarían (o
   perderían) al marcarlo o desmarcarlo. */
function impactoAparatos(o){
  const aparatos=o.aparatos||[];
  const hoy=recetasPosibles(o).length;
  const out={};
  for(const a of Object.keys(APARATOS)){
    const tiene=aparatos.includes(a);
    const otro=tiene?aparatos.filter(x=>x!==a):[...aparatos,a];
    const n=recetasPosibles({...o,aparatos:otro}).length;
    out[a]={tiene,delta:tiene?hoy-n:n-hoy,
            usan:RECETAS.filter(r=>r.ap.some(q=>(Array.isArray(q)?q:[q]).includes(a))).length};
  }
  return{hoy,total:RECETAS.length,porAparato:out};
}

/* Para cada proteína: cuántas recetas posibles la usan hoy, o cuántas se
   sumarían si la casa empezara a comerla. */
function impactoProteinas(o){
  const actuales=o.proteinas||TODAS_PROTEINAS;
  const hoy=recetasPosibles(o).length;
  const out={};
  for(const g of TODAS_PROTEINAS){
    const come=actuales.includes(g);
    const usan=recetasPosibles(o).filter(r=>Object.keys(r.ing).some(i=>PROTEINAS[g].ing.includes(i))).length;
    const con=recetasPosibles({...o,proteinas:[...new Set([...actuales,g])]}).length;
    out[g]={come,usan,delta:come?0:con-hoy};
  }
  return out;
}

/* ==========================================================
   TIENDAS — cuánto cuesta el plan en cada una
   ========================================================== */
/* Recetas que la cocina permite pero que no tienen precio en la tienda. */
function recetasSinPrecio(o){
  return RECETAS.filter(r=>recetaPosible(r,{...o,ignorarPrecio:true})&&!conPrecio(r,o.tienda||TIENDA_DEF));
}
/* Arma el plan en cada tienda con datos: cada una con su propio menú
   más barato, no el mismo menú con otros precios. */
function compararTiendas(o){
  return Object.keys(TIENDAS).map(t=>{
    const info={tienda:t,n:TIENDAS[t].n,datos:tieneDatos(t),
      fecha:PRECIOS[t]&&PRECIOS[t].fecha,nota:PRECIOS[t]&&PRECIOS[t].nota};
    if(!info.datos)return info;
    const oo={...o,tienda:t};
    const r=oo.mealPrep?planearMealPrep(oo):planear(oo);
    return{...info,ok:r.ok,costoTotal:r.ok?r.costoTotal:null,diasCubiertos:r.ok?r.diasCubiertos:0,
      diasPedidos:oo.dias,objetivoCumplido:r.ok&&r.objetivoCumplido,
      recetas:recetasPosibles(oo).length};
  });
}

if(typeof module!=="undefined"&&module.exports){
  module.exports={APARATOS,PROTEINAS,ING,RECETAS,ACOMPANANTES,NUTRI,nutrientes,nutrientesPlato,
    META_VERDURA,META_FIBRA,metaVerduraFranja,PRECIOS,TIENDAS,TIENDA_DEF,tieneDatos,tiendasConDatos,conPrecio,ingredientesRef,tiendaRef,recetasSinPrecio,compararTiendas,ACTIVIDAD,FRANJAS,PRINCIPALES,
    llevaCarne,comeTodo,impactoProteinas,
    variante,cumpleRestricciones,aparatosUsados,recetaPosible,recetasPosibles,
    impactoAparatos,costoIngrediente,costoCanasta,proteinaReceta,
    catalogoPorFranja,planear,planearMealPrep};
}
