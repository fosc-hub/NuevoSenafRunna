import { useState } from 'react'
import { actividadService } from '../services/actividadService'
import { track, AnalyticsEvent } from '@/utils/analytics'
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
    successMessage?: string,
    analytics?: { accion: string; props?: Record<string, unknown> }
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await action()
      if (successMessage) {
        // You can integrate with toast notifications here
        console.log(successMessage)
      }
      if (analytics) {
        track(AnalyticsEvent.ACTIVIDAD_ACCION, {
          accion: analytics.accion,
          ...analytics.props,
        })
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
      'Estado actualizado correctamente',
      { accion: 'cambiar_estado', props: { actividad_id: id, nuevo_estado: (data as any)?.estado ?? null } }
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
      'Actividad reabierta correctamente',
      { accion: 'reabrir', props: { actividad_id: id } }
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
      'Actividad transferida correctamente',
      { accion: 'transferir', props: { actividad_id: id } }
    )
  }

  // JZ approval (before Legal)
  const visarJz = async (id: number, data: VisarJzRequest) => {
    return handleAction(
      () => actividadService.visarJz(id, data),
      data.aprobado ? 'Visado JZ aprobado - Enviado a Legal' : 'Visado JZ rechazado',
      { accion: 'visar_jz', props: { actividad_id: id, aprobado: data.aprobado } }
    )
  }

  // Legal approval
  const visar = async (id: number, data: VisarRequest) => {
    return handleAction(
      () => actividadService.visar(id, data),
      data.aprobado ? 'Visado aprobado' : 'Visado rechazado con observaciones',
      { accion: 'visar_legal', props: { actividad_id: id, aprobado: data.aprobado } }
    )
  }

  // GAP-17: Derivación interna - reasignar responsables secundarios
  const reasignarResponsables = async (id: number, responsables_secundarios: number[]) => {
    return handleAction(
      () => actividadService.reasignarResponsables(id, responsables_secundarios),
      'Responsables reasignados correctamente',
      { accion: 'reasignar_responsables', props: { actividad_id: id, cantidad: responsables_secundarios.length } }
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
    reasignarResponsables,
  }
}
