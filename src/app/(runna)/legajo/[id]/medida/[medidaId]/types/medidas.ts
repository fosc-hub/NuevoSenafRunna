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
  
  export interface Etapas {
    apertura: Apertura
    plan_accion: Task[]
    historial_seguimiento: SeguimientoItem[]
    cierre: Cierre
  }
  
  export interface MedidaData {
    id: string
    tipo: string
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
    etapas: Etapas
    ultimo_informe: UltimoInforme
  }
  