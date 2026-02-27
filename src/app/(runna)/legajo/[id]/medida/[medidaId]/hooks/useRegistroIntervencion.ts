/**
 * Custom Hook for Registro de Intervención
 * Manages state, API calls, and business logic for intervención registration
 *
 * MED-02: Registro de Intervención
 */

import { useState, useEffect, useCallback } from "react"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getCurrentDateISO } from "@/utils/dateUtils"
import {
  createIntervencion,
  updateIntervencion,
  getIntervencionDetail,
  enviarIntervencion,
  aprobarIntervencion,
  rechazarIntervencion,
  uploadAdjunto,
  getAdjuntos,
  deleteAdjunto,
  getCategorias,
  getTiposDispositivo,
  getCategoriasIntervencion,
  crearYEnviarIntervencion,
  getIntervencionesByMedida,
  type CrearYEnviarRequest,
  type CrearYEnviarResponse,
} from "../api/intervenciones-api-service"
import { medidaKeys } from './useMedidaDetail'

/** Query key prefix used by IntervencionesSection to list intervenciones */
const intervencionesListKey = (medidaId: number) => [`intervenciones/medida/${medidaId}`]
import type {
  CreateIntervencionRequest,
  UpdateIntervencionRequest,
  IntervencionResponse,
  AdjuntoIntervencion,
  TipoDispositivo,
  MotivoIntervencion,
  SubMotivoIntervencion,
  CategoriaIntervencion,
  EstadoIntervencion,
} from "../types/intervencion-api"

// ============================================================================
// TYPES
// ============================================================================

interface IntervencionFormData {
  // Identificadores
  medida: number

  // Información básica
  fecha_intervencion: string // YYYY-MM-DD

  // Tipo de dispositivo (opcional)
  tipo_dispositivo_id?: number | null
  subtipo_dispositivo?: number | string | null

  // Tipo de cese (solo para etapa CESE)
  tipo_cese?: string | null
  subtipo_cese?: string | null

  // Motivo y submotivo
  motivo_id?: number
  sub_motivo_id?: number | null

  // Categoría e intervención
  categoria_intervencion_id?: number
  intervencion_especifica: string

  // Descripciones
  descripcion_detallada: string
  motivo_vulneraciones: string

  // Configuración
  requiere_informes_ampliatorios: boolean
}

interface UseRegistroIntervencionOptions {
  medidaId: number
  intervencionId?: number // Si se pasa, carga la intervención existente
  autoLoadCatalogs?: boolean // Si true, carga catálogos automáticamente
  workflowPhase?: 'apertura' | 'innovacion' | 'prorroga' | 'cese'
}

interface ValidationErrors {
  [key: string]: string
}

// ============================================================================
// HOOK
// ============================================================================

export const useRegistroIntervencion = ({
  medidaId,
  intervencionId,
  autoLoadCatalogs = true,
  workflowPhase,
}: UseRegistroIntervencionOptions) => {
  // Query client for cache invalidation
  const queryClient = useQueryClient()

  // ----------------------------------------------------------------------------
  // STATE - Form Data
  // ----------------------------------------------------------------------------
  const [formData, setFormData] = useState<IntervencionFormData>({
    medida: medidaId,
    fecha_intervencion: getCurrentDateISO(), // Hoy por defecto
    tipo_dispositivo_id: null,
    subtipo_dispositivo: "",
    tipo_cese: null,
    subtipo_cese: null,
    motivo_id: undefined,
    sub_motivo_id: null,
    categoria_intervencion_id: undefined,
    intervencion_especifica: "",
    descripcion_detallada: "",
    motivo_vulneraciones: "",
    requiere_informes_ampliatorios: false,
  })

  // ----------------------------------------------------------------------------
  // STATE - Intervención actual (cuando se edita)
  // ----------------------------------------------------------------------------
  const [intervencion, setIntervencion] = useState<IntervencionResponse | null>(null)

  // ----------------------------------------------------------------------------
  // STATE - Loading States
  // ----------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEnviando, setIsEnviando] = useState(false)
  const [isAprobando, setIsAprobando] = useState(false)
  const [isRechazando, setIsRechazando] = useState(false)
  const [isUploadingAdjunto, setIsUploadingAdjunto] = useState(false)
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false)

  // ----------------------------------------------------------------------------
  // STATE - Error States
  // ----------------------------------------------------------------------------
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // ----------------------------------------------------------------------------
  // STATE - Catalogs (tipo_dispositivo, motivo, etc.)
  // ----------------------------------------------------------------------------
  const [tiposDispositivo, setTiposDispositivo] = useState<TipoDispositivo[]>([])
  const [motivos, setMotivos] = useState<MotivoIntervencion[]>([])
  const [subMotivos, setSubMotivos] = useState<SubMotivoIntervencion[]>([])
  const [categorias, setCategorias] = useState<CategoriaIntervencion[]>([])

  // ----------------------------------------------------------------------------
  // STATE - Adjuntos
  // ----------------------------------------------------------------------------
  const [adjuntos, setAdjuntos] = useState<AdjuntoIntervencion[]>([])
  const [isLoadingAdjuntos, setIsLoadingAdjuntos] = useState(false)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load intervención detail if intervencionId is provided
   */
  useEffect(() => {
    if (intervencionId) {
      loadIntervencion()
    } else if (workflowPhase === 'cese' && medidaId) {
      loadAperturaData()
    }
  }, [intervencionId, workflowPhase, medidaId])

  /**
   * Load catalogs on mount if autoLoadCatalogs is true
   */
  useEffect(() => {
    if (autoLoadCatalogs) {
      loadCatalogs()
    }
  }, [autoLoadCatalogs])

  /**
   * Load adjuntos when intervención is loaded
   */
  useEffect(() => {
    if (intervencion?.id) {
      loadAdjuntos()
    }
  }, [intervencion?.id])

  /**
   * Filter sub-motivos when motivo changes
   */
  useEffect(() => {
    if (formData.motivo_id) {
      // Filter sub-motivos by selected motivo
      // In a real app, this might trigger an API call to get sub-motivos for this motivo
      // For now, we just filter the existing list
      const filtered = subMotivos.filter(
        (sm) => sm.motivo_id === formData.motivo_id
      )
      // If current sub_motivo is not in the filtered list, clear it
      if (
        formData.sub_motivo_id &&
        !filtered.find((sm) => sm.id === formData.sub_motivo_id)
      ) {
        setFormData((prev) => ({ ...prev, sub_motivo_id: null }))
      }
    }
  }, [formData.motivo_id, subMotivos])

  // ============================================================================
  // API CALLS - CRUD
  // ============================================================================

  /**
   * Load intervención detail from API
   */
  const loadIntervencion = async () => {
    if (!intervencionId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await getIntervencionDetail(medidaId, intervencionId)
      setIntervencion(data)

      // Populate form data with loaded intervención
      // Extract IDs from detail objects as fallback (API returns *_detalle with nested id)
      setFormData({
        medida: data.medida,
        fecha_intervencion: data.fecha_intervencion,
        tipo_dispositivo_id: data.tipo_dispositivo_id ?? data.tipo_dispositivo_detalle?.id ?? null,
        subtipo_dispositivo: data.subtipo_dispositivo || null,
        motivo_id: data.motivo_id ?? data.motivo_detalle?.id,
        sub_motivo_id: data.sub_motivo_id ?? data.sub_motivo_detalle?.id ?? null,
        categoria_intervencion_id: data.categoria_intervencion_id ?? data.categoria_intervencion_detalle?.id,
        intervencion_especifica: data.intervencion_especifica,
        descripcion_detallada: data.descripcion_detallada || "",
        motivo_vulneraciones: data.motivo_vulneraciones || "",
        tipo_cese: data.tipo_cese || null,
        subtipo_cese: data.subtipo_cese || null,
        requiere_informes_ampliatorios: data.requiere_informes_ampliatorios,
      })

    } catch (err: any) {
      console.error("Error loading intervención:", err)
      setError(err?.response?.data?.detail || "Error al cargar la intervención")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Load aperture data to pre-fill cese fields
   */
  const loadAperturaData = async () => {
    if (!medidaId) return

    setIsLoading(true)
    try {
      // Fetch all interventions for this measure
      const intervenciones = await getIntervencionesByMedida(medidaId)

      // Find the "Apertura" (usually the oldest one or the first one created)
      // For now we assume the first one in the list (or we could sort by date)
      if (intervenciones.length > 0) {
        // Find by category or just pick the first one if we can't be sure
        const apertura = intervenciones.find(i => i.categoria_intervencion_detalle?.nombre.toUpperCase().includes('APERTURA'))
          || intervenciones[0]

        if (apertura) {
          console.log("Pre-filling from apertura:", apertura)
          setFormData(prev => ({
            ...prev,
            motivo_id: apertura.motivo_id ?? apertura.motivo_detalle?.id,
            sub_motivo_id: apertura.sub_motivo_id ?? apertura.sub_motivo_detalle?.id,
            categoria_intervencion_id: apertura.categoria_intervencion_id ?? apertura.categoria_intervencion_detalle?.id,
          }))
        }
      }
    } catch (err) {
      console.error("Error loading aperture data for pre-fill:", err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Create new intervención (BORRADOR)
   */
  const createNewIntervencion = async (): Promise<IntervencionResponse | null> => {
    // Validate required fields
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return null
    }

    setIsSaving(true)
    setError(null)
    setValidationErrors({})

    try {
      const payload: CreateIntervencionRequest = {
        medida: formData.medida,
        fecha_intervencion: formData.fecha_intervencion,
        tipo_dispositivo_id: formData.tipo_dispositivo_id || null,
        subtipo_dispositivo: formData.subtipo_dispositivo || null,
        motivo_id: formData.motivo_id!,
        sub_motivo_id: formData.sub_motivo_id || null,
        categoria_intervencion_id: formData.categoria_intervencion_id!,
        intervencion_especifica: formData.intervencion_especifica,
        descripcion_detallada: formData.descripcion_detallada || null,
        motivo_vulneraciones: formData.motivo_vulneraciones || null,
        tipo_cese: formData.tipo_cese || null,
        subtipo_cese: formData.subtipo_cese || null,
        requiere_informes_ampliatorios: formData.requiere_informes_ampliatorios,
      }

      const data = await createIntervencion(medidaId, payload)
      setIntervencion(data)

      toast.success('Registro de Intervención creado exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Force immediate refetch to update UI
      try {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        console.warn('[useRegistroIntervencion] Cache refetch failed (create):', refetchErr)
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return data
    } catch (err: any) {
      console.error("Error creating intervención:", err)
      const errorMessage =
        err?.response?.data?.detail || "Error al crear la intervención"
      setError(errorMessage)

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
      })

      // Handle validation errors from backend
      if (err?.response?.data?.errors) {
        const backendErrors: ValidationErrors = {}
        err.response.data.errors.forEach((e: any) => {
          backendErrors[e.field] = e.message
        })
        setValidationErrors(backendErrors)
      }

      return null
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Update existing intervención
   */
  const updateExistingIntervencion = async (): Promise<IntervencionResponse | null> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("No se puede actualizar: ID de intervención no definido")
      return null
    }

    // Validate required fields
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return null
    }

    setIsSaving(true)
    setError(null)
    setValidationErrors({})

    try {
      const payload: UpdateIntervencionRequest = {
        fecha_intervencion: formData.fecha_intervencion,
        tipo_dispositivo_id: formData.tipo_dispositivo_id || null,
        subtipo_dispositivo: formData.subtipo_dispositivo || null,
        motivo_id: formData.motivo_id,
        sub_motivo_id: formData.sub_motivo_id || null,
        categoria_intervencion_id: formData.categoria_intervencion_id,
        intervencion_especifica: formData.intervencion_especifica,
        descripcion_detallada: formData.descripcion_detallada || null,
        motivo_vulneraciones: formData.motivo_vulneraciones || null,
        tipo_cese: formData.tipo_cese,
        subtipo_cese: formData.subtipo_cese,
        requiere_informes_ampliatorios: formData.requiere_informes_ampliatorios,
      }

      const data = await updateIntervencion(medidaId, effectiveId, payload)
      setIntervencion(data)

      toast.success('Registro de Intervención actualizado exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Force immediate refetch to update UI
      try {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        console.warn('[useRegistroIntervencion] Cache refetch failed (update):', refetchErr)
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return data
    } catch (err: any) {
      console.error("Error updating intervención:", err)
      const errorMessage =
        err?.response?.data?.detail || "Error al actualizar la intervención"
      setError(errorMessage)

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
      })

      // Handle validation errors from backend
      if (err?.response?.data?.errors) {
        const backendErrors: ValidationErrors = {}
        err.response.data.errors.forEach((e: any) => {
          backendErrors[e.field] = e.message
        })
        setValidationErrors(backendErrors)
      }

      return null
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Save intervención (create or update based on whether intervencionId exists)
   */
  const guardarBorrador = async (): Promise<IntervencionResponse | null> => {
    // Use prop intervencionId, or fallback to a just-created intervention's ID
    const effectiveId = intervencionId || intervencion?.id
    if (effectiveId) {
      return await updateExistingIntervencion()
    } else {
      return await createNewIntervencion()
    }
  }

  /**
   * Create AND send intervención in one operation
   * Uses the combined /crear-y-enviar/ endpoint for better UX
   *
   * @param archivos Optional files to attach during creation
   * @param tipos Optional file types (must match archivos length)
   * @returns The created intervention with workflow state, or null on error
   */
  const guardarYEnviar = async (
    archivos?: File[],
    tipos?: string[]
  ): Promise<CrearYEnviarResponse | null> => {
    // Validate required fields
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return null
    }

    setIsSaving(true)
    setIsEnviando(true)
    setError(null)
    setValidationErrors({})

    try {
      const payload: CrearYEnviarRequest = {
        fecha_intervencion: formData.fecha_intervencion,
        motivo_id: formData.motivo_id!,
        sub_motivo_id: formData.sub_motivo_id || null,
        categoria_intervencion_id: formData.categoria_intervencion_id!,
        intervencion_especifica: formData.intervencion_especifica,
        descripcion_detallada: formData.descripcion_detallada || null,
        motivo_vulneraciones: formData.motivo_vulneraciones || null,
        tipo_dispositivo_id: formData.tipo_dispositivo_id || null,
        subtipo_dispositivo: formData.subtipo_dispositivo || null,
        tipo_cese: formData.tipo_cese || null,
        subtipo_cese: formData.subtipo_cese || null,
        requiere_informes_ampliatorios: formData.requiere_informes_ampliatorios,
      }

      const response = await crearYEnviarIntervencion(
        medidaId,
        payload,
        archivos,
        tipos
      )

      // Update local state with the created intervention
      setIntervencion(response)

      // Update cache directly with response data, then refetch for full sync
      try {
        // If response contains medida with etapa_actual, update the cache directly
        const responseAny = response as any
        if (responseAny.medida?.etapa_actual) {
          queryClient.setQueryData(
            medidaKeys.detail(medidaId),
            (oldData: any) => {
              if (!oldData) return oldData
              console.log('[guardarYEnviar] Updating cache with new etapa_actual:', responseAny.medida.etapa_actual)
              return {
                ...oldData,
                etapa_actual: responseAny.medida.etapa_actual,
                etapa_actual_detalle: responseAny.medida.etapa_actual,
              }
            }
          )
        }

        // Also refetch to ensure full sync
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        console.warn('[useRegistroIntervencion] Cache update failed (guardarYEnviar):', refetchErr)
        // Fallback to invalidation if refetch fails
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return response
    } catch (err: any) {
      console.error("Error creating and sending intervención:", err)
      const errorMessage =
        err?.response?.data?.detail || "Error al crear y enviar la intervención"
      setError(errorMessage)

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
      })

      // Handle validation errors from backend
      if (err?.response?.data?.errors) {
        const backendErrors: ValidationErrors = {}
        err.response.data.errors.forEach((e: any) => {
          backendErrors[e.field] = e.message
        })
        setValidationErrors(backendErrors)
      }

      return null
    } finally {
      setIsSaving(false)
      setIsEnviando(false)
    }
  }

  // ============================================================================
  // API CALLS - STATE TRANSITIONS
  // ============================================================================

  /**
   * Enviar intervención a aprobación (ET → JZ)
   * Estado 1 → Estado 2 (BORRADOR → ENVIADO)
   */
  const enviar = async (): Promise<boolean> => {
    // Use prop intervencionId, or fallback to the ID from a just-created intervention
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("No se puede enviar: guarde la intervención primero")
      return false
    }

    setIsEnviando(true)
    setError(null)

    try {
      const response = await enviarIntervencion(medidaId, effectiveId)
      setIntervencion(response.intervencion)

      toast.success('Intervención enviada exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Force immediate refetch to update UI with new workflow state
      try {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        console.warn('[useRegistroIntervencion] Cache refetch failed (enviar):', refetchErr)
        // Fallback to invalidation
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return true
    } catch (err: any) {
      console.error("Error enviando intervención:", err)
      const errorMsg = err?.response?.data?.detail || "Error al enviar la intervención"
      setError(errorMsg)
      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 5000,
      })
      return false
    } finally {
      setIsEnviando(false)
    }
  }

  /**
   * Aprobar intervención (JZ)
   * Estado 2 → Estado 3 (ENVIADO → APROBADO)
   */
  const aprobar = async (): Promise<boolean> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("No se puede aprobar: ID de intervención no definido")
      return false
    }

    setIsAprobando(true)
    setError(null)

    try {
      const response = await aprobarIntervencion(medidaId, effectiveId)

      // Response IS the intervention data directly (not nested under .intervencion)
      // Map medida object back to number for local state compatibility
      setIntervencion({
        ...response,
        medida: response.medida.id,
      } as IntervencionResponse)

      toast.success('Intervención aprobada exitosamente', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Update cache directly with response data, then refetch for full sync
      try {
        // Response contains medida.etapa_actual with the new workflow state
        if (response.medida?.etapa_actual) {
          console.log('[aprobar] Updating cache with new etapa_actual:', response.medida.etapa_actual)
          queryClient.setQueryData(
            medidaKeys.detail(medidaId),
            (oldData: any) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                etapa_actual: response.medida.etapa_actual,
                etapa_actual_detalle: response.medida.etapa_actual,
              }
            }
          )
        }

        // Also refetch to ensure full sync
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        console.warn('[useRegistroIntervencion] Cache update failed (aprobar):', refetchErr)
        // Fallback to invalidation
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return true
    } catch (err: any) {
      console.error("Error aprobando intervención:", err)
      const errorMsg = err?.response?.data?.detail || "Error al aprobar la intervención"
      setError(errorMsg)
      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 5000,
      })
      return false
    } finally {
      setIsAprobando(false)
    }
  }

  /**
   * Rechazar intervención (JZ)
   * Estado 2 → Estado 1 (ENVIADO → RECHAZADO → BORRADOR)
   */
  const rechazar = async (observaciones: string): Promise<boolean> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("No se puede rechazar: ID de intervención no definido")
      return false
    }

    if (!observaciones || observaciones.trim() === "") {
      setError("Debe proporcionar observaciones para rechazar")
      return false
    }

    setIsRechazando(true)
    setError(null)

    try {
      const response = await rechazarIntervencion(medidaId, effectiveId, {
        observaciones: observaciones,
      })

      // Response IS the intervention data directly (not nested under .intervencion)
      // Map medida object back to number for local state compatibility
      setIntervencion({
        ...response,
        medida: response.medida.id,
      } as IntervencionResponse)

      toast.info('Intervención rechazada. Se notificó al equipo técnico', {
        position: 'top-center',
        autoClose: 3000,
      })

      // Update cache directly with response data, then refetch for full sync
      try {
        // Response contains medida.etapa_actual with the new workflow state
        if (response.medida?.etapa_actual) {
          console.log('[rechazar] Updating cache with new etapa_actual:', response.medida.etapa_actual)
          queryClient.setQueryData(
            medidaKeys.detail(medidaId),
            (oldData: any) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                etapa_actual: response.medida.etapa_actual,
                etapa_actual_detalle: response.medida.etapa_actual,
              }
            }
          )
        }

        // Also refetch to ensure full sync
        await Promise.all([
          queryClient.refetchQueries({ queryKey: medidaKeys.detail(medidaId), type: 'all' }),
          queryClient.refetchQueries({ queryKey: intervencionesListKey(medidaId), type: 'all' }),
        ])
      } catch (refetchErr) {
        console.warn('[useRegistroIntervencion] Cache refetch failed (rechazar):', refetchErr)
        // Fallback to invalidation
        await queryClient.invalidateQueries({ queryKey: medidaKeys.detail(medidaId) })
      }

      return true
    } catch (err: any) {
      console.error("Error rechazando intervención:", err)
      const errorMsg = err?.response?.data?.detail || "Error al rechazar la intervención"
      setError(errorMsg)
      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 5000,
      })
      return false
    } finally {
      setIsRechazando(false)
    }
  }

  // ============================================================================
  // API CALLS - ADJUNTOS
  // ============================================================================

  /**
   * Load adjuntos list
   */
  const loadAdjuntos = async () => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) return


    setIsLoadingAdjuntos(true)

    try {
      const data = await getAdjuntos(medidaId, effectiveId)
      setAdjuntos(data)
    } catch (err: any) {
      console.error("Error loading adjuntos:", err)
      // Check for permission errors (Legal users might be blocked from this specific endpoint)
      if (err?.response?.status === 404 || err?.response?.status === 403) {
        console.warn("[useRegistroIntervencion] Specific adjuntos-list endpoint blocked, falling back to nested data")
      }
    } finally {
      setIsLoadingAdjuntos(false)
    }
  }

  /**
   * Upload adjunto
   */
  const uploadAdjuntoFile = async (
    file: File,
    tipo: string
  ): Promise<AdjuntoIntervencion | null> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) {
      setError("Debe guardar la intervención antes de subir adjuntos")
      return null
    }

    setIsUploadingAdjunto(true)
    setError(null)

    try {
      const adjunto = await uploadAdjunto(medidaId, effectiveId, file, tipo)
      // Reload adjuntos list
      await loadAdjuntos()
      return adjunto
    } catch (err: any) {
      console.error("Error uploading adjunto:", err)
      setError(err?.response?.data?.detail || "Error al subir el archivo")
      return null
    } finally {
      setIsUploadingAdjunto(false)
    }
  }

  /**
   * Delete adjunto
   */
  const deleteAdjuntoFile = async (adjuntoId: number): Promise<boolean> => {
    const effectiveId = intervencionId || intervencion?.id
    if (!effectiveId) return false

    try {
      await deleteAdjunto(medidaId, effectiveId, adjuntoId)
      // Reload adjuntos list
      await loadAdjuntos()
      return true
    } catch (err: any) {
      console.error("Error deleting adjunto:", err)
      setError(err?.response?.data?.detail || "Error al eliminar el archivo")
      return false
    }
  }

  // ============================================================================
  // API CALLS - CATALOGS
  // ============================================================================

  /**
   * Load all catalog data from API
   * Uses unified /api/categorias/ endpoint for motivos and submotivos
   */
  const loadCatalogs = async () => {
    setIsLoadingCatalogs(true)

    try {
      // Fetch all catalogs in parallel
      const [categoriasResponse, tiposDispositivoData, categoriasIntervencionData] = await Promise.all([
        getCategorias(),
        getTiposDispositivo(),
        getCategoriasIntervencion(),
      ])

      // Map categorias_motivo to MotivoIntervencion format
      const motivosData: MotivoIntervencion[] = categoriasResponse.categorias_motivo.map((motivo) => ({
        id: motivo.id,
        nombre: motivo.nombre,
        activo: true,
      }))

      // Map categorias_submotivo to SubMotivoIntervencion format
      const subMotivosData: SubMotivoIntervencion[] = categoriasResponse.categorias_submotivo.map((submotivo) => ({
        id: submotivo.id,
        motivo_id: submotivo.motivo, // Map 'motivo' to 'motivo_id'
        nombre: submotivo.nombre,
        activo: true,
      }))

      // Update state
      setTiposDispositivo(tiposDispositivoData)
      setMotivos(motivosData)
      setSubMotivos(subMotivosData)
      setCategorias(categoriasIntervencionData)

      console.log("Catalogs loaded successfully:", {
        motivos: motivosData.length,
        subMotivos: subMotivosData.length,
        tiposDispositivo: tiposDispositivoData.length,
        categorias: categoriasIntervencionData.length,
      })
    } catch (err: any) {
      console.error("Error loading catalogs:", err)
      // Don't set global error for catalog loading failure
      // Keep empty arrays so the UI can still render
    } finally {
      setIsLoadingCatalogs(false)
    }
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate form data
   * Returns object with field errors
   */
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {}

    if (!formData.fecha_intervencion) {
      errors.fecha_intervencion = "La fecha de intervención es obligatoria"
    }

    if (!formData.motivo_id) {
      errors.motivo_id = "El motivo es obligatorio"
    }

    if (!formData.categoria_intervencion_id) {
      errors.categoria_intervencion_id = "La categoría es obligatoria"
    }

    if (!formData.intervencion_especifica || formData.intervencion_especifica.trim() === "") {
      errors.intervencion_especifica = "La intervención específica es obligatoria"
    }

    return errors
  }

  /**
   * Check if form is valid
   */
  const isFormValid = (): boolean => {
    const errors = validateForm()
    return Object.keys(errors).length === 0
  }

  // ============================================================================
  // FORM HELPERS
  // ============================================================================

  /**
   * Update a single form field
   */
  const updateField = useCallback(
    <K extends keyof IntervencionFormData>(
      field: K,
      value: IntervencionFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear validation error for this field when it changes
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [validationErrors]
  )

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      medida: medidaId,
      fecha_intervencion: getCurrentDateISO(),
      tipo_dispositivo_id: null,
      motivo_id: undefined,
      sub_motivo_id: null,
      categoria_intervencion_id: undefined,
      intervencion_especifica: "",
      descripcion_detallada: "",
      motivo_vulneraciones: "",
      tipo_cese: null,
      subtipo_cese: null,
      requiere_informes_ampliatorios: false,
    })
    setValidationErrors({})
    setError(null)
  }

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setError(null)
    setValidationErrors({})
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Get filtered sub-motivos for current motivo
   */
  const availableSubMotivos = subMotivos.filter(
    (sm) => sm.motivo_id === formData.motivo_id
  )

  /**
   * Current estado of intervención
   */
  const currentEstado: EstadoIntervencion | null = intervencion?.estado || null

  /**
   * Check if intervención can be edited
   * BORRADOR and RECHAZADO can be edited
   */
  const canEdit = !intervencion || intervencion.estado === "BORRADOR" || intervencion.estado === "RECHAZADO"

  /**
   * Check if intervención can be sent
   * BORRADOR and RECHAZADO can be sent (re-sent after corrections)
   */
  const canEnviar = intervencion?.estado === "BORRADOR" || intervencion?.estado === "RECHAZADO"

  /**
   * Check if intervención can be approved/rejected
   * Only ENVIADO can be approved/rejected
   */
  const canAprobarOrRechazar = intervencion?.estado === "ENVIADO"

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // Form data
    formData,
    updateField,
    resetForm,

    // Current intervención
    intervencion,
    currentEstado,

    // Loading states
    isLoading,
    isSaving,
    isEnviando,
    isAprobando,
    isRechazando,
    isUploadingAdjunto,
    isLoadingAdjuntos,
    isLoadingCatalogs,

    // Error states
    error,
    validationErrors,
    clearErrors,

    // Validation
    validateForm,
    isFormValid,

    // CRUD operations
    guardarBorrador,
    guardarYEnviar,
    loadIntervencion,

    // State transitions
    enviar,
    aprobar,
    rechazar,

    // Adjuntos
    adjuntos,
    loadAdjuntos,
    uploadAdjuntoFile,
    deleteAdjuntoFile,

    // Catalogs
    tiposDispositivo,
    motivos,
    subMotivos: availableSubMotivos,
    categorias,
    loadCatalogs,

    // Permission checks
    canEdit,
    canEnviar,
    canAprobarOrRechazar,
  }
}
