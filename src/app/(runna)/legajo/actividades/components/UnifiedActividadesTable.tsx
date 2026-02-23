"use client"

import React, { useState, useMemo, useCallback } from "react"
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Button,
  Collapse,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import ClearIcon from "@mui/icons-material/Clear"
import FolderIcon from "@mui/icons-material/Folder"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import CheckBoxIcon from "@mui/icons-material/CheckBox"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import FilterListIcon from "@mui/icons-material/FilterList"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import CancelIcon from "@mui/icons-material/Cancel"
import AssignmentIcon from "@mui/icons-material/Assignment"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PendingIcon from "@mui/icons-material/Pending"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import ErrorIcon from "@mui/icons-material/Error"
import TimelineIcon from "@mui/icons-material/Timeline"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import RepeatIcon from "@mui/icons-material/Repeat"
import FiberNewIcon from "@mui/icons-material/FiberNew"
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useUser } from "@/utils/auth/userZustand"

// Import services
import { globalActividadService, type GlobalActividadFilters } from "../services/globalActividadService"
import { actividadService } from "../../[id]/medida/[medidaId]/services/actividadService"

// Import types
import type { TActividadPlanTrabajo, ActividadFilters } from "../../[id]/medida/[medidaId]/types/actividades"
import { getActorColor, ACTOR_LABELS, ZONA_TIPO_LABELS, getZonaTipoColor } from "../../[id]/medida/[medidaId]/types/actividades"
import { extractArray } from "@/hooks/useApiQuery"
import { useApiQuery } from "@/hooks/useApiQuery"

// Import reusable components
import { ActividadDetailModal } from "../../[id]/medida/[medidaId]/components/medida/ActividadDetailModal"
import { EditActividadModal } from "../../[id]/medida/[medidaId]/components/medida/EditActividadModal"
import { CancelActividadModal } from "../../[id]/medida/[medidaId]/components/medida/CancelActividadModal"
import AsignarActividadModal from "../../[id]/medida/[medidaId]/components/medida/AsignarActividadModal"
import { PlanAccionModal } from "../../[id]/medida/[medidaId]/components/medida/plan-accion-modal"
import { ResponsablesAvatarGroup } from "../../[id]/medida/[medidaId]/components/medida/ResponsablesAvatarGroup"
import { DeadlineIndicator } from "../../[id]/medida/[medidaId]/components/medida/DeadlineIndicator"
// QuickFilterChips removed - now using AdvancedFiltersPanel for all variants
import { ActividadStatistics } from "../../[id]/medida/[medidaId]/components/medida/ActividadStatistics"
import { useActorVisibility } from "../../[id]/medida/[medidaId]/hooks/useActorVisibility"
import BulkAsignarActividadModal from "./BulkAsignarActividadModal"
import { AdvancedFiltersPanel } from "./AdvancedFiltersPanel"
import { SectionCard } from "../../[id]/medida/[medidaId]/components/medida/shared/section-card"

// ============================================================================
// TYPES & CONFIGURATION
// ============================================================================

export type TableVariant = "legajo" | "medida" | "global"

// Estado color configuration
const ESTADO_COLORS: Record<string, { backgroundColor: string; color: string; bgLight: string; label: string }> = {
  PENDIENTE: { backgroundColor: "#ff9800", color: "white", bgLight: "rgba(255, 152, 0, 0.1)", label: "Pendiente" },
  EN_PROGRESO: { backgroundColor: "#2196f3", color: "white", bgLight: "rgba(33, 150, 243, 0.1)", label: "En Progreso" },
  COMPLETADA: { backgroundColor: "#4caf50", color: "white", bgLight: "rgba(76, 175, 80, 0.1)", label: "Completada" },
  REALIZADA: { backgroundColor: "#4caf50", color: "white", bgLight: "rgba(76, 175, 80, 0.1)", label: "Realizada" },
  PENDIENTE_VISADO_JZ: { backgroundColor: "#f57c00", color: "white", bgLight: "rgba(245, 124, 0, 0.1)", label: "Pend. Visado JZ" },
  PENDIENTE_VISADO: { backgroundColor: "#9c27b0", color: "white", bgLight: "rgba(156, 39, 176, 0.1)", label: "Pend. Visado" },
  VISADO_CON_OBSERVACION: { backgroundColor: "#ff5722", color: "white", bgLight: "rgba(255, 87, 34, 0.1)", label: "Visado c/Obs" },
  VISADO_APROBADO: { backgroundColor: "#009688", color: "white", bgLight: "rgba(0, 150, 136, 0.1)", label: "Visado Aprobado" },
  CANCELADA: { backgroundColor: "#f44336", color: "white", bgLight: "rgba(244, 67, 54, 0.1)", label: "Cancelada" },
  VENCIDA: { backgroundColor: "#9e9e9e", color: "white", bgLight: "rgba(158, 158, 158, 0.1)", label: "Vencida" },
}

const getEstadoColor = (estado: string) => {
  return ESTADO_COLORS[estado] || { backgroundColor: "#9e9e9e", color: "white", bgLight: "rgba(158, 158, 158, 0.1)", label: estado }
}

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface UnifiedActividadesTableProps {
  /** Table variant determines available features */
  variant: TableVariant

  // === Data Source Options (choose one) ===
  /** For 'legajo' variant: pre-loaded actividades from props */
  actividades?: TActividadPlanTrabajo[]
  /** For 'medida' variant: plan trabajo ID for API fetch */
  planTrabajoId?: number
  /** For 'medida' variant: medida data for modals */
  medidaData?: any
  /** For 'medida' variant: filter by etapa (MPJ phases) */
  filterEtapa?: "APERTURA" | "PROCESO" | "CESE"
  /** Actors to exclude from the table (e.g., ['EQUIPO_LEGAL'] for separate Kanban) */
  excludeActors?: string[]

  // === Callbacks ===
  /** Called when data should be refreshed */
  onRefresh?: () => void
  /** Called when actividades are updated (e.g., bulk assign). Returns the full updated list. */
  onActividadesUpdate?: (updatedActividades: TActividadPlanTrabajo[]) => void

  // === UI Customization ===
  /** Title for the section (default based on variant) */
  title?: string
  /** Whether to show the section wrapper (SectionCard for legajo, Paper for others) */
  showWrapper?: boolean
}

// ============================================================================
// UNIFIED COMPONENT
// ============================================================================

export const UnifiedActividadesTable: React.FC<UnifiedActividadesTableProps> = ({
  variant,
  actividades: propActividades,
  planTrabajoId,
  medidaData,
  filterEtapa,
  excludeActors,
  onRefresh,
  onActividadesUpdate,
  title,
  showWrapper = true,
}) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  useUser() // For auth context
  const { actorFilter, allowedActors, isActorAllowed, canSeeAllActors } = useActorVisibility()

  // ============================================================================
  // STATE
  // ============================================================================

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Filters
  const [filters, setFilters] = useState<GlobalActividadFilters & ActividadFilters>({
    search: "",
    estado: "",
    actor: "",
    origen: "",
    ordering: "-fecha_creacion",
  })

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [asignarModalOpen, setAsignarModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [planAccionModalOpen, setPlanAccionModalOpen] = useState(false)
  const [selectedActividad, setSelectedActividad] = useState<TActividadPlanTrabajo | null>(null)

  // Acuse de Recibo / Lectura Multi-Usuario (global variant)
  const [pendingAcuseActividad, setPendingAcuseActividad] = useState<TActividadPlanTrabajo | null>(null)

  // Sprint 2: Multi-user read tracking - local cache of read activity IDs
  // This is populated from API responses and updated optimistically on marcarLeida
  const [readActivityIds, setReadActivityIds] = useState<Set<number>>(new Set())

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Build effective filters with actor restriction
  const effectiveFilters = useMemo(() => {
    const baseFilters: GlobalActividadFilters = {
      ...filters,
      page: page + 1,
      page_size: rowsPerPage,
    }

    if (!canSeeAllActors && actorFilter) {
      baseFilters.actor = actorFilter
    } else if (filters.actor) {
      baseFilters.actor = filters.actor
    }

    return baseFilters
  }, [filters, page, rowsPerPage, actorFilter, canSeeAllActors])

  // Global variant: fetch from global API
  const {
    data: globalResponse,
    isLoading: globalLoading,
    isFetching: globalFetching,
    error: globalError,
    refetch: globalRefetch,
  } = useQuery({
    queryKey: ["global-actividades", effectiveFilters],
    queryFn: () => globalActividadService.list(effectiveFilters),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: variant === "global",
  })

  // Medida variant: fetch from plan trabajo API
  const {
    data: medidaResponse,
    isLoading: medidaLoading,
    refetch: medidaRefetch,
  } = useApiQuery<any>(
    `actividades-plan/${planTrabajoId}`,
    { ...filters, ...(actorFilter && { actor: actorFilter }), ordering: "-fecha_creacion" },
    {
      queryFn: () => actividadService.list(planTrabajoId!, { ...filters, ...(actorFilter && { actor: actorFilter }), ordering: "-fecha_creacion" }),
      enabled: variant === "medida" && !!planTrabajoId,
    }
  )

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  // Parse actividades from the appropriate source
  const { actividades, totalCount, isLoading, isFetching } = useMemo(() => {
    if (variant === "legajo") {
      // Use prop data for legajo variant
      return {
        actividades: propActividades || [],
        totalCount: propActividades?.length || 0,
        isLoading: false,
        isFetching: false,
      }
    }

    if (variant === "global") {
      if (!globalResponse) {
        return { actividades: [], totalCount: 0, isLoading: globalLoading, isFetching: globalFetching }
      }
      const items = extractArray<TActividadPlanTrabajo>(globalResponse as any)
      const count =
        !Array.isArray(globalResponse) && globalResponse && typeof globalResponse === "object" && "count" in globalResponse
          ? (globalResponse as any).count ?? items.length
          : items.length
      return { actividades: items, totalCount: count, isLoading: globalLoading, isFetching: globalFetching }
    }

    if (variant === "medida") {
      if (!medidaResponse) {
        return { actividades: [], totalCount: 0, isLoading: medidaLoading, isFetching: false }
      }
      if (Array.isArray(medidaResponse)) {
        return { actividades: medidaResponse, totalCount: medidaResponse.length, isLoading: medidaLoading, isFetching: false }
      }
      return {
        actividades: medidaResponse.results || [],
        totalCount: medidaResponse.count || 0,
        isLoading: medidaLoading,
        isFetching: false,
      }
    }

    return { actividades: [], totalCount: 0, isLoading: false, isFetching: false }
  }, [variant, propActividades, globalResponse, medidaResponse, globalLoading, globalFetching, medidaLoading])

  // Apply client-side filtering (for legajo variant which gets data from props)
  const filteredActividades = useMemo(() => {
    let result = actividades

    // Exclude specific actors (e.g., EQUIPO_LEGAL for separate Kanban display)
    if (excludeActors && excludeActors.length > 0) {
      result = result.filter((actividad) => !excludeActors.includes(actividad.actor))
    }

    // Actor visibility filtering
    if (!canSeeAllActors && allowedActors.length > 0) {
      result = result.filter((actividad) => isActorAllowed(actividad.actor))
    }

    // Etapa filtering (medida variant with MPJ)
    if (variant === "medida" && filterEtapa) {
      result = result.filter(
        (actividad) =>
          actividad.tipo_actividad_info?.etapa_medida_aplicable === filterEtapa ||
          actividad.tipo_actividad_info?.etapa_medida_aplicable === null
      )
    }

    // Client-side filtering for legajo variant (props-based data)
    if (variant === "legajo") {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(
          (actividad) =>
            actividad.tipo_actividad_info?.nombre?.toLowerCase().includes(searchLower) ||
            actividad.subactividad?.toLowerCase().includes(searchLower) ||
            actividad.descripcion?.toLowerCase().includes(searchLower) ||
            actividad.responsable_principal_info?.nombre_completo?.toLowerCase().includes(searchLower)
        )
      }

      // Estado filter
      if (filters.estado) {
        result = result.filter((actividad) => actividad.estado === filters.estado)
      }

      // Actor filter
      if (filters.actor) {
        result = result.filter((actividad) => actividad.actor === filters.actor)
      }

      // Vencida filter
      const globalFilters = filters as GlobalActividadFilters
      if (globalFilters.vencida === true) {
        result = result.filter((actividad) => actividad.esta_vencida && actividad.estado === "PENDIENTE")
      }

      // Tipo actividad filter
      if (globalFilters.tipo_actividad) {
        result = result.filter((actividad) => actividad.tipo_actividad === Number(globalFilters.tipo_actividad))
      }

      // Responsable filter
      if (globalFilters.responsable) {
        result = result.filter(
          (actividad) =>
            actividad.responsable_principal === Number(globalFilters.responsable) ||
            actividad.responsables_secundarios?.includes(Number(globalFilters.responsable))
        )
      }

      // Fecha desde filter
      if (globalFilters.fecha_desde) {
        const fechaDesde = new Date(globalFilters.fecha_desde)
        result = result.filter((actividad) => {
          if (!actividad.fecha_planificacion) return false
          return new Date(actividad.fecha_planificacion) >= fechaDesde
        })
      }

      // Fecha hasta filter
      if (globalFilters.fecha_hasta) {
        const fechaHasta = new Date(globalFilters.fecha_hasta)
        result = result.filter((actividad) => {
          if (!actividad.fecha_planificacion) return false
          return new Date(actividad.fecha_planificacion) <= fechaHasta
        })
      }
    }

    return result
  }, [actividades, variant, canSeeAllActors, allowedActors, isActorAllowed, filterEtapa, filters])

  // Paginated actividades (client-side for legajo/medida, server-side for global)
  const paginatedActividades = useMemo(() => {
    if (variant === "global") {
      // Server-side pagination
      return filteredActividades
    }
    // Client-side pagination
    const start = page * rowsPerPage
    return filteredActividades.slice(start, start + rowsPerPage)
  }, [filteredActividades, page, rowsPerPage, variant])

  // ============================================================================
  // SPRINT 2: Lectura Multi-Usuario
  // ============================================================================

  // Mutation to mark activity as read
  const marcarLeidaMutation = useMutation({
    mutationFn: (actividadId: number) => actividadService.marcarLeida(actividadId),
    onSuccess: (data) => {
      // Update local cache optimistically
      setReadActivityIds((prev) => new Set([...prev, data.actividad]))
      // Invalidate queries to refresh data if needed
      queryClient.invalidateQueries({ queryKey: ["actividad-lectura"] })
    },
  })

  // Get IDs of currently displayed activities for batch read status check
  const actividadIdsForLectura = useMemo(() => {
    return paginatedActividades.map((a) => a.id)
  }, [paginatedActividades])

  // Query to check which activities the current user has read
  // Batches individual leida-por-mi calls for efficiency
  const { data: lecturaStatusMap } = useQuery({
    queryKey: ["actividad-lectura-batch", actividadIdsForLectura],
    queryFn: async () => {
      if (actividadIdsForLectura.length === 0) return {}
      // Fetch read status for each activity in parallel
      const results = await Promise.all(
        actividadIdsForLectura.map(async (id) => {
          try {
            const response = await actividadService.getLeidaPorMi(id)
            return { id, leida: response.leida }
          } catch {
            return { id, leida: false }
          }
        })
      )
      // Convert to map for O(1) lookup
      return results.reduce((acc, { id, leida }) => {
        acc[id] = leida
        return acc
      }, {} as Record<number, boolean>)
    },
    enabled: variant === "global" && actividadIdsForLectura.length > 0,
    staleTime: 30 * 1000, // 30 seconds - balance between freshness and API calls
  })

  // Sync API lectura status with local state
  React.useEffect(() => {
    if (lecturaStatusMap) {
      const readIds = Object.entries(lecturaStatusMap)
        .filter(([_, leida]) => leida)
        .map(([id]) => Number(id))
      setReadActivityIds((prev) => new Set([...prev, ...readIds]))
    }
  }, [lecturaStatusMap])

  // Helper function to check if activity has been read by current user
  const isActivityRead = useCallback(
    (actividadId: number) => {
      return readActivityIds.has(actividadId)
    },
    [readActivityIds]
  )

  // Statistics
  const statistics = useMemo(() => {
    const sourceData = variant === "global" ? actividades : filteredActividades
    const total = sourceData.length
    const pendientes = sourceData.filter((a) => a.estado === "PENDIENTE").length
    const enProgreso = sourceData.filter((a) => a.estado === "EN_PROGRESO").length
    const realizadas = sourceData.filter((a) => a.estado === "COMPLETADA" || a.estado === "VISADO_APROBADO").length
    const vencidas = sourceData.filter((a) => a.esta_vencida && a.estado === "PENDIENTE").length
    const completionRate = total > 0 ? (realizadas / total) * 100 : 0

    return { total, pendientes, enProgreso, realizadas, vencidas, completionRate }
  }, [actividades, filteredActividades, variant])

  // Selection helpers
  const selectedActividades = useMemo(
    () => paginatedActividades.filter((a) => selectedIds.has(a.id)),
    [paginatedActividades, selectedIds]
  )

  const isAllSelected = useMemo(
    () => paginatedActividades.length > 0 && paginatedActividades.every((a) => selectedIds.has(a.id)),
    [paginatedActividades, selectedIds]
  )

  const isIndeterminate = useMemo(() => selectedIds.size > 0 && !isAllSelected, [selectedIds, isAllSelected])

  // Has active filters - now consistent for all variants
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.search ||
        filters.estado ||
        filters.actor ||
        filters.origen ||
        (filters as GlobalActividadFilters).nnya_nombre ||
        (filters as GlobalActividadFilters).nnya_dni ||
        (filters as GlobalActividadFilters).numero_legajo ||
        (filters as GlobalActividadFilters).tipo_medida ||
        (filters as GlobalActividadFilters).responsable ||
        (filters as GlobalActividadFilters).tipo_actividad ||
        (filters as GlobalActividadFilters).zona ||
        (filters as GlobalActividadFilters).fecha_desde ||
        (filters as GlobalActividadFilters).fecha_hasta ||
        (filters as GlobalActividadFilters).vencida ||
        (filters as GlobalActividadFilters).pendiente_visado ||
        (filters as GlobalActividadFilters).es_borrador ||
        (filters as GlobalActividadFilters).sin_leer // Sprint 2: Lectura Multi-Usuario
    )
  }, [filters])

  // Estado chip configs removed - now using AdvancedFiltersPanel for all variants

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(() => {
    if (variant === "global") {
      globalRefetch()
    } else if (variant === "medida") {
      medidaRefetch()
    }
    onRefresh?.()
  }, [variant, globalRefetch, medidaRefetch, onRefresh])

  const handleFilterChange = useCallback((key: keyof GlobalActividadFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      estado: "",
      actor: "",
      origen: "",
      ordering: "-fecha_creacion",
      nnya_nombre: undefined,
      nnya_dni: undefined,
      numero_legajo: undefined,
      tipo_medida: undefined,
      responsable: undefined,
      tipo_actividad: undefined,
      zona: undefined,
      fecha_desde: undefined,
      fecha_hasta: undefined,
      fecha_creacion_desde: undefined,
      fecha_creacion_hasta: undefined,
      vencida: undefined,
      pendiente_visado: undefined,
      es_borrador: undefined,
      dias_restantes_max: undefined,
      // Sprint 2: Lectura Multi-Usuario
      sin_leer: undefined,
      leida_por_mi: undefined,
    })
    setPage(0)
  }, [])

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      const newSelected = new Set(selectedIds)
      paginatedActividades.forEach((a) => newSelected.delete(a.id))
      setSelectedIds(newSelected)
    } else {
      const newSelected = new Set(selectedIds)
      paginatedActividades.forEach((a) => newSelected.add(a.id))
      setSelectedIds(newSelected)
    }
  }, [isAllSelected, paginatedActividades, selectedIds])

  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        newSelected.add(id)
      }
      return newSelected
    })
  }, [])

  const handleViewDetail = useCallback((actividad: TActividadPlanTrabajo) => {
    // Sprint 2: Auto-mark as read when viewing detail (global variant)
    if (variant === "global" && !isActivityRead(actividad.id)) {
      marcarLeidaMutation.mutate(actividad.id)
    }
    setSelectedActividad(actividad)
    setDetailModalOpen(true)
  }, [variant, isActivityRead, marcarLeidaMutation])

  const handleEdit = useCallback((actividad: TActividadPlanTrabajo) => {
    setSelectedActividad(actividad)
    setEditModalOpen(true)
  }, [])

  const handleCancel = useCallback((actividad: TActividadPlanTrabajo) => {
    setSelectedActividad(actividad)
    setCancelModalOpen(true)
  }, [])

  const handleAssign = useCallback((actividad: TActividadPlanTrabajo) => {
    setSelectedActividad(actividad)
    setAsignarModalOpen(true)
  }, [])

  const handleGoToLegajo = useCallback(
    (actividad: TActividadPlanTrabajo) => {
      if (actividad.legajo_info?.id && actividad.medida_info?.id) {
        router.push(`/legajo/${actividad.legajo_info.id}/medida/${actividad.medida_info.id}`)
      } else {
        handleViewDetail(actividad)
      }
    },
    [router, handleViewDetail]
  )

  const handleRequestAcuse = useCallback(
    (actividad: TActividadPlanTrabajo) => {
      // Sprint 2: Use backend-based read status
      if (isActivityRead(actividad.id)) {
        handleViewDetail(actividad)
      } else {
        setPendingAcuseActividad(actividad)
      }
    },
    [isActivityRead, handleViewDetail]
  )

  const handleConfirmAcuse = useCallback(() => {
    if (pendingAcuseActividad) {
      // Sprint 2: Mark as read via backend API
      marcarLeidaMutation.mutate(pendingAcuseActividad.id)

      setSelectedActividad(pendingAcuseActividad)
      setDetailModalOpen(true)
      setPendingAcuseActividad(null)
    }
  }, [pendingAcuseActividad, marcarLeidaMutation])

  const handleRowClick = useCallback(
    (actividad: TActividadPlanTrabajo) => {
      if (variant === "global") {
        handleRequestAcuse(actividad)
      }
    },
    [variant, handleRequestAcuse]
  )

  const handleBulkSuccess = useCallback((updatedActividades?: TActividadPlanTrabajo[]) => {
    setSelectedIds(new Set())
    setBulkModalOpen(false)

    // For prop-based data (legajo variant), merge updated actividades and notify parent
    if (variant === "legajo" && updatedActividades && updatedActividades.length > 0 && propActividades) {
      // Create a map of updated actividades by ID for quick lookup
      const updatedMap = new Map(updatedActividades.map(a => [a.id, a]))

      // Merge: replace existing items with updated ones
      const mergedActividades = propActividades.map(actividad =>
        updatedMap.has(actividad.id) ? updatedMap.get(actividad.id)! : actividad
      )

      // Notify parent of the update so it can update its state
      onActividadesUpdate?.(mergedActividades)
    } else {
      // For API-based data, just refresh
      handleRefresh()
    }
  }, [handleRefresh, variant, propActividades, onActividadesUpdate])

  const handleModalSuccess = useCallback(() => {
    handleRefresh()
  }, [handleRefresh])

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================

  const features = useMemo(
    () => ({
      // Selection & Bulk Actions - enabled for ALL variants
      showCheckbox: true,
      showBulkAssign: true,

      // Advanced Filters - enabled for ALL variants
      showAdvancedFilters: true,

      // Data columns - context-specific
      showNnyaLegajo: variant === "global",
      showFechaPlanificacion: true, // Show for all variants
      showZonas: variant === "global", // Show zonas column for global activities (PLTM Zonas Anidadas)

      // Global-specific features
      showAcuseRecibo: variant === "global",
      showGoToLegajo: variant === "global",
      showRefreshButton: variant === "global" || variant === "medida",

      // Medida-specific features
      showEdit: variant === "medida",
      showCancel: variant === "medida",
      showIndividualAssign: variant === "medida",
      showAddActivity: variant === "medida",

      // Deprecated - replaced by showAdvancedFilters for all
      showQuickFilterChips: false,
      showEstadoChipFilters: false,

      // Statistics display
      showProgressBar: variant === "legajo",
      showStatCards: true,

      // Wrapper style
      useSectionCard: variant === "legajo",
    }),
    [variant]
  )

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const formatDate = (fecha: string | null | undefined) => {
    if (!fecha) return "N/A"
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return fecha
    }
  }

  // ============================================================================
  // RENDER: LOADING
  // ============================================================================

  if (isLoading && actividades.length === 0) {
    return (
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={56} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={400} />
      </Paper>
    )
  }

  // ============================================================================
  // RENDER: NO PLAN TRABAJO (legajo variant)
  // ============================================================================

  if (variant === "legajo" && (!propActividades || propActividades.length === 0) && !hasActiveFilters) {
    const emptyContent = (
      <Box sx={{ textAlign: "center", py: 6, bgcolor: "grey.50", borderRadius: 2 }}>
        <AssignmentIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          No hay plan de trabajo asignado para este legajo.
        </Typography>
      </Box>
    )

    if (features.useSectionCard && showWrapper) {
      return <SectionCard title={title || "Plan de Trabajo"}>{emptyContent}</SectionCard>
    }
    return emptyContent
  }

  // ============================================================================
  // RENDER: STATISTICS
  // ============================================================================

  const renderStatistics = () => {
    if (variant === "medida") {
      return <ActividadStatistics actividades={filteredActividades} />
    }

    return (
      <Box sx={{ mb: 3 }}>
        {/* Progress Bar (legajo only) */}
        {features.showProgressBar && (
          <Paper elevation={1} sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                Progreso del Plan de Trabajo
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#4caf50" }}>
                {statistics.completionRate.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={statistics.completionRate}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                "& .MuiLinearProgress-bar": { borderRadius: 5, backgroundColor: "#4caf50" },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {statistics.realizadas} de {statistics.total} actividades completadas
              </Typography>
              {statistics.vencidas > 0 && (
                <Typography variant="caption" sx={{ color: "#f44336", fontWeight: 600 }}>
                  ⚠️ {statistics.vencidas} vencidas
                </Typography>
              )}
            </Box>
          </Paper>
        )}

        {/* Stat Cards */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255, 152, 0, 0.1)", borderLeft: "4px solid #ff9800" }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <PendingIcon sx={{ color: "#ff9800", fontSize: 28 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800" }}>
                  {statistics.pendientes}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                Pendientes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(33, 150, 243, 0.1)", borderLeft: "4px solid #2196f3" }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <PlayCircleIcon sx={{ color: "#2196f3", fontSize: 28 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2196f3" }}>
                  {statistics.enProgreso}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                En Progreso
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(76, 175, 80, 0.1)", borderLeft: "4px solid #4caf50" }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#4caf50" }}>
                  {variant === "global" ? totalCount : statistics.realizadas}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                {variant === "global" ? "Total" : "Realizadas"}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: statistics.vencidas > 0 ? "rgba(244, 67, 54, 0.1)" : "rgba(156, 39, 176, 0.1)",
                borderLeft: `4px solid ${statistics.vencidas > 0 ? "#f44336" : "#9c27b0"}`,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <ErrorIcon sx={{ color: statistics.vencidas > 0 ? "#f44336" : "#9c27b0", fontSize: 28 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: statistics.vencidas > 0 ? "#f44336" : "#9c27b0" }}>
                  {statistics.vencidas}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                Vencidas
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  // ============================================================================
  // RENDER: FILTERS
  // ============================================================================

  const renderFilters = () => {
    // Advanced Filters - now shown for ALL variants
    if (features.showAdvancedFilters) {
      return (
        <AdvancedFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          canSeeAllActors={canSeeAllActors}
          variant={variant}
        />
      )
    }

    return null
  }

  // ============================================================================
  // RENDER: BULK ACTIONS TOOLBAR
  // ============================================================================

  const renderBulkActionsToolbar = () => {
    if (!features.showBulkAssign || selectedIds.size === 0) return null

    return (
      <Collapse in={selectedIds.size > 0}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: "primary.50",
            border: "1px solid",
            borderColor: "primary.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CheckBoxIcon color="primary" />
            <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
              {selectedIds.size} {selectedIds.size === 1 ? "actividad seleccionada" : "actividades seleccionadas"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AssignmentIndIcon />}
              onClick={() => setBulkModalOpen(true)}
            >
              Asignar Responsables
            </Button>
            <Button variant="outlined" color="inherit" size="small" onClick={() => setSelectedIds(new Set())}>
              Cancelar Selección
            </Button>
          </Box>
        </Paper>
      </Collapse>
    )
  }

  // ============================================================================
  // RENDER: TABLE
  // ============================================================================

  const renderTable = () => (
    <TableContainer>
      <Table sx={{ "& .MuiTableRow-root:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" } }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "primary.main",
              "& .MuiTableCell-root": { position: "sticky", top: 0, zIndex: 1, backgroundColor: "primary.main" },
            }}
          >
            {features.showCheckbox && (
              <TableCell padding="checkbox" sx={{ backgroundColor: "primary.main" }}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  sx={{
                    color: "white",
                    "&.Mui-checked": { color: "white" },
                    "&.MuiCheckbox-indeterminate": { color: "white" },
                  }}
                />
              </TableCell>
            )}
            <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Tipo / Subactividad</TableCell>
            {features.showNnyaLegajo && (
              <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>NNyA / Legajo</TableCell>
            )}
            <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Equipo</TableCell>
            {features.showZonas && (
              <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Zonas</TableCell>
            )}
            <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Responsables</TableCell>
            {features.showFechaPlanificacion && (
              <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Fecha Plan.</TableCell>
            )}
            <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem" }}>Plazo</TableCell>
            <TableCell sx={{ fontWeight: 600, color: "white", fontSize: "0.875rem", textAlign: "center" }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedActividades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={features.showNnyaLegajo ? (features.showZonas ? 10 : 9) : features.showFechaPlanificacion ? 8 : 7} align="center">
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <FilterListIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {hasActiveFilters
                      ? "No se encontraron actividades con los filtros aplicados"
                      : variant === "global"
                      ? "No tienes actividades asignadas"
                      : "No hay actividades en el plan de trabajo"}
                  </Typography>
                  {hasActiveFilters && (
                    <Chip label="Limpiar filtros" onClick={handleClearFilters} color="primary" variant="outlined" sx={{ mt: 2 }} />
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            paginatedActividades.map((actividad) => {
              const estadoConfig = getEstadoColor(actividad.estado)
              const isSelected = selectedIds.has(actividad.id)
              // Sprint 2: Use backend-based read status
              const isRead = variant === "global" ? isActivityRead(actividad.id) : true
              const isUnread = variant === "global" && !isRead

              return (
                <TableRow
                  key={actividad.id}
                  hover
                  selected={isSelected}
                  onClick={() => handleRowClick(actividad)}
                  sx={{
                    backgroundColor: isSelected
                      ? "rgba(156, 39, 176, 0.08)"
                      : isUnread
                      ? "rgba(25, 118, 210, 0.04)" // Light blue for unread
                      : actividad.esta_vencida && actividad.estado === "PENDIENTE"
                      ? "rgba(211, 47, 47, 0.05)"
                      : actividad.es_borrador
                      ? "rgba(237, 108, 2, 0.05)"
                      : "transparent",
                    borderLeft: isSelected
                      ? "4px solid #9c27b0"
                      : isUnread
                      ? "4px solid #1976d2" // Blue left border for unread
                      : actividad.esta_vencida && actividad.estado === "PENDIENTE"
                      ? "4px solid #d32f2f"
                      : actividad.es_borrador
                      ? "4px solid #ed6c02"
                      : "4px solid transparent",
                    transition: "all 0.2s",
                    cursor: variant === "global" ? "pointer" : "default",
                    fontWeight: isUnread ? 600 : 400, // Bold text for unread
                  }}
                >
                  {/* Checkbox */}
                  {features.showCheckbox && (
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onChange={() => handleSelectOne(actividad.id)} color="primary" />
                    </TableCell>
                  )}

                  {/* Tipo / Subactividad */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {actividad.tipo_actividad_info?.nombre || "Sin tipo"}
                        </Typography>
                        {actividad.subactividad && (
                          <Typography variant="caption" color="text.secondary">
                            {actividad.subactividad}
                          </Typography>
                        )}
                        {actividad.descripcion && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontStyle: "italic" }}>
                            {actividad.descripcion.length > 50 ? `${actividad.descripcion.substring(0, 50)}...` : actividad.descripcion}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-end" }}>
                        {/* Sprint 2: Unread badge for global variant */}
                        {isUnread && (
                          <Chip
                            icon={<FiberNewIcon sx={{ fontSize: 14 }} />}
                            label="Nueva"
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 600, fontSize: "0.65rem", height: 20 }}
                          />
                        )}
                        {actividad.esta_vencida && actividad.estado === "PENDIENTE" && (
                          <Chip label="VENCIDA" size="small" color="error" sx={{ fontWeight: 600, fontSize: "0.65rem" }} />
                        )}
                        {actividad.es_borrador && (
                          <Chip label="BORRADOR" size="small" variant="outlined" color="warning" sx={{ fontWeight: 500, fontSize: "0.65rem" }} />
                        )}
                        {/* Recursive Activity Indicator - Sprint 3 */}
                        {actividad.tipo_actividad_info?.es_recursiva && (
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  Actividad Recursiva
                                </Typography>
                                <Typography variant="caption">
                                  Se crea automáticamente cada {actividad.tipo_actividad_info.periodo_recursion_dias} días
                                </Typography>
                                {actividad.origen === "AUTO_RECURSIVA" && (
                                  <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: "italic" }}>
                                    Creada automáticamente por el sistema
                                  </Typography>
                                )}
                              </Box>
                            }
                          >
                            <Chip
                              icon={<RepeatIcon sx={{ fontSize: 14 }} />}
                              label={actividad.origen === "AUTO_RECURSIVA" ? "AUTO" : `${actividad.tipo_actividad_info.periodo_recursion_dias}d`}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              sx={{
                                fontSize: "0.65rem",
                                height: 20,
                                backgroundColor: actividad.origen === "AUTO_RECURSIVA" ? "rgba(156, 39, 176, 0.1)" : "transparent",
                                "& .MuiChip-icon": { color: "inherit" }
                              }}
                            />
                          </Tooltip>
                        )}
                        {actividad.adjuntos && actividad.adjuntos.length > 0 && (
                          <Tooltip title={`${actividad.adjuntos.length} archivos`}>
                            <Chip
                              icon={<TimelineIcon fontSize="small" />}
                              label={actividad.adjuntos.length}
                              size="small"
                              variant="outlined"
                              color="info"
                              sx={{ fontSize: "0.65rem", height: 18 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* NNyA / Legajo */}
                  {features.showNnyaLegajo && (
                    <TableCell>
                      {actividad.legajo_info ? (
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {actividad.legajo_info.nnya_apellido}, {actividad.legajo_info.nnya_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {actividad.legajo_info.numero}
                          </Typography>
                          {actividad.medida_info && (
                            <Chip
                              label={actividad.medida_info.tipo_medida}
                              size="small"
                              sx={{
                                ml: 1,
                                fontSize: "0.65rem",
                                height: 18,
                                backgroundColor: actividad.medida_info.estado_vigencia === "VIGENTE" ? "rgba(76, 175, 80, 0.1)" : "rgba(158, 158, 158, 0.1)",
                                color: actividad.medida_info.estado_vigencia === "VIGENTE" ? "#388e3c" : "#757575",
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin información
                        </Typography>
                      )}
                    </TableCell>
                  )}

                  {/* Equipo */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Chip
                      label={actividad.actor_display || ACTOR_LABELS[actividad.actor] || actividad.actor}
                      size="small"
                      sx={{ backgroundColor: getActorColor(actividad.actor), color: "white", fontSize: "0.7rem", fontWeight: 500 }}
                    />
                  </TableCell>

                  {/* Zonas */}
                  {features.showZonas && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {actividad.zonas_info && actividad.zonas_info.length > 0 ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {actividad.zonas_info.map((zona) => (
                            <Tooltip
                              key={zona.id}
                              title={
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>{zona.nombre}</Typography>
                                  <Typography variant="caption">
                                    {ZONA_TIPO_LABELS[zona.tipo_responsabilidad] || zona.tipo_responsabilidad}
                                  </Typography>
                                  {zona.user_responsable && (
                                    <Typography variant="caption" display="block">
                                      Responsable: {zona.user_responsable.nombre_completo}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            >
                              <Chip
                                icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                                label={zona.nombre}
                                size="small"
                                sx={{
                                  backgroundColor: `${getZonaTipoColor(zona.tipo_responsabilidad)}15`,
                                  color: getZonaTipoColor(zona.tipo_responsabilidad),
                                  fontSize: "0.65rem",
                                  height: 22,
                                  "& .MuiChip-icon": { color: "inherit" }
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Sin zonas</Typography>
                      )}
                    </TableCell>
                  )}

                  {/* Responsables */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <ResponsablesAvatarGroup
                      responsablePrincipal={actividad.responsable_principal_info}
                      responsablesSecundarios={actividad.responsables_secundarios_info}
                    />
                  </TableCell>

                  {/* Fecha Planificación */}
                  {features.showFechaPlanificacion && (
                    <TableCell>
                      <Typography variant="body2">{formatDate(actividad.fecha_planificacion)}</Typography>
                    </TableCell>
                  )}

                  {/* Estado */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Chip
                      label={actividad.estado_display || estadoConfig.label}
                      sx={{ backgroundColor: estadoConfig.backgroundColor, color: estadoConfig.color, fontWeight: 500, fontSize: "0.75rem" }}
                      size="small"
                    />
                  </TableCell>

                  {/* Plazo */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DeadlineIndicator
                      diasRestantes={actividad.dias_restantes}
                      estaVencida={actividad.esta_vencida}
                      estado={actividad.estado}
                      fechaPlanificacion={actividad.fecha_planificacion}
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell sx={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
                      {/* Acuse de Recibo / View - Sprint 2: Uses isRead from backend */}
                      {features.showAcuseRecibo ? (
                        isRead ? (
                          <Tooltip title="Ver detalle (ya leída)">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetail(actividad)}
                              sx={{
                                backgroundColor: "rgba(76, 175, 80, 0.1)",
                                color: "success.main",
                                "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.2)", transform: "scale(1.1)" },
                                transition: "all 0.2s",
                              }}
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Marcar como leída y ver detalle">
                            <IconButton
                              size="small"
                              onClick={() => handleRequestAcuse(actividad)}
                              sx={{
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                                color: "primary.main",
                                "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.2)", transform: "scale(1.1)" },
                                transition: "all 0.2s",
                              }}
                            >
                              <MarkEmailUnreadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )
                      ) : (
                        <Tooltip title="Ver detalle">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetail(actividad)}
                            sx={{
                              backgroundColor: "rgba(156, 39, 176, 0.1)",
                              color: "primary.main",
                              "&:hover": { backgroundColor: "rgba(156, 39, 176, 0.2)", transform: "scale(1.1)" },
                              transition: "all 0.2s",
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Edit */}
                      {features.showEdit && (
                        <Tooltip title={actividad.estado === "REALIZADA" || actividad.estado === "CANCELADA" ? "No se puede editar" : "Editar"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(actividad)}
                              disabled={actividad.estado === "REALIZADA" || actividad.estado === "CANCELADA"}
                              sx={{
                                backgroundColor: "rgba(156, 39, 176, 0.1)",
                                color: "primary.main",
                                "&:hover": { backgroundColor: "rgba(156, 39, 176, 0.2)", transform: "scale(1.1)" },
                                "&:disabled": { backgroundColor: "rgba(0, 0, 0, 0.05)", color: "rgba(0, 0, 0, 0.26)" },
                                transition: "all 0.2s",
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      {/* Cancel */}
                      {features.showCancel && (
                        <Tooltip title={actividad.estado === "REALIZADA" || actividad.estado === "CANCELADA" ? "No se puede cancelar" : "Cancelar"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleCancel(actividad)}
                              disabled={actividad.estado === "REALIZADA" || actividad.estado === "CANCELADA"}
                              sx={{
                                color: "error.main",
                                "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)", transform: "scale(1.1)" },
                                "&:disabled": { backgroundColor: "rgba(0, 0, 0, 0.05)", color: "rgba(0, 0, 0, 0.26)" },
                                transition: "all 0.2s",
                              }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      {/* Individual Assign */}
                      {features.showIndividualAssign && (
                        <Tooltip title="Asignar responsables">
                          <IconButton
                            size="small"
                            onClick={() => handleAssign(actividad)}
                            sx={{
                              backgroundColor: "rgba(33, 150, 243, 0.1)",
                              color: "info.main",
                              "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.2)", transform: "scale(1.1)" },
                              transition: "all 0.2s",
                            }}
                          >
                            <AssignmentIndIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Go to Legajo */}
                      {features.showGoToLegajo && (
                        <Tooltip title={actividad.legajo_info ? `Ir al legajo ${actividad.legajo_info.numero}` : "Ir al legajo"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleGoToLegajo(actividad)}
                              disabled={!actividad.legajo_info || !actividad.medida_info}
                              sx={{
                                backgroundColor: "rgba(33, 150, 243, 0.1)",
                                color: "info.main",
                                "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.2)", transform: "scale(1.1)" },
                                "&:disabled": { backgroundColor: "rgba(33, 150, 243, 0.05)" },
                                transition: "all 0.2s",
                              }}
                            >
                              <FolderIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  // ============================================================================
  // RENDER: MAIN CONTENT
  // ============================================================================

  const renderContent = () => (
    <>
      {/* Header */}
      {variant !== "legajo" && (
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {title || (variant === "global" ? "Mis Actividades" : "Plan de trabajo")}
              </Typography>
              {variant === "global" && (
                <Typography variant="body2" color="text.secondary">
                  Gestiona las actividades asignadas a ti o a tu equipo
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {hasActiveFilters && (
                <Tooltip title="Limpiar filtros">
                  <IconButton onClick={handleClearFilters} size="small">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
              {features.showRefreshButton && (
                <Tooltip title="Actualizar">
                  <IconButton onClick={handleRefresh} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
              {features.showAddActivity && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setPlanAccionModalOpen(true)}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Agregar actividad
                </Button>
              )}
            </Box>
          </Box>

          {renderStatistics()}
          {renderFilters()}
        </Box>
      )}

      {/* Legajo variant content */}
      {variant === "legajo" && (
        <>
          {renderStatistics()}
          {renderFilters()}
        </>
      )}

      {/* Bulk Actions */}
      {variant !== "legajo" && renderBulkActionsToolbar()}
      {variant === "legajo" && renderBulkActionsToolbar()}

      {/* Error State */}
      {globalError && (
        <Alert severity="error" sx={{ mx: 3, mb: 2 }}>
          Error al cargar las actividades. Por favor intenta nuevamente.
        </Alert>
      )}

      {/* Table */}
      {variant === "legajo" ? (
        actividades.length > 0 && (
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
            {renderTable()}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredActividades.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
            />
          </Paper>
        )
      ) : (
        <>
          {renderTable()}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={variant === "global" ? totalCount : filteredActividades.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          />
        </>
      )}

      {/* Info adicional (legajo only) */}
      {variant === "legajo" && actividades.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            El plan de trabajo define las actividades y objetivos a cumplir para el seguimiento del legajo. Las actividades vencidas
            requieren atención inmediata. Puede seleccionar múltiples actividades para realizar acciones en lote.
          </Typography>
        </Box>
      )}
    </>
  )

  // ============================================================================
  // RENDER: WRAPPER
  // ============================================================================

  const wrappedContent = () => {
    if (!showWrapper) return renderContent()

    if (features.useSectionCard) {
      return (
        <SectionCard
          title={title || "Plan de Trabajo"}
          chips={[
            {
              label: `${statistics.completionRate.toFixed(0)}% completado`,
              color: statistics.completionRate === 100 ? "success" : "primary",
            },
          ]}
          headerActions={
            <Tooltip
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Estados de actividades:
                  </Typography>
                  <Typography variant="caption" display="block">
                    ✅ Completada: Actividad finalizada
                  </Typography>
                  <Typography variant="caption" display="block">
                    ▶️ En Progreso: Actividad en curso
                  </Typography>
                  <Typography variant="caption" display="block">
                    ⏳ Pendiente: Actividad sin iniciar
                  </Typography>
                  <Typography variant="caption" display="block">
                    ❌ Vencida: Actividad pasada la fecha límite
                  </Typography>
                </Box>
              }
              arrow
              placement="right"
            >
              <IconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
        >
          {renderContent()}
        </SectionCard>
      )
    }

    return (
      <Paper elevation={2} sx={{ borderRadius: 2, position: "relative" }}>
        {isFetching && actividades.length > 0 && (
          <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "8px 8px 0 0" }} />
        )}
        {renderContent()}
      </Paper>
    )
  }

  // ============================================================================
  // RENDER: MODALS
  // ============================================================================

  return (
    <>
      {wrappedContent()}

      {/* Activity Detail Modal */}
      {selectedActividad && (
        <ActividadDetailModal
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false)
            setSelectedActividad(null)
          }}
          actividad={selectedActividad}
          onUpdate={handleModalSuccess}
        />
      )}

      {/* Edit Modal (medida variant) */}
      {features.showEdit && selectedActividad && (
        <EditActividadModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedActividad(null)
          }}
          actividad={selectedActividad}
          tipoMedida={medidaData?.tipo_medida}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Cancel Modal (medida variant) */}
      {features.showCancel && selectedActividad && (
        <CancelActividadModal
          open={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false)
            setSelectedActividad(null)
          }}
          actividadId={selectedActividad.id}
          actividadNombre={`${selectedActividad.tipo_actividad_info?.nombre || ""} - ${selectedActividad.subactividad || ""}`}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Individual Assign Modal (medida variant) */}
      {features.showIndividualAssign && selectedActividad && (
        <AsignarActividadModal
          open={asignarModalOpen}
          onClose={() => {
            setAsignarModalOpen(false)
            setSelectedActividad(null)
          }}
          actividadId={selectedActividad.id}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Bulk Assign Modal */}
      {features.showBulkAssign && (
        <BulkAsignarActividadModal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          selectedActividades={selectedActividades}
          onSuccess={handleBulkSuccess}
        />
      )}

      {/* Plan Accion Modal (medida variant) */}
      {features.showAddActivity && planTrabajoId && (
        <PlanAccionModal
          open={planAccionModalOpen}
          onClose={() => setPlanAccionModalOpen(false)}
          planTrabajoId={planTrabajoId}
          onSuccess={handleModalSuccess}
          tipoMedida={medidaData?.tipo_medida}
          filterEtapa={filterEtapa}
        />
      )}

      {/* Acuse de Recibo Dialog (global variant) */}
      {features.showAcuseRecibo && (
        <Dialog
          open={!!pendingAcuseActividad}
          onClose={() => setPendingAcuseActividad(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2, borderTop: "4px solid #ff9800" } }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ReceiptLongIcon color="warning" />
            Acuse de Recibo
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>Está a punto de acceder a la siguiente actividad:</DialogContentText>
            {pendingAcuseActividad && (
              <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {pendingAcuseActividad.tipo_actividad_info?.nombre || "Sin tipo"}
                </Typography>
                {pendingAcuseActividad.subactividad && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {pendingAcuseActividad.subactividad}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
                  {pendingAcuseActividad.legajo_info && (
                    <Chip
                      size="small"
                      icon={<FolderIcon />}
                      label={`${pendingAcuseActividad.legajo_info.nnya_apellido}, ${pendingAcuseActividad.legajo_info.nnya_nombre}`}
                      variant="outlined"
                    />
                  )}
                  <Chip
                    size="small"
                    label={pendingAcuseActividad.estado_display || pendingAcuseActividad.estado}
                    sx={{
                      backgroundColor: getEstadoColor(pendingAcuseActividad.estado).backgroundColor,
                      color: getEstadoColor(pendingAcuseActividad.estado).color,
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Paper>
            )}
            <Alert severity="info" sx={{ mt: 2 }}>
              Al confirmar el acuse de recibo, quedará registrado que ha tomado conocimiento de esta actividad.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setPendingAcuseActividad(null)} color="inherit" variant="outlined">
              Cancelar
            </Button>
            <Button onClick={handleConfirmAcuse} color="warning" variant="contained" startIcon={<CheckCircleOutlineIcon />}>
              Confirmar Acuse de Recibo
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default UnifiedActividadesTable
