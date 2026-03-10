"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
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
import { PersonAdd, Visibility, Refresh, DownloadRounded, Info, PriorityHigh, Remove, KeyboardArrowDown } from "@mui/icons-material"
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
import type { LegajoApiResponse, PaginatedLegajosResponse } from "../types/legajo-api"
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
import { useApiQuery } from "@/hooks/useApiQuery"

// Dynamically import LegajoDetail with no SSR to avoid hydration issues
const LegajoDetail = dynamic(() => import("../../legajo/legajo-detail"), { ssr: false })

// Custom toolbar component
const CustomToolbar = ({ onExportXlsx }: { onExportXlsx: () => void }) => {
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
      <Tooltip title="Actualizar" arrow>
        <IconButton
          size="small"
          onClick={() => window.location.reload()}
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


const LegajoTable: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const permissions = useUserPermissions()
  const filterOptions = useFilterOptions()
  const queryClient = useQueryClient()
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
      // Convert GridSortModel to Django ordering format
      const ordering = sortModel
        .map((sort) => {
          const prefix = sort.sort === "desc" ? "-" : ""
          return `${prefix}${sort.field}`
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
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedLegajoId(null)
    setIsModalOpen(false)
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
        field: "indicadores_alertas",
        headerName: "Alertas",
        width: 90,
        align: "center",
        headerAlign: "center",
        sortable: false,
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
              alertas={params.row.indicadores?.alertas || []}
              virtualAlerts={virtualAlerts}
            />
          )
        },
      },
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
        field: "nombre",
        headerName: "Nombre",
        width: 180,
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
        headerName: "Medidas",
        width: 85,
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
                bgcolor: count > 0 ? alpha("#3b82f6", 0.1) : "#f1f5f9",
                color: count > 0 ? "#2563eb" : "#94a3b8",
                border: count > 0 ? "1px solid #93c5fd" : "1px solid #e2e8f0",
              }}
            />
          )
        },
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
        headerName: "Andarivel",
        width: 150,
        align: "left",
        headerAlign: "left",
        sortable: false,
        renderCell: (params) => <AndarielMedidas estado={params.row.indicadores?.medida_andarivel || null} />,
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
        nombre: legajo.nnya?.nombre_completo || "N/A",
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
        <Box sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: "1.25rem",
              color: "#0f172a",
              letterSpacing: "-0.025em",
            }}
          >
            Gestión de Legajos
          </Typography>
          <Box sx={{ mb: 2 }}>
            <LegajoSearchBar onSearch={handleSearch} initialValue={apiFilters.search || ""} />
          </Box>
          <div className="flex gap-4 relative z-10">
            <LegajoButtons isLoading={isLoading} handleNuevoRegistro={() => { }} onLegajoCreated={() => loadLegajos()} />
            <LegajoFilters onFilterChange={(newFilters) => { setApiFilters((prev) => ({ ...prev, ...newFilters })); setPaginationModel((prev) => ({ ...prev, page: 0 })) }} />
          </div>
        </Box>
        <ActiveFiltersBar filters={apiFilters} totalResults={totalCount} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAllFilters} jefeZonalNames={jefeZonalNames} directorNames={directorNames} equipoTrabajoNames={equipoTrabajoNames} equipoCentroVidaNames={equipoCentroVidaNames} />
        <Box sx={{ height: 650, width: "100%", bgcolor: "#ffffff" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            sortingMode="server"
            rowCount={totalCount}
            paginationMode="server"
            loading={isLoading || isUpdating}
            onRowClick={(params) => handleOpenModal(params.row.id)}
            slots={{ toolbar: () => <CustomToolbar onExportXlsx={handleExportXlsx} /> }}
            getRowClassName={(params) => {
              const classes: string[] = []
              if (shouldHighlightLegajo(params.row)) classes.push("highlight-pending")
              if (params.indexRelativeToCurrentPage % 2 === 0) classes.push("row-even")
              return classes.join(" ")
            }}
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
      </Paper>
      <Modal open={isModalOpen} onClose={handleCloseModal}>
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
