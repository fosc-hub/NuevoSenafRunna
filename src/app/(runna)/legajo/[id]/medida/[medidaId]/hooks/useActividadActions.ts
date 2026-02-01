import { useState } from 'react'
import { actividadService } from '../services/actividadService'
import type {
  TActividadPlanTrabajo,
  TComentarioActividad,
  THistorialActividad,
  TTransferenciaActividad,
  CambiarEstadoRequest,
  ReabrirRequest,
  TransferirRequest,
  VisarRequest,
  VisarJzRequest,
  HistorialFilters
} from '../types/actividades'

/**
 * Hook for activity actions with loading/error states
 * Wraps all PLTM-02 service methods with state management
 */
export const useActividadActions = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async <T,>(
    action: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await action()
      if (successMessage) {
        // You can integrate with toast notifications here
        console.log(successMessage)
      }
      return result
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error desconocido'
      setError(errorMessage)
      console.error('Action error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // State transition
  const cambiarEstado = async (id: number, data: CambiarEstadoRequest) => {
    return handleAction(
      () => actividadService.cambiarEstado(id, data),
      'Estado actualizado correctamente'
    )
  }

  // Add comment
  const agregarComentario = async (id: number, texto: string) => {
    return handleAction(
      () => actividadService.agregarComentario(id, texto),
      'Comentario agregado'
    )
  }

  // Get history
  const getHistorial = async (id: number, filters?: HistorialFilters) => {
    return handleAction(
      () => actividadService.getHistorial(id, filters)
    )
  }

  // Reopen activity
  const reabrir = async (id: number, data: ReabrirRequest) => {
    return handleAction(
      () => actividadService.reabrir(id, data),
      'Actividad reabierta correctamente'
    )
  }

  // Get transfers
  const getTransferencias = async (id: number) => {
    return handleAction(
      () => actividadService.getTransferencias(id)
    )
  }

  // Transfer activity
  const transferir = async (id: number, data: TransferirRequest) => {
    return handleAction(
      () => actividadService.transferir(id, data),
      'Actividad transferida correctamente'
    )
  }

  // JZ approval (before Legal)
  const visarJz = async (id: number, data: VisarJzRequest) => {
    return handleAction(
      () => actividadService.visarJz(id, data),
      data.aprobado ? 'Visado JZ aprobado - Enviado a Legal' : 'Visado JZ rechazado'
    )
  }

  // Legal approval
  const visar = async (id: number, data: VisarRequest) => {
    return handleAction(
      () => actividadService.visar(id, data),
      data.aprobado ? 'Visado aprobado' : 'Visado rechazado con observaciones'
    )
  }

  return {
    loading,
    error,
    cambiarEstado,
    agregarComentario,
    getHistorial,
    reabrir,
    getTransferencias,
    transferir,
    visarJz,
    visar,
  }
}
