export interface TInstitucionDemanda {
    id: number;
    nombre: string;
    mail?: string | null;
    telefono?: number | null;
    localizacion?: number | null;
}

export interface TOrigen {
    id: number;
    nombre: string;
}
export interface TSubOrigen {
    id: number;
    nombre: string;
    origen: number;
}
export interface TUsuarioExterno {
    id: number;
    nombre: string;
    apellido: string;
    fecha_nacimiento?: Date | null;
    genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';
    telefono: number;
    mail: string;
    vinculo: number;
    institucion: number;
}

interface TDemandaBase {
    id: number;
    fecha_y_hora_ingreso: Date;
    origen: 'WEB' | 'TELEFONO' | 'MAIL' | 'PERSONAL' | 'OTRO';
    nro_notificacion_102?: number | null;
    nro_sac?: number | null;
    nro_suac?: number | null;
    nro_historia_clinica?: number | null;
    nro_oficio_web?: number | null;
    descripcion?: string | null;
    ultima_actualizacion: Date;
    constatacion: boolean;
    evaluacion: boolean;
    decision: boolean;
    archivado: boolean;
    completado: boolean;
    localizacion: number;
    usuario_externo?: number | null;
}

export interface TDemanda extends TDemandaBase {
  nnya_principal: any;
  precalificacion: any;
  estado_demanda: string;
  origen_demanda: any;
  demanda_score: any;
}
/** A generic paginated response shape */
export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
  }
  export type TDemandaPaginated = PaginatedResponse<TDemanda>

interface TPrecalificacionDemandaBase {
    id: number;
    fecha_y_hora: Date;
    descripcion: string;
    estado_demanda: 'URGENTE' | 'NO_URGENTE' | 'COMPLETAR';
    ultima_actualizacion: Date;
    demanda: number;
}

export interface TPrecalificacionDemanda extends TPrecalificacionDemandaBase {}

interface TDemandaScoreBase {
    id: number;
    ultima_actualizacion: Date;
    score: number;
    score_condiciones_vulnerabilidad: number;
    score_vulneracion: number;
    score_motivos_intervencion: number;
    score_indicadores_valoracion: number;
    demanda: number;
}

export interface TDemandaScore extends TDemandaScoreBase {}
