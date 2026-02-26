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

// Additional interfaces for missing properties
export interface TDemandaZona {
    id: number;
    zona?: {
        nombre: string;
    };
    recibido: boolean;
    fecha_recibido?: string;
    recibido_por?: number;
}

export interface TCalificacion {
    id: number;
    estado_calificacion: string;
}

// Interface for calificacion operations (create/update)
export interface TCalificacionOperation {
    fecha_y_hora?: string;
    descripcion: string;
    estado_calificacion: string;
    demanda: number;
    justificacion: string;
    ultima_actualizacion?: string;
}

export interface TNnyaPrincipal {
    nombre: string;
    apellido: string;
    dni: string;
    legajo?: {
        numero: string;
    };
}

// Nuevo campo para NNyA desde legajo vinculado (usado en demandas CARGA_OFICIOS)
export interface TNnyaNombreLegajo {
    nombre: string;
    apellido: string;
    legajo_id: number;
    legajo_numero: string;
}

export interface TDemandaScore {
    id: number;
    ultima_actualizacion: Date;
    score: number;
    score_condiciones_vulnerabilidad: number;
    score_vulneracion: number;
    score_motivos_intervencion: number;
    score_indicadores_valoracion: number;
    demanda: number;
}

export interface TLocalizacion {
    nombre: string;
}

export interface TCpc {
    nombre: string;
}

export interface TUsuario {
    username: string;
}

export interface TZona {
    nombre: string;
}

export interface TEtiqueta {
    nombre: string;
}

export interface TAdjunto {
    archivo: string;
}

export interface TCalificacionChoice {
    0: string;
    1: string;
}

// Interface for demanda zona operations
export interface TDemandaZonaOperation {
    id: number;
    demanda: number;
    fecha_recibido: string;
    recibido: boolean;
    recibido_por: number;
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
    nnya_principal: TNnyaPrincipal | null;
    nnya_nombre_legajo?: TNnyaNombreLegajo | null;
    precalificacion: any;
    calificacion?: TCalificacion;
    estado_demanda: string;
    origen_demanda: any;
    demanda_score?: TDemandaScore;

    // Additional properties that the code accesses
    bloque_datos_remitente?: {
        nombre: string;
    };
    codigos_demanda?: Array<{ tipo: string; codigo: string }>;
    localidad?: TLocalizacion;
    cpc: TCpc;
    demanda_zona?: TDemandaZona;
    demanda_zona_id?: number;
    registrado_por_user_zona?: TZona;
    registrado_por_user?: TUsuario;
    area_senaf?: string;
    envio_de_respuesta?: string;
    objetivo_de_demanda?: string;
    etiqueta?: TEtiqueta;
    adjuntos?: TAdjunto[];
    calificacion_choices?: TCalificacionChoice[];

    // Properties needed for the fallback update
    fecha_recibido?: string;
    recibido?: boolean;
    recibido_por?: number;
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

export interface TPrecalificacionDemanda extends TPrecalificacionDemandaBase { }

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

export interface TDemandaScore extends TDemandaScoreBase { }
