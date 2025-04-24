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
  GridToolbarExport,
} from "@mui/x-data-grid"
import { PersonAdd, Edit, Warning, AttachFile, Visibility, Refresh } from "@mui/icons-material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import Buttons from "../../../../components/Buttons"
import AsignarModal from "../../../../components/asignarModal"
import { getLegajos, updateLegajo, type Legajo, type PaginatedResponse } from "../mock-data/legajos-service"
import LegajoButtons from "./legajos-buttons"

// Dynamically import LegajoDetail with no SSR to avoid hydration issues
const LegajoDetail = dynamic(() => import("../../legajo/legajo-detail"), { ssr: false })

// Define a type for adjuntos to help with debugging
interface Adjunto {
  archivo: string
}

// Helper function to get file name from URL
const getFileNameFromUrl = (url: string): string => {
  const parts = url.split("/")
  return parts[parts.length - 1]
}

// Custom toolbar component
const CustomToolbar = () => {
  return (
    <GridToolbarContainer sx={{ p: 1, borderBottom: "1px solid #e0e0e0" }}>
      <GridToolbarFilterButton
        sx={{
          mr: 1,
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      />
      <GridToolbarExport
        sx={{
          mr: 1,
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      />
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
      }}
    />
  )
}

// Custom component for rendering adjuntos
const AdjuntosCell = (props: { adjuntos: Adjunto[] }) => {
  const { adjuntos } = props
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  if (!adjuntos || !Array.isArray(adjuntos) || adjuntos.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin adjuntos
      </Typography>
    )
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation()
    }
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  // Show a summary in the cell
  return (
    <div style={{ width: "100%" }}>
      <Tooltip title={`Ver ${adjuntos.length} ${adjuntos.length === 1 ? "adjunto" : "adjuntos"}`}>
        <Badge badgeContent={adjuntos.length} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem" } }}>
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{
              color: "primary.main",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            <AttachFile fontSize="small" />
          </IconButton>
        </Badge>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClick={(e) => e.stopPropagation()}
        sx={{ zIndex: 9999 }}
      >
        <Box
          sx={{
            width: 300,
            p: 2,
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Adjuntos ({adjuntos.length})
            </Typography>
            <Button size="small" variant="outlined" onClick={handleClose} sx={{ minWidth: "auto", padding: "2px 8px" }}>
              Cerrar
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {adjuntos.map((adjunto, index) => {
              if (!adjunto || !adjunto.archivo) {
                return null
              }

              const fileName = getFileNameFromUrl(adjunto.archivo)

              // Use a div instead of Link to avoid nested <a> tags
              return (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(adjunto.archivo, "_blank", "noopener,noreferrer")
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#1976d2",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f7ff"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  <AttachFile style={{ fontSize: "1rem", marginRight: "8px", flexShrink: 0 }} />
                  <span style={{ wordBreak: "break-word" }}>{fileName}</span>
                </div>
              )
            })}
          </div>
        </Box>
      </Popover>
    </div>
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
  const [legajosData, setLegajosData] = useState<PaginatedResponse<Legajo> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [apiFilters, setApiFilters] = useState({
    tipo_legajo: null,
    estado_legajo: null,
    prioridad: null,
  })

  useEffect(() => {
    fetchLegajos()
  }, [paginationModel.page, paginationModel.pageSize, apiFilters])

  const fetchLegajos = () => {
    try {
      setIsLoading(true)
      const response = getLegajos(paginationModel.page, paginationModel.pageSize, apiFilters)
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

  const handlePrioridadChange = (legajoId: number, newValue: string) => {
    console.log(`Updating prioridad for legajo ${legajoId} to ${newValue}`)
    setIsUpdating(true)
    try {
      const updatedLegajo = updateLegajo(legajoId, { prioridad: newValue })

      // Update the local state to reflect the changes
      if (legajosData) {
        const updatedResults = legajosData.results.map((legajo) =>
          legajo.id === legajoId ? { ...legajo, prioridad: newValue } : legajo,
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
        renderCell: (params) => <AdjuntosCell adjuntos={params.value} />,
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
    legajosData?.results.map((legajo: Legajo) => {
      return {
        id: legajo.id,
        numero_legajo: legajo.numero_legajo || `L-${legajo.id}`,
        nombre: legajo.persona_principal
          ? `${legajo.persona_principal.nombre} ${legajo.persona_principal.apellido}`
          : "N/A",
        dni: legajo.persona_principal?.dni || "N/A",
        prioridad: legajo.prioridad || null,
        ultimaActualizacion: new Date(legajo.ultima_actualizacion).toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        localidad: legajo.localidad?.nombre || "N/A",
        zonaEquipo: legajo.legajo_zona?.zona?.nombre || "N/A",
        estado_legajo: legajo.estado_legajo,
        recibido: legajo.legajo_zona?.recibido || false,
        legajo_zona_id: legajo.legajo_zona?.id,
        tipo_legajo: legajo.tipo_legajo || "N/A",
        profesional_asignado: legajo.profesional_asignado?.nombre || null,
        fecha_apertura: legajo.fecha_apertura,
        adjuntos: legajo.adjuntos || [],
      }
    }) || []

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
          onSearch={(query) => console.log("Searching for:", query)}
          onFilter={(filters) => console.log("Filters applied:", filters)}
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
              toolbar: CustomToolbar,
            }}
            sx={{
              cursor: "pointer",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #e0e0e0",
              },
              "& .MuiDataGrid-cell": {
                padding: "8px 16px",
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
        legajoId={selectedLegajoIdForAssignment}
      />
    </>
  )
}

export default LegajoTable
