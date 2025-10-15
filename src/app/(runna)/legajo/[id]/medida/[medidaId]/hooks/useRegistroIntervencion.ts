/**
 * Custom Hook for Registro de Intervención
 * Manages state, API calls, and business logic for intervención registration
 *
 * MED-02: Registro de Intervención
 */

import { useState, useEffect, useCallback } from "react"
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
} from "../api/intervenciones-api-service"
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
}: UseRegistroIntervencionOptions) => {
  // ----------------------------------------------------------------------------
  // STATE - Form Data
  // ----------------------------------------------------------------------------
  const [formData, setFormData] = useState<IntervencionFormData>({
    medida: medidaId,
    fecha_intervencion: new Date().toISOString().split("T")[0], // Hoy por defecto
    tipo_dispositivo_id: null,
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
    }
  }, [intervencionId])

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
      setFormData({
        medida: data.medida,
        fecha_intervencion: data.fecha_intervencion,
        tipo_dispositivo_id: data.tipo_dispositivo_id || null,
        motivo_id: data.motivo_id,
        sub_motivo_id: data.sub_motivo_id || null,
        categoria_intervencion_id: data.categoria_intervencion_id,
        intervencion_especifica: data.intervencion_especifica,
        descripcion_detallada: data.descripcion_detallada || "",
        motivo_vulneraciones: data.motivo_vulneraciones || "",
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
        motivo_id: formData.motivo_id!,
        sub_motivo_id: formData.sub_motivo_id || null,
        categoria_intervencion_id: formData.categoria_intervencion_id!,
        intervencion_especifica: formData.intervencion_especifica,
        descripcion_detallada: formData.descripcion_detallada || null,
        motivo_vulneraciones: formData.motivo_vulneraciones || null,
        requiere_informes_ampliatorios: formData.requiere_informes_ampliatorios,
      }

      const data = await createIntervencion(medidaId, payload)
      setIntervencion(data)

      return data
    } catch (err: any) {
      console.error("Error creating intervención:", err)
      const errorMessage =
        err?.response?.data?.detail || "Error al crear la intervención"
      setError(errorMessage)

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
    if (!intervencionId) {
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
        motivo_id: formData.motivo_id,
        sub_motivo_id: formData.sub_motivo_id || null,
        categoria_intervencion_id: formData.categoria_intervencion_id,
        intervencion_especifica: formData.intervencion_especifica,
        descripcion_detallada: formData.descripcion_detallada || null,
        motivo_vulneraciones: formData.motivo_vulneraciones || null,
        requiere_informes_ampliatorios: formData.requiere_informes_ampliatorios,
      }

      const data = await updateIntervencion(medidaId, intervencionId, payload)
      setIntervencion(data)

      return data
    } catch (err: any) {
      console.error("Error updating intervención:", err)
      const errorMessage =
        err?.response?.data?.detail || "Error al actualizar la intervención"
      setError(errorMessage)

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
    if (intervencionId) {
      return await updateExistingIntervencion()
    } else {
      return await createNewIntervencion()
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
    if (!intervencionId) {
      setError("No se puede enviar: guarde la intervención primero")
      return false
    }

    setIsEnviando(true)
    setError(null)

    try {
      const response = await enviarIntervencion(medidaId, intervencionId)
      setIntervencion(response.intervencion)
      return true
    } catch (err: any) {
      console.error("Error enviando intervención:", err)
      setError(
        err?.response?.data?.detail || "Error al enviar la intervención"
      )
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
    if (!intervencionId) {
      setError("No se puede aprobar: ID de intervención no definido")
      return false
    }

    setIsAprobando(true)
    setError(null)

    try {
      const response = await aprobarIntervencion(medidaId, intervencionId)
      setIntervencion(response.intervencion)
      return true
    } catch (err: any) {
      console.error("Error aprobando intervención:", err)
      setError(
        err?.response?.data?.detail || "Error al aprobar la intervención"
      )
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
    if (!intervencionId) {
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
      const response = await rechazarIntervencion(medidaId, intervencionId, {
        observaciones_jz: observaciones,
      })
      setIntervencion(response.intervencion)
      return true
    } catch (err: any) {
      console.error("Error rechazando intervención:", err)
      setError(
        err?.response?.data?.detail || "Error al rechazar la intervención"
      )
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
    if (!intervencionId) return

    setIsLoadingAdjuntos(true)

    try {
      const data = await getAdjuntos(medidaId, intervencionId)
      setAdjuntos(data)
    } catch (err: any) {
      console.error("Error loading adjuntos:", err)
      // Don't set global error for adjuntos loading failure
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
    if (!intervencionId) {
      setError("Debe guardar la intervención antes de subir adjuntos")
      return null
    }

    setIsUploadingAdjunto(true)
    setError(null)

    try {
      const adjunto = await uploadAdjunto(medidaId, intervencionId, file, tipo)
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
    if (!intervencionId) return false

    try {
      await deleteAdjunto(medidaId, intervencionId, adjuntoId)
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
   * Load all catalog data
   * TODO: Replace with real API calls when catalog endpoints are available
   */
  const loadCatalogs = async () => {
    setIsLoadingCatalogs(true)

    try {
      // TODO: Replace with real API calls
      // For now, using mock data
      setTiposDispositivo([
        { id: 1, nombre: "Residencia", activo: true },
        { id: 2, nombre: "Hogar Convivencial", activo: true },
        { id: 3, nombre: "Familia Cuidadora", activo: true },
      ])

      setMotivos([
        { id: 1, nombre: "Vulneración de derechos", activo: true },
        { id: 2, nombre: "Seguimiento", activo: true },
        { id: 3, nombre: "Evaluación", activo: true },
      ])

      setSubMotivos([
        { id: 1, motivo_id: 1, nombre: "Maltrato físico", activo: true },
        { id: 2, motivo_id: 1, nombre: "Maltrato psicológico", activo: true },
        { id: 3, motivo_id: 2, nombre: "Seguimiento periódico", activo: true },
      ])

      setCategorias([
        { id: 1, nombre: "Categoría A", activo: true },
        { id: 2, nombre: "Categoría B", activo: true },
        { id: 3, nombre: "Categoría C", activo: true },
      ])
    } catch (err: any) {
      console.error("Error loading catalogs:", err)
      // Don't set global error for catalog loading failure
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
      fecha_intervencion: new Date().toISOString().split("T")[0],
      tipo_dispositivo_id: null,
      motivo_id: undefined,
      sub_motivo_id: null,
      categoria_intervencion_id: undefined,
      intervencion_especifica: "",
      descripcion_detallada: "",
      motivo_vulneraciones: "",
      requiere_informes_ampliatorios: false,
    })
    setValidationErrors({})
    setError(null)
  }

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    setError(null)
    setValidationErrors({})
  }

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
   * Only BORRADOR can be edited
   */
  const canEdit = !intervencion || intervencion.estado === "BORRADOR"

  /**
   * Check if intervención can be sent
   * Only BORRADOR can be sent
   */
  const canEnviar = intervencion?.estado === "BORRADOR"

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
