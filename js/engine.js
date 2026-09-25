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
  pollo_surt:{n:"Pollo marinado",u:"g",prot:20.0,cat:"Proteína"},
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
};

const SKUS = [
  {ing:"arroz",nom:"Arroz Diana 500 G",size:500,precio:1990},
  {ing:"arroz",nom:"Arroz Premium Albar 2500 G",size:2500,precio:6990},
  {ing:"lenteja",nom:"Lenteja El Estío 500 Grs",size:500,precio:1750},
  {ing:"frijol",nom:"Fríjol Lima Granipack 500 G",size:500,precio:3990},
  {ing:"garbanzo",nom:"Garbanzo El Estío 500 Grs",size:500,precio:2650},
  {ing:"arveja_seca",nom:"Arveja El Estío 500 Grs",size:500,precio:1850},
  {ing:"espagueti",nom:"Spaghetti Deliziare 500 G",size:500,precio:3990},
  {ing:"harina_maiz",nom:"Harina de Maíz Amarilla PAN 800 G",size:800,precio:2700},
  {ing:"arepa",nom:"Arepa Amarilla Masmaí 5 Und",size:5,precio:1990},
  {ing:"huevo",nom:"Huevo Tipo B 30 Und",size:30,precio:10990},
  {ing:"pollo_surt",nom:"Surtida de Pollo Marinada 500 G",size:500,precio:5200},
  {ing:"pollo_muslo",nom:"Muslos de Pollo Brasset 700 G",size:700,precio:8750},
  {ing:"atun",nom:"Filete de Atún 300 G",size:300,precio:17950},
  {ing:"salchicha",nom:"Salchicha Tradicional Viandé 400 G",size:400,precio:6750},
  {ing:"carne_res",nom:"Hamburguesa de Res Viandé 450 G",size:450,precio:10400},
  {ing:"papa",nom:"Papa Pareja 2500 G",size:2500,precio:7500},
  {ing:"papa",nom:"Papa Pastusa 2500 G",size:2500,precio:11250},
  {ing:"papa_criolla",nom:"Papa Criolla 1000 G",size:1000,precio:8450},
  {ing:"platano",nom:"Plátano X 1000 G",size:1000,precio:2900},
  {ing:"cebolla",nom:"Cebolla Cabezona X 1000 G",size:1000,precio:4500},
  {ing:"cebolla_larga",nom:"Cebolla Larga 500 Gr",size:500,precio:3600},
  {ing:"tomate",nom:"Tomate Chonto X 1000 G",size:1000,precio:4990},
  {ing:"zanahoria",nom:"Zanahoria X 1000 G",size:1000,precio:3100},
  {ing:"arveja_cong",nom:"Arveja Verde Congelada Cooltivo 500 G",size:500,precio:5990},
  {ing:"ajo",nom:"Ajo Malla 3 Unidades",size:3,precio:1100},
  {ing:"banano",nom:"Banano Unidad",size:1,precio:550},
  {ing:"leche",nom:"Leche Entera Bolsa UHT Latti 900 Ml",size:900,precio:3090},
  {ing:"queso",nom:"Queso Mozzarella Búfala 100 Gr",size:100,precio:5990},
  {ing:"avena_beb",nom:"Avena Tetra Pak Latti 900 Ml",size:900,precio:5650},
  {ing:"aceite",nom:"Aceite Imatá 420 Ml",size:420,precio:3990},
  {ing:"aceite",nom:"Aceite Vegetal Imatá 900 Ml",size:900,precio:6750},
  {ing:"sal",nom:"Sal Refisal 1000 G",size:1000,precio:2900},
  {ing:"panela",nom:"Panela Pastilla 1000 G",size:1000,precio:7350},
  {ing:"azucar",nom:"Azúcar Blanca 1000 Grs",size:1000,precio:3390},
  {ing:"pasta_tomate",nom:"Pasta de Tomate Zev 200 Grs",size:200,precio:2800},
];

const RECETAS = [
 {id:"arroz_pollo",n:"Arroz con pollo",min:45,ap:["estufa"],tipo:["almuerzo","comida"],
  ing:{arroz:90,pollo_surt:120,cebolla:25,zanahoria:30,arveja_cong:25,aceite:10,sal:3,ajo:0.3},
  pasos:["Sofríe cebolla, ajo y zanahoria en aceite.","Agrega el pollo y dora 5 min.","Suma el arroz y el doble de agua, tapa 18 min.","Incorpora la arveja los últimos 5 min."]},
 {id:"frijoles",n:"Fríjoles con arroz y maduro",min:60,ap:["estufa","olla_presion"],tipo:["almuerzo","comida"],
  ing:{frijol:80,arroz:80,platano:120,cebolla:20,tomate:40,aceite:8,sal:3},
  pasos:["Remoja el fríjol la noche anterior.","Cocina en olla a presión 25 min.","Haz hogao con cebolla y tomate y súmalo.","Fríe el plátano maduro aparte."]},
 {id:"lentejas",n:"Lentejas guisadas con arroz",min:40,ap:["estufa"],tipo:["almuerzo","comida"],
  ing:{lenteja:80,arroz:80,cebolla:25,tomate:40,zanahoria:30,aceite:8,sal:3,ajo:0.3},
  pasos:["Sofríe cebolla, ajo, tomate y zanahoria.","Suma la lenteja y agua, cocina 25 min.","Cocina el arroz aparte."]},
 {id:"garbanzos",n:"Garbanzos guisados con arroz",min:45,ap:["estufa","olla_presion"],tipo:["almuerzo","comida"],
  ing:{garbanzo:80,arroz:80,tomate:50,cebolla:25,aceite:8,sal:3,ajo:0.3},
  pasos:["Remoja el garbanzo la noche anterior.","Olla a presión 20 min.","Guisa con hogao de tomate, cebolla y ajo."]},
 {id:"pericos",n:"Huevos pericos con arepa",min:15,ap:["estufa"],tipo:["desayuno"],
  ing:{huevo:2,cebolla_larga:20,tomate:35,arepa:1,aceite:5,sal:2},
  pasos:["Sofríe cebolla larga y tomate.","Agrega los huevos batidos y revuelve.","Asa la arepa."]},
 {id:"pasta_atun",n:"Espagueti con atún",min:25,ap:["estufa"],tipo:["almuerzo","comida"],
  ing:{espagueti:100,atun:55,pasta_tomate:30,cebolla:20,aceite:8,sal:3},
  pasos:["Cocina el espagueti al dente.","Sofríe cebolla, suma pasta de tomate y atún.","Mezcla todo."]},
 {id:"sudado",n:"Sudado de pollo con papa",min:45,ap:["estufa"],tipo:["almuerzo","comida"],
  ing:{pollo_muslo:150,papa:200,cebolla:25,tomate:50,zanahoria:30,aceite:8,sal:3},
  pasos:["Dora los muslos.","Suma hogao, papa en trozos y zanahoria.","Tapa y cocina 25 min a fuego bajo."]},
 {id:"arroz_huevo",n:"Arroz salteado con huevo",min:25,ap:["estufa"],tipo:["almuerzo","comida"],
  ing:{arroz:90,huevo:2,arveja_cong:40,zanahoria:35,cebolla_larga:20,aceite:10,sal:2},
  pasos:["Cocina el arroz y déjalo enfriar.","Saltea verduras a fuego alto.","Suma huevo revuelto y el arroz."]},
 {id:"sopa_verduras",n:"Sopa de verduras con papa",min:35,ap:["estufa"],tipo:["comida"],
  ing:{papa:180,zanahoria:60,arveja_seca:30,cebolla:20,cebolla_larga:15,sal:3},
  pasos:["Hierve la arveja 20 min.","Suma papa, zanahoria y cebolla.","Cocina 15 min más."]},
 {id:"tortilla_papa",n:"Tortilla de papa",min:30,ap:["estufa"],tipo:["desayuno","comida"],
  ing:{papa:200,huevo:2,cebolla:30,aceite:15,sal:3},
  pasos:["Fríe papa en láminas con cebolla.","Bate los huevos y mézclalos.","Cuaja por ambos lados."]},
 {id:"pollo_horno",n:"Pollo al horno con papas",min:60,ap:["horno"],tipo:["almuerzo","comida"],
  ing:{pollo_muslo:180,papa:200,aceite:10,sal:3,ajo:0.5},
  pasos:["Adoba el pollo con ajo, sal y aceite.","Hornea 45 min a 200 °C con las papas."]},
 {id:"bolonesa",n:"Espagueti a la boloñesa",min:40,ap:["estufa"],tipo:["almuerzo","comida"],
  ing:{espagueti:100,carne_res:90,pasta_tomate:40,cebolla:25,tomate:40,aceite:8,sal:3},
  pasos:["Desmenuza y dora la carne.","Suma cebolla, tomate y pasta de tomate.","Cocina 20 min y sirve sobre el espagueti."]},
 {id:"sancocho",n:"Sancocho de pollo",min:70,ap:["estufa"],tipo:["almuerzo"],
  ing:{pollo_muslo:150,papa:150,platano:100,cebolla_larga:20,zanahoria:40,sal:4},
  pasos:["Hierve el pollo con cebolla larga 25 min.","Suma plátano verde en trozos.","Agrega papa y zanahoria, 20 min más."]},
 {id:"arepas_queso",n:"Arepas de maíz con queso",min:20,ap:["estufa"],tipo:["desayuno"],
  ing:{harina_maiz:60,queso:35,sal:2,aceite:5},
  pasos:["Amasa la harina con agua tibia y sal.","Forma discos y asa 6 min por lado.","Abre y rellena con queso."]},
 {id:"avena_banano",n:"Avena con banano",min:5,ap:[],tipo:["desayuno"],
  ing:{avena_beb:250,banano:1},
  pasos:["Sirve la avena bien fría.","Corta el banano encima."]},
 {id:"crema_zanahoria",n:"Crema de zanahoria",min:30,ap:["estufa","licuadora"],tipo:["comida"],
  ing:{zanahoria:150,papa:80,leche:100,cebolla:20,sal:3,aceite:5},
  pasos:["Cocina zanahoria, papa y cebolla hasta ablandar.","Licúa con la leche.","Regresa al fuego 5 min."]},
 {id:"patacones",n:"Patacones con hogao y huevo",min:30,ap:["estufa"],tipo:["comida"],
  ing:{platano:200,huevo:1,tomate:40,cebolla_larga:20,aceite:20,sal:3},
  pasos:["Fríe el plátano verde en rodajas, aplasta y vuelve a freír.","Prepara hogao.","Sirve con huevo frito encima."]},
 {id:"salchichas_pure",n:"Salchichas guisadas con puré",min:30,ap:["estufa"],tipo:["almuerzo","comida"],
  ing:{salchicha:100,papa:200,leche:50,cebolla:20,tomate:30,aceite:8,sal:3},
  pasos:["Cocina la papa y hazla puré con leche.","Guisa las salchichas en hogao."]},
 {id:"atun_arroz",n:"Atún con arroz y ensalada",min:20,ap:[["estufa","arrocera"]],tipo:["almuerzo","comida"],
  ing:{atun:55,arroz:90,tomate:60,cebolla:20,aceite:8,sal:2},
  pasos:["Cocina el arroz en olla o arrocera.","Mezcla el atún con cebolla picada.","Ensalada de tomate al lado."]},
 {id:"huevo_ensalada",n:"Huevos cocidos con papa y ensalada",min:25,ap:["estufa"],tipo:["almuerzo","comida"],
  ing:{huevo:2,papa:150,tomate:60,cebolla:20,zanahoria:40,aceite:8,sal:2},
  pasos:["Cocina huevos 10 min y papa aparte.","Ralla zanahoria y pica tomate y cebolla.","Aliña con aceite y sal."]},
 {id:"arepa_queso_leche",n:"Arepa con queso y leche",min:10,ap:[["estufa","microondas","airfryer"]],tipo:["desayuno"],
  ing:{arepa:1,queso:30,leche:200},
  pasos:["Asa la arepa en sartén, o 6 min en airfryer, o 1 min en microondas.","Derrite el queso encima.","Sirve con leche caliente."]},
 {id:"pasta_verduras",n:"Pasta con verduras salteadas",min:25,ap:["estufa"],tipo:["almuerzo","comida"],
  ing:{espagueti:100,zanahoria:50,arveja_cong:40,cebolla:25,pasta_tomate:25,aceite:10,sal:3,queso:15},
  pasos:["Cocina el espagueti.","Saltea zanahoria, arveja y cebolla.","Mezcla con pasta de tomate y queso rallado."]},
 /* --- Airfryer --- */
 {id:"muslos_air",n:"Muslos crocantes con papa en airfryer",min:35,ap:["airfryer"],tipo:["almuerzo","comida"],
  ing:{pollo_muslo:180,papa:200,aceite:5,sal:3,ajo:0.5},
  pasos:["Adoba los muslos con ajo y sal.","Papa en cascos con una cucharadita de aceite.","Airfryer a 190 °C por 25 min, volteando a la mitad."]},
 {id:"hamburguesa_air",n:"Hamburguesa de res con papa en airfryer",min:25,ap:["airfryer"],tipo:["almuerzo","comida"],
  ing:{carne_res:150,papa:180,tomate:50,cebolla:20,aceite:5,sal:2},
  pasos:["Papa en bastones con un poco de aceite, 15 min a 200 °C.","Suma la carne y 8 min más, volteando una vez.","Sirve con tomate y cebolla en rodajas."]},
 {id:"salchipapa_air",n:"Salchichas, papa y huevo en airfryer",min:25,ap:["airfryer"],tipo:["almuerzo","comida"],
  ing:{salchicha:120,huevo:1,papa:180,tomate:40,aceite:5,sal:2},
  pasos:["Papa en bastones, 12 min a 200 °C.","Suma las salchichas cortadas, 8 min más.","El huevo va en un molde pequeño los últimos 6 min."]},
 {id:"patacon_air",n:"Patacones de airfryer con huevo",min:30,ap:["airfryer"],tipo:["desayuno","comida"],
  ing:{platano:180,huevo:2,aceite:5,sal:2},
  pasos:["Plátano verde en trozos, 10 min a 180 °C.","Aplasta y vuelve 8 min a 200 °C.","Huevos en molde pequeño 7 min."]},
 /* --- Microondas --- */
 {id:"huevos_micro",n:"Huevos al microondas con arepa",min:8,ap:["microondas"],tipo:["desayuno"],
  ing:{huevo:2,arepa:1,tomate:30,cebolla_larga:10,sal:1},
  pasos:["Bate los huevos con tomate y cebolla picados en una taza.","Microondas 1 min, revuelve y 40 s más.","Calienta la arepa 30 s."]},
 {id:"papa_atun_micro",n:"Papa rellena de atún al microondas",min:15,ap:["microondas"],tipo:["almuerzo","comida"],
  ing:{papa:250,atun:80,cebolla:20,tomate:40,aceite:5,sal:2},
  pasos:["Pincha la papa y cocínala 8 min en microondas, volteando a la mitad.","Ábrela y mezcla la pulpa con atún, cebolla y tomate.","Rellena y dale 1 min más."]},
 /* --- Arrocera --- */
 {id:"arroz_pollo_arrocera",n:"Arroz con pollo de arrocera",min:40,ap:["arrocera"],tipo:["almuerzo","comida"],
  ing:{arroz:90,pollo_surt:120,zanahoria:30,arveja_cong:25,cebolla:20,aceite:5,sal:3},
  pasos:["Pon todo en la arrocera con 1,5 tazas de agua por taza de arroz.","Enciende y deja que salte sola.","Reposa 10 min tapada antes de servir."]},
 {id:"arroz_lenteja_arrocera",n:"Arroz con lentejas de arrocera",min:45,ap:["arrocera"],tipo:["almuerzo","comida"],
  ing:{arroz:80,lenteja:80,cebolla:20,tomate:40,zanahoria:30,aceite:5,sal:3},
  pasos:["Remoja la lenteja 1 h.","Todo a la arrocera con 2 tazas de agua por taza de arroz.","Reposa 10 min tapada."]},
];

const CARNES=["pollo_surt","pollo_muslo","atun","salchicha","carne_res"];
const LACTEOS=["leche","queso","avena_beb"];
const GLUTEN=["espagueti"];

/* Ingredientes que se escalan cuando la persona necesita más (o menos)
   proteína. El resto de la receta —arroz, papa, verduras, aliños— se queda
   igual: nadie duplica la cebolla porque va al gimnasio. */
const ESCALABLES=["huevo","pollo_surt","pollo_muslo","atun","salchicha","carne_res",
                  "lenteja","frijol","garbanzo","arveja_seca","queso"];
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
  const{aparatos=["estufa"],restricciones=[],maxMinutos=90}=o;
  return !!aparatosUsados(r,aparatos)&&cumpleRestricciones(r,restricciones)&&r.min<=maxMinutos;
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
function costoIngrediente(ingId,cantidad){
  const op=SKUS.filter(s=>s.ing===ingId);
  if(!op.length||cantidad<=0)return null;
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
function costoCanasta(c){let t=0;for(const[i,q]of Object.entries(c)){const x=costoIngrediente(i,q);if(x)t+=x.costo;}return t;}
function detalleCanasta(c){
  const f=[];
  for(const[i,q]of Object.entries(c)){
    const x=costoIngrediente(i,q); if(!x)continue;
    f.push({ing:i,nombre:ING[i].n,cat:ING[i].cat,unidad:ING[i].u,
      necesita:Math.round(q*10)/10,sku:x.etiqueta,costo:x.costo,
      sobrante:Math.round(x.sobrante*10)/10,sobranteValor:x.sobranteValor,desp:!!ING[i].desp});
  }
  return f.sort((a,b)=>b.costo-a.costo);
}
function proteinaReceta(r){
  let p=0;
  for(const[i,q]of Object.entries(r.ing)){const m=ING[i];if(!m)continue;
    p+=(m.u==="und")?m.prot*q:m.prot*q/100;}
  return p;
}
function sumar(c,r,por){const n={...c};for(const[i,q]of Object.entries(r.ing))n[i]=(n[i]||0)+q*por;return n;}

/* Filtra el catálogo y lo parte por franja. El piso por comida es DURO en
   almuerzo y cena: una receta que no lo alcanza simplemente no es candidata
   para esa franja (aunque siga sirviendo de desayuno). */
function catalogoPorFranja(o){
  const{aparatos=["estufa"],restricciones=[],maxMinutos=90,
        pisoComida=20,objetivoDesayuno=0}=o;
  const base=RECETAS.filter(r=>recetaPosible(r,{aparatos,restricciones,maxMinutos}))
    .map(r=>({...r,usa:aparatosUsados(r,aparatos)}));
  const porFranja={};
  for(const f of ["desayuno","almuerzo","comida"]){
    const meta=PRINCIPALES.includes(f)?pisoComida:objetivoDesayuno;
    porFranja[f]=base.filter(r=>r.tipo.includes(f))
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
  const{aparatos=["estufa"],restricciones=[],maxMinutos=90,pisoComida=20}=o;
  const base=RECETAS.filter(r=>recetaPosible(r,{aparatos,restricciones,maxMinutos}));
  const out={};
  for(const f of franjasUsadas){
    const sinPiso=base.filter(r=>r.tipo.includes(f));
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

  let carrito={},elegidas=[],usos={},ultima=null;
  for(let d=0;d<dias;d++){
    for(const franja of franjas){
      let mejor=null;
      // Primera pasada con la regla de variedad; si nadie pasa, se relaja.
      for(const evitarRepetir of [true,false]){
        for(const r of porFranja[franja]){
          if((usos[r.id]||0)>=maxRepeticiones)continue;
          if(evitarRepetir&&r.id===ultima)continue;
          const nuevo=sumar(carrito,r,personas);
          const delta=costoCanasta(nuevo)-costoCanasta(carrito);
          const score=delta/personas;
          if(!mejor||score<mejor.score)mejor={r,score,delta,nuevo};
        }
        if(mejor)break;
      }
      if(!mejor){d=dias;break;}
      if(modo==="presupuesto"&&costoCanasta(mejor.nuevo)>presupuesto){d=dias;break;}
      carrito=mejor.nuevo;
      elegidas.push({receta:mejor.r,franja,costoMarginal:mejor.delta});
      usos[mejor.r.id]=(usos[mejor.r.id]||0)+1; ultima=mejor.r.id;
    }
  }
  return empaquetar(o,{carrito,elegidas,porFranja,franjas,diasMax,maxRepeticiones});
}

/* Resultado común a los dos modos */
function empaquetar(o,st){
  const{presupuesto=200000,personas=2,dias=5,comidasDia=2,modo="dias",
        pisoComida=20,objetivoDia=0,peso=70,actividad="activo"}=o;
  const{carrito,elegidas,porFranja,franjas,diasMax}=st;
  const costoTotal=costoCanasta(carrito), canasta=detalleCanasta(carrito);
  const diasCubiertos=Math.floor(elegidas.length/comidasDia);
  const porciones=elegidas.length*personas;

  const principalesPlan=elegidas.filter(e=>PRINCIPALES.includes(e.franja));
  const protPrincipales=principalesPlan.map(e=>proteinaReceta(e.receta));
  const proteinaMinComida=protPrincipales.length?Math.round(Math.min(...protPrincipales)):0;
  const proteinaDia=elegidas.length
    ? elegidas.reduce((a,e)=>a+proteinaReceta(e.receta),0)/Math.max(1,elegidas.length/comidasDia) : 0;

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
    elegidas,canasta,carrito,
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
  const nPrin=franjas.filter(f=>PRINCIPALES.includes(f)).length;
  const vacias=[];
  if(hayDesayuno&&!porFranja.desayuno.length)vacias.push("desayuno");
  if(nPrin&&!principales.length)vacias.push("almuerzo/cena");
  if(vacias.length)
    return{ok:false,motivo:"franja_vacia",vacias,diag:diagnostico(o,franjas),
           pisoComida,candidatas:0};

  const kDes=hayDesayuno?Math.min(1,porFranja.desayuno.length):0;
  const kPrin=Math.max(1,Math.min(platos-kDes,principales.length));

  const armar=(d)=>{
    let carrito={},elegidos=[];
    const grupos=[];
    if(kDes)grupos.push({tipo:"desayuno",pool:porFranja.desayuno,comidas:d,k:kDes});
    if(nPrin)grupos.push({tipo:"principal",pool:principales,comidas:d*nPrin,k:kPrin});
    for(const g of grupos){
      const K=Math.min(g.k,g.pool.length);
      const base=Math.floor(g.comidas/K),extra=g.comidas%K;
      for(let i=0;i<K;i++){
        const comidas=base+(i<extra?1:0); if(comidas<=0)continue;
        const porc=comidas*personas;
        let mejor=null;
        for(const r of g.pool){
          if(elegidos.some(e=>e.receta.id===r.id))continue;
          const nuevo=sumar(carrito,r,porc);
          const delta=costoCanasta(nuevo)-costoCanasta(carrito);
          const score=delta/porc;
          if(!mejor||score<mejor.score)mejor={r,score,delta,nuevo,comidas,porc};
        }
        if(!mejor)break;
        carrito=mejor.nuevo;
        elegidos.push({receta:mejor.r,comidas:mejor.comidas,porciones:mejor.porc,
                       grupo:g.tipo,costoMarginal:mejor.delta});
      }
    }
    return{carrito,elegidos,dias:d};
  };

  // En modo presupuesto se recortan DÍAS, no platos: el sentido del meal prep
  // es cocinar poco, así que lo que cede es la cobertura.
  let st=armar(dias);
  if(modo==="presupuesto"){
    let d=dias;
    while(d>1&&costoCanasta(st.carrito)>presupuesto){ d--; st=armar(d); }
  }

  // Rotación: cada día toma su desayuno de la tanda de desayuno y sus
  // principales de las tandas principales, intercaladas.
  const qDes=st.elegidos.filter(e=>e.grupo==="desayuno").map(e=>({r:e.receta,quedan:e.comidas}));
  const qPrin=st.elegidos.filter(e=>e.grupo==="principal").map(e=>({r:e.receta,quedan:e.comidas}));
  const tomar=(q)=>{ for(let i=0;i<q.length;i++){ const c=q.shift(); if(c.quedan>0){c.quedan--; q.push(c); return c.r;} }
                     return null; };
  const secuencia=[];
  for(let d=0;d<st.dias;d++)for(const f of franjas){
    const r=f==="desayuno"?tomar(qDes):tomar(qPrin);
    if(r)secuencia.push({receta:r,franja:f});
  }

  const res=empaquetar(o,{carrito:st.carrito,elegidas:secuencia,porFranja,franjas,
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

if(typeof module!=="undefined"&&module.exports){
  module.exports={APARATOS,ING,SKUS,RECETAS,ACTIVIDAD,FRANJAS,PRINCIPALES,
    variante,cumpleRestricciones,aparatosUsados,recetaPosible,recetasPosibles,
    impactoAparatos,costoIngrediente,costoCanasta,proteinaReceta,
    catalogoPorFranja,planear,planearMealPrep};
}
