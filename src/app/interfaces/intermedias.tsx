interface TBaseModel {
    id: number;
    deleted?: boolean;
}

interface TLocalizacionPersonaBase extends TBaseModel {
    persona: number;
    localizacion: number;
    principal: boolean;
}

export interface TLocalizacionPersona extends TLocalizacionPersonaBase {
}

interface TDemandaPersonaBase extends TBaseModel {
    conviviente: boolean;
    supuesto_autordv: boolean;
    supuesto_autordv_principal: boolean;
    nnya_principal: boolean;
    demanda: number;
    persona: number;
}

export interface TDemandaPersona extends TDemandaPersonaBase {
}

interface TDemandaAsignadoBase {
    esta_activo: boolean;
    recibido: boolean;
    comentarios?: string;
    demanda: number;
    user: number;
}

export interface TDemandaAsignado extends TDemandaAsignadoBase {
}

interface TDemandaVinculadaBase extends TBaseModel {
    demanda_1 : number;
    demanda_2: number;
}

export interface TDemandaVinculada extends TDemandaVinculadaBase {
}

export interface TLegajoAsignado {
    esta_activo: boolean;
    recibido: boolean;
    comentarios?: string;
    legajo: number;
    user: number;
}

export interface TVinculoPersona {
    nombre: string;
}

interface TVinculoPersonaPersonaBase extends TBaseModel {
    conviven: boolean;
    autordv: boolean;
    garantiza_proteccion : boolean;
    persona_1 : number;
    persona_2 : number;
    vinculo?: number;
}

export interface TVinculoPersonaPersona extends TVinculoPersonaPersonaBase {
}

interface TPersonaCondicionesVulnerabilidadBase {
    si_no : boolean;
    persona: number;
    condicion_vulnerabilidad : number;
    demanda?: number;
}

export interface TPersonaCondicionesVulnerabilidad extends TPersonaCondicionesVulnerabilidadBase {}

interface TDemandaMotivoIntervencionBase {
    si_no: boolean;
    demanda: number;
    motivo_intervencion: number;
}

export interface TDemandaMotivoIntervencion extends TDemandaMotivoIntervencionBase {}