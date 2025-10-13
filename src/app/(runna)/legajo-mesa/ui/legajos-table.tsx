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
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid"
import { PersonAdd, Edit, Warning, AttachFile, Visibility, Refresh, DownloadRounded } from "@mui/icons-material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import AsignarModal from "../../../../components/asignarModal"
import { fetchLegajos, updateLegajoPrioridad } from "../api/legajos-api-service"
import type { LegajoApiResponse, PaginatedLegajosResponse } from "../types/legajo-api"
import LegajoButtons from "./legajos-buttons"
import { exportDemandasToExcel } from "./legajos-service"

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

// Status chip component for better visual representation
const StatusChip = ({ status }: { status: string }) => {
  let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default"
  let label = status

  switch (status) {
    case "ABIERTO":
      color = "success"
      label = "Abierto"
      break
    case "EN_PROCESO":
      color = "info"
      label = "En Proceso"
      break
    case "PENDIENTE_REVISION":
      color = "warning"
      label = "Pendiente Revisión"
      break
    case "CERRADO":
      color = "default"
      label = "Cerrado"
      break
    case "ARCHIVADO":
      color = "secondary"
      label = "Archivado"
      break
    case "DERIVADO":
      color = "primary"
      label = "Derivado"
      break
    case "SUSPENDIDO":
      color = "error"
      label = "Suspendido"
      break
    default:
      label = "Desconocido"
  }

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 500,
        "& .MuiChip-label": {
          px: 1,
        },
        margin: "0 auto",
        display: "flex",
      }}
    />
  )
}

// Custom component for rendering adjuntos
// Note: Adjuntos are not available in the current API response
const AdjuntosCell = () => {
  return (
    <Typography variant="body2" color="text.secondary">
      N/A
    </Typography>
  )
}

const LegajoTable: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [totalCount, setTotalCount] = useState(0)
  const [selectedLegajoId, setSelectedLegajoId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterState, setFilterState] = useState({
    todos: true,
    abiertos: false,
    enProceso: false,
    cerrados: false,
    archivados: false,
    derivados: false,
    suspendidos: false,
    pendienteRevision: false,
  })
  const [user, setUser] = useState({ id: 1, is_superuser: false, all_permissions: [] })
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false)
  const [selectedLegajoIdForAssignment, setSelectedLegajoIdForAssignment] = useState<number | null>(null)
  const [legajosData, setLegajosData] = useState<PaginatedLegajosResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [apiFilters, setApiFilters] = useState<{
    zona: number | null
    urgencia: string | null
    search: string | null
  }>({
    zona: null,
    urgencia: null,
    search: null,
  })

  useEffect(() => {
    loadLegajos()
  }, [paginationModel.page, paginationModel.pageSize, apiFilters])

  const loadLegajos = async () => {
    try {
      setIsLoading(true)

      // Build query params - API uses 1-based pagination
      const queryParams: any = {
        page: paginationModel.page + 1, // Convert from 0-based to 1-based
        page_size: paginationModel.pageSize,
      }

      // Add filters if they exist
      if (apiFilters.zona !== null) {
        queryParams.zona = apiFilters.zona
      }
      if (apiFilters.urgencia !== null && apiFilters.urgencia.trim() !== "") {
        queryParams.urgencia = apiFilters.urgencia
      }
      if (apiFilters.search !== null && apiFilters.search.trim() !== "") {
        queryParams.search = apiFilters.search
      }

      const response = await fetchLegajos(queryParams)
      setTotalCount(response.count)
      setLegajosData(response)
    } catch (error) {
      console.error("Error al obtener los legajos:", error)
      toast.error("Error al cargar los legajos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (newFilters: typeof apiFilters) => {
    setApiFilters(newFilters)
    // Reset to first page when filters change
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
      await updateLegajoPrioridad(legajoId, newValue as "ALTA" | "MEDIA" | "BAJA")

      // Update the local state to reflect the changes
      if (legajosData) {
        const updatedResults = legajosData.results.map((legajo) =>
          legajo.id === legajoId ? { ...legajo, prioridad: newValue as "ALTA" | "MEDIA" | "BAJA" } : legajo,
        )
        setLegajosData({
          ...legajosData,
          results: updatedResults,
        })
      }

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

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "ABIERTO":
        return "#4caf50" // green
      case "EN_PROCESO":
        return "#2196f3" // blue
      case "PENDIENTE_REVISION":
        return "#ff9800" // orange
      case "CERRADO":
        return "#9e9e9e" // dark gray
      case "ARCHIVADO":
        return "#673ab7" // purple
      case "DERIVADO":
        return "#00bcd4" // cyan
      case "SUSPENDIDO":
        return "#f44336" // red
      default:
        return "transparent"
    }
  }

  // Helper function to format text with underscores
  const formatUnderscoreText = (text: any): string => {
    if (!text || typeof text !== "string" || text === "N/A") {
      return "N/A"
    }

    return text
      .split("_")
      .join(" ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
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
          <Typography variant="body2" sx={{ fontWeight: params.row.recibido ? "normal" : "bold" }}>
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
            <Typography variant="body2" sx={{ fontWeight: params.row.recibido ? "normal" : "bold" }}>
              {params.value}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "prioridad",
        headerName: "Prioridad",
        width: 150,
        renderCell: (params) => (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              "& select": {
                width: "100%",
                padding: "8px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                backgroundColor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                cursor: "pointer",
                outline: "none",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#bdbdbd",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                },
                "&:focus": {
                  borderColor: "#2196f3",
                  boxShadow: "0 0 0 2px rgba(33,150,243,0.2)",
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
        ),
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
        field: "actions",
        headerName: "Acciones",
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 1 }}>
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

            <Tooltip title={params.row.estado_legajo === "EN_PROCESO" ? "Editar" : "No disponible para edición"}>
              <span>
                <IconButton
                  size="small"
                  disabled={params.row.estado_legajo !== "EN_PROCESO"}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (params.row.estado_legajo === "EN_PROCESO") {
                      window.location.href = `/legajo/editar?id=${params.row.id}`
                    }
                  }}
                  sx={{
                    color: params.row.estado_legajo === "EN_PROCESO" ? "success.main" : "action.disabled",
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ),
      },
      {
        field: "estado_legajo",
        headerName: "Estado",
        width: 160,
        renderCell: (params) => <StatusChip status={params.value} />,
      },
      {
        field: "adjuntos",
        headerName: "Adjuntos",
        width: 100,
        renderCell: () => <AdjuntosCell />,
      },
    ]

    // Add more columns for larger screens
    if (!isMobile) {
      baseColumns.push(
        {
          field: "tipo_legajo",
          headerName: "Tipo",
          width: 150,
          renderCell: (params) => {
            return <Typography variant="body2">{formatUnderscoreText(params.value)}</Typography>
          },
        },
        {
          field: "localidad",
          headerName: "Localidad",
          width: 130,
          renderCell: (params) => <Typography variant="body2">{params.value}</Typography>,
        },
        {
          field: "zonaEquipo",
          headerName: "Zona/Equipo",
          width: 130,
          renderCell: (params) => <Typography variant="body2">{params.value}</Typography>,
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
          width: 150,
          renderCell: (params) => <Typography variant="body2">{params.value}</Typography>,
        },
      )
    }

    return baseColumns
  }

  const columns = useMemo(() => getColumns(), [isMobile])

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

      return {
        id: legajo.id,
        numero_legajo: legajo.numero || `L-${legajo.id}`,
        nombre: legajo.nnya ? legajo.nnya.nombre_completo : "N/A",
        dni: legajo.nnya?.dni || "N/A",
        prioridad: legajo.prioridad || null,
        ultimaActualizacion: ultimaActualizacionFormatted,
        localidad: "N/A", // Not available in API response
        zonaEquipo: legajo.zona || "N/A",
        estado_legajo: "ABIERTO", // Default value
        recibido: true, // Default to true
        legajo_zona_id: null,
        tipo_legajo: legajo.equipo_trabajo || "N/A",
        profesional_asignado: legajo.user_responsable || null,
        fecha_apertura: legajo.fecha_apertura,
        adjuntos: [], // Not available in API response
      }
    }) || []

  // Add this function to handle Excel export
  const handleExportXlsx = () => {
    // Define field mappings (raw field name -> display name)
    const fieldMappings = {
      id: "ID",
      numero_legajo: "Nº Legajo",
      nombre: "Nombre",
      dni: "DNI",
      prioridad: "Prioridad",
      ultimaActualizacion: "Última Actualización",
      localidad: "Localidad",
      zonaEquipo: "Zona/Equipo",
      estado_legajo: "Estado",
      tipo_legajo: "Tipo",
      profesional_asignado: "Profesional",
      fecha_apertura: "Fecha Apertura",
      adjuntos: "Cantidad de Adjuntos",
    }

    // Define formatters for specific fields
    const formatters = {
      estado_legajo: (value: string) => formatUnderscoreText(value),
      tipo_legajo: (value: string) => formatUnderscoreText(value),
      prioridad: (value: string) => formatUnderscoreText(value),
      adjuntos: (value: any[]) => (Array.isArray(value) ? value.length : 0),
    }

    // Export to Excel
    exportDemandasToExcel(rows)

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
          <div className="flex gap-4 relative z-10">
            <LegajoButtons
              onSearch={() => console.log("Searching...")}
              onFilter={() => console.log("Filters applied")}
              onNewLegajo={() => console.log("Creating new legajo")}
            />
          </div>
        </Box>
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
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
                position: "relative",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "7px",
                },
              },
              // Add specific styles for each estado_legajo
              "& .row-abierto::before": {
                backgroundColor: "#4caf50",
              },
              "& .row-en-proceso::before": {
                backgroundColor: "#2196f3",
              },
              "& .row-pendiente-revision::before": {
                backgroundColor: "#ff9800",
              },
              "& .row-cerrado::before": {
                backgroundColor: "#9e9e9e",
              },
              "& .row-archivado::before": {
                backgroundColor: "#673ab7",
              },
              "& .row-derivado::before": {
                backgroundColor: "#00bcd4",
              },
              "& .row-suspendido::before": {
                backgroundColor: "#f44336",
              },
              // Add style for non-received rows
              "& .row-not-received": {
                fontWeight: "500",
              },
              // Add a new style for received rows
              "& .row-received": {
                color: "#666666",
              },
            }}
            getRowClassName={(params) => {
              const estado = params.row.estado_legajo?.toLowerCase() || ""
              const recibido = params.row.recibido
              return `row-${estado.replace(/_/g, "-")}${recibido ? " row-received" : " row-not-received"}`
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
      <AsignarModal
        open={isAsignarModalOpen}
        onClose={handleCloseAsignarModal}
        demandaId={selectedLegajoIdForAssignment}
      />
    </>
  )
}

export default LegajoTable
