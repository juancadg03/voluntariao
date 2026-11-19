import type {
  FiltrosIniciativas,
  IniciativaPublica,
  ListaIniciativas,
} from "@/types/contratos";

const ejemplos = [
  [
    "cocina-comunitaria",
    "Cocina comunitaria en San Antonio",
    "Cali",
    "Alimentación",
    "Casa comunitaria San Antonio",
    "Prepararemos almuerzos para compartir con las familias del barrio.",
    "Cocina del Barrio",
    "Preparación de almuerzos",
  ],
  [
    "rio-limpio",
    "Una mañana por el río",
    "Jamundí",
    "Ambiente",
    "Puente del río Jamundí",
    "Recogeremos residuos y clasificaremos el material recuperado en la ribera.",
    "Vecinos del Río",
    "Recolección de residuos",
  ],
  [
    "lectura",
    "Lecturas bajo los árboles",
    "Palmira",
    "Educación",
    "Parque Bolívar",
    "Compartiremos cuentos y acompañaremos a niñas y niños en pequeños círculos de lectura.",
    "Lectores del Valle",
    "Lectura en voz alta",
  ],
];

// Fechas relativas para que la demostración siempre tenga próximas jornadas.
function iniciativasDemo(): IniciativaPublica[] {
  const hoy = Date.now();
  const dia = 86400000;
  return ejemplos.map(
    (
      [id, titulo, ciudad, categoria, lugar, descripcion, nombre, actividad],
      i,
    ) => ({
      id,
      titulo,
      ciudad,
      categoria,
      lugar,
      descripcion,
      publicada_en: new Date(hoy - (3 - i) * dia).toISOString(),
      fecha_inicio:
        new Date(hoy + (2 + i * 3) * dia).toISOString().slice(0, 10) +
        "T09:00:00-05:00",
      estado: "publicada",
      organizador: { id: "org-" + id, nombre },
      necesidades: [
        {
          id: "nec-" + id,
          nombre: actividad,
          tipo_aporte: "voluntariado",
          unidad: "personas",
          cantidad_objetivo: 10,
          cantidad_confirmada: 4 + i * 3,
          estado: i === 2 ? "cubierta" : "pendiente",
        },
      ],
    }),
  );
}

export function diaColombia(fecha: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Bogota",
  }).format(new Date(fecha));
}
export function fechaVisible(fecha: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeZone: "America/Bogota",
  }).format(new Date(fecha));
}
export function listar(f: FiltrosIniciativas = {}): ListaIniciativas {
  const data = iniciativasDemo().filter(
    (i) =>
      (!f.ciudad || i.ciudad === f.ciudad) &&
      (!f.categoria || i.categoria === f.categoria) &&
      (!f.fecha || diaColombia(i.fecha_inicio) === f.fecha),
  );
  return { data, total: data.length };
}
export function detalle(id: string) {
  return iniciativasDemo().find((i) => i.id === id);
}
