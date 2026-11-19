/** DTO compartidos. Las fechas incluyen la zona horaria (ISO 8601). */
export type EstadoIniciativa =
  | "borrador"
  | "publicada"
  | "en_preparacion"
  | "lista"
  | "realizada"
  | "completada"
  | "suspendida"
  | "cancelada";
export type EstadoNecesidad =
  "pendiente" | "comprometida" | "recibida" | "cubierta";
export type TipoAporte = "voluntariado" | "donacion_especie" | "transporte";

export interface OrganizadorPublico {
  id: string;
  nombre: string;
}


export interface Necesidad {
  id: string;
  nombre: string;
  tipo_aporte: TipoAporte;
  unidad: string;
  cantidad_objetivo: number;
  cantidad_confirmada: number;
  estado: EstadoNecesidad;
}

export interface IniciativaPublica {
  id: string;
  titulo: string;
  descripcion: string;
  ciudad: string;
  lugar: string;
  categoria: string;
  fecha_inicio: string;
  publicada_en: string;
  estado: Exclude<EstadoIniciativa, "borrador">;
  organizador: OrganizadorPublico;
  necesidades: Necesidad[];
}

export interface FiltrosIniciativas {
  ciudad?: string;
  categoria?: string;
  fecha?: string; // Día en Colombia, AAAA-MM-DD.
}

/** GET /api/iniciativas y GET /api/iniciativas/:id */
export interface ListaIniciativas {
  data: IniciativaPublica[];
  total: number;
}
export interface DetalleIniciativa {
  data: IniciativaPublica;
}

