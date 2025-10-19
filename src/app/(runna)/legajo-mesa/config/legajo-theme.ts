/**
 * Standardized color system for Legajo indicators
 * Ensures consistency across priority chips, andarivel states, and semáforo indicators
 */

// Priority/Urgencia colors (ALTA, MEDIA, BAJA)
export const PRIORITY_COLORS = {
  ALTA: {
    bg: "#ffebee", // Light red background
    text: "#c62828", // Dark red text
    border: "#ef5350", // Medium red border
    icon: "#d32f2f", // Red icon
  },
  MEDIA: {
    bg: "#fff3e0", // Light orange/yellow background
    text: "#ef6c00", // Dark orange text
    border: "#ff9800", // Orange border
    icon: "#f57c00", // Orange icon
  },
  BAJA: {
    bg: "#e8f5e9", // Light green background
    text: "#2e7d32", // Dark green text
    border: "#66bb6a", // Medium green border
    icon: "#43a047", // Green icon
  },
} as const

// Andarivel (Medida workflow stages) colors
export const ANDARIVEL_COLORS = {
  Intervención: {
    bg: "#e3f2fd", // Light blue
    text: "#1565c0", // Dark blue
    border: "#42a5f5", // Medium blue
    icon: "#1976d2",
  },
  Aval: {
    bg: "#fff3e0", // Light orange
    text: "#e65100", // Dark orange
    border: "#fb8c00", // Orange
    icon: "#f57c00",
  },
  "Informe Jurídico": {
    bg: "#f3e5f5", // Light purple
    text: "#6a1b9a", // Dark purple
    border: "#ab47bc", // Medium purple
    icon: "#8e24aa",
  },
  Ratificación: {
    bg: "#e8f5e9", // Light green
    text: "#2e7d32", // Dark green
    border: "#66bb6a", // Medium green
    icon: "#43a047",
  },
} as const

// Semáforo colors (for Oficios vencimientos)
export const SEMAFORO_COLORS = {
  verde: {
    bg: "#e8f5e9", // Light green
    text: "#2e7d32", // Dark green
    border: "#66bb6a", // Medium green
    icon: "#43a047",
    label: "A tiempo",
  },
  amarillo: {
    bg: "#fffde7", // Light yellow
    text: "#f57f17", // Dark yellow
    border: "#ffeb3b", // Yellow
    icon: "#fbc02d",
    label: "Por vencer",
  },
  rojo: {
    bg: "#ffebee", // Light red
    text: "#c62828", // Dark red
    border: "#ef5350", // Medium red
    icon: "#d32f2f",
    label: "Vencido",
  },
} as const

// Plan de Trabajo (PT) activity states
export const PT_STATE_COLORS = {
  pendientes: {
    bg: "#e0e0e0", // Light gray
    text: "#424242", // Dark gray
    border: "#9e9e9e", // Medium gray
    icon: "#616161",
    label: "Pendientes",
  },
  en_progreso: {
    bg: "#e3f2fd", // Light blue
    text: "#1565c0", // Dark blue
    border: "#42a5f5", // Medium blue
    icon: "#1976d2",
    label: "En Progreso",
  },
  vencidas: {
    bg: "#ffebee", // Light red
    text: "#c62828", // Dark red
    border: "#ef5350", // Medium red
    icon: "#d32f2f",
    label: "Vencidas",
  },
  realizadas: {
    bg: "#e8f5e9", // Light green
    text: "#2e7d32", // Dark green
    border: "#66bb6a", // Medium green
    icon: "#43a047",
    label: "Realizadas",
  },
} as const

// Demanda (PI) states
export const DEMANDA_STATE_COLORS = {
  ACTIVA: {
    bg: "#e3f2fd", // Light blue
    text: "#1565c0", // Dark blue
    border: "#42a5f5", // Medium blue
    icon: "#1976d2",
  },
  CERRADA: {
    bg: "#e0e0e0", // Light gray
    text: "#424242", // Dark gray
    border: "#9e9e9e", // Medium gray
    icon: "#616161",
  },
  DERIVADA: {
    bg: "#fff3e0", // Light orange
    text: "#e65100", // Dark orange
    border: "#fb8c00", // Orange
    icon: "#f57c00",
  },
} as const

// Helper functions
export const getPriorityColor = (priority: "ALTA" | "MEDIA" | "BAJA" | null) => {
  if (!priority) return PRIORITY_COLORS.BAJA
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.BAJA
}

export const getAndarielColor = (
  etapa: "Intervención" | "Aval" | "Informe Jurídico" | "Ratificación" | null
) => {
  if (!etapa) return ANDARIVEL_COLORS.Intervención
  return ANDARIVEL_COLORS[etapa] || ANDARIVEL_COLORS.Intervención
}

export const getSemaforoColor = (semaforo: "verde" | "amarillo" | "rojo" | null) => {
  if (!semaforo) return SEMAFORO_COLORS.verde
  return SEMAFORO_COLORS[semaforo] || SEMAFORO_COLORS.verde
}

export const getPTStateColor = (state: "pendientes" | "en_progreso" | "vencidas" | "realizadas" | null) => {
  if (!state) return PT_STATE_COLORS.pendientes
  return PT_STATE_COLORS[state] || PT_STATE_COLORS.pendientes
}

export const getDemandaStateColor = (state: "ACTIVA" | "CERRADA" | "DERIVADA" | null) => {
  if (!state) return DEMANDA_STATE_COLORS.ACTIVA
  return DEMANDA_STATE_COLORS[state] || DEMANDA_STATE_COLORS.ACTIVA
}

// Calculate semáforo based on days remaining
export const calculateSemaforo = (fechaVencimiento: string): "verde" | "amarillo" | "rojo" => {
  const hoy = new Date()
  const vencimiento = new Date(fechaVencimiento)
  const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

  if (diasRestantes < 0) {
    return "rojo" // Vencido
  } else if (diasRestantes <= 3) {
    return "amarillo" // Por vencer (3 días o menos)
  } else {
    return "verde" // A tiempo
  }
}

// Progress bar colors
export const PROGRESS_BAR_COLORS = {
  verde: "#66bb6a", // Green
  amarillo: "#ffeb3b", // Yellow
  rojo: "#ef5350", // Red
  background: "#e0e0e0", // Gray background
} as const

// Type exports for convenience
export type PriorityType = keyof typeof PRIORITY_COLORS
export type AndarielType = keyof typeof ANDARIVEL_COLORS
export type SemaforoType = keyof typeof SEMAFORO_COLORS
export type PTStateType = keyof typeof PT_STATE_COLORS
export type DemandaStateType = keyof typeof DEMANDA_STATE_COLORS
