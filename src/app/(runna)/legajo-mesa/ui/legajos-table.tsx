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
  Popover,
  Chip,
  Tooltip,
  IconButton,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid"
import { PersonAdd, Edit, Warning, AttachFile, Visibility, Refresh, DownloadRounded, Info } from "@mui/icons-material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import { useQueryClient } from "@tanstack/react-query"
import AsignarLegajoModal from "../components/asignar-legajo-modal"
import { fetchLegajos, updateLegajoPrioridad } from "../api/legajos-api-service"
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
    <GridToolbarContainer sx={{ p: 1, borderBottom: "1px solid #e0e0e0" }}>
      <GridToolbarFilterButton />
      <Button
        size="small"
        startIcon={<DownloadRounded />}
        onClick={onExportXlsx}
        sx={{
          mr: 1,
          textTransform: "none",
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
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
            <Typography variant="caption" sx={{ display: "block" }}>
              • Click en encabezado: ordena por una columna
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              • Ctrl/Cmd + Click: agrega columna al ordenamiento
            </Typography>
          </Box>
        }
        placement="right"
      >
        <IconButton size="small" sx={{ ml: 1 }}>
          <Info fontSize="small" />
        </IconButton>
      </Tooltip>
      <IconButton
        size="small"
        sx={{
          ml: "auto",
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      >
        <Refresh fontSize="small" />
      </IconButton>
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
      // Multiple columns: "field1,-field2,field3"
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
    queryParams,
    {
      queryFn: () => fetchLegajos(queryParams),
    }
  )

  const totalCount = legajosData?.count || 0

  // Wrapper function for backward compatibility with existing callbacks
  const loadLegajos = () => {
    refetch()
  }

  const handleFilterChange = (newFilters: typeof apiFilters) => {
    setApiFilters(newFilters)
    // Reset to first page when filters change
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleSearch = (searchTerm: string) => {
    setApiFilters((prev) => ({ ...prev, search: searchTerm || null }))
    // Reset to first page when search changes
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleRemoveFilter = (filterKey: string) => {
    // Handle composite filters
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
    const clearedFilters: typeof apiFilters = {
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
    setApiFilters(clearedFilters)
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const handleNuevoRegistro = () => {
    console.log("Nuevo registro clicked")
  }

  const handlePrioridadChange = async (legajoId: number, newValue: string) => {
    console.log(`Updating prioridad for legajo ${legajoId} to ${newValue}`)
    setIsUpdating(true)
    try {
      // Call the API to update the prioridad
      const updatedLegajo = await updateLegajoPrioridad(legajoId, newValue as "ALTA" | "MEDIA" | "BAJA")

      // Map urgencia number back to prioridad string for display
      const urgenciaToPrioridadMap: Record<number, "ALTA" | "MEDIA" | "BAJA"> = {
        1: "ALTA",
        2: "MEDIA",
        3: "BAJA",
      }

      const prioridadFromResponse = updatedLegajo.urgencia
        ? urgenciaToPrioridadMap[updatedLegajo.urgencia]
        : newValue as "ALTA" | "MEDIA" | "BAJA"

      // Update the TanStack Query cache with optimistic update
      queryClient.setQueryData<PaginatedLegajosResponse>(
        ["legajos/", queryParams],
        (oldData) => {
          if (!oldData) return oldData

          const updatedResults = oldData.results.map((legajo) =>
            legajo.id === legajoId
              ? { ...legajo, prioridad: prioridadFromResponse, urgencia: updatedLegajo.urgencia }
              : legajo,
          )

          return {
            ...oldData,
            results: updatedResults,
          }
        }
      )

      toast.success("Prioridad actualizada con éxito")
    } catch (error) {
      console.error("Error al actualizar la Prioridad:", error)
      toast.error("Error al actualizar la Prioridad")
    } finally {
      setIsUpdating(false)
    }
  }

  const formatPrioridadValue = (value: string | undefined | null) => {
    return value || "Seleccionar"
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

  // Define responsive columns based on screen size
  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
      {
        field: "id",
        headerName: "ID",
        width: 80,
        renderCell: (params) => (
          <div style={{ display: "flex", alignItems: "center" }}>
            {params.value}
            {params.row.prioridad === "ALTA" && (
              <Tooltip title="Alta Prioridad">
                <Warning color="error" style={{ marginLeft: "4px" }} fontSize="small" />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        field: "numero_legajo",
        headerName: "Nº Legajo",
        width: 120,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: "normal" }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: "nombre",
        headerName: "Nombre",
        width: 180,
        renderCell: (params) => (
          <Tooltip title={`DNI: ${params.row.dni}`}>
            <Typography variant="body2" sx={{ fontWeight: "normal" }}>
              {params.value}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "prioridad",
        headerName: "Prioridad",
        width: 150,
        renderCell: (params) => {
          const prioridadValue = params.value as "ALTA" | "MEDIA" | "BAJA" | null
          const colors = getPriorityColor(prioridadValue)

          return (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                "& select": {
                  width: "100%",
                  padding: "8px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  backgroundColor: colors.bg,
                  color: colors.text,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  outline: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: colors.border,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  },
                  "&:focus": {
                    borderColor: colors.border,
                    boxShadow: `0 0 0 2px ${colors.bg}`,
                  },
                },
              }}
            >
              <select
                value={formatPrioridadValue(params.value)}
                onChange={(e) => {
                  e.stopPropagation()
                  handlePrioridadChange(params.row.id, e.target.value)
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {params.value === null && <option value="">Seleccionar</option>}
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </Box>
          )
        },
      },
      {
        field: "ultimaActualizacion",
        headerName: "Actualización",
        width: 150,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        ),
      },
      {
        field: "medidas_activas_count",
        headerName: "Medidas",
        width: 100,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value || 0}
            size="small"
            color={params.value > 0 ? "primary" : "default"}
            sx={{ minWidth: 40 }}
          />
        ),
      },
      {
        field: "actividades_activas_count",
        headerName: "Actividades",
        width: 110,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value || 0}
            size="small"
            color={params.value > 0 ? "secondary" : "default"}
            sx={{ minWidth: 40 }}
          />
        ),
      },
      {
        field: "oficios_count",
        headerName: "Oficios",
        width: 100,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value || 0}
            size="small"
            color={params.value > 0 ? "info" : "default"}
            sx={{ minWidth: 40 }}
          />
        ),
      },
      {
        field: "indicadores_pi",
        headerName: "PI",
        width: 80,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <ChipDemandaPI count={params.row.indicadores?.demanda_pi_count || 0} />
        ),
      },
      {
        field: "indicadores_oficios_semaforo",
        headerName: "Oficios",
        width: 150,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => <ChipsOficios oficios={params.row.oficios || []} />,
      },
      {
        field: "indicadores_medidas",
        headerName: "Andarivel Medidas",
        width: 180,
        renderCell: (params) => <AndarielMedidas estado={params.row.indicadores?.medida_andarivel || null} />,
      },
      {
        field: "indicadores_pt",
        headerName: "Plan de Trabajo",
        width: 200,
        renderCell: (params) => (
          <ContadoresPT
            actividades={
              params.row.indicadores?.pt_actividades || {
                pendientes: 0,
                en_progreso: 0,
                vencidas: 0,
                realizadas: 0,
              }
            }
          />
        ),
      },
      {
        field: "indicadores_alertas",
        headerName: "Alertas",
        width: 80,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => <AlertasChip alertas={params.row.indicadores?.alertas || []} />,
      },
      {
        field: "actions",
        headerName: "Acciones",
        width: 180,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {/* Quick action buttons */}
            <Tooltip title="Ver detalles">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenModal(params.row.id)
                }}
                sx={{ color: "primary.main" }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* CA-3: Hide "Asignar" button for Level 2 users (Equipo Técnico) */}
            {permissions.canAssign && (
              <Tooltip title="Asignar">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenAsignarModal(params.row.id)
                  }}
                  sx={{ color: "secondary.main" }}
                >
                  <PersonAdd fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Action Menu with more options */}
            <ActionMenu
              legajoId={params.row.id}
              demandaId={params.row.indicadores?.demanda_pi_id || null}
              tieneMedidas={params.row.medidas_activas_count > 0}
              tieneOficios={params.row.oficios_count > 0}
              tienePlanTrabajo={
                (params.row.indicadores?.pt_actividades?.pendientes || 0) +
                (params.row.indicadores?.pt_actividades?.en_progreso || 0) +
                (params.row.indicadores?.pt_actividades?.vencidas || 0) +
                (params.row.indicadores?.pt_actividades?.realizadas || 0) >
                0
              }
              onViewDetail={handleOpenModal}
              onAssign={handleOpenAsignarModal}
              userPermissions={{
                canAssign: permissions.canAssign,
                canEdit: permissions.canEdit,
                canSendNotification: permissions.canSendNotification,
              }}
            />
          </Box>
        ),
      },
    ]

    // Add more columns for larger screens
    if (!isMobile) {
      const additionalColumns: GridColDef[] = [
        {
          field: "zona",
          headerName: "Zona",
          width: 130,
          renderCell: (params) => <Typography variant="body2">{params.value || "N/A"}</Typography>,
        },
        {
          field: "equipo_trabajo",
          headerName: "Equipo",
          width: 150,
          renderCell: (params) => <Typography variant="body2">{params.value || "N/A"}</Typography>,
        },
        {
          field: "profesional_asignado",
          headerName: "Profesional",
          width: 150,
          renderCell: (params) => <Typography variant="body2">{params.value || "Sin asignar"}</Typography>,
        },
        {
          field: "fecha_apertura",
          headerName: "Fecha Apertura",
          width: 130,
          renderCell: (params) => {
            try {
              const date = new Date(params.value)
              return (
                <Typography variant="body2">
                  {date.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Typography>
              )
            } catch {
              return <Typography variant="body2">{params.value}</Typography>
            }
          },
        },
      ]

      // CA-2: Only show judicial data columns for users with permission
      if (permissions.canViewJudicialData) {
        additionalColumns.splice(3, 0, {
          field: "jefe_zonal",
          headerName: "Jefe Zonal",
          width: 150,
          renderCell: (params) => <Typography variant="body2">{params.value || "N/A"}</Typography>,
        })
      }

      baseColumns.push(...additionalColumns)
    }

    return baseColumns
  }

  const columns = useMemo(() => getColumns(), [isMobile, permissions])

  // Build name mappings for ActiveFiltersBar
  const jefeZonalNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.jefesZonales.forEach((jefe) => {
      mapping[jefe.id] = jefe.nombre_completo || jefe.nombre || `ID: ${jefe.id}`
    })
    return mapping
  }, [filterOptions.jefesZonales])

  const directorNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.directores.forEach((director) => {
      mapping[director.id] = director.nombre_completo || director.nombre || `ID: ${director.id}`
    })
    return mapping
  }, [filterOptions.directores])

  const equipoTrabajoNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.equiposTrabajo.forEach((equipo) => {
      mapping[equipo.id] = equipo.nombre || equipo.codigo || `ID: ${equipo.id}`
    })
    return mapping
  }, [filterOptions.equiposTrabajo])

  const equipoCentroVidaNames = useMemo(() => {
    const mapping: Record<number, string> = {}
    filterOptions.equiposCentroVida.forEach((equipo) => {
      mapping[equipo.id] = equipo.nombre || equipo.codigo || `ID: ${equipo.id}`
    })
    return mapping
  }, [filterOptions.equiposCentroVida])

  const rows =
    legajosData?.results.map((legajo: LegajoApiResponse) => {
      // Format fecha_ultima_actualizacion safely
      let ultimaActualizacionFormatted = "N/A"
      try {
        if (legajo.fecha_ultima_actualizacion) {
          const date = new Date(legajo.fecha_ultima_actualizacion)
          if (!isNaN(date.getTime())) {
            ultimaActualizacionFormatted = date.toLocaleString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        }
      } catch (error) {
        console.error("Error formatting fecha_ultima_actualizacion:", error)
      }

      // Safely extract counts from arrays
      const medidasCount = Array.isArray(legajo.medidas_activas) ? legajo.medidas_activas.length : 0
      const actividadesCount = Array.isArray(legajo.actividades_activas) ? legajo.actividades_activas.length : 0
      const oficiosCount = Array.isArray(legajo.oficios) ? legajo.oficios.length : 0

      // Safely extract string values from fields that might be strings or objects
      const zonaValue = typeof legajo.zona === "string"
        ? legajo.zona
        : legajo.zona && typeof legajo.zona === "object" && (legajo.zona as any).nombre
          ? (legajo.zona as any).nombre
          : null

      const equipoTrabajoValue = typeof legajo.equipo_trabajo === "string"
        ? legajo.equipo_trabajo
        : legajo.equipo_trabajo && typeof legajo.equipo_trabajo === "object" && (legajo.equipo_trabajo as any).nombre
          ? (legajo.equipo_trabajo as any).nombre
          : null

      const userResponsableValue = typeof legajo.user_responsable === "string"
        ? legajo.user_responsable
        : legajo.user_responsable && typeof legajo.user_responsable === "object" && (legajo.user_responsable as any).nombre_completo
          ? (legajo.user_responsable as any).nombre_completo
          : null

      const jefeZonalValue = typeof legajo.jefe_zonal === "string"
        ? legajo.jefe_zonal
        : legajo.jefe_zonal && typeof legajo.jefe_zonal === "object" && (legajo.jefe_zonal as any).nombre_completo
          ? (legajo.jefe_zonal as any).nombre_completo
          : null

      return {
        id: legajo.id,
        numero_legajo: legajo.numero || `L-${legajo.id}`,
        nombre: legajo.nnya ? legajo.nnya.nombre_completo : "N/A",
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
        // Add indicadores and oficios for new visual components
        indicadores: legajo.indicadores,
        oficios: legajo.oficios,
      }
    }) || []

  // Add this function to handle Excel export
  const handleExportXlsx = () => {
    // Export to Excel with current table data and filter metadata
    exportLegajosToExcel(rows, {
      filters: apiFilters,
      totalCount: totalCount,
    })

    // Show success message
    toast.success("Archivo Excel generado correctamente", {
      position: "top-center",
      autoClose: 3000,
    })
  }

  return (
    <>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0", bgcolor: "#f9f9f9" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1976d2" }}>
            Gestión de Legajos
          </Typography>

          {/* Search Bar - LEG-03 CA-1 */}
          <Box sx={{ mb: 2 }}>
            <LegajoSearchBar
              onSearch={handleSearch}
              initialValue={apiFilters.search || ""}
            />
          </Box>

          {/* Action Buttons and Filters */}
          <div className="flex gap-4 relative z-10">
            <LegajoButtons
              isLoading={isLoading}
              handleNuevoRegistro={() => { }}
              onFilterChange={(filters) => {
                // Handle filter changes if needed
                console.log('Filter changes:', filters)
              }}
              onSearch={() => {
                // Handle search if needed
                console.log('Search triggered')
              }}
              onLegajoCreated={(data) => {
                console.log('Legajo created:', data)
                // Refresh the data
                loadLegajos()
              }}
            />
            <LegajoFilters
              onFilterChange={(newFilters) => {
                setApiFilters((prev) => ({ ...prev, ...newFilters }))
                setPaginationModel((prev) => ({ ...prev, page: 0 }))
              }}
            />
          </div>
        </Box>

        {/* Active Filters Bar - LEG-03 CA-5 */}
        <ActiveFiltersBar
          filters={apiFilters}
          totalResults={totalCount}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
          jefeZonalNames={jefeZonalNames}
          directorNames={directorNames}
          equipoTrabajoNames={equipoTrabajoNames}
          equipoCentroVidaNames={equipoCentroVidaNames}
        />

        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={(newModel) => setSortModel(newModel)}
            sortingMode="server"
            pageSizeOptions={[5, 10, 25, 50, 100]}
            rowCount={totalCount}
            paginationMode="server"
            loading={isLoading || isUpdating}
            onRowClick={(params) => {
              handleOpenModal(params.row.id)
            }}
            slots={{
              toolbar: () => <CustomToolbar onExportXlsx={handleExportXlsx} />,
            }}
            sx={{
              cursor: "pointer",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #e0e0e0",
              },
              "& .MuiDataGrid-cell": {
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
              "& .MuiDataGrid-row": {
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              },
            }}
          />
        </div>
      </Paper>
      <Modal
        open={isModalOpen}
        aria-labelledby="legajo-detail-modal"
        aria-describedby="legajo-detail-description"
        onClose={(_event, reason) => {
          if (reason !== "backdropClick") {
            handleCloseModal()
          }
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "90%", md: "80%" },
            maxWidth: 900,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          {selectedLegajoId ? (
            <LegajoDetail params={{ id: selectedLegajoId.toString() }} onClose={handleCloseModal} />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Modal>
      <AsignarLegajoModal
        open={isAsignarModalOpen}
        onClose={handleCloseAsignarModal}
        legajoId={selectedLegajoIdForAssignment}
        onAsignacionComplete={() => loadLegajos()}
      />
    </>
  )
}

export default LegajoTable
