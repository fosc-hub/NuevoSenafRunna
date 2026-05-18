"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import {
  Paper,
  Button,
  Modal,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  alpha,
  Stack,
  Drawer,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Popover,
} from "@mui/material"
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
  GridToolbarContainer,
  GridToolbarFilterButton,
  gridClasses,
} from "@mui/x-data-grid"
import {
  PersonAdd,
  Visibility,
  Refresh,
  DownloadRounded,
  Info,
  PriorityHigh,
  Remove,
  KeyboardArrowDown,
  ViewListRounded,
  TableRowsRounded,
  Close as CloseIcon,
  ArrowBack,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import { useQueryClient } from "@tanstack/react-query"
import AsignarLegajoModal from "../components/asignar-legajo-modal"
import { fetchLegajos, updateLegajoPrioridad } from "../api/legajos-api-service"
import { extractArray } from "@/hooks/useApiQuery"
import {
  shouldHighlightLegajo as shouldHighlightLegajoUtil,
  UserPermissions,
  normalizeState,
  hasKeyword
} from "@/utils/notification-utils"
import type { LegajoApiResponse, MedidaActivaBasica, PaginatedLegajosResponse } from "../types/legajo-api"
import LegajoButtons from "./legajos-buttons"
import { exportLegajosToExcel } from "./legajos-service"
import LegajoFilters, { type LegajoFiltersState } from "./legajos-filters"
import {
  ChipDemandaPI,
  ChipsOficios,
  AndarielMedidas,
  ContadoresPT,
  AlertasChip,
} from "../components/indicadores-chips"
import ActionMenu from "../components/action-menu"
import { useUserPermissions } from "../hooks/useUserPermissions"
import LegajoSearchBar from "../components/search/LegajoSearchBar"
import ActiveFiltersBar from "../components/search/ActiveFiltersBar"
import { useFilterOptions } from "../hooks/useFilterOptions"
import { getPriorityColor } from "../config/legajo-theme"
import { gradients } from "@/theme/colors"
import { useApiQuery } from "@/hooks/useApiQuery"

// Dynamically import LegajoDetail with no SSR to avoid hydration issues
const LegajoDetail = dynamic(() => import("../../legajo/legajo-detail"), { ssr: false })

// Custom toolbar component
const CustomToolbar = ({ onExportXlsx, onRefresh }: { onExportXlsx: () => void; onRefresh: () => void }) => {
  return (
    <GridToolbarContainer
      sx={{
        p: 1.5,
        borderBottom: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        gap: 1,
      }}
    >
      <GridToolbarFilterButton />
      <Button
        size="small"
        startIcon={<DownloadRounded sx={{ fontSize: 18 }} />}
        onClick={onExportXlsx}
        sx={{
          color: "#475569",
          fontSize: "0.8125rem",
          fontWeight: 500,
          textTransform: "none",
          "&:hover": { bgcolor: "#f1f5f9" },
        }}
      >
        Exportar Excel
      </Button>
      <Tooltip
        title={
          <Box sx={{ p: 0.5 }}>
            <Typography variant="caption" sx={{ display: "block", fontWeight: 600, mb: 0.5 }}>
              Ordenamiento Multi-columna
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.85)" }}>
              • Click en encabezado: ordena por una columna
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.85)" }}>
              • Ctrl/Cmd + Click: agrega columna al ordenamiento
            </Typography>
          </Box>
        }
        placement="right"
        arrow
      >
        <IconButton size="small" sx={{ color: "#94a3b8", "&:hover": { bgcolor: "#f1f5f9", color: "#475569" } }}>
          <Info sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }} />
      <Tooltip title="Actualizar datos" arrow>
        <IconButton
          size="small"
          onClick={onRefresh}
          sx={{
            color: "#94a3b8",
            "&:hover": { bgcolor: "#f1f5f9", color: "#475569" },
          }}
        >
          <Refresh sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </GridToolbarContainer>
  )
}


const LEGAJO_VIEW_MODE_STORAGE_KEY = "legajo-mesa:viewMode:v1"
type LegajoViewMode = "list" | "tabla"

const MedidasHoverChip = ({ count, medidas, legajoId }: { count: number; medidas: MedidaActivaBasica[]; legajoId: number }) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startClose = () => {
    closeTimer.current = setTimeout(() => setAnchorEl(null), 150)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    <>
      <Chip
        label={count}
        size="small"
        onMouseEnter={(e) => { cancelClose(); if (count > 0) setAnchorEl(e.currentTarget) }}
        onMouseLeave={startClose}
        sx={{
          minWidth: 32,
          height: 24,
          fontSize: "0.75rem",
          fontWeight: 600,
          cursor: count > 0 ? "pointer" : "default",
          bgcolor: count > 0 ? alpha("#3b82f6", 0.1) : "#f1f5f9",
          color: count > 0 ? "#2563eb" : "#94a3b8",
          border: count > 0 ? "1px solid #93c5fd" : "1px solid #e2e8f0",
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        disableRestoreFocus
        sx={{ pointerEvents: "none" }}
        PaperProps={{
          onMouseEnter: cancelClose,
          onMouseLeave: startClose,
          sx: { pointerEvents: "auto", py: 0.5, minWidth: 220, maxWidth: 300, boxShadow: 3 },
        }}
      >
        {medidas.map((m) => (
          <Box
            key={m.id}
            onClick={() => { setAnchorEl(null); router.push(`/legajo/${legajoId}/medida/${m.id}`) }}
            sx={{
              px: 1.5,
              py: 0.75,
              mx: 0.5,
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": { bgcolor: alpha("#3b82f6", 0.08) },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e40af", fontSize: "0.8rem" }}>
              {m.numero_medida}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              {m.tipo_medida}{m.etapa_actual__nombre ? ` · ${m.etapa_actual__nombre}` : ""}
            </Typography>
          </Box>
        ))}
      </Popover>
    </>
  )
}

const LegajoTable: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"))
  const permissions = useUserPermissions()
  const filterOptions = useFilterOptions()
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [selectedLegajoId, setSelectedLegajoId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false)
  const [selectedLegajoIdForAssignment, setSelectedLegajoIdForAssignment] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Initialize filters from sessionStorage or default values
  const [apiFilters, setApiFilters] = useState<LegajoFiltersState & { search: string | null }>(() => {
    if (typeof window !== "undefined") {
      const savedFilters = sessionStorage.getItem("legajo-mesa-filters")
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters)
        } catch (error) {
          console.error("Error parsing saved filters:", error)
        }
      }
    }
    return {
      zona: null,
      urgencia: null,
      tiene_medidas_activas: null,
      tiene_oficios: null,
      tiene_plan_trabajo: null,
      tiene_alertas: null,
      tiene_demanda_pi: null,
      search: null,
      jefe_zonal: null,
      director: null,
      equipo_trabajo: null,
      equipo_centro_vida: null,
    }
  })

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("legajo-mesa-filters", JSON.stringify(apiFilters))
    }
  }, [apiFilters])

  const [viewMode, setViewMode] = useState<LegajoViewMode>(() => {
    if (typeof window === "undefined") return "list"
    const stored = window.localStorage.getItem(LEGAJO_VIEW_MODE_STORAGE_KEY) as LegajoViewMode | null
    return stored === "list" || stored === "tabla" ? stored : "list"
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(LEGAJO_VIEW_MODE_STORAGE_KEY, viewMode)
    } catch {
      /* ignore */
    }
  }, [viewMode])

  const handleViewModeChange = (_e: React.MouseEvent<HTMLElement>, next: LegajoViewMode | null) => {
    if (next) setViewMode(next)
  }

  // Sync ?legajo=ID URL param -> selectedLegajoId on first mount.
  useEffect(() => {
    const fromUrl = searchParams.get("legajo")
    if (fromUrl) {
      const parsed = Number(fromUrl)
      if (!Number.isNaN(parsed)) setSelectedLegajoId(parsed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateUrlSelection = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id == null) params.delete("legajo")
    else params.set("legajo", String(id))
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : "?", { scroll: false })
  }

  // Build query params using useMemo - API uses 1-based pagination
  const queryParams = useMemo(() => {
    const params: any = {
      page: paginationModel.page + 1, // Convert from 0-based to 1-based
      page_size: paginationModel.pageSize,
    }

    // Add all filters if they exist
    if (apiFilters.zona !== null) {
      params.zona = apiFilters.zona
    }
    if (apiFilters.urgencia !== null) {
      params.urgencia = apiFilters.urgencia
    }
    if (apiFilters.search !== null && apiFilters.search.trim() !== "") {
      params.search = apiFilters.search
    }
    if (apiFilters.tiene_medidas_activas !== null) {
      params.tiene_medidas_activas = apiFilters.tiene_medidas_activas
    }
    if (apiFilters.tiene_oficios !== null) {
      params.tiene_oficios = apiFilters.tiene_oficios
    }
    if (apiFilters.tiene_plan_trabajo !== null) {
      params.tiene_plan_trabajo = apiFilters.tiene_plan_trabajo
    }
    if (apiFilters.tiene_alertas !== null) {
      params.tiene_alertas = apiFilters.tiene_alertas
    }
    if (apiFilters.tiene_demanda_pi !== null) {
      params.tiene_demanda_pi = apiFilters.tiene_demanda_pi
    }

    // Add numeric filters
    if (apiFilters.id__gt !== undefined && apiFilters.id__gt !== null) {
      params.id__gt = apiFilters.id__gt
    }
    if (apiFilters.id__lt !== undefined && apiFilters.id__lt !== null) {
      params.id__lt = apiFilters.id__lt
    }
    if (apiFilters.id__gte !== undefined && apiFilters.id__gte !== null) {
      params.id__gte = apiFilters.id__gte
    }
    if (apiFilters.id__lte !== undefined && apiFilters.id__lte !== null) {
      params.id__lte = apiFilters.id__lte
    }

    // Add date filters
    if (apiFilters.fecha_apertura__gte) {
      params.fecha_apertura__gte = apiFilters.fecha_apertura__gte
    }
    if (apiFilters.fecha_apertura__lte) {
      params.fecha_apertura__lte = apiFilters.fecha_apertura__lte
    }
    if (apiFilters.fecha_apertura__ultimos_dias !== undefined && apiFilters.fecha_apertura__ultimos_dias !== null) {
      params.fecha_apertura__ultimos_dias = apiFilters.fecha_apertura__ultimos_dias
    }

    // Add responsable filters
    if (apiFilters.jefe_zonal !== undefined && apiFilters.jefe_zonal !== null) {
      params.jefe_zonal = apiFilters.jefe_zonal
    }
    if (apiFilters.director !== undefined && apiFilters.director !== null) {
      params.director = apiFilters.director
    }
    if (apiFilters.equipo_trabajo !== undefined && apiFilters.equipo_trabajo !== null) {
      params.equipo_trabajo = apiFilters.equipo_trabajo
    }
    if (apiFilters.equipo_centro_vida !== undefined && apiFilters.equipo_centro_vida !== null) {
      params.equipo_centro_vida = apiFilters.equipo_centro_vida
    }

    // Add sorting (multi-column support)
    if (sortModel.length > 0) {
      // Map DataGrid field names → Django ordering field names where they differ
      const fieldMap: Record<string, string> = {
        indicadores_alertas: "has_alerta",
      }
      const ordering = sortModel
        .map((sort) => {
          const prefix = sort.sort === "desc" ? "-" : ""
          const field = fieldMap[sort.field] ?? sort.field
          return `${prefix}${field}`
        })
        .join(",")
      params.ordering = ordering
    }

    return params
  }, [paginationModel.page, paginationModel.pageSize, apiFilters, sortModel])

  // Fetch legajos using TanStack Query
  const { data: legajosData, isLoading, refetch } = useApiQuery<PaginatedLegajosResponse>(
    "legajos/",
    queryParams
  )

  const totalCount = legajosData?.count || 0

  // Wrapper function for backward compatibility with existing callbacks
  const loadLegajos = () => {
    refetch()
  }

  const handleFilterChange = (newFilters: typeof apiFilters) => {
    setApiFilters(newFilters)
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleSearch = (searchTerm: string) => {
    setApiFilters((prev) => ({ ...prev, search: searchTerm || null }))
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleRemoveFilter = (filterKey: string) => {
    if (filterKey === "fecha_apertura") {
      setApiFilters((prev) => ({
        ...prev,
        fecha_apertura__gte: null,
        fecha_apertura__lte: null,
        fecha_apertura__ultimos_dias: null,
      }))
    } else if (filterKey === "id_filter") {
      setApiFilters((prev) => ({
        ...prev,
        id__gt: null,
        id__lt: null,
        id__gte: null,
        id__lte: null,
      }))
    } else {
      setApiFilters((prev) => ({ ...prev, [filterKey]: null }))
    }
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleClearAllFilters = () => {
    setApiFilters({
      zona: null,
      urgencia: null,
      tiene_medidas_activas: null,
      tiene_oficios: null,
      tiene_plan_trabajo: null,
      tiene_alertas: null,
      tiene_demanda_pi: null,
      search: null,
      jefe_zonal: null,
      director: null,
      equipo_trabajo: null,
      equipo_centro_vida: null,
    })
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  /**
   * Determina si un legajo debe resaltarse basándose en el rol del usuario y el estado de la medida activa.
   */
  const shouldHighlightLegajo = (row: any): boolean => {
    const allStates = row.allStates || []

    const userPerms: UserPermissions = {
      isDirector: permissions.isDirector,
      isLegales: permissions.isLegales,
      isEquipoTecnico: permissions.isEquipoTecnico,
      isJefeZonal: permissions.isJefeZonal,
      isAdmin: permissions.isAdmin,
      userId: permissions.user?.id,
    }

    return shouldHighlightLegajoUtil(allStates, userPerms)
  }

  const handlePrioridadChange = async (legajoId: number, newValue: string) => {
    setIsUpdating(true)
    try {
      const updatedLegajo = await updateLegajoPrioridad(legajoId, newValue as "ALTA" | "MEDIA" | "BAJA")
      const urgenciaToPrioridadMap: Record<number, "ALTA" | "MEDIA" | "BAJA"> = {
        1: "ALTA",
        2: "MEDIA",
        3: "BAJA",
      }
      const prioridadFromResponse = updatedLegajo.urgencia
        ? urgenciaToPrioridadMap[updatedLegajo.urgencia]
        : (newValue as "ALTA" | "MEDIA" | "BAJA")

      queryClient.setQueryData<PaginatedLegajosResponse>(["legajos/", queryParams], (oldData) => {
        if (!oldData) return oldData
        const updatedResults = oldData.results.map((legajo) =>
          legajo.id === legajoId
            ? { ...legajo, prioridad: prioridadFromResponse, urgencia: updatedLegajo.urgencia }
            : legajo
        )
        return { ...oldData, results: updatedResults }
      })
      toast.success("Prioridad actualizada con éxito")
    } catch (error) {
      toast.error("Error al actualizar la Prioridad")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleOpenModal = (legajoId: number) => {
    setSelectedLegajoId(legajoId)
    updateUrlSelection(legajoId)
    // Modal only opens in tabla mode; list mode shows detail in the side pane.
    if (viewMode === "tabla") setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedLegajoId(null)
    setIsModalOpen(false)
    updateUrlSelection(null)
  }

  const handleOpenAsignarModal = (legajoId: number) => {
    setSelectedLegajoIdForAssignment(legajoId)
    setIsAsignarModalOpen(true)
  }

  const handleCloseAsignarModal = () => {
    setSelectedLegajoIdForAssignment(null)
    setIsAsignarModalOpen(false)
  }

  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
      {
        field: "id",
        headerName: "ID",
        width: 80,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", fontSize: "0.8125rem" }}>
              {params.value}
            </Typography>
            {params.row.prioridad === "ALTA" && (
              <Tooltip title="Alta Prioridad" arrow>
                <PriorityHigh sx={{ fontSize: 16, color: "#dc2626" }} />
              </Tooltip>
            )}
          </Box>
        )
      },
      {
        field: "indicadores_alertas",
        headerName: "Alertas",
        width: 90,
        align: "center",
        headerAlign: "center",
        sortable: true,
        renderCell: (params) => {
          const allStates = params.row.allStates || []
          const virtualAlerts: any[] = []

          const userPerms: UserPermissions = {
            isDirector: permissions.isDirector,
            isLegales: permissions.isLegales,
            isEquipoTecnico: permissions.isEquipoTecnico,
            isJefeZonal: permissions.isJefeZonal,
            isAdmin: permissions.isAdmin,
            userId: permissions.user?.id,
          }

          if (userPerms.isDirector && (hasKeyword(allStates, "NOTA_AVAL") || hasKeyword(allStates, "PENDIENTE_NOTA_AVAL"))) {
            virtualAlerts.push({ tipo: "URGENTE", severidad: "alta", mensaje: "Pendiente Nota de Aval" })
          }
          if (userPerms.isLegales && (
            hasKeyword(allStates, "JURIDICO") ||
            hasKeyword(allStates, "LEGAL") ||
            hasKeyword(allStates, "RATIFICACION") ||
            hasKeyword(allStates, "PENDIENTE_VISADO")
          )) {
            virtualAlerts.push({ tipo: "URGENTE", severidad: "alta", mensaje: "Pendiente Informe Jurídico" })
          }

          return (
            <AlertasChip
              alertas={params.row.alertas || []}
              virtualAlerts={virtualAlerts}
            />
          )
        },
      },
      {
        field: "numero_legajo",
        headerName: "Nº Legajo",
        width: 110,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 500, color: "#1e40af", fontSize: "0.8125rem" }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: "apellido",
        headerName: "Apellido",
        width: 140,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => (
          <Tooltip title={`DNI: ${params.row.dni}`} arrow placement="top">
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#1e293b",
                fontSize: "0.8125rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {params.value}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "nombre",
        headerName: "Nombre",
        width: 140,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => (
          <Tooltip title={`DNI: ${params.row.dni}`} arrow placement="top">
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "#1e293b",
                fontSize: "0.8125rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {params.value}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "prioridad",
        headerName: "Prioridad",
        width: 130,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const colors = getPriorityColor(params.value as any)
          const priorityLabel = params.value === "ALTA" ? "Alta" : params.value === "MEDIA" ? "Media" : params.value === "BAJA" ? "Baja" : null

          return (
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={params.value || ""}
                onChange={(e) => {
                  e.stopPropagation()
                  handlePrioridadChange(params.row.id, e.target.value as string)
                }}
                onClick={(e) => e.stopPropagation()}
                displayEmpty
                IconComponent={KeyboardArrowDown}
                sx={{
                  height: 32,
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  bgcolor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 1.5,
                  "& .MuiSelect-select": {
                    py: 0.5,
                    px: 1.5,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&:hover": {
                    bgcolor: alpha(colors.bg, 0.8),
                  },
                  "& .MuiSvgIcon-root": {
                    color: colors.text,
                    fontSize: "1.25rem",
                  },
                }}
              >
                {params.value === null && (
                  <MenuItem value="" sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
                    <em>Seleccionar</em>
                  </MenuItem>
                )}
                <MenuItem value="ALTA" sx={{ fontSize: "0.8125rem", color: "#c62828", fontWeight: 500 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PriorityHigh sx={{ fontSize: 16 }} />
                    Alta
                  </Box>
                </MenuItem>
                <MenuItem value="MEDIA" sx={{ fontSize: "0.8125rem", color: "#ef6c00", fontWeight: 500 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Remove sx={{ fontSize: 16 }} />
                    Media
                  </Box>
                </MenuItem>
                <MenuItem value="BAJA" sx={{ fontSize: "0.8125rem", color: "#2e7d32", fontWeight: 500 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <KeyboardArrowDown sx={{ fontSize: 16 }} />
                    Baja
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          )
        },
      },
      {
        field: "ultimaActualizacion",
        headerName: "Actualización",
        width: 140,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: "medidas_activas_count",
        headerName: "Cant. Medidas",
        width: 110,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <MedidasHoverChip
            count={params.value || 0}
            medidas={params.row.medidas_activas || []}
            legajoId={params.row.id}
          />
        ),
      },
      {
        field: "actividades_activas_count",
        headerName: "Actividades",
        width: 95,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const count = params.value || 0
          return (
            <Chip
              label={count}
              size="small"
              sx={{
                minWidth: 32,
                height: 24,
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: count > 0 ? alpha("#8b5cf6", 0.1) : "#f1f5f9",
                color: count > 0 ? "#7c3aed" : "#94a3b8",
                border: count > 0 ? "1px solid #c4b5fd" : "1px solid #e2e8f0",
              }}
            />
          )
        },
      },
      {
        field: "oficios_count",
        headerName: "Oficios",
        width: 80,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const count = params.value || 0
          return (
            <Chip
              label={count}
              size="small"
              sx={{
                minWidth: 32,
                height: 24,
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: count > 0 ? alpha("#0ea5e9", 0.1) : "#f1f5f9",
                color: count > 0 ? "#0284c7" : "#94a3b8",
                border: count > 0 ? "1px solid #7dd3fc" : "1px solid #e2e8f0",
              }}
            />
          )
        },
      },
      {
        field: "indicadores_pi",
        headerName: "PI",
        width: 70,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => <ChipDemandaPI count={params.row.indicadores?.demanda_pi_count || 0} />,
      },
      {
        field: "indicadores_oficios_semaforo",
        headerName: "Oficios",
        width: 130,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => <ChipsOficios oficios={params.row.oficios || []} />,
      },
      {
        field: "indicadores_medidas",
        headerName: "Medidas",
        width: 150,
        align: "left",
        headerAlign: "left",
        sortable: false,
        renderCell: (params) => (
          <AndarielMedidas
            estado={params.row.indicadores?.medida_andarivel || null}
            medidasActivas={params.row.medidas_activas || []}
          />
        ),
      },
      {
        field: "indicadores_pt",
        headerName: "Plan Trabajo",
        width: 170,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => (
          <ContadoresPT
            actividades={params.row.indicadores?.pt_actividades || { pendientes: 0, en_progreso: 0, vencidas: 0, realizadas: 0 }}
          />
        ),
      },

      {
        field: "actions",
        headerName: "Acciones",
        width: 150,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", justifyContent: "center" }}>
            <Tooltip title="Ver detalles" arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleOpenModal(params.row.id) }}
                sx={{
                  color: "#3b82f6",
                  bgcolor: alpha("#3b82f6", 0.08),
                  "&:hover": { bgcolor: alpha("#3b82f6", 0.16) },
                  width: 30,
                  height: 30,
                }}
              >
                <Visibility sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            {permissions.canAssign && (
              <Tooltip title="Asignar" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleOpenAsignarModal(params.row.id) }}
                  sx={{
                    color: "#8b5cf6",
                    bgcolor: alpha("#8b5cf6", 0.08),
                    "&:hover": { bgcolor: alpha("#8b5cf6", 0.16) },
                    width: 30,
                    height: 30,
                  }}
                >
                  <PersonAdd sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            <ActionMenu
              legajoId={params.row.id}
              demandaId={params.row.indicadores?.demanda_pi_id || null}
              tieneMedidas={params.row.medidas_activas_count > 0}
              tieneOficios={params.row.oficios_count > 0}
              tienePlanTrabajo={true}
              onViewDetail={handleOpenModal}
              onAssign={handleOpenAsignarModal}
              userPermissions={permissions}
            />
          </Box>
        ),
      },
    ]

    if (!isMobile) {
      const additionalColumns: GridColDef[] = [
        {
          field: "zona",
          headerName: "Zona",
          width: 120,
          align: "left",
          headerAlign: "left",
          renderCell: (params) => (
            <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#475569" }}>
              {params.value || "-"}
            </Typography>
          ),
        },
        {
          field: "equipo_trabajo",
          headerName: "Equipo",
          width: 140,
          align: "left",
          headerAlign: "left",
          renderCell: (params) => (
            <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis" }}>
              {params.value || "-"}
            </Typography>
          ),
        },
        {
          field: "profesional_asignado",
          headerName: "Profesional",
          width: 140,
          align: "left",
          headerAlign: "left",
          renderCell: (params) => (
            <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis" }}>
              {params.value || "-"}
            </Typography>
          ),
        },
        {
          field: "fecha_apertura",
          headerName: "F. Apertura",
          width: 110,
          align: "left",
          headerAlign: "left",
          renderCell: (params) => (
            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#64748b" }}>
              {params.value ? new Date(params.value).toLocaleDateString("es-AR") : "-"}
            </Typography>
          ),
        },
      ]
      if (permissions.canViewJudicialData) {
        additionalColumns.push({
          field: "jefe_zonal",
          headerName: "Jefe Zonal",
          width: 140,
          align: "left",
          headerAlign: "left",
          renderCell: (params) => (
            <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis" }}>
              {params.value || "-"}
            </Typography>
          ),
        })
      }
      baseColumns.push(...additionalColumns)
    }
    return baseColumns
  }

  const columns = useMemo(() => getColumns(), [isMobile, permissions])

  const jefeZonalNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.jefesZonales.forEach((j) => { mapping[j.id] = j.nombre_completo || j.nombre || `ID: ${j.id}` })
    return mapping
  }, [filterOptions.jefesZonales])

  const directorNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.directores.forEach((d) => { mapping[d.id] = d.nombre_completo || d.nombre || `ID: ${d.id}` })
    return mapping
  }, [filterOptions.directores])

  const equipoTrabajoNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.equiposTrabajo.forEach((e) => { mapping[e.id] = e.nombre || e.codigo || `ID: ${e.id}` })
    return mapping
  }, [filterOptions.equiposTrabajo])

  const equipoCentroVidaNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.equiposCentroVida.forEach((e) => { mapping[e.id] = e.nombre || e.codigo || `ID: ${e.id}` })
    return mapping
  }, [filterOptions.equiposCentroVida])

  const rows = useMemo(() => {
    return legajosData?.results.map((legajo: LegajoApiResponse) => {
      let ultimaActualizacionFormatted = "N/A"
      if (legajo.fecha_ultima_actualizacion) {
        const date = new Date(legajo.fecha_ultima_actualizacion)
        if (!isNaN(date.getTime())) {
          ultimaActualizacionFormatted = date.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
        }
      }

      const medidasCount = Array.isArray(legajo.medidas_activas) ? legajo.medidas_activas.length : 0
      const actividadesCount = Array.isArray(legajo.actividades_activas) ? legajo.actividades_activas.length : 0
      const oficiosCount = Array.isArray(legajo.oficios) ? legajo.oficios.length : 0

      const zonaValue = typeof legajo.zona === "string" ? legajo.zona : (legajo.zona as any)?.nombre || null
      const equipoTrabajoValue = typeof legajo.equipo_trabajo === "string" ? legajo.equipo_trabajo : (legajo.equipo_trabajo as any)?.nombre || null
      const userResponsableValue = typeof legajo.user_responsable === "string" ? legajo.user_responsable : (legajo.user_responsable as any)?.nombre_completo || null
      const jefeZonalValue = typeof legajo.jefe_zonal === "string" ? legajo.jefe_zonal : (legajo.jefe_zonal as any)?.nombre_completo || null

      return {
        id: legajo.id,
        numero_legajo: legajo.numero || `L-${legajo.id}`,
        nombre: legajo.nnya?.nombre || "N/A",
        apellido: legajo.nnya?.apellido || "N/A",
        dni: legajo.nnya?.dni ? String(legajo.nnya.dni) : "N/A",
        prioridad: legajo.prioridad || null,
        ultimaActualizacion: ultimaActualizacionFormatted,
        medidas_activas_count: medidasCount,
        actividades_activas_count: actividadesCount,
        oficios_count: oficiosCount,
        zona: zonaValue,
        equipo_trabajo: equipoTrabajoValue,
        profesional_asignado: userResponsableValue,
        jefe_zonal: jefeZonalValue,
        fecha_apertura: legajo.fecha_apertura,
        medidas_activas: legajo.medidas_activas,
        indicadores: legajo.indicadores,
        alertas: legajo.alertas || legajo.indicadores?.alertas || [],
        oficios: legajo.oficios,
        allStates: (() => {
          const states = new Set<string>()

          const ESTADO_FIELDS = [
            "estado",
            "etapa",
            "etapa_estado",
            "estado_etapa",
            "etapa_nombre",
            "etapa_actual__estado",
            "etapa_actual__nombre",
            "etapa_actual_nombre",
            "etapa_actual_estado",
          ] as const

          const andarivel = legajo.indicadores?.medida_andarivel as any
          if (andarivel?.etapa_estado) {
            states.add(normalizeState(andarivel.etapa_estado))
          }

          if (Array.isArray(legajo.medidas_activas)) {
            legajo.medidas_activas.forEach((m: any) => {
              // Campos simples de la medida
              ESTADO_FIELDS.forEach((field) => {
                if (m[field]) states.add(normalizeState(m[field]))
              })

              // etapa_actual (objeto único)
              if (m.etapa_actual?.estado) states.add(normalizeState(m.etapa_actual.estado))
              if (m.etapa_actual?.nombre) states.add(normalizeState(m.etapa_actual.nombre))

              // ✅ FIX: iterar TODOS los arrays de etapas posibles
              const arraysDeEtapas = ["etapas", "etapas_activas", "pasos", "historial_etapas"]
              arraysDeEtapas.forEach((arrayField) => {
                if (Array.isArray(m[arrayField])) {
                  m[arrayField].forEach((etapa: any) => {
                    if (etapa.estado) states.add(normalizeState(etapa.estado))
                    if (etapa.etapa_estado) states.add(normalizeState(etapa.etapa_estado))
                    if (etapa.nombre) states.add(normalizeState(etapa.nombre))
                  })
                }
              })
            })
          }

          if (process.env.NODE_ENV === "development") {
            // console.log(`[Legajo ${legajo.id}] allStates:`, Array.from(states))
          }

          return Array.from(states)
        })()
      }
    }) || []
  }, [legajosData])

  const handleExportXlsx = () => {
    exportLegajosToExcel(rows, { filters: apiFilters, totalCount: totalCount })
    toast.success("Archivo Excel generado correctamente")
  }

  // Layout flags. List mode reuses the DataGrid for the "nothing selected" state on
  // desktop (denser scan view) and switches to a 420px sidebar of cards once a
  // legajo is opened. On mobile the cards list is always shown and detail is in a
  // Drawer, since DataGrid is unusable on small screens.
  const showTable = viewMode === "tabla" || (viewMode === "list" && !selectedLegajoId && !isMdDown)
  const showCardsList = viewMode === "list" && (isMdDown || selectedLegajoId !== null)

  // Horizontal scroll affordance — see mesadeentrada for full rationale.
  const gridContainerRef = useRef<HTMLDivElement | null>(null)
  const scrollerRef = useRef<HTMLElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const scrollGridBy = (delta: number) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({ left: delta, behavior: "smooth" })
  }

  useEffect(() => {
    if (!showTable) {
      scrollerRef.current = null
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    const container = gridContainerRef.current
    if (!container) return

    let scroller: HTMLElement | null = null
    let resizeObs: ResizeObserver | null = null

    const update = () => {
      const el = scroller
      if (!el) return
      setCanScrollLeft(el.scrollLeft > 1)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }

    const attach = (el: HTMLElement) => {
      scroller = el
      scrollerRef.current = el
      update()
      el.addEventListener("scroll", update, { passive: true })
      resizeObs = new ResizeObserver(update)
      resizeObs.observe(el)
    }

    const found = container.querySelector(".MuiDataGrid-virtualScroller") as HTMLElement | null
    let mo: MutationObserver | null = null
    if (found) {
      attach(found)
    } else {
      mo = new MutationObserver(() => {
        const el = container.querySelector(".MuiDataGrid-virtualScroller") as HTMLElement | null
        if (el) {
          attach(el)
          mo?.disconnect()
          mo = null
        }
      })
      mo.observe(container, { childList: true, subtree: true })
    }

    return () => {
      if (scroller) scroller.removeEventListener("scroll", update)
      resizeObs?.disconnect()
      mo?.disconnect()
      scrollerRef.current = null
    }
  }, [showTable, columns])

  return (
    <>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ p: { xs: 1.5, md: 2.5 }, borderBottom: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.125rem", md: "1.5rem" },
                background: gradients.title,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              Gestión de Legajos
            </Typography>

            <ToggleButtonGroup
              size="small"
              exclusive
              value={viewMode}
              onChange={handleViewModeChange}
              aria-label="Modo de vista"
              sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
            >
              <ToggleButton value="list" aria-label="Vista lista" sx={{ textTransform: "none", px: 1.25 }}>
                <ViewListRounded fontSize="small" sx={{ mr: 0.5 }} />
                Lista
              </ToggleButton>
              <ToggleButton value="tabla" aria-label="Vista tabla" sx={{ textTransform: "none", px: 1.25 }}>
                <TableRowsRounded fontSize="small" sx={{ mr: 0.5 }} />
                Tabla
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ mb: 2 }}>
            <LegajoSearchBar onSearch={handleSearch} initialValue={apiFilters.search || ""} />
          </Box>
          <div className="flex flex-wrap gap-2 sm:gap-4 relative z-10">
            <LegajoButtons isLoading={isLoading} handleNuevoRegistro={() => { }} onLegajoCreated={() => loadLegajos()} />
            <LegajoFilters onFilterChange={(newFilters) => { setApiFilters((prev) => ({ ...prev, ...newFilters })); setPaginationModel((prev) => ({ ...prev, page: 0 })) }} />
          </div>
        </Box>
        <ActiveFiltersBar filters={apiFilters} totalResults={totalCount} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAllFilters} jefeZonalNames={jefeZonalNames} directorNames={directorNames} equipoTrabajoNames={equipoTrabajoNames} equipoCentroVidaNames={equipoCentroVidaNames} />
        {showTable && (
        <Box ref={gridContainerRef} sx={{ position: "relative", height: 650, width: "100%", bgcolor: "#ffffff" }}>
          {canScrollLeft && (
            <>
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  top: 56,
                  left: 0,
                  bottom: 56,
                  width: 48,
                  pointerEvents: "none",
                  background: "linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0))",
                  zIndex: 2,
                }}
              />
              <Tooltip title="Desplazar a la izquierda" placement="right">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); scrollGridBy(-320) }}
                  aria-label="Desplazar tabla a la izquierda"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 8,
                    transform: "translateY(-50%)",
                    bgcolor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    border: "1px solid #e2e8f0",
                    zIndex: 3,
                    "&:hover": { bgcolor: "#f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
                  }}
                >
                  <ChevronLeft fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {canScrollRight && (
            <>
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  top: 56,
                  right: 0,
                  bottom: 56,
                  width: 48,
                  pointerEvents: "none",
                  background: "linear-gradient(to left, rgba(255,255,255,0.95), rgba(255,255,255,0))",
                  zIndex: 2,
                }}
              />
              <Tooltip title="Desplazar a la derecha — hay más columnas" placement="left">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); scrollGridBy(320) }}
                  aria-label="Desplazar tabla a la derecha"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 8,
                    transform: "translateY(-50%)",
                    bgcolor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    border: "1px solid #e2e8f0",
                    zIndex: 3,
                    "&:hover": { bgcolor: "#f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
                    animation: "scrollHintPulse 2s ease-in-out 1",
                    "@keyframes scrollHintPulse": {
                      "0%": { transform: "translateY(-50%) translateX(0)" },
                      "30%": { transform: "translateY(-50%) translateX(-4px)" },
                      "60%": { transform: "translateY(-50%) translateX(0)" },
                      "100%": { transform: "translateY(-50%) translateX(0)" },
                    },
                  }}
                >
                  <ChevronRight fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            sortingMode="server"
            rowCount={totalCount}
            paginationMode="server"
            loading={isLoading || isUpdating}
            onRowClick={(params) => handleOpenModal(params.row.id)}
            localeText={{
              MuiTablePagination: {
                labelRowsPerPage: 'Filas por página:',
                labelDisplayedRows: ({ from, to, count }) =>
                  `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
              },
            }}
            slots={{ toolbar: () => <CustomToolbar onExportXlsx={handleExportXlsx} onRefresh={loadLegajos} /> }}
            getRowId={(row) => row.id}
            getRowClassName={(params) => {
              const classes: string[] = []
              if (shouldHighlightLegajo(params.row)) classes.push("highlight-pending")
              if (params.indexRelativeToCurrentPage % 2 === 0) classes.push("row-even")
              return classes.join(" ")
            }}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={{
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              fontSize: "0.8125rem",
              // Header styling
              [`& .${gridClasses.columnHeaders}`]: {
                bgcolor: "#f8fafc",
                borderBottom: "2px solid #e2e8f0",
              },
              [`& .${gridClasses.columnHeader}`]: {
                fontWeight: 600,
                color: "#475569",
                fontSize: "0.8125rem",
                "&:focus, &:focus-within": {
                  outline: "none",
                },
              },
              [`& .${gridClasses.columnHeaderTitle}`]: {
                fontWeight: 600,
              },
              // Cell styling
              [`& .${gridClasses.cell}`]: {
                borderColor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                "&:focus, &:focus-within": {
                  outline: "none",
                },
              },
              // Row styling
              [`& .${gridClasses.row}`]: {
                borderBottom: "1px solid #f1f5f9",
                transition: "background-color 0.15s ease",
                "&:hover": {
                  bgcolor: "#f8fafc",
                },
                "&.Mui-selected": {
                  bgcolor: alpha("#1976d2", 0.08),
                  "&:hover": {
                    bgcolor: alpha("#1976d2", 0.12),
                  },
                },
              },
              // Striped rows
              "& .row-even": {
                bgcolor: "#fafbfc",
              },
              // Highlighted pending rows
              "& .highlight-pending": {
                bgcolor: alpha("#6366f1", 0.06),
                borderLeft: "4px solid #6366f1",
                "&:hover": {
                  bgcolor: alpha("#6366f1", 0.1),
                },
                "&.row-even": {
                  bgcolor: alpha("#6366f1", 0.08),
                },
                [`& .${gridClasses.cell}`]: {
                  color: "#3730a3",
                },
              },
              // Footer and pagination
              [`& .${gridClasses.footerContainer}`]: {
                borderTop: "2px solid #e2e8f0",
                bgcolor: "#f8fafc",
              },
              // Remove cell separator
              [`& .${gridClasses.columnSeparator}`]: {
                color: "#e2e8f0",
              },
              // Scrollbar styling
              "& ::-webkit-scrollbar": {
                width: 8,
                height: 8,
              },
              "& ::-webkit-scrollbar-thumb": {
                bgcolor: "#cbd5e1",
                borderRadius: 4,
                "&:hover": {
                  bgcolor: "#94a3b8",
                },
              },
              "& ::-webkit-scrollbar-track": {
                bgcolor: "#f1f5f9",
              },
            }}
          />
        </Box>
        )}

        {showCardsList && (
          <Box
            sx={{
              display: "flex",
              height: { xs: "calc(100dvh - 320px)", md: "calc(100vh - 280px)" },
              minHeight: { xs: 360, md: 520 },
              bgcolor: "#fff",
            }}
          >
            {/* Left pane: 420px sidebar of cards (full width on mobile). */}
            <Box
              sx={{
                width: { xs: "100%", md: 420 },
                flexShrink: 0,
                borderRight: { xs: "none", md: "1px solid #e2e8f0" },
                display: "flex",
                flexDirection: "column",
                bgcolor: "#fafbfc",
              }}
            >
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                {isLoading && rows.length === 0 ? (
                  <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} variant="rectangular" height={84} sx={{ borderRadius: 1 }} />
                    ))}
                  </Box>
                ) : rows.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron legajos con los filtros actuales.
                    </Typography>
                  </Box>
                ) : (
                  rows.map((row) => {
                    const isSelected = selectedLegajoId === row.id
                    const accent = row.prioridad === "ALTA"
                      ? "#dc2626"
                      : row.prioridad === "MEDIA"
                        ? "#ef6c00"
                        : row.prioridad === "BAJA"
                          ? "#2e7d32"
                          : "#cbd5e1"
                    return (
                      <Box
                        key={row.id}
                        onClick={() => handleOpenModal(row.id)}
                        sx={{
                          px: 2,
                          py: 1.25,
                          borderBottom: "1px solid #eef2f6",
                          borderLeft: `4px solid ${accent}`,
                          cursor: "pointer",
                          bgcolor: isSelected ? alpha("#1976d2", 0.08) : "#fff",
                          transition: "background-color 0.15s",
                          "&:hover": { bgcolor: isSelected ? alpha("#1976d2", 0.12) : "#f8fafc" },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1e293b", flex: 1, minWidth: 0 }}
                            noWrap
                            title={row.nombre}
                          >
                            {row.nombre}
                          </Typography>
                          {row.prioridad === "ALTA" && (
                            <Tooltip title="Alta prioridad">
                              <PriorityHigh sx={{ fontSize: 16, color: "#dc2626" }} />
                            </Tooltip>
                          )}
                          <Typography variant="caption" sx={{ color: "#1e40af", fontWeight: 500 }}>
                            {row.numero_legajo}
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                          <AlertasChip
                            alertas={row.indicadores?.alertas || []}
                            virtualAlerts={[]}
                          />
                          {row.medidas_activas_count > 0 && (
                            <Tooltip title={`${row.medidas_activas_count} medidas activas`}>
                              <Chip
                                label={`M·${row.medidas_activas_count}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: alpha("#3b82f6", 0.1),
                                  color: "#2563eb",
                                  border: "1px solid #93c5fd",
                                }}
                              />
                            </Tooltip>
                          )}
                          {row.actividades_activas_count > 0 && (
                            <Tooltip title={`${row.actividades_activas_count} actividades activas`}>
                              <Chip
                                label={`A·${row.actividades_activas_count}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: alpha("#8b5cf6", 0.1),
                                  color: "#7c3aed",
                                  border: "1px solid #c4b5fd",
                                }}
                              />
                            </Tooltip>
                          )}
                          {row.oficios_count > 0 && (
                            <Tooltip title={`${row.oficios_count} oficios`}>
                              <Chip
                                label={`O·${row.oficios_count}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: alpha("#0ea5e9", 0.1),
                                  color: "#0284c7",
                                  border: "1px solid #7dd3fc",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Stack>

                        <Typography
                          variant="caption"
                          sx={{ mt: 0.5, display: "block", color: "#64748b" }}
                          noWrap
                          title={`${row.zona || "-"} · ${row.equipo_trabajo || "-"} · ${row.ultimaActualizacion}`}
                        >
                          {row.zona || "-"} · {row.equipo_trabajo || "-"} · {row.ultimaActualizacion}
                        </Typography>
                      </Box>
                    )
                  })
                )}
              </Box>

              {/* Compact pagination footer */}
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderTop: "1px solid #e2e8f0",
                  bgcolor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {totalCount > 0
                    ? `${paginationModel.page * paginationModel.pageSize + 1}–${Math.min(
                        (paginationModel.page + 1) * paginationModel.pageSize,
                        totalCount,
                      )} de ${totalCount}`
                    : "0 resultados"}
                </Typography>
                <Pagination
                  size="small"
                  count={Math.max(1, Math.ceil(totalCount / paginationModel.pageSize))}
                  page={paginationModel.page + 1}
                  onChange={(_, p) => setPaginationModel((prev) => ({ ...prev, page: p - 1 }))}
                  siblingCount={0}
                  boundaryCount={1}
                />
              </Box>
            </Box>

            {/* Right pane: detail (desktop only — mobile uses the Drawer below). */}
            {!isMdDown && selectedLegajoId !== null && (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    bgcolor: "#fff",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                    Legajo #{selectedLegajoId}
                  </Typography>
                  <Tooltip title="Cerrar">
                    <IconButton size="small" onClick={handleCloseModal}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 3 } }}>
                  <LegajoDetail
                    params={{ id: selectedLegajoId.toString() }}
                    onClose={handleCloseModal}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Mobile drawer for detail when in list mode */}
      {viewMode === "list" && isMdDown && (
        <Drawer
          anchor="right"
          open={selectedLegajoId !== null}
          onClose={handleCloseModal}
          PaperProps={{ sx: { width: "100%", maxWidth: "100vw" } }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 1,
              position: "sticky",
              top: 0,
              bgcolor: "#fff",
              zIndex: 1,
            }}
          >
            <IconButton size="small" onClick={handleCloseModal} aria-label="Volver">
              <ArrowBack fontSize="small" />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
              Legajo #{selectedLegajoId}
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            {selectedLegajoId && (
              <LegajoDetail
                params={{ id: selectedLegajoId.toString() }}
                onClose={handleCloseModal}
              />
            )}
          </Box>
        </Drawer>
      )}
      <Modal open={isModalOpen && viewMode === "tabla"} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: "85%" },
            maxWidth: 1000,
            bgcolor: "#ffffff",
            p: { xs: 2, md: 4 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 3,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #e2e8f0",
          }}
        >
          {selectedLegajoId ? (
            <LegajoDetail params={{ id: selectedLegajoId.toString() }} onClose={handleCloseModal} />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Modal>
      <AsignarLegajoModal open={isAsignarModalOpen} onClose={handleCloseAsignarModal} legajoId={selectedLegajoIdForAssignment} onAsignacionComplete={loadLegajos} />
    </>
  )
}

export default LegajoTable
