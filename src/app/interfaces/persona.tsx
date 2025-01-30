interface TBaseModel {
    id: number;
    deleted?: boolean;
}

interface TPersonaBase extends TBaseModel {
    nombre: string;
    apellido: string;
    fecha_nacimiento?: Date | null;
    edad_aproximada?: number | null;
    dni?: number | null;
    situacion_dni: 'EN_TRAMITE' | 'VENCIDO' | 'EXTRAVIADO' | 'INEXISTENTE' | 'VALIDO' | 'OTRO';
    genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';
    boton_antipanico?: boolean;
    observaciones?: string | null;
    adulto: boolean;
    nnya: boolean;
}

export interface TPersona extends TPersonaBase {
}

export interface TInstitucionEducativa {
    nombre: string;
    mail?: string | null;
    telefono?: number | null;
    localizacion?: number | null;
}

interface TNNyAEducacionBase extends TBaseModel {
    curso: string;
    nivel: 'PRIMARIO' | 'SECUNDARIO' | 'TERCIARIO' | 'UNIVERSITARIO' | 'OTRO';
    turno: 'MANIANA' | 'TARDE' | 'NOCHE' | 'OTRO';
    comentarios?: string | null;
    institucion_educativa: number;
    nnya: number;
}

export interface TNNyAEducacion extends TNNyAEducacionBase {
}

export interface TInstitucionSanitaria {
    nombre: string;
    mail?: string | null;
    telefono?: number | null;
    localizacion?: number | null;
}

interface TNNyASaludBase extends TBaseModel {
    observaciones?: string | null;
    institucion_sanitaria: number;
    nnya: number;
}

export interface TNNyASalud extends TNNyASaludBase {
}

interface TNNyAScoreBase {
    ultima_actualizacion: Date;
    score: number;
    score_condiciones_vulnerabilidad: number;
    score_vulneracion: number;
    score_motivos_intervencion: number;
    nnya: number;
}

export interface TNNyAScore extends TNNyAScoreBase {}

interface TLegajoBase {
    info_legajo: string;
    nnya: number;
}

export interface TLegajo extends TLegajoBase {}
