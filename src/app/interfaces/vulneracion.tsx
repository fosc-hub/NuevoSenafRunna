interface TBaseModel {
    id: number;
}

export interface TCategoriaMotivo extends TBaseModel {
    nombre: string;
    descripcion?: string | null;
    peso: number;
}

export interface TCategoriaSubmotivo extends TBaseModel {
    nombre: string;
    descripcion?: string | null;
    peso: number;
    motivo: number;
}

export interface TGravedadVulneracion extends TBaseModel {
    nombre: string;
    descripcion?: string | null;
    peso: number;
}

export interface TUrgenciaVulneracion extends TBaseModel {
    nombre: string;
    descripcion?: string | null;
    peso: number;
}

export interface TCondicionesVulnerabilidad extends TBaseModel {
    nombre: string;
    descripcion?: string | null;
    peso: number;
    nnya: boolean;
    adulto: boolean;
}

export interface TMotivoIntervencion extends TBaseModel {
    nombre: string;
    descripcion?: string | null;
    peso: number;
}

interface TVulneracionBase extends TBaseModel {
    principal_demanda: boolean;
    transcurre_actualidad: boolean;
    deleted: boolean;
    sumatoria_de_pesos: number;
    demanda?: any; // Replace with actual type
    nnya: any; // Replace with actual type
    autor_dv?: any; // Replace with actual type
    categoria_motivo: number;
    categoria_submotivo: number;
    gravedad_vulneracion: number;
    urgencia_vulneracion: number;
}

export interface TVulneracion extends TVulneracionBase {
}
