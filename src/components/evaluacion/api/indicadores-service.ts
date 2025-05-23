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

// Valoración interface for the new endpoint
export interface ValoracionItem {
  indicador: number
  checked: boolean
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

// New function to use the /valoracion/{demanda_pk}/ endpoint using the apiService
export const submitValoracion = async (demandaId: number, indicadores: ValoracionItem[]): Promise<any> => {
  try {
    // Usar la función create del apiService para enviar los datos
    // Nota: Usamos el endpoint sin la barra final porque create la añade automáticamente
    const endpoint = `valoracion/${demandaId}`

    // Enviamos los indicadores como un array
    const response = await create<any>(
      endpoint,
      indicadores,
      true, // Mostrar toast de éxito
      "Indicadores valorados correctamente",
    )

    return response
  } catch (error) {
    console.error("Error submitting valoracion:", error)
    // El error ya será manejado por la función create del apiService
    throw error
  }
}
