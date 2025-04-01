// Import the existing API service
import { create, get } from "@/app/api/apiService"

export interface Indicador {
  id: number
  nombre: string
  descripcion: string
  peso: number
  selected?: boolean
}

export interface Evaluacion {
  id?: number
  si_no: boolean
  demanda: number
  indicador: number
}

// Batch evaluation submission interface
export interface BatchEvaluacion {
  demanda: number
  indicadores: {
    indicador: number
    si_no: boolean
  }[]
}

// Fetch indicators from the API - using the correct endpoint format
export const getIndicadores = async (): Promise<Indicador[]> => {
  return get<Indicador>("indicadores-valoracion/")
}

// Submit an evaluation for an indicator (without showing toast)
const createSingleEvaluacion = async (evaluacion: Omit<Evaluacion, "id">): Promise<Evaluacion> => {
  return create<Evaluacion>("evaluaciones", evaluacion, false) // No toast for individual calls
}

// Submit all evaluations in a single request
export const createEvaluaciones = async (
  demandaId: number,
  indicadores: { indicadorId: number; selected: boolean }[],
): Promise<Evaluacion[]> => {
  try {
    // Make individual API calls without showing toasts
    const promises = indicadores.map(({ indicadorId, selected }) =>
      createSingleEvaluacion({
        si_no: selected,
        demanda: demandaId,
        indicador: indicadorId,
      }),
    )

    // Wait for all promises to resolve
    const results = await Promise.all(promises)

    // Show a single success toast after all are complete
    import("react-toastify").then(({ toast }) => {
      toast.success("Indicadores valorados correctamente", {
        position: "top-center",
        autoClose: 3000,
      })
    })

    return results
  } catch (error) {
    // Re-throw the error to be handled by the caller
    throw error
  }
}

