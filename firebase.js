<script>
window.addEventListener('DOMContentLoaded', function() {
// =============================================
// DATA
// =============================================

const DEFAULT_TASKS = {
  lunes: [
    { id: 'l1', cat: 'cocina', icon: '🍲', text: 'Meal prep principal: viandas para llevar (martes a jueves) y comidas de casa hasta el miércoles' },
    { id: 'l2', cat: 'cocina', icon: '📋', text: 'Revisar el menú e ingredientes necesarios para saber qué y cuánto cocinar' },
    { id: 'l3', cat: 'limpieza', icon: '🚿', text: 'Baños' },
    { id: 'l4', cat: 'limpieza', icon: '🛋️', text: 'Living y comedor — limpieza general' },
    { id: 'l5', cat: 'limpieza', icon: '🍳', text: 'Cocina — limpieza general' },
    { id: 'l6', cat: 'limpieza', icon: '🛏️', text: 'Hacer camas' },
    { id: 'l7', cat: 'ropa', icon: '👕', text: 'Poner lavarropas con la ropa del fin de semana (mientras cocina)' },
    { id: 'l8', cat: 'ropa', icon: '💨', text: 'Pasar a tender al finalizar' },
    { id: 'l9', cat: 'ropa', icon: '🧺', text: 'Planchar y guardar lo que se lavó el viernes' },
  ],
  miercoles: [
    { id: 'm1', cat: 'cocina', icon: '🥘', text: 'Refuerzo puntual: reponer lo que se agotó del meal prep del lunes' },
    { id: 'm2', cat: 'cocina', icon: '🥗', text: 'Algo fresco si se necesita (ensalada, guarnición, etc.)' },
    { id: 'm3', cat: 'limpieza', icon: '🚿', text: 'Limpieza profunda: baños y cocina' },
    { id: 'm4', cat: 'limpieza', icon: '🏠', text: 'Limpieza general del resto de la casa' },
    { id: 'm5', cat: 'limpieza', icon: '🛏️', text: 'Hacer camas' },
    { id: 'm6', cat: 'ropa', icon: '🧺', text: 'Planchar y guardar la ropa lavada el lunes' },
    { id: 'm7', cat: 'ropa', icon: '👕', text: 'Nueva tanda al lavarropas' },
  ],
  viernes: [
    { id: 'v1', cat: 'cocina', icon: '🍽️', text: 'Meal prep para el fin de semana' },
    { id: 'v2', cat: 'limpieza', icon: '🚿', text: 'Baños' },
    { id: 'v3', cat: 'limpieza', icon: '🛋️', text: 'Living y comedor — limpieza general' },
    { id: 'v4', cat: 'limpieza', icon: '🍳', text: 'Cocina — limpieza general' },
    { id: 'v5', cat: 'limpieza', icon: '🛏️', text: 'Hacer camas' },
    { id: 'v6', cat: 'ropa', icon: '🧺', text: 'Planchar y guardar la ropa del miércoles' },
    { id: 'v7', cat: 'ropa', icon: '👕', text: 'Lavar lo acumulado de la semana' },
  ]
};

const CATEGORIES = {
  cocina: { label: 'Cocina', icon: '🍳' },
  limpieza: { label: 'Limpieza', icon: '🧹' },
  ropa: { label: 'Ropa', icon: '👕' },
};

// Seasons for Southern Hemisphere (Argentina)
// verano: dic-feb, otono: mar-may, invierno: jun-ago, primavera: sep-nov
function getCurrentSeason() {
  const m = new Date().getMonth() + 1; // 1-12
  if (m >= 12 || m <= 2) return 'verano';
  if (m >= 3 && m <= 5) return 'otono';
  if (m >= 6 && m <= 8) return 'invierno';
  return 'primavera';
}

// Tags de temperatura: 'frio' = mejor en frio, 'fresco' = todo el año, 'calor' = mejor en calor
const PRELOADED_RECIPES = [
  // ── VERANO / FRESCOS ──────────────────────────────────────────────
  {
    id: 'r1', emoji: '🥗', name: 'Ensalada de quinoa con vegetales',
    time: 20, tags: ['rapido', 'singluten', 'calor'],
    ingredients: [
      { name: 'Quinoa', amount: '200 g' },
      { name: 'Pepino', amount: '1 unidad' },
      { name: 'Tomates cherry', amount: '150 g' },
      { name: 'Morrón rojo', amount: '1 unidad' },
      { name: 'Limón', amount: '1 unidad' },
      { name: 'Aceite de oliva', amount: '3 cdas' },
      { name: 'Sal y perejil', amount: 'A gusto' },
    ],
    steps: [
      'Cocinar quinoa con 2 partes de agua por 1 de quinoa, 15 min. Dejar enfriar.',
      'Picar pepino, cherry y morrón en cubos chicos.',
      'Mezclar todo con aceite, jugo de limón, sal y perejil.',
      'Guardar en heladera hasta servir.',
    ],
    conservation: 'Hasta 3 días en heladera. No congela.'
  },
  {
    id: 'r2', emoji: '🐟', name: 'Medallones de merluza con ensalada',
    time: 25, tags: ['rapido', 'singluten', 'calor', 'finde'],
    ingredients: [
      { name: 'Merluza en postas', amount: '1 kg' },
      { name: 'Ajo', amount: '3 dientes' },
      { name: 'Limón', amount: '2 unidades' },
      { name: 'Aceite de oliva', amount: '3 cdas' },
      { name: 'Lechuga', amount: '1 planta' },
      { name: 'Tomate', amount: '2 unidades' },
      { name: 'Sal y pimienta', amount: 'A gusto' },
    ],
    steps: [
      'Marinar el pescado con limón, ajo, sal y pimienta 15 min.',
      'Cocinar en sartén con aceite 4 min por lado.',
      'Armar ensalada con lechuga y tomate en rodajas.',
      'Servir el pescado sobre la ensalada con un chorro de limón.',
    ],
    conservation: 'Consumir el día. El pescado cocido dura 1 día en heladera.'
  },
  {
    id: 'r3', emoji: '🥚', name: 'Tortilla de verduras',
    time: 30, tags: ['rapido', 'singluten', 'fresco'],
    ingredients: [
      { name: 'Huevos', amount: '6 unidades' },
      { name: 'Zucchini', amount: '1 unidad' },
      { name: 'Espinaca', amount: '100 g' },
      { name: 'Queso rallado sin TACC', amount: '50 g' },
      { name: 'Aceite de oliva', amount: '2 cdas' },
      { name: 'Sal, pimienta, nuez moscada', amount: 'A gusto' },
    ],
    steps: [
      'Saltear zucchini en rodajas y espinaca hasta ablandar.',
      'Batir huevos con sal, pimienta y nuez moscada.',
      'Mezclar huevos con verduras y queso.',
      'Cocinar en sartén aceitada tapado a fuego bajo 10 min.',
      'Dar vuelta con cuidado y cocinar 5 min más.',
    ],
    conservation: 'Hasta 3 días en heladera. Se puede comer fría. No congela bien.'
  },
  {
    id: 'r4', emoji: '🥩', name: 'Carne a la plancha con chimichurri',
    time: 20, tags: ['rapido', 'singluten', 'calor', 'finde'],
    ingredients: [
      { name: 'Bife de chorizo o cuadril', amount: '1 kg' },
      { name: 'Ajo', amount: '4 dientes' },
      { name: 'Perejil fresco', amount: '1 atado' },
      { name: 'Orégano', amount: '1 cdita' },
      { name: 'Vinagre de manzana', amount: '2 cdas' },
      { name: 'Aceite de oliva', amount: '4 cdas' },
      { name: 'Sal, ají molido', amount: 'A gusto' },
    ],
    steps: [
      'Mezclar ajo picado, perejil, orégano, vinagre, aceite y ají. Dejar reposar.',
      'Calentar la plancha o parrilla al máximo.',
      'Salar la carne al momento. Cocinar 3-4 min por lado según grosor.',
      'Servir con chimichurri por encima.',
    ],
    conservation: 'Consumir el día o hasta 2 días en heladera. El chimichurri dura 1 semana.'
  },
  {
    id: 'r5', emoji: '🫙', name: 'Pollo marinado y grillado (meal prep)',
    time: 40, tags: ['mealprep', 'singluten', 'fresco'],
    ingredients: [
      { name: 'Pechugas de pollo', amount: '1.5 kg' },
      { name: 'Limón', amount: '2 unidades' },
      { name: 'Ajo', amount: '4 dientes' },
      { name: 'Mostaza sin TACC', amount: '2 cdas' },
      { name: 'Aceite de oliva', amount: '4 cdas' },
      { name: 'Pimentón, sal, pimienta', amount: 'A gusto' },
    ],
    steps: [
      'Preparar marinada: mezclar limón, ajo, mostaza, aceite y especias.',
      'Cubrir el pollo con la marinada y dejar mínimo 30 min (mejor toda la noche).',
      'Cocinar en plancha o sartén caliente 5-6 min por lado.',
      'Dejar enfriar y cortar en tiras. Guardar en porciones.',
    ],
    conservation: 'Hasta 4 días en heladera en recipiente hermético. Congela hasta 2 meses.'
  },
  {
    id: 'r6', emoji: '🥑', name: 'Bowl de arroz con pollo y palta',
    time: 35, tags: ['mealprep', 'singluten', 'calor'],
    ingredients: [
      { name: 'Arroz', amount: '300 g' },
      { name: 'Pechuga de pollo', amount: '600 g' },
      { name: 'Palta', amount: '2 unidades' },
      { name: 'Maíz en lata', amount: '1 lata' },
      { name: 'Limón', amount: '1 unidad' },
      { name: 'Aceite de oliva', amount: '3 cdas' },
      { name: 'Sal, comino, pimentón', amount: 'A gusto' },
    ],
    steps: [
      'Cocinar arroz según indicaciones del paquete. Dejar enfriar.',
      'Condimentar pollo con comino, pimentón, sal. Cocinar en sartén.',
      'Cortar pollo en tiras. Pelar y longuear la palta.',
      'Armar bowls con arroz, pollo, palta y maíz. Rociar con limón.',
    ],
    conservation: 'Guardar arroz y pollo separados. Armar con palta al momento. Dura 3 días.'
  },
  {
    id: 'r7', emoji: '🥬', name: 'Tabulé de quinoa',
    time: 25, tags: ['rapido', 'singluten', 'calor'],
    ingredients: [
      { name: 'Quinoa', amount: '200 g' },
      { name: 'Pepino', amount: '2 unidades' },
      { name: 'Tomate', amount: '3 unidades' },
      { name: 'Cebolla de verdeo', amount: '4 tallos' },
      { name: 'Menta fresca', amount: '1/2 atado' },
      { name: 'Perejil', amount: '1/2 atado' },
      { name: 'Limón', amount: '2 unidades' },
      { name: 'Aceite de oliva', amount: '4 cdas' },
    ],
    steps: [
      'Cocinar quinoa y dejar enfriar completamente.',
      'Picar finamente pepino, tomate, cebolla de verdeo, menta y perejil.',
      'Mezclar todo con la quinoa fría.',
      'Condimentar con jugo de limón, aceite y sal. Refrigerar.',
    ],
    conservation: 'Hasta 3 días en heladera. Mejor al día siguiente.'
  },
  {
    id: 'r8', emoji: '🍳', name: 'Huevos revueltos con vegetales',
    time: 15, tags: ['rapido', 'singluten', 'fresco'],
    ingredients: [
      { name: 'Huevos', amount: '8 unidades' },
      { name: 'Tomate', amount: '2 unidades' },
      { name: 'Cebolla de verdeo', amount: '3 tallos' },
      { name: 'Morrón', amount: '1 unidad' },
      { name: 'Aceite de oliva', amount: '2 cdas' },
      { name: 'Sal y pimienta', amount: 'A gusto' },
    ],
    steps: [
      'Saltear morrón y cebolla de verdeo 3 min.',
      'Agregar tomate en cubos y cocinar 2 min más.',
      'Batir huevos con sal y pimienta. Verter sobre las verduras.',
      'Revolver a fuego bajo hasta que cuajen pero queden cremosos.',
    ],
    conservation: 'Consumir al momento. No apto para prep.'
  },
  // ── OTOÑO / PRIMAVERA (templados) ────────────────────────────────
  {
    id: 'r9', emoji: '🍗', name: 'Pollo al horno con papas',
    time: 70, tags: ['mealprep', 'singluten', 'finde', 'fresco'],
    ingredients: [
      { name: 'Muslos o pechugas de pollo', amount: '1.5 kg' },
      { name: 'Papas', amount: '800 g' },
      { name: 'Aceite de oliva', amount: '4 cdas' },
      { name: 'Ajo', amount: '4 dientes' },
      { name: 'Pimentón ahumado', amount: '1 cdita' },
      { name: 'Sal y pimienta', amount: 'A gusto' },
      { name: 'Romero o tomillo', amount: '1 ramita' },
    ],
    steps: [
      'Precalentar el horno a 200°C.',
      'Cortar las papas en cubos y condimentar con aceite, sal y pimentón.',
      'Condimentar el pollo con ajo picado, aceite, sal, pimienta y hierbas.',
      'Disponer todo en una asadera. Hornear 50-60 min hasta dorar.',
      'Dejar enfriar antes de guardar en porciones.',
    ],
    conservation: 'Hasta 4 días en heladera. Congela hasta 2 meses.'
  },
  {
    id: 'r10', emoji: '🍖', name: 'Carne a la mostaza al horno',
    time: 60, tags: ['mealprep', 'singluten', 'finde', 'fresco'],
    ingredients: [
      { name: 'Peceto o lomo', amount: '1 kg' },
      { name: 'Mostaza sin TACC', amount: '3 cdas' },
      { name: 'Ajo', amount: '3 dientes' },
      { name: 'Romero', amount: '2 ramitas' },
      { name: 'Aceite de oliva', amount: '2 cdas' },
      { name: 'Sal y pimienta', amount: 'A gusto' },
    ],
    steps: [
      'Mezclar mostaza con ajo picado, aceite, sal y pimienta.',
      'Cubrir toda la carne con la mezcla y dejar marinar 30 min mínimo.',
      'Colocar en asadera con ramitas de romero.',
      'Hornear a 180°C: 45-50 min para punto rosa, 60 min para bien cocido.',
      'Reposar 10 min antes de filetear.',
    ],
    conservation: 'Hasta 4 días en heladera fileteada. Congela bien.'
  },
  {
    id: 'r11', emoji: '🍛', name: 'Curry de pollo',
    time: 45, tags: ['mealprep', 'singluten', 'finde', 'fresco'],
    ingredients: [
      { name: 'Pechuga de pollo', amount: '1 kg' },
      { name: 'Leche de coco', amount: '400 ml' },
      { name: 'Cebolla', amount: '1 unidad' },
      { name: 'Ajo', amount: '3 dientes' },
      { name: 'Jengibre fresco', amount: '1 cm' },
      { name: 'Pasta de curry sin TACC', amount: '2 cdas' },
      { name: 'Tomate', amount: '2 unidades' },
      { name: 'Aceite', amount: '2 cdas' },
    ],
    steps: [
      'Saltear cebolla, ajo y jengibre en aceite.',
      'Agregar pasta de curry y mezclar 1 min.',
      'Incorporar pollo en cubos y sellar.',
      'Agregar tomate picado y leche de coco.',
      'Cocinar 25 min a fuego medio revolviendo a veces.',
    ],
    conservation: 'Hasta 4 días en heladera. Congela muy bien.'
  },
  {
    id: 'r12', emoji: '🥚', name: 'Frittata de espinaca y champiñones',
    time: 30, tags: ['rapido', 'singluten', 'fresco'],
    ingredients: [
      { name: 'Huevos', amount: '8 unidades' },
      { name: 'Espinaca', amount: '150 g' },
      { name: 'Champiñones', amount: '200 g' },
      { name: 'Queso cremoso sin TACC', amount: '80 g' },
      { name: 'Ajo', amount: '2 dientes' },
      { name: 'Aceite de oliva', amount: '2 cdas' },
      { name: 'Sal, pimienta, nuez moscada', amount: 'A gusto' },
    ],
    steps: [
      'Saltear ajo, champiñones y espinaca. Salpimentar.',
      'Batir huevos con sal, pimienta y nuez moscada.',
      'Mezclar con las verduras y el queso cremoso en trozos.',
      'Cocinar en sartén a fuego bajo tapado 12 min.',
      'Gratinar 3 min en horno o grill si se desea.',
    ],
    conservation: 'Hasta 3 días en heladera. Se puede comer fría.'
  },
  // ── INVIERNO / FRÍOS ─────────────────────────────────────────────
  {
    id: 'r13', emoji: '🥣', name: 'Sopa crema de zapallo',
    time: 40, tags: ['mealprep', 'singluten', 'frio'],
    ingredients: [
      { name: 'Zapallo', amount: '800 g' },
      { name: 'Papa', amount: '2 unidades' },
      { name: 'Cebolla', amount: '1 unidad' },
      { name: 'Caldo de verduras sin TACC', amount: '1 litro' },
      { name: 'Crema de leche', amount: '100 ml' },
      { name: 'Aceite', amount: '2 cdas' },
      { name: 'Sal, pimienta, nuez moscada', amount: 'A gusto' },
    ],
    steps: [
      'Saltear cebolla en aceite hasta transparentar.',
      'Agregar zapallo y papa en cubos. Cubrir con caldo.',
      'Cocinar 25 min a fuego medio.',
      'Procesar con mixer. Agregar crema y ajustar sal.',
    ],
    conservation: 'Hasta 5 días en heladera. Congela perfectamente (sin crema).'
  },
  {
    id: 'r14', emoji: '🫘', name: 'Lentejas guisadas',
    time: 50, tags: ['mealprep', 'singluten', 'frio'],
    ingredients: [
      { name: 'Lentejas secas', amount: '400 g' },
      { name: 'Cebolla', amount: '1 unidad' },
      { name: 'Morrón rojo', amount: '1 unidad' },
      { name: 'Zanahoria', amount: '2 unidades' },
      { name: 'Tomate', amount: '2 unidades' },
      { name: 'Chorizo colorado sin TACC', amount: '1 unidad' },
      { name: 'Pimentón, comino, sal', amount: 'A gusto' },
    ],
    steps: [
      'Remojar las lentejas 30 min y escurrir.',
      'Saltear cebolla, morrón y zanahoria en aceite.',
      'Agregar chorizo en rodajas y sellar.',
      'Incorporar tomate, especias y lentejas. Cubrir con agua.',
      'Cocinar 30-35 min hasta que estén tiernas.',
    ],
    conservation: 'Hasta 5 días en heladera. Congela perfectamente.'
  },
  {
    id: 'r15', emoji: '🥩', name: 'Carne estofada con verduras',
    time: 90, tags: ['mealprep', 'singluten', 'frio'],
    ingredients: [
      { name: 'Carne de res (osobuco o paleta)', amount: '1.2 kg' },
      { name: 'Cebolla', amount: '2 unidades' },
      { name: 'Zanahoria', amount: '3 unidades' },
      { name: 'Tomates perita', amount: '400 g' },
      { name: 'Caldo de res sin TACC', amount: '500 ml' },
      { name: 'Aceite', amount: '3 cdas' },
      { name: 'Ajo, sal, pimienta, pimentón', amount: 'A gusto' },
    ],
    steps: [
      'Sellar la carne en aceite caliente por todos lados.',
      'Retirar y saltear cebolla y zanahoria en la misma olla.',
      'Agregar tomates, ajo y caldo. Volver a poner la carne.',
      'Cocinar tapado a fuego bajo 60-70 min.',
      'Desmenuzar con tenedor si se desea. Enfriar antes de guardar.',
    ],
    conservation: 'Hasta 5 días en heladera. Congela muy bien hasta 3 meses.'
  },
  {
    id: 'r16', emoji: '🍲', name: 'Cazuela de pollo con vegetales',
    time: 60, tags: ['mealprep', 'singluten', 'frio'],
    ingredients: [
      { name: 'Muslos de pollo', amount: '1.2 kg' },
      { name: 'Papa', amount: '3 unidades' },
      { name: 'Zanahoria', amount: '2 unidades' },
      { name: 'Choclo en rodajas', amount: '1 unidad' },
      { name: 'Cebolla', amount: '1 unidad' },
      { name: 'Caldo de verduras sin TACC', amount: '750 ml' },
      { name: 'Ajo, orégano, sal, pimienta', amount: 'A gusto' },
    ],
    steps: [
      'Sellar los muslos de pollo en aceite caliente.',
      'Saltear cebolla y ajo en la misma olla.',
      'Agregar papa, zanahoria y choclo. Cubrir con caldo.',
      'Incorporar el pollo. Cocinar 40 min tapado a fuego medio.',
      'Ajustar sal y servir con el caldo.',
    ],
    conservation: 'Hasta 4 días en heladera. Congela bien (sin papa).'
  },
  {
    id: 'r17', emoji: '🫕', name: 'Guiso de arroz con carne',
    time: 55, tags: ['mealprep', 'singluten', 'frio'],
    ingredients: [
      { name: 'Carne picada', amount: '600 g' },
      { name: 'Arroz', amount: '250 g' },
      { name: 'Tomate perita', amount: '400 g' },
      { name: 'Cebolla', amount: '1 unidad' },
      { name: 'Morrón', amount: '1 unidad' },
      { name: 'Caldo de carne sin TACC', amount: '500 ml' },
      { name: 'Pimentón, comino, sal', amount: 'A gusto' },
    ],
    steps: [
      'Saltear cebolla y morrón en aceite.',
      'Agregar carne picada y dorar bien.',
      'Incorporar tomate y especias. Cocinar 5 min.',
      'Agregar arroz y caldo. Cocinar 20 min revolviendo.',
      'Ajustar sal y consistencia con agua si hace falta.',
    ],
    conservation: 'Hasta 4 días en heladera. El arroz absorbe líquido al reposar; agregar un poco de agua al calentar.'
  },
  // ── TODO EL AÑO ───────────────────────────────────────────────────
  {
    id: 'r18', emoji: '🥗', name: 'Ensalada de pollo grillado',
    time: 30, tags: ['rapido', 'singluten', 'fresco'],
    ingredients: [
      { name: 'Pechuga de pollo', amount: '600 g' },
      { name: 'Lechuga', amount: '1 planta' },
      { name: 'Tomate', amount: '2 unidades' },
      { name: 'Zanahoria rallada', amount: '1 unidad' },
      { name: 'Limón', amount: '1 unidad' },
      { name: 'Aceite de oliva', amount: '3 cdas' },
      { name: 'Sal, pimienta, orégano', amount: 'A gusto' },
    ],
    steps: [
      'Condimentar el pollo con limón, sal, pimienta y orégano.',
      'Cocinar en plancha 5-6 min por lado.',
      'Dejar reposar y cortar en tiras.',
      'Armar ensalada y colocar el pollo encima. Rociar con aceite y limón.',
    ],
    conservation: 'El pollo dura 3 días en heladera. Armar la ensalada al momento.'
  },
  {
    id: 'r19', emoji: '🍳', name: 'Medallones de pollo caseros',
    time: 35, tags: ['mealprep', 'singluten', 'fresco'],
    ingredients: [
      { name: 'Pechuga de pollo molida o picada', amount: '800 g' },
      { name: 'Huevo', amount: '2 unidades' },
      { name: 'Ajo en polvo', amount: '1 cdita' },
      { name: 'Pimentón', amount: '1 cdita' },
      { name: 'Harina de arroz sin TACC', amount: '3 cdas' },
      { name: 'Sal, pimienta, orégano', amount: 'A gusto' },
      { name: 'Aceite', amount: '3 cdas' },
    ],
    steps: [
      'Mezclar pollo con huevo, especias y harina de arroz.',
      'Formar medallones con las manos húmedas.',
      'Cocinar en sartén con aceite 4-5 min por lado.',
      'Dejar enfriar sobre papel absorbente.',
    ],
    conservation: 'Hasta 4 días en heladera. Congela muy bien (hasta 2 meses).'
  },
  {
    id: 'r20', emoji: '🥦', name: 'Verduras asadas al horno',
    time: 40, tags: ['rapido', 'singluten', 'fresco'],
    ingredients: [
      { name: 'Zucchini', amount: '2 unidades' },
      { name: 'Morrón rojo y amarillo', amount: '2 unidades' },
      { name: 'Berenjena', amount: '1 unidad' },
      { name: 'Cebolla', amount: '1 unidad' },
      { name: 'Aceite de oliva', amount: '4 cdas' },
      { name: 'Ajo en polvo, orégano, sal', amount: 'A gusto' },
    ],
    steps: [
      'Cortar todas las verduras en trozos similares.',
      'Condimentar con aceite, ajo, orégano y sal.',
      'Distribuir en asadera sin superponer.',
      'Hornear a 200°C por 30-35 min, dando vuelta a la mitad.',
    ],
    conservation: 'Hasta 4 días en heladera. Perfectas como guarnición o en ensaladas.'
  },
];

// =============================================
// FIREBASE CONFIG
// =============================================

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBscEOpi1PYAB2r0V2NY0LiR4wntk02X90",
  authDomain: "organizacion-del-hogar.firebaseapp.com",
  projectId: "organizacion-del-hogar",
  storageBucket: "organizacion-del-hogar.firebasestorage.app",
  messagingSenderId: "32562856639",
  appId: "1:32562856639:web:b162dd75308378510d7c0a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(e => {
    console.error('Error al iniciar sesión:', e);
    alert('No se pudo iniciar sesión. Intentá de nuevo.');
  });
}

function signOut() {
  // Unsubscribe all listeners before signing out
  unsubscribeSnapshots.forEach(fn => fn());
  unsubscribeSnapshots = [];
  auth.signOut();
}

// =============================================
// STATE
// =============================================

let state = {
  tasks: {
    lunes: DEFAULT_TASKS.lunes.map(t => ({...t, done: false, custom: false})),
    miercoles: DEFAULT_TASKS.miercoles.map(t => ({...t, done: false, custom: false})),
    viernes: DEFAULT_TASKS.viernes.map(t => ({...t, done: false, custom: false})),
  },
  sessions: {},
  history: [],
  recipes: PRELOADED_RECIPES,
  menuChoice: null,
  notes: { lunes: [], miercoles: [], viernes: [] },
  weekPlan: [],        // up to 3 selected recipe ids for the week
  shoppingList: [],    // [{ id, name, amount, category, checked, recipeId }]
  currentFilter: 'todos',
  currentSearch: '',
};

let clockIntervals = {};
let currentView = 'lunes';
let saveTimeout = null;

// =============================================
// FIREBASE SAVE
// =============================================

// Shared home document — everyone reads/writes same data
function sharedDoc(docName) {
  return db.collection('hogar').doc(docName);
}

async function saveToFirebase() {
  if (!currentUser) return;
  try {
    await sharedDoc('tasks').set(state.tasks);
    await sharedDoc('sessions').set(state.sessions || {});
    await sharedDoc('history').set({ entries: state.history || [] });
    const preloadedIds = new Set(PRELOADED_RECIPES.map(r => r.id));
    const customRecipes = state.recipes.filter(r => !preloadedIds.has(r.id));
    await sharedDoc('customRecipes').set({ recipes: customRecipes });
    await sharedDoc('menuChoice').set(state.menuChoice || {});
    await sharedDoc('notes').set(state.notes || { lunes: [], miercoles: [], viernes: [] });
    await sharedDoc('weekPlan').set({ recipes: state.weekPlan || [], updatedBy: currentUser.displayName || 'Alguien', updatedAt: new Date().toISOString() });
    await sharedDoc('shoppingList').set({ items: state.shoppingList || [] });
  } catch(e) {
    console.error('Error guardando:', e);
  }
}

function save() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveToFirebase(), 800);
}

// =============================================
// FIREBASE ONsnapshot (REALTIME)
// =============================================

function mergeTasksFromFirestore(saved) {
  ['lunes', 'miercoles', 'viernes'].forEach(day => {
    if (saved[day] && Array.isArray(saved[day]) && saved[day].length > 0) {
      const defaultIds = new Set(DEFAULT_TASKS[day].map(t => t.id));
      const savedMap = {};
      saved[day].forEach(t => savedMap[t.id] = t);
      const merged = DEFAULT_TASKS[day].map(t => ({
        ...t,
        done: savedMap[t.id]?.done || false,
        custom: false
      }));
      saved[day].filter(t => !defaultIds.has(t.id)).forEach(t => merged.push(t));
      state.tasks[day] = merged;
    }
  });
}

function setupRealtimeListeners() {
  unsubscribeSnapshots.forEach(fn => fn());
  unsubscribeSnapshots = [];

  // TASKS
  const unsubTasks = sharedDoc('tasks').onSnapshot(snap => {
    if (snap.exists) mergeTasksFromFirestore(snap.data());
    else saveToFirebase();
    ['lunes', 'miercoles', 'viernes'].forEach(day => renderTasks(day));
    ['lunes', 'miercoles', 'viernes'].forEach(day => checkNotification(day));
  }, e => console.error('tasks snapshot error:', e));
  unsubscribeSnapshots.push(unsubTasks);

  // SESSIONS
  const unsubSess = sharedDoc('sessions').onSnapshot(snap => {
    if (snap.exists) {
      const remoteSessions = snap.data();
      ['lunes', 'miercoles', 'viernes'].forEach(day => {
        if (!clockIntervals[day]) state.sessions[day] = remoteSessions[day] || null;
      });
      ['lunes', 'miercoles', 'viernes'].forEach(day => {
        if (state.sessions[day] && state.sessions[day].running && !clockIntervals[day]) {
          document.getElementById('start-btn-' + day).style.display = 'none';
          document.getElementById('clock-' + day).style.display = 'grid';
          tickClock(day);
          clockIntervals[day] = setInterval(() => tickClock(day), 1000);
        }
      });
    }
  }, e => console.error('sessions error:', e));
  unsubscribeSnapshots.push(unsubSess);

  // HISTORY
  const unsubHist = sharedDoc('history').onSnapshot(snap => {
    if (snap.exists) state.history = snap.data().entries || [];
    if (currentView === 'historial') renderHistory();
  }, e => console.error('history error:', e));
  unsubscribeSnapshots.push(unsubHist);

  // CUSTOM RECIPES
  const unsubRecipes = sharedDoc('customRecipes').onSnapshot(snap => {
    if (snap.exists) {
      const custom = snap.data().recipes || [];
      state.recipes = [...PRELOADED_RECIPES, ...custom];
    }
    if (currentView === 'menu') renderMenu();
  }, e => console.error('recipes error:', e));
  unsubscribeSnapshots.push(unsubRecipes);

  // MENU CHOICE
  const unsubMenu = sharedDoc('menuChoice').onSnapshot(snap => {
    if (snap.exists && snap.data().day) state.menuChoice = snap.data();
    ['lunes', 'miercoles', 'viernes'].forEach(day => checkNotification(day));
  }, e => console.error('menuChoice error:', e));
  unsubscribeSnapshots.push(unsubMenu);

  // NOTES
  const unsubNotes = sharedDoc('notes').onSnapshot(snap => {
    if (snap.exists) state.notes = snap.data();
    ['lunes', 'miercoles', 'viernes'].forEach(day => renderNotes(day));
  }, e => console.error('notes error:', e));
  unsubscribeSnapshots.push(unsubNotes);

  // WEEK PLAN
  const unsubPlan = sharedDoc('weekPlan').onSnapshot(snap => {
    if (snap.exists) {
      state.weekPlan = snap.data().recipes || [];
      state.weekPlanMeta = { updatedBy: snap.data().updatedBy, updatedAt: snap.data().updatedAt };
    }
    if (currentView === 'plan') renderPlan();
  }, e => console.error('weekPlan error:', e));
  unsubscribeSnapshots.push(unsubPlan);

  // SHOPPING LIST
  const unsubShopping = sharedDoc('shoppingList').onSnapshot(snap => {
    if (snap.exists) state.shoppingList = snap.data().items || [];
    if (currentView === 'compras') renderShoppingList();
  }, e => console.error('shoppingList error:', e));
  unsubscribeSnapshots.push(unsubShopping);
}

// =============================================
// NAVIGATION
// =============================================

function showView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => {
    if (t.textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(view.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''))) {
      t.classList.add('active');
    }
  });
  currentView = view;
  if (view === 'menu') renderMenu();
  if (view === 'historial') renderHistory();
  if (view === 'compras') renderShoppingList();
  if (view === 'plan') { window._pickingSlot = undefined; renderPlan(); }
}

// =============================================
// TASKS
// =============================================

function getDayColor(day) {
  return day === 'lunes' ? 'var(--lunes)' : day === 'miercoles' ? 'var(--miercoles)' : 'var(--viernes)';
}

function renderTasks(day) {
  const tasks = state.tasks[day];
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((done/total)*100) : 0;
  const color = getDayColor(day);

  document.getElementById('progress-' + day).innerHTML = `
    <div class="day-progress" style="margin-bottom:20px">
      <div class="progress-label">Progreso</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <div class="progress-count" style="color:${color}">${done}/${total}</div>
    </div>
  `;

  const cats = {};
  tasks.forEach(t => {
    if (!cats[t.cat]) cats[t.cat] = [];
    cats[t.cat].push(t);
  });

  let html = '';
  for (const [cat, items] of Object.entries(cats)) {
    const catInfo = CATEGORIES[cat] || { label: cat, icon: '📌' };
    html += `<div class="category-section">
      <div class="category-header">
        <span class="category-icon">${catInfo.icon}</span>
        <span class="category-name">${catInfo.label}</span>
      </div>
      <ul class="task-list">`;
    items.forEach(t => {
      html += `<li class="task-item ${t.done ? 'done' : ''}" id="task-li-${t.id}">
        <div class="task-check" onclick="toggleTask('${day}','${t.id}')">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="task-text" onclick="toggleTask('${day}','${t.id}')">${t.text}</span>
        ${t.menuLinked ? '<span class="task-tag tag-menu">🍽 Menú</span>' : ''}
        <div class="task-actions">
          <button class="task-action-btn" onclick="editTask('${day}','${t.id}')" title="Editar">✏️</button>
          <button class="task-action-btn task-action-delete" onclick="deleteTask('${day}','${t.id}')" title="Eliminar">🗑</button>
        </div>
      </li>`;
    });
    html += `</ul>
      <div class="add-task-row">
        <input class="task-input" id="new-task-${day}-${cat}" placeholder="Agregar tarea de ${catInfo.label.toLowerCase()}..." onkeydown="if(event.key==='Enter')addTask('${day}','${cat}','${day}-${cat}')"/>
        <button class="btn-add" onclick="addTask('${day}','${cat}','${day}-${cat}')">+</button>
      </div>
    </div>`;
  }

  document.getElementById('tasks-' + day).innerHTML = html;

  if (done === total && total > 0) {
    document.getElementById('tasks-' + day).insertAdjacentHTML('afterbegin', `
      <div class="summary-banner" style="margin-bottom:20px">
        <div class="summary-icon">🎉</div>
        <div class="summary-text">
          <h3>¡Todas las tareas completadas!</h3>
          <p>Excelente jornada. Podés finalizar el reloj cuando te vayas.</p>
        </div>
      </div>
    `);
  }
}

function toggleTask(day, id) {
  const task = state.tasks[day].find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    save();
    renderTasks(day);
  }
}

function addTask(day, cat, inputId) {
  const input = document.getElementById('new-task-' + inputId);
  const text = input.value.trim();
  if (!text) return;
  const newId = day[0] + Date.now();
  state.tasks[day].push({ id: newId, cat, icon: '📌', text, done: false, custom: true });
  input.value = '';
  save();
  renderTasks(day);
}

function editTask(day, id) {
  const task = state.tasks[day].find(t => t.id === id);
  if (!task) return;
  const li = document.getElementById('task-li-' + id);
  if (!li) return;
  const textEl = li.querySelector('.task-text');
  const currentText = task.text;
  // Replace text span with inline input
  textEl.outerHTML = `<input class="task-input task-edit-input" id="edit-input-${id}" value="${currentText.replace(/"/g, '&quot;')}"
    onkeydown="if(event.key==='Enter')saveEditTask('${day}','${id}');if(event.key==='Escape')renderTasks('${day}')"
    style="flex:1;margin:0 8px" />
    <button class="btn btn-primary" style="padding:6px 12px;font-size:12px" onclick="saveEditTask('${day}','${id}')">✓</button>`;
  const input = document.getElementById('edit-input-' + id);
  if (input) { input.focus(); input.select(); }
}

function saveEditTask(day, id) {
  const input = document.getElementById('edit-input-' + id);
  if (!input) return;
  const newText = input.value.trim();
  if (!newText) return;
  const task = state.tasks[day].find(t => t.id === id);
  if (task) { task.text = newText; save(); renderTasks(day); }
}

function deleteTask(day, id) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  state.tasks[day] = state.tasks[day].filter(t => t.id !== id);
  save();
  renderTasks(day);
}

function resetDay(day) {
  if (!confirm('¿Resetear todas las tareas de este día?')) return;
  state.tasks[day] = state.tasks[day].map(t => ({...t, done: false}));
  save();
  renderTasks(day);
}

// =============================================
// CLOCK
// =============================================

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function getEndOfSession(day) {
  // Returns the 13:00 of the current day if before 13:00, else today's 13:00 as fallback
  // But primarily: returns 13:00 of whatever day was passed
  const now = new Date();
  const end = new Date(now);
  end.setHours(13, 0, 0, 0);
  // If 13:00 already passed today, show time since 13:00 (overtime)
  return end;
}

function startSession(day) {
  if (state.sessions[day] && state.sessions[day].running) return;
  const now = Date.now();
  state.sessions[day] = { start: now, running: true, elapsed: 0 };
  save();
  document.getElementById('start-btn-' + day).style.display = 'none';
  document.getElementById('clock-' + day).style.display = 'grid';
  tickClock(day);
  clockIntervals[day] = setInterval(() => tickClock(day), 1000);
}

function tickClock(day) {
  const session = state.sessions[day];
  if (!session || !session.running) return;
  const elapsed = Date.now() - session.start;

  // Calculate end of session: 13:00 on the day session was started
  const startDate = new Date(session.start);
  const endTime = new Date(startDate);
  endTime.setHours(13, 0, 0, 0);
  // If session started after 13:00, end is 5 hours after start
  if (endTime.getTime() <= session.start) endTime.setTime(session.start + 5 * 60 * 60 * 1000);
  const remaining = endTime.getTime() - Date.now();

  const elEl = document.getElementById('elapsed-' + day);
  const remEl = document.getElementById('remaining-' + day);

  if (!elEl) return;

  elEl.textContent = formatTime(elapsed);

  if (remaining <= 0) {
    elEl.className = 'clock-time critical';
    remEl.className = 'clock-remaining critical';
    const overtime = Math.abs(remaining);
    remEl.innerHTML = `Tiempo extra: <span>+${formatTime(overtime)}</span>`;
  } else if (remaining < 30 * 60 * 1000) {
    elEl.className = 'clock-time critical';
    remEl.className = 'clock-remaining critical';
    remEl.innerHTML = `Tiempo restante: <span>${formatTime(remaining)}</span>`;
  } else if (remaining < 60 * 60 * 1000) {
    elEl.className = 'clock-time warning';
    remEl.className = 'clock-remaining warning';
    remEl.innerHTML = `Tiempo restante: <span>${formatTime(remaining)}</span>`;
  } else {
    elEl.className = 'clock-time';
    remEl.className = 'clock-remaining';
    remEl.innerHTML = `Tiempo restante hasta las 13:00: <span>${formatTime(remaining)}</span>`;
  }
}

function endSession(day) {
  const session = state.sessions[day];
  if (!session) return;
  clearInterval(clockIntervals[day]);
  const elapsed = Date.now() - session.start;
  const tasks = state.tasks[day];
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;

  // Save to history
  const entry = {
    id: Date.now(),
    day,
    date: new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    elapsed,
    doneTasks: done,
    totalTasks: total,
    finishedOnTime: elapsed <= 5 * 60 * 60 * 1000,
  };
  state.history.unshift(entry);
  state.sessions[day] = null;
  save();
  document.getElementById('clock-' + day).style.display = 'none';
  document.getElementById('start-btn-' + day).style.display = '';
  renderTasks(day);
  alert(`✅ Jornada finalizada.\nTiempo trabajado: ${formatTime(elapsed)}\nTareas completadas: ${done}/${total}`);
}

// =============================================
// NOTIFICATION (day before)
// =============================================

function checkNotification(day) {
  const today = new Date().getDay(); // 0=dom,1=lun,2=mar,3=mie,4=jue,5=vie,6=sab
  // Show notif if today is the day before the work day
  const prevDay = { lunes: 0, miercoles: 2, viernes: 4 };
  const container = document.getElementById('notif-' + day);
  if (!container) return;

  if (today === prevDay[day]) {
    const recs = getRecommendedRecipes(day);
    const chosen = state.menuChoice && state.menuChoice.day === day ? state.menuChoice.recipeId : null;
    renderNotif(container, day, recs, chosen);
  } else {
    container.innerHTML = '';
  }
}

function getRecommendedRecipes(day) {
  const season = getCurrentSeason();
  const maxTime = { lunes: 90, miercoles: 50, viernes: 90 };
  const limit = maxTime[day] || 90;

  // What was cooked recently (last 2 weeks)
  const recentRecipeIds = new Set(
    (state.history || [])
      .filter(h => h.recipeId && (Date.now() - new Date(h.date)) < 14 * 24 * 3600 * 1000)
      .map(h => h.recipeId)
  );
  const plannedIds = new Set(state.weekPlan || []);

  let pool = state.recipes.filter(r => {
    if (r.tags.includes('frio') && (season === 'verano' || season === 'primavera')) return false;
    if (r.tags.includes('calor') && (season === 'invierno' || season === 'otono')) return false;
    if (r.time > limit) return false;
    return true;
  });

  // Deterministic seed based on day of week so options don't change on reload
  const daySeed = new Date().getDay() * 1000 + ['lunes','miercoles','viernes'].indexOf(day);
  const seededRandom = (i) => ((daySeed * 9301 + i * 49297 + 233280) % 233280) / 233280;

  const scored = pool.map((r, i) => {
    let score = seededRandom(i) * 0.4; // small stable variety
    if (day === 'lunes' && r.tags.includes('mealprep')) score += 3;
    if (day === 'miercoles' && r.tags.includes('rapido')) score += 3;
    if (day === 'viernes' && (r.tags.includes('mealprep') || r.tags.includes('finde'))) score += 3;
    if (recentRecipeIds.has(r.id)) score -= 4;
    if (plannedIds.has(r.id)) score -= 5;
    return { r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(s => s.r);
}

function renderNotif(container, day, recs, chosenId) {
  const dayLabels = { lunes: 'el lunes', miercoles: 'el miércoles', viernes: 'el viernes' };
  // Store recs in dataset so chooseMenuOption can re-render without re-randomizing
  container.dataset.recs = JSON.stringify(recs);
  const chosenRecipe = state.recipes.find(r => r.id === chosenId);
  container.innerHTML = `
    <div class="notif-banner">
      <div class="notif-header">
        <span class="notif-icon">🔔</span>
        <div>
          <div class="notif-title">¡Mañana trabajás! Elegí qué cocinar ${dayLabels[day]}</div>
          <div class="notif-subtitle">Recomendaciones según estación, tiempo disponible y lo cocinado recientemente.</div>
        </div>
      </div>
      <div class="menu-options">
        ${recs.map(r => `
          <div class="menu-option-card ${chosenId === r.id ? 'selected' : ''}" onclick="chooseMenuOption('${day}','${r.id}',this)">
            <div style="font-size:1.5rem;margin-bottom:6px">${r.emoji}</div>
            <div class="menu-option-name">${r.name}</div>
            <div class="menu-option-time">⏱ ${r.time} min</div>
            <span class="menu-option-tag">${r.tags.includes('mealprep') ? 'Meal prep' : 'Plato fresco'}</span>
          </div>
        `).join('')}
      </div>
      ${chosenId && chosenRecipe ? `
        <div class="notif-confirm" style="margin-top:14px">
          <span style="color:var(--success);font-weight:700">✓ Elegiste: ${chosenRecipe.emoji} ${chosenRecipe.name}</span>
          <button class="btn btn-ghost" onclick="addMenuToTasks('${day}','${chosenId}')">Agregar a tareas del día</button>
        </div>
      ` : ''}
    </div>
  `;
}

function chooseMenuOption(day, recipeId, el) {
  document.querySelectorAll('#notif-' + day + ' .menu-option-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const recipe = state.recipes.find(r => r.id === recipeId);
  state.menuChoice = { day, recipeId, recipeName: recipe?.name || '', recipeEmoji: recipe?.emoji || '' };
  save();
  const container = document.getElementById('notif-' + day);
  const recs = JSON.parse(container.dataset.recs || 'null') || getRecommendedRecipes(day);
  renderNotif(container, day, recs, recipeId);
}

function addMenuToTasks(day, recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;
  const already = state.tasks[day].find(t => t.menuLinked && t.recipeId === recipeId);
  if (already) { alert('Esta receta ya está en las tareas.'); return; }
  const newTask = {
    id: 'm' + Date.now(),
    cat: 'cocina',
    icon: recipe.emoji,
    text: `Preparar: ${recipe.name}`,
    done: false,
    custom: true,
    menuLinked: true,
    recipeId
  };
  state.tasks[day].push(newTask);
  save();
  renderTasks(day);
  alert(`✅ "${recipe.name}" agregada a las tareas de cocina del ${day}.`);
}

// =============================================
// MENU VIEW
// =============================================

function setFilter(filter, btn) {
  state.currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderMenu();
}

function filterRecipes(val) {
  state.currentSearch = val;
  renderMenu();
}

function renderMenu() {
  // Season badge
  const season = getCurrentSeason();
  const seasonInfo = { verano: ['🌞 Verano', 'rgba(212,168,71,0.2)', 'var(--gold)'], otono: ['🍂 Otoño', 'rgba(200,105,58,0.2)', 'var(--lunes)'], invierno: ['❄️ Invierno', 'rgba(100,160,220,0.2)', '#7AB8E8'], primavera: ['🌸 Primavera', 'rgba(107,191,142,0.2)', 'var(--success)'] };
  const [label, bg, color] = seasonInfo[season];
  const badge = document.getElementById('season-badge');
  if (badge) { badge.textContent = label; badge.style.background = bg; badge.style.color = color; }
  renderRecipeGrid();
  renderTodayRec();
}

function renderTodayRec() {
  const today = new Date().getDay();
  const dayMap = { 1: 'lunes', 3: 'miercoles', 5: 'viernes' };
  const todayKey = dayMap[today];
  const container = document.getElementById('today-rec');
  if (!todayKey) { container.innerHTML = ''; return; }
  const recs = getRecommendedRecipes(todayKey);
  container.innerHTML = `
    <div style="margin-bottom:10px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold)">
      ⭐ Recomendados para hoy (${todayKey})
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">
      ${recs.map(r => `<span class="recommend-badge" onclick="openRecipe('${r.id}')" style="cursor:pointer">${r.emoji} ${r.name}</span>`).join('')}
    </div>
  `;
}

function renderRecipeGrid() {
  const grid = document.getElementById('recipes-grid');
  let recipes = state.recipes;
  if (state.currentFilter !== 'todos') recipes = recipes.filter(r => r.tags.includes(state.currentFilter));
  if (state.currentSearch) {
    const s = state.currentSearch.toLowerCase();
    recipes = recipes.filter(r => r.name.toLowerCase().includes(s));
  }

  if (!recipes.length) {
    grid.innerHTML = '<p style="color:var(--muted);padding:20px">No se encontraron recetas.</p>';
    return;
  }

  grid.innerHTML = recipes.map(r => `
    <div class="recipe-card" onclick="openRecipe('${r.id}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="recipe-emoji">${r.emoji}</div>
        <div class="recipe-card-actions" onclick="event.stopPropagation()">
          <button class="task-action-btn" onclick="openEditRecipeModal('${r.id}')" title="Editar">✏️</button>
          <button class="task-action-btn task-action-delete" onclick="deleteRecipe('${r.id}')" title="Eliminar">🗑</button>
        </div>
      </div>
      <div class="recipe-name">${r.name}</div>
      <div class="recipe-meta">
        <span>⏱ ${r.time} min</span>
        <span>🥄 ${r.ingredients.length} ingredientes</span>
      </div>
      <div class="recipe-chips">
        ${r.tags.includes('mealprep') ? '<span class="recipe-chip chip-mealprep">Meal prep</span>' : ''}
        ${r.tags.includes('rapido') ? '<span class="recipe-chip chip-rapido">Rápido</span>' : ''}
        ${r.tags.includes('finde') ? '<span class="recipe-chip chip-finde">Fin de semana</span>' : ''}
        ${r.tags.includes('singluten') ? '<span class="recipe-chip chip-singluten">Sin gluten</span>' : ''}
        ${r.tags.includes('calor') ? '<span class="recipe-chip chip-calor">🌞 Verano</span>' : ''}
        ${r.tags.includes('frio') ? '<span class="recipe-chip chip-frio">🧥 Invierno</span>' : ''}
        ${r.tags.includes('fresco') ? '<span class="recipe-chip chip-fresco">🍃 Todo el año</span>' : ''}
      </div>
    </div>
  `).join('');
}

function openRecipe(id) {
  const recipe = state.recipes.find(r => r.id === id);
  if (!recipe) return;
  document.getElementById('menu-list-view').style.display = 'none';
  document.getElementById('menu-detail-view').classList.add('active');

  const today = new Date().getDay();
  const dayMap = { 1: 'lunes', 3: 'miercoles', 5: 'viernes' };
  const todayKey = dayMap[today];
  const alreadyAdded = todayKey && state.tasks[todayKey].find(t => t.menuLinked && t.recipeId === id);

  document.getElementById('recipe-detail-content').innerHTML = `
    <div class="recipe-detail-header">
      <div class="recipe-detail-emoji">${recipe.emoji}</div>
      <div class="recipe-detail-title">${recipe.name}</div>
      <div class="recipe-detail-meta">
        <span>⏱ <strong>${recipe.time} min</strong></span>
        <span>🥄 <strong>${recipe.ingredients.length} ingredientes</strong></span>
        <span>${recipe.tags.map(t => {
          const labels = { mealprep: 'Meal prep', rapido: 'Rápido', finde: 'Fin de semana', singluten: 'Sin gluten', calor: '🌞 Verano', frio: '🧥 Invierno', fresco: '🍃 Todo el año' };
          return `<span class="recipe-chip chip-${t}" style="vertical-align:middle">${labels[t] || t}</span>`;
        }).join(' ')}</span>
      </div>
    </div>

    <div class="recipe-section">
      <div class="recipe-section-title">Ingredientes</div>
      <ul class="ingredients-list">
        ${recipe.ingredients.map(i => `
          <li class="ingredient-item">
            <span class="ingredient-name">${i.name}</span>
            <span class="ingredient-amount">${i.amount}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="recipe-section">
      <div class="recipe-section-title">Preparación paso a paso</div>
      <ol class="steps-list">
        ${recipe.steps.map((s, i) => `
          <li class="step-item">
            <div class="step-num">${i + 1}</div>
            <div class="step-text">${s}</div>
          </li>
        `).join('')}
      </ol>
    </div>

    <div class="recipe-section">
      <div class="recipe-section-title">Conservación</div>
      <div class="conservation-box">🧊 ${recipe.conservation}</div>
    </div>

    ${todayKey ? `
      <button class="add-to-day-btn" onclick="addMenuToTasks('${todayKey}','${id}')" ${alreadyAdded ? 'disabled' : ''}>
        ${alreadyAdded ? '✓ Ya está en las tareas de hoy' : `+ Agregar a las tareas de ${todayKey}`}
      </button>
    ` : ''}
  `;
}

function closeRecipeDetail() {
  document.getElementById('menu-list-view').style.display = '';
  document.getElementById('menu-detail-view').classList.remove('active');
}

// =============================================
// ADD RECIPE MODAL
// =============================================

function openAddRecipeModal() {
  // Clear form for new recipe
  document.getElementById('r-name').value = '';
  document.getElementById('r-emoji').value = '';
  document.getElementById('r-time').value = '';
  document.getElementById('r-mealprep').checked = false;
  document.getElementById('r-rapido').checked = false;
  document.getElementById('r-finde').checked = false;
  document.getElementById('r-sg').checked = true;
  document.getElementById('r-ingredients').value = '';
  document.getElementById('r-steps').value = '';
  document.getElementById('r-storage').value = '';
  document.getElementById('r-edit-id').value = '';
  document.querySelector('#add-recipe-modal .modal-title').textContent = 'Nueva receta';
  document.getElementById('add-recipe-modal').classList.add('open');
}

function closeAddRecipeModal() {
  document.getElementById('add-recipe-modal').classList.remove('open');
}

function openEditRecipeModal(id) {
  const recipe = state.recipes.find(r => r.id === id);
  if (!recipe) return;
  document.getElementById('r-name').value = recipe.name;
  document.getElementById('r-emoji').value = recipe.emoji;
  document.getElementById('r-time').value = recipe.time;
  document.getElementById('r-mealprep').checked = recipe.tags.includes('mealprep');
  document.getElementById('r-rapido').checked = recipe.tags.includes('rapido');
  document.getElementById('r-finde').checked = recipe.tags.includes('finde');
  document.getElementById('r-sg').checked = recipe.tags.includes('singluten');
  document.getElementById('r-ingredients').value = recipe.ingredients.map(i => `${i.name} ${i.amount}`).join('\n');
  document.getElementById('r-steps').value = recipe.steps.join('\n');
  document.getElementById('r-storage').value = recipe.conservation;
  document.getElementById('r-edit-id').value = id;
  document.querySelector('#add-recipe-modal .modal-title').textContent = 'Editar receta';
  document.getElementById('add-recipe-modal').classList.add('open');
}

function deleteRecipe(id) {
  if (!confirm('¿Eliminar esta receta?')) return;
  state.recipes = state.recipes.filter(r => r.id !== id);
  save();
  renderMenu();
}

function saveNewRecipe() {
  const name = document.getElementById('r-name').value.trim();
  const emoji = document.getElementById('r-emoji').value.trim() || '🍽️';
  const time = parseInt(document.getElementById('r-time').value) || 30;
  const tags = [];
  if (document.getElementById('r-mealprep').checked) tags.push('mealprep');
  if (document.getElementById('r-rapido').checked) tags.push('rapido');
  if (document.getElementById('r-finde').checked) tags.push('finde');
  if (document.getElementById('r-sg').checked) tags.push('singluten');

  const ingredients = document.getElementById('r-ingredients').value.trim().split('\n').filter(Boolean).map(line => {
    const parts = line.trim().split(/\s+/);
    const amount = parts.slice(-1)[0];
    const n = parts.slice(0, -1).join(' ');
    return { name: n || line, amount };
  });

  const steps = document.getElementById('r-steps').value.trim().split('\n').filter(Boolean);
  const conservation = document.getElementById('r-storage').value.trim() || 'Consultar según ingredientes.';

  if (!name) { alert('Ingresá el nombre de la receta.'); return; }

  const editId = document.getElementById('r-edit-id').value;
  if (editId) {
    // Edit existing
    const idx = state.recipes.findIndex(r => r.id === editId);
    if (idx !== -1) {
      state.recipes[idx] = { ...state.recipes[idx], emoji, name, time, tags, ingredients, steps, conservation };
    }
  } else {
    // New recipe
    const recipe = { id: 'c' + Date.now(), emoji, name, time, tags, ingredients, steps, conservation };
    state.recipes.push(recipe);
  }

  save();
  closeAddRecipeModal();
  renderMenu();
}

// =============================================
// HISTORY
// =============================================

function renderHistory() {
  const container = document.getElementById('history-entries');
  const overview = document.getElementById('history-overview-stats');

  if (!state.history.length) {
    overview.innerHTML = '';
    container.innerHTML = `
      <div class="history-empty">
        <div class="icon">📊</div>
        <p>Todavía no hay jornadas registradas.<br>Iniciá el reloj cuando llegues y finalizalo cuando te vayas.</p>
      </div>
    `;
    return;
  }

  // Overview stats
  const totalSessions = state.history.length;
  const avgElapsed = state.history.reduce((a, e) => a + e.elapsed, 0) / totalSessions;
  const avgCompletion = state.history.reduce((a, e) => a + (e.doneTasks / (e.totalTasks || 1)), 0) / totalSessions;
  const onTime = state.history.filter(e => e.finishedOnTime).length;

  overview.innerHTML = `
    <div class="history-overview">
      <div class="overview-card">
        <div class="overview-value">${totalSessions}</div>
        <div class="overview-label">Jornadas registradas</div>
      </div>
      <div class="overview-card">
        <div class="overview-value">${formatTime(avgElapsed)}</div>
        <div class="overview-label">Tiempo promedio</div>
      </div>
      <div class="overview-card">
        <div class="overview-value">${Math.round(avgCompletion * 100)}%</div>
        <div class="overview-label">Tareas completadas (prom.)</div>
      </div>
      <div class="overview-card">
        <div class="overview-value">${onTime}/${totalSessions}</div>
        <div class="overview-label">Jornadas en tiempo</div>
      </div>
    </div>
    <div class="section-title-main">Registro de jornadas</div>
  `;

  container.innerHTML = state.history.map(entry => {
    const pct = Math.round((entry.doneTasks / (entry.totalTasks || 1)) * 100);
    const timeClass = entry.finishedOnTime ? 'stat-good' : 'stat-warn';
    const labelClass = `label-${entry.day}`;
    return `
      <div class="history-entry">
        <div class="history-entry-header">
          <div class="history-date">${entry.date}</div>
          <span class="history-day-label ${labelClass}">${entry.day}</span>
        </div>
        <div class="history-stats">
          <div class="stat-box">
            <div class="stat-value ${timeClass}">${formatTime(entry.elapsed)}</div>
            <div class="stat-label">Tiempo trabajado</div>
          </div>
          <div class="stat-box">
            <div class="stat-value ${pct === 100 ? 'stat-good' : pct >= 70 ? 'stat-warn' : 'stat-bad'}">${pct}%</div>
            <div class="stat-label">Tareas completadas</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${entry.doneTasks}/${entry.totalTasks}</div>
            <div class="stat-label">Tareas hechas</div>
          </div>
          <div class="stat-box">
            <div class="stat-value ${entry.finishedOnTime ? 'stat-good' : 'stat-bad'}">${entry.finishedOnTime ? '✓' : '✗'}</div>
            <div class="stat-label">Terminó antes de las 13:00</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function clearHistory() {
  if (!confirm('¿Borrar todo el historial?')) return;
  state.history = [];
  save();
  renderHistory();
}

// =============================================
// AI RECOMMENDATIONS (Claude API)
// =============================================

async function getAIRecommendations() {
  const btn = document.getElementById('ai-rec-btn');
  const result = document.getElementById('ai-rec-result');
  btn.disabled = true;
  btn.textContent = '✨ Consultando IA...';
  result.innerHTML = '';

  // Build context from history and existing recipes
  const season = getCurrentSeason();
  const seasonLabels = { verano: 'verano', otono: 'otoño', invierno: 'invierno', primavera: 'primavera' };
  const recentHistory = state.history.slice(0, 10);
  const existingNames = state.recipes.map(r => r.name).join(', ');

  const prompt = `Sos un asistente de cocina para una familia argentina de 4 personas. 
Actualmente es ${seasonLabels[season]} en Buenos Aires.
Las recetas que ya tienen son: ${existingNames}.
Historial reciente de jornadas (${recentHistory.length} registros): ${JSON.stringify(recentHistory.map(h => ({ dia: h.day, fecha: h.date, tareasCompletas: h.doneTasks + '/' + h.totalTasks })))}.

Sugerí 3 recetas nuevas que NO estén ya en su lista, apropiadas para la estación, sin TACC (sin gluten), que sean prácticas para meal prep o rápidas de preparar. 
Para cada receta incluí: nombre, emoji, tiempo en minutos, tags (mealprep/rapido/finde/singluten/calor/frio/fresco), ingredientes con cantidades para 4 personas, pasos, y cómo conservarla.
Respondé SOLO con un JSON array con esta estructura exacta, sin texto extra:
[{"name":"...","emoji":"...","time":30,"tags":["mealprep","singluten"],"ingredients":[{"name":"...","amount":"..."}],"steps":["..."],"conservation":"..."}]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.map(c => c.text || '').join('') || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const recipes = JSON.parse(clean);

    result.innerHTML = `
      <div style="background:linear-gradient(135deg,#fdf8e8,#f5edcc);border:1px solid var(--gold);border-radius:16px;padding:20px 24px;margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:14px">✨ Sugerencias de la IA para este ${seasonLabels[season]}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
          ${recipes.map((r, i) => `
            <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px">
              <div style="font-size:1.8rem;margin-bottom:6px">${r.emoji}</div>
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${r.name}</div>
              <div style="font-size:12px;color:var(--muted);margin-bottom:8px">⏱ ${r.time} min · ${r.ingredients.length} ingredientes</div>
              <button onclick="addAIRecipe(${i})" style="width:100%;padding:8px;border-radius:8px;border:none;background:var(--gold);color:#fff;font-weight:700;font-size:12px;cursor:pointer">+ Agregar al menú</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Store suggestions temporarily
    window._aiSuggestions = recipes;

  } catch(e) {
    result.innerHTML = `<div style="color:var(--danger);padding:12px;font-size:13px">No se pudo obtener sugerencias. Intentá de nuevo.</div>`;
    console.error('AI error:', e);
  }

  btn.disabled = false;
  btn.textContent = '✨ Sugerir con IA';
}

function addAIRecipe(index) {
  const recipe = window._aiSuggestions?.[index];
  if (!recipe) return;
  const newRecipe = { id: 'ai' + Date.now() + index, ...recipe };
  state.recipes.push(newRecipe);
  save();
  renderMenu();
  document.getElementById('ai-rec-result').innerHTML = `<div style="color:var(--success);padding:8px 0;font-size:13px;font-weight:700">✓ "${recipe.name}" agregada al menú</div>`;
}

window.getAIRecommendations = getAIRecommendations;
window.addAIRecipe = addAIRecipe;

function init() {
  // Register service worker for offline/PWA support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Safety timeout — if auth doesn't respond in 5s, show login screen
  const authTimeout = setTimeout(() => {
    document.getElementById('loading-overlay').style.display = 'none';
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('loading-msg').textContent = 'Conectando...';
  }, 5000);

  // Auth state observer
  auth.onAuthStateChanged(async user => {
    clearTimeout(authTimeout);
    if (user) {
      currentUser = user;
      document.getElementById('auth-overlay').style.display = 'none';
      document.getElementById('loading-overlay').style.display = 'flex';
      document.getElementById('loading-msg').textContent = `Hola, ${user.displayName?.split(' ')[0] || 'bienvenida'} 👋`;

      const brand = document.getElementById('nav-brand');
      if (brand) brand.innerHTML = `🏠 Casa &nbsp;<span style="font-size:11px;color:var(--muted);font-family:'Lato',sans-serif;font-weight:400">${user.displayName?.split(' ')[0] || ''}</span> <button onclick="signOut()" style="margin-left:8px;font-size:10px;background:none;border:1px solid var(--border);border-radius:6px;padding:2px 8px;cursor:pointer;color:var(--muted);font-family:'Lato',sans-serif">Salir</button>`;

      setupRealtimeListeners();

      setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
        ['lunes', 'miercoles', 'viernes'].forEach(day => {
          renderTasks(day);
          checkNotification(day);
        });
      }, 1500);

    } else {
      currentUser = null;
      unsubscribeSnapshots.forEach(fn => fn());
      unsubscribeSnapshots = [];
      document.getElementById('loading-overlay').style.display = 'none';
      document.getElementById('auth-overlay').style.display = 'flex';
    }
  });
}

// =============================================
// NOTES PER DAY
// =============================================

function renderNotes(day) {
  const el = document.getElementById('notes-list-' + day);
  if (!el) return;
  const notes = (state.notes && state.notes[day]) || [];
  if (!notes.length) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:4px 0">Sin notas todavía.</p>';
    return;
  }
  el.innerHTML = notes.slice().reverse().map(n => `
    <div class="note-item">
      <div>${n.text}</div>
      <div class="note-meta">— ${n.author} · ${new Date(n.at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</div>
    </div>
  `).join('');
}

function addNote(day) {
  const input = document.getElementById('note-input-' + day);
  const text = input?.value?.trim();
  if (!text) return;
  if (!state.notes) state.notes = { lunes: [], miercoles: [], viernes: [] };
  if (!state.notes[day]) state.notes[day] = [];
  state.notes[day].push({
    id: 'n' + Date.now(),
    text,
    author: currentUser?.displayName?.split(' ')[0] || 'Alguien',
    at: new Date().toISOString()
  });
  input.value = '';
  save();
  renderNotes(day);
}

// =============================================
// WEEK PLAN (domingo → elegir 3 recetas)
// =============================================

function renderPlan() {
  const sel = document.getElementById('plan-selections');
  const picker = document.getElementById('plan-recipe-picker');
  if (!sel || !picker) return;

  const plan = state.weekPlan || [];
  const meta = state.weekPlanMeta;
  const season = getCurrentSeason();
  const seasonLabel = { verano: '🌞 verano', otono: '🍂 otoño', invierno: '🧥 invierno', primavera: '🌸 primavera' }[season];

  const metaHtml = meta?.updatedBy
    ? `<p style="font-size:12px;color:var(--muted);margin-bottom:20px">Último cambio: <b>${meta.updatedBy}</b> · ${new Date(meta.updatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</p>`
    : '';

  // 3 slots
  sel.innerHTML = metaHtml + [0, 1, 2].map(i => {
    const recipeId = plan[i];
    const recipe = recipeId ? state.recipes.find(r => r.id === recipeId) : null;
    if (recipe) {
      return `
        <div class="plan-slot filled" id="plan-slot-${i}">
          <div class="plan-slot-number">${i + 1}</div>
          <div class="plan-slot-emoji">${recipe.emoji}</div>
          <div class="plan-slot-info">
            <div class="plan-slot-name">${recipe.name}</div>
            <div class="plan-slot-meta">⏱ ${recipe.time} min · ${recipe.tags.includes('mealprep') ? 'Meal prep' : 'Plato fresco'} · ${recipe.ingredients.length} ingredientes</div>
          </div>
          <button class="plan-slot-remove" onclick="event.stopPropagation();removePlanSlot(${i})">✕</button>
        </div>`;
    } else {
      return `
        <div class="plan-slot" id="plan-slot-${i}" onclick="pickRecipeForSlot(${i})">
          <div class="plan-slot-number">${i + 1}</div>
          <div style="color:var(--muted);font-size:14px">Tocá para elegir una receta · ${seasonLabel}</div>
        </div>`;
    }
  }).join('');

  // Picker
  if (window._pickingSlot !== undefined) {
    const available = state.recipes.filter(r => {
      if (r.tags.includes('frio') && (season === 'verano' || season === 'primavera')) return false;
      if (r.tags.includes('calor') && (season === 'invierno' || season === 'otono')) return false;
      return true;
    });
    picker.innerHTML = `
      <div style="font-weight:700;margin-bottom:10px;font-size:14px">¿Qué vas a cocinar en el lugar ${window._pickingSlot + 1}?</div>
      <input class="menu-search" type="text" placeholder="Buscar receta..." oninput="filterPlanPicker(this.value)" id="plan-picker-search" style="margin-bottom:12px" />
      <div class="plan-picker-grid" id="plan-picker-grid">
        ${available.map(r => `
          <div class="plan-picker-card ${plan.includes(r.id) ? 'already-selected' : ''}" onclick="selectRecipeForSlot(${window._pickingSlot},'${r.id}')">
            <div style="font-size:1.5rem">${r.emoji}</div>
            <div style="font-weight:700;font-size:13px;margin-top:4px">${r.name}</div>
            <div style="font-size:12px;color:var(--muted)">⏱ ${r.time} min</div>
          </div>
        `).join('')}
      </div>`;
    window._planPickerRecipes = available;
  } else if (plan.length > 0) {
    picker.innerHTML = `
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-primary" onclick="generateShoppingList()" style="padding:14px;font-size:15px">
          🛒 Generar lista de compras (${plan.length} receta${plan.length > 1 ? 's' : ''})
        </button>
        ${plan.length < 3 ? `<p style="font-size:12px;color:var(--muted);text-align:center">Podés agregar hasta 3 recetas</p>` : ''}
      </div>`;
  } else {
    picker.innerHTML = '';
  }
}

function filterPlanPicker(query) {
  const grid = document.getElementById('plan-picker-grid');
  if (!grid || !window._planPickerRecipes) return;
  const plan = state.weekPlan || [];
  const q = query.toLowerCase();
  const filtered = q
    ? window._planPickerRecipes.filter(r => r.name.toLowerCase().includes(q))
    : window._planPickerRecipes;
  grid.innerHTML = filtered.map(r => `
    <div class="plan-picker-card ${plan.includes(r.id) ? 'already-selected' : ''}" onclick="selectRecipeForSlot(${window._pickingSlot},'${r.id}')">
      <div style="font-size:1.5rem">${r.emoji}</div>
      <div style="font-weight:700;font-size:13px;margin-top:4px">${r.name}</div>
      <div style="font-size:12px;color:var(--muted)">⏱ ${r.time} min</div>
    </div>
  `).join('');
}

function pickRecipeForSlot(i) {
  window._pickingSlot = i;
  renderPlan();
  document.getElementById('plan-recipe-picker')?.scrollIntoView({ behavior: 'smooth' });
}

function selectRecipeForSlot(i, recipeId) {
  if (!state.weekPlan) state.weekPlan = [];
  state.weekPlan[i] = recipeId;
  state.weekPlan = state.weekPlan.filter(Boolean);
  window._pickingSlot = undefined;
  save();
  renderPlan();
}

function removePlanSlot(i) {
  if (!state.weekPlan) return;
  state.weekPlan.splice(i, 1);
  window._pickingSlot = undefined;
  save();
  renderPlan();
}

function savePlan() {
  if (!state.weekPlan?.length) { alert('Agregá al menos una receta al plan primero.'); return; }
  save();
  generateShoppingList();
}

// =============================================
// SHOPPING LIST
// =============================================

function categorizeShopping(name) {
  const n = name.toLowerCase();
  if (/carne|pollo|cerdo|pescado|merluza|res|bife|pechuga|muslo|osobuco|paleta|peceto|lomo|salmon/.test(n)) return 'Carnes y pescados';
  if (/leche|queso|crema|huevo|yogur|manteca/.test(n)) return 'Lácteos y huevos';
  if (/papa|zanahoria|cebolla|ajo|tomate|morrón|zucchini|berenjena|espinaca|lechuga|zapallo|choclo|verdeo|pepino|palta|apio|rúcula|brócoli|coliflor/.test(n)) return 'Verduras';
  if (/limón|naranja|manzana|banana|mango|frutilla|uva|pera/.test(n)) return 'Frutas';
  if (/arroz|quinoa|lenteja|harina|pasta|pan|fideos|avena|garbanzo|porotos/.test(n)) return 'Granos y cereales';
  if (/aceite|sal|pimienta|pimentón|comino|orégano|romero|tomillo|mostaza|vinagre|caldo|leche de coco|curry|condimento|aliño/.test(n)) return 'Condimentos y especias';
  return 'Otros';
}

function generateShoppingList() {
  const plan = state.weekPlan || [];
  if (!plan.length) return;
  const ingredientMap = {};
  plan.forEach(recipeId => {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    recipe.ingredients.forEach(ing => {
      const key = ing.name.toLowerCase().trim();
      if (ingredientMap[key]) {
        ingredientMap[key].sources.push(recipe.name);
      } else {
        ingredientMap[key] = {
          id: 'si' + Date.now() + Math.random().toString(36).slice(2),
          name: ing.name,
          amount: ing.amount,
          category: categorizeShopping(ing.name),
          checked: false,
          sources: [recipe.name]
        };
      }
    });
  });
  state.shoppingList = Object.values(ingredientMap);
  save();
  showView('compras');
}

function renderShoppingList() {
  const container = document.getElementById('shopping-list-container');
  const sourceEl = document.getElementById('shopping-source');
  if (!container) return;

  const items = state.shoppingList || [];
  if (!items.length) {
    container.innerHTML = `
      <div class="shopping-empty">
        <div class="shopping-empty-icon">🛒</div>
        <div style="font-size:15px;font-weight:700;margin-bottom:8px">La lista está vacía</div>
        <div style="font-size:13px">Armá el plan de la semana y generá la lista automáticamente.</div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="showView('plan')">Ir al plan →</button>
      </div>`;
    if (sourceEl) sourceEl.textContent = '';
    return;
  }

  const total = items.length;
  const checked = items.filter(i => i.checked).length;
  if (sourceEl) {
    const planRecipes = (state.weekPlan || []).map(id => state.recipes.find(r => r.id === id)?.name).filter(Boolean);
    sourceEl.innerHTML = `<b>${checked}/${total}</b> tachados · Recetas: ${planRecipes.join(', ')}`;
  }

  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  const catOrder = ['Carnes y pescados', 'Verduras', 'Frutas', 'Lácteos y huevos', 'Granos y cereales', 'Condimentos y especias', 'Otros'];
  const catIcons = { 'Carnes y pescados': '🥩', 'Lácteos y huevos': '🥛', 'Verduras': '🥦', 'Granos y cereales': '🌾', 'Condimentos y especias': '🧂', 'Frutas': '🍋', 'Otros': '📦' };

  const sortedCats = catOrder.filter(c => grouped[c]).concat(Object.keys(grouped).filter(c => !catOrder.includes(c)));

  container.innerHTML = sortedCats.map(cat => `
    <div class="shopping-category">
      <div class="shopping-category-title">${catIcons[cat] || '📦'} ${cat}</div>
      ${grouped[cat].map(item => `
        <div class="shopping-item ${item.checked ? 'checked' : ''}" onclick="toggleShoppingItem('${item.id}')">
          <div class="shopping-item-check">${item.checked ? '✓' : ''}</div>
          <div class="shopping-item-name">${item.name}</div>
          <div class="shopping-item-amount">${item.amount}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function toggleShoppingItem(id) {
  const item = (state.shoppingList || []).find(i => i.id === id);
  if (item) { item.checked = !item.checked; save(); renderShoppingList(); }
}

function clearCheckedItems() {
  state.shoppingList = (state.shoppingList || []).filter(i => !i.checked);
  save(); renderShoppingList();
}

function clearShoppingList() {
  if (!confirm('¿Borrar toda la lista de compras?')) return;
  state.shoppingList = [];
  save(); renderShoppingList();
}

window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;

window.showView = showView;
window.toggleTask = toggleTask;
window.addTask = addTask;
window.editTask = editTask;
window.saveEditTask = saveEditTask;
window.deleteTask = deleteTask;
window.resetDay = resetDay;
window.startSession = startSession;
window.endSession = endSession;
window.chooseMenuOption = chooseMenuOption;
window.addMenuToTasks = addMenuToTasks;
window.setFilter = setFilter;
window.filterRecipes = filterRecipes;
window.openRecipe = openRecipe;
window.closeRecipeDetail = closeRecipeDetail;
window.openAddRecipeModal = openAddRecipeModal;
window.openEditRecipeModal = openEditRecipeModal;
window.deleteRecipe = deleteRecipe;
window.closeAddRecipeModal = closeAddRecipeModal;
window.saveNewRecipe = saveNewRecipe;
window.clearHistory = clearHistory;
window.getAIRecommendations = getAIRecommendations;
window.addAIRecipe = addAIRecipe;
window.addNote = addNote;
window.renderPlan = renderPlan;
window.pickRecipeForSlot = pickRecipeForSlot;
window.selectRecipeForSlot = selectRecipeForSlot;
window.removePlanSlot = removePlanSlot;
window.savePlan = savePlan;
window.filterPlanPicker = filterPlanPicker;
window.generateShoppingList = generateShoppingList;
window.toggleShoppingItem = toggleShoppingItem;
window.clearCheckedItems = clearCheckedItems;
window.clearShoppingList = clearShoppingList;

init();
}); // end DOMContentLoaded
</script>