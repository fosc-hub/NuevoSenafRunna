export interface Persona {
    nombre: string
    apellido: string
    dni: string
    edad: number
    alias?: string
    telefono?: string
    email?: string
  }
  
  export interface Profesional {
    nombre: string
  }
  
  export interface Localidad {
    nombre: string
  }
  
  export interface MedidaActiva {
    tipo: string
    estado: string
    fecha_apertura: string
    grupo_actuante: string
    juzgado: string
    nro_sac: string
    respuesta_enviada: boolean
  }
  
  export interface SituacionesCriticas {
    BP: boolean
    RSA: boolean
    DCS: boolean
    SCP: boolean
  }
  
  export interface Intervencion {
    fecha: string
    descripcion: string
    hora: string
  }
  
  export interface MedidaHistorial {
    medida?: string
    fecha_alta: string
    duracion: string
    equipo: string
    juzgado: string
    dispositivo: string
    fecha_cierre: string
    legajos_afectado?: string
  }
  
  export interface HistorialMedidas {
    MPI: MedidaHistorial[]
    MPE: MedidaHistorial[]
    MPJ: MedidaHistorial[]
  }
  
  export interface Legajo {
    id: string
    numero_legajo: string
    fecha_apertura: string
    persona_principal: Persona
    profesional_asignado?: Profesional
    ubicacion: string
    localidad: Localidad
    equipo_interviniente: string
    prioridad: string
    medida_activa: MedidaActiva
    situaciones_criticas: SituacionesCriticas
    intervenciones: Intervencion[]
    historial_medidas: HistorialMedidas
  }
  