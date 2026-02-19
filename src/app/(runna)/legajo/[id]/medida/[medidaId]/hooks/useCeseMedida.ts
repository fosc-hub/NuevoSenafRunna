/**
 * Custom Hook for Cese de Medidas (Measure Closure)
 *
 * Provides React Query mutations for closing protection measures:
 * - MPI: Direct closure
 * - MPE: Two-phase closure (initiate/confirm)
 *
 * Handles loading states, cache invalidation, and toast notifications.
 *
 * Usage:
 * ```tsx
 * const {
 *   cesarMPI,
 *   solicitarCese,
 *   isCesandoMPI,
 *   isSolicitandoCese,
 * } = useCeseMedida({ medidaId, onSuccess })
 * ```
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { cesarMedidaMPI, solicitarCeseMPE } from "../api/cese-medida-api-service"
import { medidaKeys } from "./useMedidaDetail"
import {
  isCeseIniciado,
  isCeseConfirmado,
  type CesarMedidaMPIRequest,
  type CesarMedidaMPIResponse,
  type SolicitarCeseMPERequest,
  type SolicitarCeseMPEResponse,
} from "../types/cese-medida-api"

// ============================================================================
// HOOK INTERFACE
// ============================================================================

interface UseCeseMedidaParams {
  /** ID of the medida to close */
  medidaId: number
  /** Callback on successful cese operation */
  onSuccess?: () => void
}

interface UseCeseMedidaReturn {
  /**
   * Close MPI measure directly
   * @param observaciones - Optional reason for closure
   * @param cancelarActividades - Whether to cancel pending activities (default: true)
   */
  cesarMPI: (observaciones?: string, cancelarActividades?: boolean) => Promise<CesarMedidaMPIResponse>

  /**
   * Initiate or confirm MPE measure closure
   * - If not in CESE etapa: Initiates cese (Flow A)
   * - If in CESE etapa: Confirms cese and closes (Flow B)
   * @param observaciones - Optional reason for closure
   * @param cancelarActividades - Whether to cancel pending activities (only for Flow A)
   */
  solicitarCese: (observaciones?: string, cancelarActividades?: boolean) => Promise<SolicitarCeseMPEResponse>

  /** Loading state for MPI cese */
  isCesandoMPI: boolean

  /** Loading state for MPE cese */
  isSolicitandoCese: boolean

  /** Error from last MPI cese attempt */
  errorMPI: Error | null

  /** Error from last MPE cese attempt */
  errorMPE: Error | null
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useCeseMedida({
  medidaId,
  onSuccess,
}: UseCeseMedidaParams): UseCeseMedidaReturn {
  const queryClient = useQueryClient()

  // ============================================================================
  // MPI MUTATION
  // ============================================================================

  const mpiMutation = useMutation<
    CesarMedidaMPIResponse,
    Error,
    CesarMedidaMPIRequest
  >({
    mutationFn: (data) => cesarMedidaMPI(medidaId, data),
    onSuccess: (response) => {
      // Show success toast
      toast.success(
        `✅ Medida MPI cerrada exitosamente. ${response.actividades_canceladas} actividades canceladas.`,
        {
          position: "top-center",
          autoClose: 4000,
        }
      )

      // Invalidate medida detail cache to refresh UI
      queryClient.invalidateQueries({
        queryKey: medidaKeys.detail(medidaId),
      })

      // Call success callback
      onSuccess?.()
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detalle || error?.message || "Error al cesar medida MPI"
      toast.error(`❌ ${message}`, {
        position: "top-center",
        autoClose: 5000,
      })
    },
  })

  // ============================================================================
  // MPE MUTATION
  // ============================================================================

  const mpeMutation = useMutation<
    SolicitarCeseMPEResponse,
    Error,
    SolicitarCeseMPERequest
  >({
    mutationFn: (data) => solicitarCeseMPE(medidaId, data),
    onSuccess: (response) => {
      // Show appropriate toast based on flow
      if (isCeseIniciado(response)) {
        toast.info(
          `ℹ️ Proceso de cese iniciado. ${response.siguiente_paso}`,
          {
            position: "top-center",
            autoClose: 5000,
          }
        )

        // Show warnings if any
        if (response.advertencias && response.advertencias.length > 0) {
          response.advertencias.forEach((adv) => {
            toast.warning(`⚠️ ${adv}`, {
              position: "top-center",
              autoClose: 6000,
            })
          })
        }
      } else if (isCeseConfirmado(response)) {
        toast.success(
          "✅ Medida cerrada exitosamente. Se ha creado la etapa POST_CESE para seguimiento.",
          {
            position: "top-center",
            autoClose: 4000,
          }
        )
      }

      // Invalidate medida detail cache to refresh UI
      queryClient.invalidateQueries({
        queryKey: medidaKeys.detail(medidaId),
      })

      // Call success callback
      onSuccess?.()
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detalle || error?.message || "Error al solicitar cese"
      toast.error(`❌ ${message}`, {
        position: "top-center",
        autoClose: 5000,
      })
    },
  })

  // ============================================================================
  // WRAPPER FUNCTIONS
  // ============================================================================

  /**
   * Close MPI measure directly
   */
  const cesarMPI = async (
    observaciones?: string,
    cancelarActividades: boolean = true
  ): Promise<CesarMedidaMPIResponse> => {
    return mpiMutation.mutateAsync({
      observaciones,
      cancelar_actividades: cancelarActividades,
    })
  }

  /**
   * Initiate or confirm MPE measure closure
   */
  const solicitarCese = async (
    observaciones?: string,
    cancelarActividades: boolean = true
  ): Promise<SolicitarCeseMPEResponse> => {
    return mpeMutation.mutateAsync({
      observaciones,
      cancelar_actividades: cancelarActividades,
    })
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    cesarMPI,
    solicitarCese,
    isCesandoMPI: mpiMutation.isPending,
    isSolicitandoCese: mpeMutation.isPending,
    errorMPI: mpiMutation.error,
    errorMPE: mpeMutation.error,
  }
}

export default useCeseMedida
