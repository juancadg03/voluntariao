// ═══════════════════════════════════════════════════════════════════════════
// comun.js · Piezas compartidas por las tres pantallas del prototipo
// ═══════════════════════════════════════════════════════════════════════════
//
// QUÉ ES
//   No es una vista: es la "caja de herramientas" que usan index.html,
//   detalle.html y entrar.html. Cada página lo carga con <script src="comun.js">
//   ANTES de su propio script, así que todo lo de aquí queda disponible para ellas.
//
// POR QUÉ EXISTE
//   Para no repetir lo mismo en cada página. Si el encabezado o los datos
//   cambian, se cambian aquí una sola vez. Es lo mismo que harán los
//   componentes de React: escribir una pieza una vez y usarla en muchas pantallas.
//
// QUÉ CONTIENE (en este orden)            EN LA APP REAL SERÁ…
//   1. Datos de ejemplo (INICIATIVAS)     → la respuesta de GET /api/iniciativas
//   2. Catálogos y usuario de ejemplo     → las tablas categorias y tipos_ayuda
//   3. Utilidades (esc, fechas, faltan)   → funciones en frontend/src/
//   4. Sesión simulada con localStorage   → la cookie y GET /api/cuentas/yo
//   5. Íconos SVG                         → un componente <Icono>
//   6. Componentes pequeños (chip, insignia, barra de progreso)
//                                         → <Chip>, <InsigniaEstado>, <BarraProgreso>
//   7. Aviso emergente (toast)            → el componente <Aviso>
//   8. Encabezado y menús según el rol    → <MenuSuperior> y <MenuInferior>
//   9. Barra amarilla del prototipo       → NO existirá: es solo para probar
//
// Los nombres de los componentes vienen de docs/05-diseno-de-pantallas.md §5.5.

// ─── 1. Datos de ejemplo (imitan la respuesta de GET /api/iniciativas) ─────
// Ocho iniciativas inventadas para ver la interfaz con contenido realista.
// Cada una tiene sus "necesidades": lo concreto que pide (personas, mercados,
// viajes), con la meta (objetivo) y cuántos ya están confirmados.

const INICIATIVAS = [
  {
    id: 1, titulo: 'Olla comunitaria en Siloé', categoria: 'Alimentación',
    tiposAyuda: ['Mano de obra', 'Donaciones', 'Transporte'],
    fecha: '2026-11-22T09:00', lugar: 'Cancha de Siloé', zona: 'Comuna 20',
    organizador: 'Fundación Manos Unidas', verificada: true,
    lat: 3.4236, lng: -76.5585, ilustracion: 'persona_caja', tinte: 'naranja-claro',
    contacto: '573001234567',
    descripcion: 'Cada mes cocinamos un almuerzo para 200 familias del barrio. Necesitamos manos para pelar, cocinar y servir, y mercados para armar las ollas. Trae gorro o pañoleta; nosotros ponemos delantales.',
    necesidades: [
      { id: 11, nombre: 'Personas para cocinar', tipo: 'Mano de obra', unidad: 'personas', objetivo: 20, confirmada: 12 },
      { id: 12, nombre: 'Mercados donados', tipo: 'Donaciones', unidad: 'mercados', objetivo: 30, confirmada: 30 },
      { id: 13, nombre: 'Transporte de ollas', tipo: 'Transporte', unidad: 'viajes', objetivo: 2, confirmada: 0 },
    ],
  },
  {
    id: 2, titulo: 'Brigada de salud en Potrero Grande', categoria: 'Salud',
    tiposAyuda: ['Mano de obra', 'Asesoría'],
    fecha: '2026-11-29T08:00', lugar: 'Salón comunal Potrero Grande', zona: 'Comuna 21',
    organizador: 'Colectivo Salud al Barrio', verificada: true,
    lat: 3.4135, lng: -76.4766, ilustracion: 'dibujo', tinte: 'azul-claro',
    contacto: '573011112233',
    descripcion: 'Jornada de tamizaje: toma de presión, glucometría y orientación en salud. Buscamos estudiantes o profesionales de salud y botiquines básicos para entregar.',
    necesidades: [
      { id: 21, nombre: 'Personal o estudiantes de salud', tipo: 'Mano de obra', unidad: 'personas', objetivo: 6, confirmada: 2 },
      { id: 22, nombre: 'Botiquines básicos', tipo: 'Donaciones', unidad: 'botiquines', objetivo: 15, confirmada: 9 },
    ],
  },
  {
    id: 3, titulo: 'Siembra de árboles nativos en Cristo Rey', categoria: 'Medio ambiente',
    tiposAyuda: ['Mano de obra', 'Transporte'],
    fecha: '2026-11-28T07:00', lugar: 'Sendero del Cristo Rey', zona: 'Los Andes',
    organizador: 'Laura Ríos', verificada: false,
    lat: 3.4361, lng: -76.5653, ilustracion: 'cristorey', tinte: 'salvia-claro',
    contacto: '573159876543',
    descripcion: 'Sembramos 100 árboles nativos en el sendero. Lleva ropa cómoda, agua y bloqueador. Subimos caminando desde el barrio Bellavista.',
    necesidades: [
      { id: 31, nombre: 'Voluntarios para sembrar', tipo: 'Mano de obra', unidad: 'personas', objetivo: 30, confirmada: 22 },
      { id: 32, nombre: 'Plántulas nativas', tipo: 'Donaciones', unidad: 'plántulas', objetivo: 100, confirmada: 100 },
    ],
  },
  {
    id: 4, titulo: 'Tarde de compañía en hogar de adultos mayores', categoria: 'Adulto mayor',
    tiposAyuda: ['Mano de obra'],
    fecha: '2026-11-26T14:00', lugar: 'Hogar San Fernando', zona: 'Comuna 19',
    organizador: 'Andrés Mejía', verificada: false,
    lat: 3.4370, lng: -76.5450, ilustracion: 'corazon', tinte: 'vino-claro',
    contacto: '573124445566',
    descripcion: 'Juegos de mesa, música y conversación con los abuelos del hogar. Ya completamos el grupo, pero puedes contactarnos para la próxima.',
    necesidades: [
      { id: 41, nombre: 'Acompañantes', tipo: 'Mano de obra', unidad: 'personas', objetivo: 10, confirmada: 10 },
    ],
  },
  {
    id: 5, titulo: 'Refuerzo escolar de matemáticas', categoria: 'Educación',
    tiposAyuda: ['Mano de obra', 'Asesoría'],
    fecha: '2026-11-30T16:00', lugar: 'Biblioteca comunitaria Meléndez', zona: 'Comuna 18',
    organizador: 'Camila Ortiz', verificada: false,
    lat: 3.3870, lng: -76.5440, ilustracion: 'persona_caja', tinte: 'amarillo-claro',
    contacto: '573187776655',
    descripcion: 'Acompañamos a niños de primaria con tareas de matemáticas, dos horas por semana. No necesitas ser docente: solo paciencia y ganas.',
    necesidades: [
      { id: 51, nombre: 'Tutores', tipo: 'Mano de obra', unidad: 'personas', objetivo: 12, confirmada: 4 },
    ],
  },
  {
    id: 6, titulo: 'Taller de derechos laborales para mujeres', categoria: 'Derechos humanos',
    tiposAyuda: ['Asesoría'],
    fecha: '2026-12-03T18:00', lugar: 'Casa cultural El Vallado', zona: 'Comuna 15',
    organizador: 'Colectivo Mujeres del Distrito', verificada: true,
    lat: 3.4028, lng: -76.4940, ilustracion: 'bandera_cali', tinte: 'azul-claro',
    contacto: '573162223344',
    descripcion: 'Taller práctico sobre contratos, prestaciones y a dónde acudir en caso de abuso laboral. Buscamos abogadas o estudiantes de derecho.',
    necesidades: [
      { id: 61, nombre: 'Abogadas o estudiantes de derecho', tipo: 'Asesoría', unidad: 'personas', objetivo: 3, confirmada: 1 },
    ],
  },
  {
    id: 7, titulo: 'Lectura en voz alta en La Ermita', categoria: 'Cultura',
    tiposAyuda: ['Mano de obra'],
    fecha: '2026-12-05T15:00', lugar: 'Plazoleta de La Ermita', zona: 'Centro',
    organizador: 'Biblioteca Letras al Río', verificada: true,
    lat: 3.4532, lng: -76.5332, ilustracion: 'ermita', tinte: 'amarillo-claro',
    contacto: '573205554433',
    descripcion: 'Leemos cuentos y poemas de autores vallecaucanos a quienes pasen por la plazoleta. Elige tu texto favorito y ven a compartirlo.',
    necesidades: [
      { id: 71, nombre: 'Lectores voluntarios', tipo: 'Mano de obra', unidad: 'personas', objetivo: 8, confirmada: 3 },
    ],
  },
  {
    id: 8, titulo: 'Útiles escolares para niños de Aguablanca', categoria: 'Infancia',
    tiposAyuda: ['Donaciones', 'Transporte'],
    fecha: '2026-12-12T10:00', lugar: 'Parroquia Nuestra Señora', zona: 'Comuna 14',
    organizador: 'Fundación Manos Unidas', verificada: true,
    lat: 3.4180, lng: -76.4840, ilustracion: 'persona_bandera_colombia', tinte: 'salvia-claro',
    contacto: '573001234567',
    descripcion: 'Armamos 80 kits escolares para el próximo año. Recibimos cuadernos, colores, lápices y morrales en buen estado.',
    necesidades: [
      { id: 81, nombre: 'Kits escolares', tipo: 'Donaciones', unidad: 'kits', objetivo: 80, confirmada: 35 },
      { id: 82, nombre: 'Camioneta para repartir', tipo: 'Transporte', unidad: 'viajes', objetivo: 2, confirmada: 1 },
    ],
  },
];

// ─── 2. Catálogos y usuario de ejemplo ────────────────────────────────────
// Catálogos: las opciones de los filtros (en la app real vienen de las tablas
// categorias y tipos_ayuda, y el administrador puede agregar más: RF-016).
const CATEGORIAS = ['Salud', 'Educación', 'Infancia', 'Adulto mayor', 'Alimentación',
  'Medio ambiente', 'Cultura', 'Derechos humanos', 'Incidencia social'];
const TIPOS_AYUDA = ['Mano de obra', 'Donaciones', 'Transporte', 'Asesoría'];

// Usuario de ejemplo para cuando hay sesión (aparece, por ejemplo, en la hoja de inscripción)
const USUARIO_DEMO = {
  voluntario: { nombre: 'Ana Gómez', correo: 'ana@correo.com' },
  organizacion: { nombre: 'Fundación Manos Unidas', correo: 'contacto@manosunidas.org' },
};

// ─── 3. Utilidades ─────────────────────────────────────────────────────────

/** Escapa texto antes de meterlo en innerHTML. React lo hace solo; aquí, a mano. */
function esc(texto) {
  return String(texto).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Formatos de fecha en español de Colombia: "sáb 22 nov · 9:00" y "Sábado 22 de noviembre · 9:00".
// Intl.DateTimeFormat viene en el navegador; no hace falta ninguna librería.
const fmtCorta = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtLarga = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtHora = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' });

function fechaCorta(iso) {
  const d = new Date(iso);
  return `${fmtCorta.format(d).replace(/\./g, '')} · ${fmtHora.format(d)}`;
}
function fechaLarga(iso) {
  const d = new Date(iso);
  const texto = fmtLarga.format(d);
  return `${texto[0].toUpperCase()}${texto.slice(1)} · ${fmtHora.format(d)}`;
}

/** Cuántas unidades faltan para completar una necesidad (nunca menos de 0). */
function faltan(n) { return Math.max(0, n.objetivo - n.confirmada); }

/** Estado de la necesidad (RF-019), simplificado para el prototipo. */
function estadoNecesidad(n) {
  if (faltan(n) === 0) return 'cubierta';
  if (n.confirmada > 0) return 'comprometida';
  return 'pendiente';
}

// Lectura y escritura de localStorage protegidas: en modo privado puede fallar.
// localStorage guarda texto en el navegador y sobrevive a recargar la página;
// por eso el prototipo "recuerda" el rol y las inscripciones de prueba.
function leer(clave, porDefecto) {
  try { const v = localStorage.getItem(clave); return v === null ? porDefecto : JSON.parse(v); }
  catch { return porDefecto; }
}
function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento */ }
}

// ─── 4. Sesión simulada ────────────────────────────────────────────────────
// En la app real el rol viene de GET /api/cuentas/yo (cookie de sesión).

const ROLES = { visitante: 'Visitante', voluntario: 'Voluntario', organizacion: 'Organización' };
function rolActual() { return leer('calida-proto-rol', 'visitante'); }
function cambiarRol(rol) { guardar('calida-proto-rol', rol); }

/** Inscripciones hechas en el prototipo: { idNecesidad: cantidad } */
function misInscripciones() { return leer('calida-proto-inscripciones', {}); }
function registrarInscripcion(idNecesidad, cantidad) {
  const todas = misInscripciones();
  todas[idNecesidad] = cantidad;
  guardar('calida-proto-inscripciones', todas);
}

// ─── 5. Íconos (trazos de 24 × 24, estilo Lucide) ──────────────────────────
// Cada ícono es el dibujo (los <path>) de un SVG. icono('buscar') arma el SVG completo.
// aria-hidden="true": el lector de pantalla los ignora, porque siempre van junto a un texto.

const TRAZOS = {
  inicio: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  mapa: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  campana: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  ubicacion: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  buscar: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  atras: '<path d="m15 18-6-6 6-6"/>',
  compartir: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4M12 2v13"/>',
  cerrar: '<path d="M18 6 6 18M6 6l12 12"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  ojo: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ojoTachado: '<path d="M2 12s3.5-7 10-7c2 0 3.8.7 5.2 1.6M22 12s-3.5 7-10 7c-2 0-3.8-.7-5.2-1.6"/><path d="m3 3 18 18"/>',
  mensaje: '<path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.2-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
  bandera: '<path d="M4 22V4s1-1 4-1 5 2 8 2 4-1 4-1v11s-1 1-4 1-5-2-8-2-4 1-4 1"/>',
  lista: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  verificada: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
  reintentar: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  alerta: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
};

function icono(nombre, clases = 'size-5') {
  return `<svg class="${clases} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TRAZOS[nombre]}</svg>`;
}

// ─── 6. Componentes pequeños ───────────────────────────────────────────────
// Funciones que devuelven un trozo de HTML como texto. Las páginas las meten
// con innerHTML. En React serán componentes, que hacen lo mismo con JSX.

/** Etiqueta redondeada: la categoría o un tipo de ayuda. */

function chip(texto, clases = 'bg-vino-claro text-vino') {
  return `<span class="inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${clases}">${esc(texto)}</span>`;
}

const ESTILO_ESTADO = {
  cubierta: ['Cubierta', 'bg-exito-claro text-exito', 'check'],
  comprometida: ['En progreso', 'bg-aviso-claro text-aviso', 'reloj'],
  pendiente: ['Sin aportes aún', 'bg-divisor text-tinta-suave', 'reloj'],
  inscrito: ['Inscrito · pendiente', 'bg-aviso-claro text-aviso', 'reloj'],
  publicada: ['Publicada', 'bg-exito-claro text-exito', 'check'],
};

/** Insignia de estado: color + ícono + texto (nunca solo color). */
function insignia(estado) {
  const [texto, clases, ic] = ESTILO_ESTADO[estado];
  return `<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ${clases}">${icono(ic, 'size-4')}${texto}</span>`;
}

/** Barra de progreso con el número siempre visible (no solo la barra). */
function barraProgreso(n, etiqueta) {
  const pct = Math.round((n.confirmada / n.objetivo) * 100);
  return `
    <div role="progressbar" aria-label="${esc(etiqueta)}" aria-valuemin="0" aria-valuemax="${n.objetivo}" aria-valuenow="${n.confirmada}"
         class="h-2.5 w-full overflow-hidden rounded-full bg-divisor">
      <div class="h-full rounded-full ${pct >= 100 ? 'bg-exito' : 'bg-vino'}" style="width:${pct}%"></div>
    </div>`;
}

// ─── 7. Aviso emergente (toast) ────────────────────────────────────────────
// Un mensaje breve abajo de la pantalla que se borra solo a los 3,5 s.
// role="status" hace que el lector de pantalla lo lea en voz alta.

function avisar(mensaje) {
  let caja = document.getElementById('avisos');
  if (!caja) {
    caja = document.createElement('div');
    caja.id = 'avisos';
    caja.setAttribute('role', 'status');
    caja.className = 'pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8';
    document.body.appendChild(caja);
  }
  caja.innerHTML = `<p class="rounded-xl bg-tinta px-4 py-3 text-sm text-white shadow-lg">${esc(mensaje)}</p>`;
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => { caja.innerHTML = ''; }, 3500);
}

/**
 * Enlaces a pantallas que existen en el diseño pero no en este prototipo.
 * Llevan el atributo data-fuera="Nombre (PT-xx)". Al hacer clic, en vez de
 * llevar a una página rota, avisa que esa pantalla todavía no está hecha.
 */
document.addEventListener('click', (e) => {
  const enlace = e.target.closest('[data-fuera]');
  if (!enlace) return;
  e.preventDefault();
  avisar(`${enlace.dataset.fuera} no está en el prototipo (ver docs/05).`);
});

// ─── 8. Encabezado y menús según el rol (docs/05 §3.1) ─────────────────────
// Cada rol ve opciones distintas. "href" lleva a una página del prototipo;
// "fuera" marca una pantalla que aún no está hecha (ver data-fuera arriba).

const MENUS = {
  visitante: [
    { id: 'inicio', texto: 'Inicio', icono: 'inicio', href: 'index.html' },
    { id: 'mapa', texto: 'Mapa', icono: 'mapa', fuera: 'El mapa (PT-02)' },
    { id: 'entrar', texto: 'Entrar', icono: 'usuario', href: 'entrar.html' },
  ],
  voluntario: [
    { id: 'inicio', texto: 'Inicio', icono: 'inicio', href: 'index.html' },
    { id: 'mapa', texto: 'Mapa', icono: 'mapa', fuera: 'El mapa (PT-02)' },
    { id: 'inscripciones', texto: 'Mis inscripciones', corto: 'Inscripciones', icono: 'lista', fuera: 'Mis inscripciones (PT-09)' },
    { id: 'perfil', texto: 'Perfil', icono: 'usuario', fuera: 'Mi perfil (PT-10)' },
  ],
  organizacion: [
    { id: 'inicio', texto: 'Inicio', icono: 'inicio', href: 'index.html' },
    { id: 'mapa', texto: 'Mapa', icono: 'mapa', fuera: 'El mapa (PT-02)' },
    { id: 'panel', texto: 'Mis iniciativas', corto: 'Iniciativas', icono: 'lista', fuera: 'Mis iniciativas (PT-06)' },
    { id: 'perfil', texto: 'Perfil', icono: 'usuario', fuera: 'Mi perfil (PT-10)' },
  ],
};

function atributosEnlace(item, actual) {
  const href = item.href ?? '#';
  const fuera = item.fuera ? ` data-fuera="${esc(item.fuera)}"` : '';
  const aria = item.id === actual ? ' aria-current="page"' : '';
  return `href="${href}"${fuera}${aria}`;
}

/**
 * Pinta el encabezado (todas las pantallas) y la barra inferior (móvil).
 * @param {string} actual id de la opción activa del menú
 */
function pintarNavegacion(actual) {
  const rol = rolActual();
  const menu = MENUS[rol];
  const conSesion = rol !== 'visitante';

  const enlacesEscritorio = menu.map((item) => `
    <a ${atributosEnlace(item, actual)}
       class="rounded-lg px-3 py-2 text-tinta-suave hover:bg-vino-claro hover:text-vino aria-[current=page]:font-semibold aria-[current=page]:text-vino">
      ${esc(item.texto)}</a>`).join('');

  const campana = conSesion ? `
    <a href="#" data-fuera="Avisos (PT-11)" class="relative grid size-11 place-items-center rounded-full text-tinta hover:bg-vino-claro">
      ${icono('campana', 'size-6')}
      <span class="sr-only">Avisos: 2 sin leer</span>
      <span aria-hidden="true" class="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-vino text-xs font-semibold text-white">2</span>
    </a>` : '';

  const publicar = rol === 'organizacion' ? `
    <a href="#" data-fuera="El formulario de iniciativa (PT-07)"
       class="inline-flex items-center gap-1 rounded-lg bg-vino px-3 py-2 text-sm font-semibold text-white hover:bg-vino-oscuro">
      ${icono('mas', 'size-4')} Publicar</a>` : '';

  document.getElementById('encabezado').innerHTML = `
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
      <a href="index.html" class="mr-auto"><img src="recursos/logo.svg" alt="Calida, ir al inicio" class="h-9 w-auto"></a>
      <nav aria-label="Principal" class="hidden items-center gap-1 lg:flex">${enlacesEscritorio}</nav>
      ${publicar}
      ${campana}
    </div>`;

  const inferior = document.getElementById('menu-inferior');
  if (!inferior) return;
  inferior.innerHTML = `
    <ul class="mx-auto flex max-w-md">
      ${menu.map((item) => `
        <li class="flex-1">
          <a ${atributosEnlace(item, actual)}
             class="flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs text-tinta-suave aria-[current=page]:font-semibold aria-[current=page]:text-vino">
            ${icono(item.icono, 'size-6')}${esc(item.corto ?? item.texto)}
          </a>
        </li>`).join('')}
    </ul>`;
}

// ─── 9. Barra de controles del prototipo ───────────────────────────────────
// No es parte del diseño: sirve para ver la misma pantalla con otro rol o
// en otro estado (cargando, vacío, error) sin tener un backend.

/**
 * @param {string} controlesExtra HTML con controles propios de la página
 */
function pintarBarraPrototipo(controlesExtra = '') {
  const rol = rolActual();
  const barra = document.getElementById('barra-prototipo');
  barra.innerHTML = `
    <details class="border-b-2 border-dashed border-aviso bg-amarillo-claro text-sm">
      <summary class="mx-auto max-w-6xl cursor-pointer px-4 py-2 font-semibold">
        Prototipo · controles (no es parte del diseño)
      </summary>
      <div class="mx-auto flex max-w-6xl flex-wrap items-end gap-4 px-4 pb-3">
        <label class="flex flex-col gap-1">
          <span>Ver como</span>
          <select id="proto-rol" class="rounded-lg border border-borde bg-white px-2 py-1.5">
            ${Object.entries(ROLES).map(([v, t]) => `<option value="${v}" ${v === rol ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </label>
        ${controlesExtra}
        <button id="proto-reiniciar" type="button" class="rounded-lg border border-borde bg-white px-3 py-1.5 hover:bg-crema">
          Borrar inscripciones de prueba
        </button>
      </div>
    </details>`;

  document.getElementById('proto-rol').addEventListener('change', (e) => {
    cambiarRol(e.target.value);
    location.reload();
  });
  document.getElementById('proto-reiniciar').addEventListener('click', () => {
    guardar('calida-proto-inscripciones', {});
    location.reload();
  });
}
