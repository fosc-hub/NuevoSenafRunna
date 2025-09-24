export interface TActividadTipo {
    id: number;
    nombre: string;
}

export interface TInstitucionActividad {
    id: number;
    nombre: string;
    mail?: string | null;
    telefono?: number | null;
    localizacion?: number | null;
}

interface TActividadBase {
    id: number;
    fecha_y_hora: string;
    descripcion: string;
    demanda: number;
    tipo?: number | null;
    institucion?: number | null;
}

export interface TActividad extends TActividadBase {}

export interface TInstitucionRespuesta {
    id: number;
    nombre: string;
    mail?: string | null;
    telefono?: number | null;
    localizacion?: number | null;
}

export interface TRespuesta {
    id: number;
    // fecha_y_hora: Date | null;
    mail: string;
    mensaje: string;
    demanda: number;
    institucion?: number | null;
}

export interface TIndicadoresValoracion {
    id: number;
    nombre: string;
    descripcion?: string | null;
    peso: number;
}

export interface TValoracionSeleccionada {
    indicador: number;
    checked: boolean;
}

interface TEvaluacionesBase {
    id: number;
    demanda: number;
    indicador: number;
    si_no: boolean;
}

export interface TEvaluaciones extends TEvaluacionesBase {}

export interface TDecision {
    id: number;
    justificacion: string;
    decision: 'APERTURA DE LEGAJO' | 'RECHAZAR CASO' | 'MPI_MPE';
    demanda: number;
    nnya: number;
}