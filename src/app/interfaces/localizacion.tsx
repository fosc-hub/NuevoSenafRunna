export interface TProvincia {
    id: number;
    nombre: string;
}

export interface TDepartamento {
    id: number;
    nombre: string;
    provincia: number;
}

export interface TLocalidad {
    id: number;
    nombre: string;
    departamento: number;
}

export interface TBarrio {
    id: number;
    nombre: string;
    localidad: number;
}

export interface TCPC {
    id: number;
    nombre: string;
    localidad: number;
}

interface TLocalizacionBase {
    id: number;
    deleted?: boolean;
    calle: string;
    tipo_calle: 'CALLE' | 'AVENIDA' | 'PASAJE' | 'RUTA' | 'BOULEVARD' | 'OTRO';
    piso_depto?: number | null;
    lote?: number | null;
    mza?: number | null;
    casa_nro?: number | null;
    referencia_geo: string;
    barrio?: number | null;
    localidad: number;
    cpc?: number | null;
}

export interface TLocalizacion extends TLocalizacionBase {
    
}
