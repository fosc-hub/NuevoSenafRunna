export interface Persona {
  nombre: string
  dni: string
}

export interface Apertura {
  fecha: string
  estado: string
  equipo: string
}

export interface Task {
  estado: boolean
  tarea: string
  fecha: string
  objetivo: string
  plazo: string
}

export interface SeguimientoItem {
  fecha: string
  descripcion: string
  hora: string
}

export interface Cierre {
  fecha: string
  estado: string
  equipo: string
}

export interface UltimoInforme {
  fecha: string
  autor: string
  archivo: string
}

// Base interface for common fields
export interface BaseEtapas {
  apertura: Apertura
  historial_seguimiento: SeguimientoItem[]
  cierre: Cierre
}

// MPI specific etapas
export interface MPIEtapas extends BaseEtapas {
  plan_accion: Task[]
}

// MPE specific etapas
export interface MPEEtapas extends BaseEtapas {
  plan_evaluacion: Task[]
  evaluacion_familiar: {
    estado: string
    fecha_inicio: string
    fecha_finalizacion: string
    equipo_evaluador: string
    observaciones: string
  }
  legajos_afectados: {
    numero_legajo: string
    nombre_nnya: string
    relacion: string
  }[]
}

// Base medida data interface
export interface BaseMedidaData {
  id: string
  tipo: 'MPI' | 'MPE' | 'MPJ'
  numero: string
  persona: Persona
  fecha_apertura: string
  ubicacion: string
  direccion: string
  juzgado: string
  nro_sac: string
  origen_demanda: string
  motivo: string
  actores_intervinientes: string
  equipos: string
  articulacion: string
  ultimo_informe: UltimoInforme
}

// MPI specific data
export interface MPIMedidaData extends BaseMedidaData {
  tipo: 'MPI'
  etapas: MPIEtapas
}

// MPE specific data  
export interface MPEMedidaData extends BaseMedidaData {
  tipo: 'MPE'
  etapas: MPEEtapas
  familia_evaluada: {
    grupo_familiar: string
    contexto_socioeconomico: string
    dinamicas_familiares: string
  }
  // MPE specific fields
  fecha: string
  fecha_resguardo: string
  lugar_resguardo: string
  zona_trabajo: string
  zona_centro_vida: string
  articulacion_local: boolean
  numero_sac: string
  articulacion_area_local: boolean
  estados: {
    inicial: boolean
    apertura: boolean
    innovacion: number
    prorroga: number
    cambio_lugar: number
    seguimiento_intervencion: boolean
    cese: boolean
    post_cese: boolean
  }
  progreso: {
    iniciada: number
    en_seguimiento: number
    cierre: number
    total: number
  }
}

// Union type for all medida data
export type MedidaData = MPIMedidaData | MPEMedidaData

// Legacy interface for backward compatibility
export interface Etapas {
  apertura: Apertura
  plan_accion: Task[]
  historial_seguimiento: SeguimientoItem[]
  cierre: Cierre
}
