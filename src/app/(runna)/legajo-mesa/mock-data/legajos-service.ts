import legajosData from "./legajos.json"

export interface Legajo {
  id: number
  numero_legajo: string
  fecha_apertura: string
  estado_legajo: string
  tipo_legajo: string
  prioridad: string
  ultima_actualizacion: string
  persona_principal: {
    nombre: string
    apellido: string
    alias?: string
    edad: number
    dni: string
  }
  ubicacion: string
  localidad: {
    id: number
    nombre: string
  }
  equipo_interviniente: string
  profesional_asignado: {
    id: number
    nombre: string
  } | null
  legajo_zona: {
    id: number
    zona: {
      id: number
      nombre: string
    }
    recibido: boolean
    fecha_recibido: string | null
  }
  medida_activa: {
    tipo: string
    estado: string
    fecha_apertura: string
    grupo_actuante: string
    juzgado: string
    nro_sac: string
    respuesta_enviada: boolean
  }
  intervenciones: {
    fecha: string
    descripcion: string
    hora: string
  }[]
  situaciones_criticas: {
    BP: boolean
    RSA: boolean
    DCS: boolean
    SCP: boolean
  }
  adjuntos: {
    archivo: string
  }[]
  historial_medidas: {
    MPI: {
      medida: string
      fecha_alta: string
      duracion: string
      equipo: string
      juzgado: string
      dispositivo: string
      fecha_cierre: string
    }[]
    MPE: {
      fecha_alta: string
      duracion: string
      equipo: string
      juzgado: string
      dispositivo: string
      fecha_cierre: string
      legajos_afectado: string
    }[]
    MPJ: {
      medida: string
      fecha_alta: string
      duracion: string
      equipo: string
      juzgado: string
      dispositivo: string
      fecha_cierre: string
    }[]
  }
  unassigned: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Get all legajos with pagination
export const getLegajos = (page = 0, pageSize = 10, filters: any = {}): PaginatedResponse<Legajo> => {
  let filteredLegajos = [...legajosData.legajos]

  // Apply filters
  if (filters.estado_legajo) {
    filteredLegajos = filteredLegajos.filter((legajo) => legajo.estado_legajo === filters.estado_legajo)
  }

  if (filters.tipo_legajo) {
    filteredLegajos = filteredLegajos.filter((legajo) => legajo.tipo_legajo === filters.tipo_legajo)
  }

  if (filters.prioridad) {
    filteredLegajos = filteredLegajos.filter((legajo) => legajo.prioridad === filters.prioridad)
  }

  // Calculate pagination
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize
  const paginatedLegajos = filteredLegajos.slice(startIndex, endIndex)

  return {
    count: filteredLegajos.length,
    next: endIndex < filteredLegajos.length ? `?page=${page + 1}&pageSize=${pageSize}` : null,
    previous: page > 0 ? `?page=${page - 1}&pageSize=${pageSize}` : null,
    results: paginatedLegajos,
  }
}

// Get a single legajo by ID
export const getLegajoById = (id: number | string): Legajo | null => {
  const numericId = typeof id === "string" ? Number.parseInt(id, 10) : id
  const legajo = legajosData.legajos.find((l) => l.id === numericId)
  return legajo || null
}

// Update a legajo (simulated)
export const updateLegajo = (id: number, data: Partial<Legajo>): Legajo => {
  const legajo = getLegajoById(id)
  if (!legajo) {
    throw new Error(`Legajo with ID ${id} not found`)
  }

  // In a real application, this would update the backend
  // For now, we'll just return the merged object
  return { ...legajo, ...data }
}
