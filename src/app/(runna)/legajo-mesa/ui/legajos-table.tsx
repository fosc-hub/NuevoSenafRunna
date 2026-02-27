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
        onClick={() => window.location.reload()}
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
        width: 120,
        align: "center",
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AlertasChip
                alertas={params.row.indicadores?.alertas || []}
                virtualAlerts={virtualAlerts}
              />
            </Box>
          )
        },
      },
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
        )
      },
      {
        field: "numero_legajo",
        headerName: "Nº Legajo",
        width: 120,
      },
      {
        field: "nombre",
        headerName: "Nombre",
        width: 180,
        renderCell: (params) => (
          <Tooltip title={`DNI: ${params.row.dni}`}>
            <Typography variant="body2">{params.value}</Typography>
          </Tooltip>
        ),
      },
      {
        field: "prioridad",
        headerName: "Prioridad",
        width: 150,
        renderCell: (params) => {
          const colors = getPriorityColor(params.value as any)
          return (
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <select
                value={params.value || ""}
                onChange={(e) => {
                  e.stopPropagation()
                  handlePrioridadChange(params.row.id, e.target.value)
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  backgroundColor: colors.bg,
                  color: colors.text,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
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
      },
      {
        field: "medidas_activas_count",
        headerName: "Medidas",
        width: 100,
        align: "center",
        renderCell: (params) => (
          <Chip label={params.value || 0} size="small" color={params.value > 0 ? "primary" : "default"} />
        ),
      },
      {
        field: "actividades_activas_count",
        headerName: "Actividades",
        width: 110,
        align: "center",
        renderCell: (params) => (
          <Chip label={params.value || 0} size="small" color={params.value > 0 ? "secondary" : "default"} />
        ),
      },
      {
        field: "oficios_count",
        headerName: "Oficios",
        width: 100,
        align: "center",
        renderCell: (params) => (
          <Chip label={params.value || 0} size="small" color={params.value > 0 ? "info" : "default"} />
        ),
      },
      {
        field: "indicadores_pi",
        headerName: "PI",
        width: 80,
        align: "center",
        renderCell: (params) => <ChipDemandaPI count={params.row.indicadores?.demanda_pi_count || 0} />,
      },
      {
        field: "indicadores_oficios_semaforo",
        headerName: "Oficios",
        width: 150,
        align: "center",
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
            actividades={params.row.indicadores?.pt_actividades || { pendientes: 0, en_progreso: 0, vencidas: 0, realizadas: 0 }}
          />
        ),
      },

      {
        field: "actions",
        headerName: "Acciones",
        width: 180,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Ver detalles">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenModal(params.row.id) }} sx={{ color: "primary.main" }}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {permissions.canAssign && (
              <Tooltip title="Asignar">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenAsignarModal(params.row.id) }} sx={{ color: "secondary.main" }}>
                  <PersonAdd fontSize="small" />
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
        { field: "zona", headerName: "Zona", width: 130 },
        { field: "equipo_trabajo", headerName: "Equipo", width: 150 },
        { field: "profesional_asignado", headerName: "Profesional", width: 150 },
        {
          field: "fecha_apertura",
          headerName: "Fecha Apertura",
          width: 130,
          renderCell: (params) => (
            <Typography variant="body2">
              {params.value ? new Date(params.value).toLocaleDateString("es-AR") : "N/A"}
            </Typography>
          ),
        },
      ]
      if (permissions.canViewJudicialData) {
        additionalColumns.push({ field: "jefe_zonal", headerName: "Jefe Zonal", width: 150 })
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
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0", bgcolor: "#f9f9f9" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1976d2" }}>Gestión de Legajos</Typography>
          <Box sx={{ mb: 2 }}>
            <LegajoSearchBar onSearch={handleSearch} initialValue={apiFilters.search || ""} />
          </Box>
          <div className="flex gap-4 relative z-10">
            <LegajoButtons isLoading={isLoading} handleNuevoRegistro={() => { }} onLegajoCreated={() => loadLegajos()} />
            <LegajoFilters onFilterChange={(newFilters) => { setApiFilters((prev) => ({ ...prev, ...newFilters })); setPaginationModel((prev) => ({ ...prev, page: 0 })) }} />
          </div>
        </Box>
        <ActiveFiltersBar filters={apiFilters} totalResults={totalCount} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAllFilters} jefeZonalNames={jefeZonalNames} directorNames={directorNames} equipoTrabajoNames={equipoTrabajoNames} equipoCentroVidaNames={equipoCentroVidaNames} />
        <div style={{ height: 600, width: "100%" }}>
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
            getRowClassName={(params) => shouldHighlightLegajo(params.row) ? "highlight-pending" : ""}
            slots={{ toolbar: () => <CustomToolbar onExportXlsx={handleExportXlsx} /> }}
            sx={{
              cursor: "pointer",
              "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(25, 118, 210, 0.04)" },
              "& .highlight-pending": {
                backgroundColor: "rgba(79, 63, 240, 0.1) !important",
                borderLeft: "6px solid #3f51b5 !important",
                "& .MuiDataGrid-cell": { fontWeight: "900 !important", color: "#1a237e !important" },
              },
            }}
          />
        </div>
      </Paper>
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: { xs: "95%", md: "80%" }, maxWidth: 900, bgcolor: "background.paper", p: 4, maxHeight: "90vh", overflowY: "auto", borderRadius: 2 }}>
          {selectedLegajoId ? <LegajoDetail params={{ id: selectedLegajoId.toString() }} onClose={handleCloseModal} /> : <CircularProgress />}
        </Box>
      </Modal>
      <AsignarLegajoModal open={isAsignarModalOpen} onClose={handleCloseAsignarModal} legajoId={selectedLegajoIdForAssignment} onAsignacionComplete={loadLegajos} />
    </>
  )
}

export default LegajoTable
