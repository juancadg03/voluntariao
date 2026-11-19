/**
 * Contratos de datos compartidos entre la interfaz y el servidor.
 *
 * Reemplaza a `src/types/contratos.ts` (ADR-04: JavaScript con JSDoc).
 * Fuente de verdad: docs/03-srs.md §5 y docs/04-arquitectura.md §6.
 * Si cambia una tabla, se actualiza este archivo en el mismo cambio.
 *
 * Las fechas son texto ISO 8601 con zona horaria (America/Bogota al mostrarlas).
 * Los esquemas de validación con Zod se agregan en la fase de construcción.
 */

// ─── Estados (coinciden con los enum de PostgreSQL) ───────────────────────

/** ADR-07: 10 estados, incluye los de moderación. */
export const ESTADOS_INICIATIVA = Object.freeze([
  "borrador",
  "pendiente_revision",
  "rechazada",
  "publicada",
  "en_preparacion",
  "lista",
  "realizada",
  "completada",
  "suspendida",
  "cancelada",
]);

/** RN-06: solo estos estados aparecen en el listado y el mapa. */
export const ESTADOS_INICIATIVA_PUBLICOS = Object.freeze([
  "publicada",
  "en_preparacion",
]);

export const ESTADOS_NECESIDAD = Object.freeze([
  "pendiente",
  "comprometida",
  "recibida",
  "cubierta",
]);

export const ESTADOS_INSCRIPCION = Object.freeze([
  "pendiente",
  "confirmada",
  "rechazada",
  "cancelada",
  "cumplida",
]);

export const ROLES = Object.freeze([
  "organizacion",
  "ciudadano",
  "voluntario",
  "administrador",
]);

/**
 * @typedef {"borrador"|"pendiente_revision"|"rechazada"|"publicada"|"en_preparacion"|"lista"|"realizada"|"completada"|"suspendida"|"cancelada"} EstadoIniciativa
 * @typedef {"publicada"|"en_preparacion"} EstadoIniciativaPublico
 * @typedef {"pendiente"|"comprometida"|"recibida"|"cubierta"} EstadoNecesidad
 * @typedef {"pendiente"|"confirmada"|"rechazada"|"cancelada"|"cumplida"} EstadoInscripcion
 * @typedef {"organizacion"|"ciudadano"|"voluntario"|"administrador"} Rol
 */

// ─── Catálogos administrables (tablas, no listas fijas) ───────────────────

/**
 * Categoría temática (tabla `categorias`).
 * @typedef {Object} Categoria
 * @property {number} id
 * @property {string} nombre
 */

/**
 * Tipo de ayuda: mano de obra, donaciones, transporte… (tabla `tipos_ayuda`).
 * @typedef {Object} TipoAyuda
 * @property {number} id
 * @property {string} nombre
 */

// ─── Usuarios ─────────────────────────────────────────────────────────────

/**
 * Datos mínimos y públicos de quien publica una iniciativa.
 * @typedef {Object} OrganizadorPublico
 * @property {string} id
 * @property {string} nombre
 * @property {boolean} verificada  Solo puede ser true en organizaciones (RF-009).
 */

/**
 * Usuario de la sesión actual. Se construye en el servidor a partir de la
 * sesión validada; nunca a partir de datos enviados por el cliente.
 * @typedef {Object} UsuarioSesion
 * @property {string} id      Igual al id de la tabla usuarios (ADR-18).
 * @property {Rol} rol
 * @property {string} nombre
 * @property {"activo"|"suspendido"} estado
 */

// ─── Iniciativas ──────────────────────────────────────────────────────────

/**
 * @typedef {Object} Necesidad
 * @property {string} id
 * @property {string} nombre
 * @property {TipoAyuda} tipo_ayuda
 * @property {string} unidad               personas, unidades, kg, viajes…
 * @property {number} cantidad_objetivo
 * @property {number} cantidad_confirmada  Nunca mayor que cantidad_objetivo (RN-07).
 * @property {EstadoNecesidad} estado
 */

/**
 * @typedef {Object} Coordenadas
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Iniciativa tal como la ve un visitante (detalle, RF-030).
 * @typedef {Object} IniciativaPublica
 * @property {string} id
 * @property {string} titulo
 * @property {string} descripcion
 * @property {string} foto_url
 * @property {Categoria} categoria
 * @property {TipoAyuda[]} tipos_ayuda
 * @property {string} ciudad
 * @property {string} lugar                 Dirección escrita.
 * @property {Coordenadas|null} ubicacion   null si no se pudo geocodificar.
 * @property {string} fecha_inicio
 * @property {string|null} fecha_fin
 * @property {string} medio_contacto        Enlace de WhatsApp o celular (RN-04).
 * @property {EstadoIniciativaPublico} estado
 * @property {string} publicada_en
 * @property {OrganizadorPublico} organizador
 * @property {Necesidad[]} necesidades
 */

/**
 * Versión reducida para el listado y las tarjetas del mapa (RF-027).
 * @typedef {Object} IniciativaResumen
 * @property {string} id
 * @property {string} titulo
 * @property {string} foto_url
 * @property {Categoria} categoria
 * @property {string} fecha_inicio
 * @property {Coordenadas|null} ubicacion
 */

/**
 * Filtros del listado y el mapa (RF-024). Todos opcionales.
 * @typedef {Object} FiltrosIniciativas
 * @property {string} [ciudad]
 * @property {number} [categoria_id]
 * @property {number} [tipo_ayuda_id]
 * @property {string} [fecha]   Día en Colombia, AAAA-MM-DD.
 * @property {string} [texto]
 * @property {number} [pagina]  Empieza en 1.
 */

/**
 * @typedef {Object} ListaIniciativas
 * @property {IniciativaResumen[]} data
 * @property {number} total
 */

// ─── Inscripciones (requieren cuenta de voluntario, RF-010 y UC-09) ───────

/**
 * Lo que envía el voluntario. Su id, nombre y correo salen de la sesión (RF-033).
 * @typedef {Object} SolicitudInscripcion
 * @property {string} necesidad_id
 * @property {number} cantidad   Mayor que 0 y no mayor que lo pendiente (RF-036).
 * @property {string} [mensaje]  Máximo 500 caracteres.
 */

/**
 * @typedef {Object} Inscripcion
 * @property {string} id
 * @property {string} necesidad_id
 * @property {string} voluntario_id
 * @property {number} cantidad
 * @property {string|null} mensaje
 * @property {EstadoInscripcion} estado
 * @property {string} creada_en
 */

/**
 * Inscripción vista por el organizador, con datos de contacto (RF-041).
 * @typedef {Inscripcion & { voluntario: { nombre: string, correo: string, telefono: string|null } }} InscripcionRecibida
 */
