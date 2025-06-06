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
  Link,
  Popover,
  Chip,
  Tooltip,
  IconButton,
  Badge,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material"
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PersonAdd, Edit, Warning, AttachFile, Visibility, Refresh } from "@mui/icons-material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import Buttons from "../../../../components/Buttons"
import AsignarModal from "../../../../components/asignarModal"
import * as XLSX from "xlsx"
import { DownloadRounded } from "@mui/icons-material"
import { useUser } from "@/utils/auth/userZustand"

// Assume these imports are available in your project
import { get, update, create, put } from "@/app/api/apiService"
import type { TDemanda } from "@/app/interfaces"

// Dynamically import DemandaDetail with no SSR to avoid hydration issues
const DemandaDetail = dynamic(() => import("../../demanda/DemandaDetail"), { ssr: false })

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

type TDemandaPaginated = PaginatedResponse<TDemanda>

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
const CustomToolbar = ({ onExportXlsx }: { onExportXlsx: () => void }) => {
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
    case "SIN_ASIGNAR":
      color = "default"
      label = "Sin Asignar"
      break
    case "CONSTATACION":
      color = "success"
      label = "Constatación"
      break
    case "EVALUACION":
      color = "info"
      label = "Evaluación"
      break
    case "PENDIENTE_AUTORIZACION":
      color = "warning"
      label = "Pendiente Autorización"
      break
    case "ARCHIVADA":
      color = "default"
      label = "Archivada"
      break
    case "ADMITIDA":
      color = "secondary"
      label = "Admitida"
      break
    case "RESPUESTA_SIN_ENVIAR":
      color = "error"
      label = "Respuesta Sin Enviar"
      break
    case "INFORME_SIN_ENVIAR":
      color = "warning"
      label = "Informe Sin Enviar"
      break
    case "REPUESTA_ENVIADA":
      color = "success"
      label = "Respuesta Enviada"
      break
    case "INFORME_ENVIADO":
      color = "info"
      label = "Informe Enviado"
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
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
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

              return (
                <Link
                  key={index}
                  href={adjunto.archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#1976d2",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                  }}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f0f7ff",
                    },
                  }}
                >
                  <AttachFile style={{ fontSize: "1rem", marginRight: "8px", flexShrink: 0 }} />
                  <span style={{ wordBreak: "break-word" }}>{fileName}</span>
                </Link>
              )
            })}
          </div>
        </Box>
      </Popover>
    </div>
  )
}

const DemandaTableContent: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const user = useUser((state) => state.user)

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [totalCount, setTotalCount] = useState(0)
  const queryClient = useQueryClient()
  const [selectedDemandaId, setSelectedDemandaId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterState, setFilterState] = useState({
    todos: true,
    sinAsignar: false,
    asignados: false,
    archivados: false,
    completados: false,
    sinLeer: false,
    leidos: false,
    constatados: false,
    evaluados: false,
  })
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false)
  const [selectedDemandaIdForAssignment, setSelectedDemandaIdForAssignment] = useState<number | null>(null)
  const [demandasData, setDemandasData] = useState<TDemandaPaginated | null>(null)

  const [apiFilters, setApiFilters] = useState({
    envio_de_respuesta: null,
    estado_demanda: null,
    objetivo_de_demanda: null,
  })

  // Check if user has permission to assign demandas
  const hasAssignPermission = user?.all_permissions?.includes('add_tdemandazona') ||
    user?.all_permissions?.includes('change_tdemandazona') ||
    user?.all_permissions?.includes('view_tdemandazona') ||
    user?.is_superuser ||
    user?.is_staff

  // Check if user has permission to evaluate
  const hasEvaluatePermission = user?.all_permissions?.includes('add_tevaluacion') ||
    user?.all_permissions?.includes('change_tevaluacion') ||
    user?.all_permissions?.includes('view_tevaluacion') ||
    user?.is_superuser ||
    user?.is_staff

  // Check if user has permission to calificar
  const hasCalificarPermission = user?.all_permissions?.includes('add_tcalificaciondemanda') ||
    user?.all_permissions?.includes('change_tcalificaciondemanda') ||
    user?.all_permissions?.includes('view_tcalificaciondemanda') ||
    user?.is_superuser ||
    user?.is_staff

  const fetchDemandas = async (pageNumber: number, pageSize: number) => {
    try {
      // Construct query parameters
      const params = new URLSearchParams()

      // Add pagination params
      params.append("page", (pageNumber + 1).toString())
      params.append("page_size", pageSize.toString())

      // Add filter params if they exist
      if (apiFilters.envio_de_respuesta) {
        params.append("envio_de_respuesta", apiFilters.envio_de_respuesta)
      }
      if (apiFilters.estado_demanda) {
        params.append("estado_demanda", apiFilters.estado_demanda)
      }
      if (apiFilters.objetivo_de_demanda) {
        params.append("objetivo_de_demanda", apiFilters.objetivo_de_demanda)
      }

      const response = await get<TDemandaPaginated>(`mesa-de-entrada/?${params.toString()}`)
      setTotalCount(response.count)
      const updatedResponse = {
        ...response,
        results: response.results.map((demanda) => ({
          ...demanda,
          demanda_zona_id: demanda.demanda_zona?.id,
        })),
      }
      setDemandasData(updatedResponse)
      return updatedResponse
    } catch (error) {
      console.error("Error al obtener las demandas:", error)
      throw error
    }
  }

  const handleFilterChange = (newFilters: typeof apiFilters) => {
    setApiFilters(newFilters)
    // Reset to first page when filters change
    setPaginationModel((prev) => ({ ...prev, page: 0 }))
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["demandas", paginationModel.page, paginationModel.pageSize, filterState, apiFilters],
    queryFn: () => fetchDemandas(paginationModel.page, paginationModel.pageSize),
    onSuccess: (data) => setDemandasData(data),
  })

  const handleNuevoRegistro = () => {
    console.log("Nuevo registro clicked")
  }

  const updateCalificacion = useMutation({
    mutationFn: async ({ demandaId, newValue }: { demandaId: number; newValue: string }) => {
      const demanda = demandasData?.results.find((d) => d.id === demandaId)
      if (!demanda) throw new Error("Demanda not found")

      if (demanda.calificacion) {
        return update<TDemanda>(
          "calificacion-demanda",
          demanda.calificacion.id,
          {
            estado_calificacion: newValue,
            ultima_actualizacion: new Date().toISOString(),
          },
          true,
          "¡Calificación actualizada con éxito!",
        )
      } else {
        const currentDate = new Date().toISOString()
        return create<TDemanda>(
          `calificacion-demanda`,
          {
            fecha_y_hora: currentDate,
            descripcion: `Nueva Calificación: ${newValue}`,
            estado_calificacion: newValue,
            demanda: demandaId,
            justificacion: "N/A",
          },
          true,
          "¡Calificación creada con éxito!",
        )
      }
    },
    onSuccess: (data, variables) => {
      console.log("Server response:", data)
      queryClient.invalidateQueries({ queryKey: ["demandas"] })
      queryClient.refetchQueries({ queryKey: ["demandas", paginationModel.page, paginationModel.pageSize] })
    },
    onError: (error) => {
      console.error("Error al actualizar la Calificación:", error)
      toast.error("Error al actualizar la Calificación", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      })
    },
  })

  const updateDemandaZona = useMutation({
    mutationFn: async ({ id, demandaId, userId }: { id: number; demandaId: number; userId: number }) => {
      const currentDate = new Date().toISOString()
      try {
        // Try to use the PUT endpoint first
        const response = await put<TDemanda>(
          "demanda-zona-recibir",
          id,
          {
            fecha_recibido: currentDate,
            recibido: true,
            recibido_por: userId,
          },
          true,
          "Demanda marcada como recibida",
        )

        // If successful, return the response
        return response
      } catch (error: any) {
        // Special handling for 208 status code (Already Reported)
        if (error.response && error.response.status === 208) {
          console.log("La demanda ya estaba marcada como recibida (208). Continuando con visualización.")
          return {
            id,
            demanda: demandaId,
            fecha_recibido: currentDate,
            recibido: true,
            recibido_por: userId,
          }
        }

        // Handle other error status codes
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
          console.warn(`Endpoint demanda-zona-recibir retornó ${error.response.status}. Continuando con visualización.`)

          if (error.response.status === 403) {
            toast.warning("No tienes permisos para marcar como recibida esta demanda, pero puedes ver los detalles.", {
              position: "top-center",
              autoClose: 3000,
            })
            return { id, demanda: demandaId }
          }

          // For 404 errors, try the fallback method
          toast.warning(
            "No se pudo marcar como recibida usando el método principal. Intentando método alternativo...",
            {
              position: "top-center",
              autoClose: 3000,
            },
          )

          // Fallback to the regular update endpoint
          return update<TDemanda>(
            "demanda-zona",
            id,
            {
              fecha_recibido: currentDate,
              recibido: true,
              recibido_por: userId,
            },
            true,
            "Demanda marcada como recibida (método alternativo)",
          )
        }

        // If it's not a handled error status code, rethrow it
        throw error
      }
    },
    onSuccess: (data, variables) => {
      // Only invalidate queries if we actually updated something
      if (data.fecha_recibido) {
        queryClient.invalidateQueries({ queryKey: ["demandas"] })
        // Update the local state to reflect the changes
        setDemandasData((prevData) => {
          if (!prevData) return null
          return {
            ...prevData,
            results: prevData.results.map((demanda) =>
              demanda.demanda_zona_id === data.id
                ? {
                  ...demanda,
                  demanda_zona: {
                    ...demanda.demanda_zona,
                    recibido: true,
                    fecha_recibido: data.fecha_recibido,
                  },
                }
                : demanda,
            ),
          }
        })
      }

      // Open DemandaDetalle modal using the demandaId from variables
      handleOpenModal(variables.demandaId)
    },
    onError: (error) => {
      console.error("Error al actualizar la Demanda Zona:", error)
      toast.error("Error al marcar la demanda como recibida", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      })
    },
  })

  const handleCalificacionChange = (demandaId: number, newValue: string) => {
    console.log(`Updating calificacion for demanda ${demandaId} to ${newValue}`)
    updateCalificacion.mutate({ demandaId, newValue })
  }

  const formatCalificacionValue = (value: string | undefined | null) => {
    return value || "Seleccionar"
  }

  const handleOpenModal = (demandaId: number) => {
    setSelectedDemandaId(demandaId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedDemandaId(null)
    setIsModalOpen(false)
  }

  const handleOpenAsignarModal = (demandaId: number) => {
    setSelectedDemandaIdForAssignment(demandaId)
    setIsAsignarModalOpen(true)
  }

  const handleCloseAsignarModal = () => {
    setSelectedDemandaIdForAssignment(null)
    setIsAsignarModalOpen(false)
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "SIN_ASIGNAR":
        return "#e0e0e0" // gray
      case "CONSTATACION":
        return "#4caf50" // green
      case "EVALUACION":
        return "#2196f3" // blue
      case "PENDIENTE_AUTORIZACION":
        return "#ff9800" // orange
      case "ARCHIVADA":
        return "#9e9e9e" // dark gray
      case "ADMITIDA":
        return "#673ab7" // purple
      case "RESPUESTA_SIN_ENVIAR":
        return "#f44336" // red
      case "INFORME_SIN_ENVIAR":
        return "#ecff0c" // Amarillo
      case "REPUESTA_ENVIADA":
        return "#8bc34a" // light green
      case "INFORME_ENVIADO":
        return "#00bcd4" // cyan
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            {params.value}
            {params.row.calificacion === "URGENTE" && (
              <Tooltip title="Urgente">
                <Warning color="error" style={{ marginLeft: "4px" }} fontSize="small" />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        field: "score",
        headerName: "Score",
        width: 80,
        renderCell: (params) => (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Chip
              label={params.value}
              size="small"
              variant="outlined"
              color={Number(params.value) > 70 ? "error" : Number(params.value) > 40 ? "warning" : "default"}
              sx={{ minWidth: 40, justifyContent: "center" }}
            />
          </div>
        ),
      },
      {
        field: "nombre",
        headerName: "Nombre",
        width: 180,
        renderCell: (params) => (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Tooltip title={`DNI: ${params.row.dni}`}>
              <Typography variant="body2" sx={{ fontWeight: params.row.recibido ? "normal" : "bold" }}>
                {params.value}
              </Typography>
            </Tooltip>
          </div>
        ),
      },
      {
        field: "calificacion",
        headerName: "Calificación",
        width: 180,
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
            {hasCalificarPermission ? (
              <select
                value={formatCalificacionValue(params.value)}
                onChange={(e) => {
                  e.stopPropagation()
                  handleCalificacionChange(params.row.id, e.target.value)
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {params.value === null && <option value="">Seleccionar</option>}
                {params.row.calificacion_choices && Array.isArray(params.row.calificacion_choices) ? (
                  params.row.calificacion_choices.map((choice) => (
                    <option key={choice[0]} value={choice[0]}>
                      {choice[1]}
                    </option>
                  ))
                ) : (
                  <option value="">No hay opciones disponibles</option>
                )}
              </select>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {formatCalificacionValue(params.value)}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: "ultimaActualizacion",
        headerName: "Actualización",
        width: 150,
        renderCell: (params) => (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Typography variant="body2" color="text.secondary">
              {params.value}
            </Typography>
          </div>
        ),
      },
      {
        field: "actions",
        headerName: "Acciones",
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center", width: "100%" }}>
            <Tooltip title="Ver detalles">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  if (!params.row.recibido && params.row.demanda_zona_id) {
                    updateDemandaZona.mutate({
                      id: params.row.demanda_zona_id,
                      demandaId: params.row.id,
                      userId: user.id,
                    })
                  } else {
                    handleOpenModal(params.row.id)
                  }
                }}
                sx={{ color: "primary.main" }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>

            {hasAssignPermission && (
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

            {hasEvaluatePermission && (
              <Tooltip
                title={
                  params.row.estado_demanda === "EVALUACION" || params.row.estado_demanda === "PENDIENTE_AUTORIZACION"
                    ? "Evaluar"
                    : "No disponible para evaluación"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    disabled={
                      params.row.estado_demanda !== "EVALUACION" && params.row.estado_demanda !== "PENDIENTE_AUTORIZACION"
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      if (
                        params.row.estado_demanda === "EVALUACION" ||
                        params.row.estado_demanda === "PENDIENTE_AUTORIZACION"
                      ) {
                        window.location.href = `/evaluacion?id=${params.row.id}`
                      }
                    }}
                    sx={{
                      color:
                        params.row.estado_demanda === "EVALUACION" ||
                          params.row.estado_demanda === "PENDIENTE_AUTORIZACION"
                          ? "success.main"
                          : "action.disabled",
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        ),
      },
      {
        field: "estado_demanda",
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
          field: "origen",
          headerName: "Remitente",
          width: 150,
          renderCell: (params) => (
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Typography variant="body2">{params.value}</Typography>
            </div>
          ),
        },
        {
          field: "localidad",
          headerName: "Localidad",
          width: 130,
          renderCell: (params) => (
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Typography variant="body2">{params.value}</Typography>
            </div>
          ),
        },
        {
          field: "zonaEquipo",
          headerName: "Zona/Equipo",
          width: 130,
          renderCell: (params) => (
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Typography variant="body2">{params.value}</Typography>
            </div>
          ),
        },
        {
          field: "envioRespuesta",
          headerName: "Envío Respuesta",
          width: 150,
          renderCell: (params) => {
            const value = params.value as string
            let displayText = value
            let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default"

            switch (value) {
              case "NO_NECESARIO":
                displayText = "No Necesario"
                color = "default"
                break
              case "PENDIENTE":
                displayText = "Pendiente"
                color = "warning"
                break
              case "ENVIADO":
                displayText = "Enviado"
                color = "success"
                break
              default:
                displayText = "N/A"
                break
            }

            return (
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <Chip label={displayText} size="small" color={color} variant="outlined" />
              </div>
            )
          },
        },
        {
          field: "objetivoDemanda",
          headerName: "Objetivo",
          width: 150,
          renderCell: (params) => {
            return (
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <Typography variant="body2">{formatUnderscoreText(params.value)}</Typography>
              </div>
            )
          },
        },
      )
    }

    return baseColumns
  }

  const columns = useMemo(() => getColumns(), [isMobile])

  const rows =
    demandasData?.results.map((demanda: TDemanda) => {
      return {
        id: demanda.id,
        score: demanda.demanda_score?.score || "N/A",
        origen: demanda.bloque_datos_remitente?.nombre || "N/A",
        nombre: demanda.nnya_principal ? `${demanda.nnya_principal.nombre} ${demanda.nnya_principal.apellido}` : "N/A",
        dni: demanda.nnya_principal?.dni || "N/A",
        calificacion: demanda.calificacion?.estado_calificacion || null,
        ultimaActualizacion: new Date(demanda.ultima_actualizacion).toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        codigosDemanda: demanda.codigos_demanda || [],
        localidad: demanda.localidad?.nombre || "N/A",
        cpc: demanda.cpc.nombre || "N/A",
        zonaEquipo: demanda.demanda_zona?.zona?.nombre || demanda.registrado_por_user_zona?.nombre || "N/A",
        usuario: demanda.registrado_por_user?.username || "N/A",
        areaSenaf: demanda.area_senaf || "N/A",
        estado_demanda: demanda.estado_demanda,
        recibido: demanda.demanda_zona?.recibido || false,
        demanda_zona_id: demanda.demanda_zona_id,
        envioRespuesta: demanda.envio_de_respuesta || "N/A",
        objetivoDemanda: demanda.objetivo_de_demanda || "N/A",
        etiqueta: demanda.etiqueta?.nombre || "N/A",
        adjuntos: demanda.adjuntos || [],
        calificacion_choices: demanda.calificacion_choices || [],
      }
    }) || []

  // Add this function to handle Excel export
  const handleExportXlsx = () => {
    // Create a worksheet from the filtered rows
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map((row) => {
        // Create a clean object for export, formatting data as needed
        return {
          ID: row.id,
          Score: row.score,
          Nombre: row.nombre,
          DNI: row.dni,
          Calificación: formatUnderscoreText(row.calificacion),
          "Última Actualización": row.ultimaActualizacion,
          Localidad: row.localidad,
          "Zona/Equipo": row.zonaEquipo,
          Estado: formatUnderscoreText(row.estado_demanda),
          "Envío Respuesta": formatUnderscoreText(row.envioRespuesta),
          "Objetivo de Demanda": formatUnderscoreText(row.objetivoDemanda),
          Etiqueta: row.etiqueta,
          "Cantidad de Adjuntos": Array.isArray(row.adjuntos) ? row.adjuntos.length : 0,
        }
      }),
    )

    // Set column widths
    const columnWidths = [
      { wch: 10 }, // ID
      { wch: 10 }, // Score
      { wch: 30 }, // Nombre
      { wch: 15 }, // DNI
      { wch: 20 }, // Calificación
      { wch: 20 }, // Última Actualización
      { wch: 20 }, // Localidad
      { wch: 20 }, // Zona/Equipo
      { wch: 20 }, // Estado
      { wch: 20 }, // Envío Respuesta
      { wch: 25 }, // Objetivo de Demanda
      { wch: 20 }, // Etiqueta
      { wch: 20 }, // Cantidad de Adjuntos
    ]
    worksheet["!cols"] = columnWidths

    // Create a workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Demandas")

    // Generate Excel file and trigger download
    const currentDate = new Date().toISOString().split("T")[0]
    XLSX.writeFile(workbook, `Demandas_${currentDate}.xlsx`)

    // Show success message
    toast.success("Archivo Excel generado correctamente", {
      position: "top-center",
      autoClose: 3000,
    })
  }

  if (isError) return <Typography color="error">Error al cargar la data</Typography>

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
            Gestión de Demandas
          </Typography>
          <div className="flex gap-4 relative z-10">
            <Buttons
              isLoading={isLoading}
              handleNuevoRegistro={handleNuevoRegistro}
              filterState={filterState}
              setFilterState={setFilterState}
              user={user}
              onFilterChange={handleFilterChange}
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
            loading={isLoading || updateCalificacion.isLoading || updateDemandaZona.isLoading}
            onRowClick={(params, event) => {
              const cellElement = event.target as HTMLElement
              if (
                !cellElement.closest('.MuiDataGrid-cell[data-field="calificacion"]') &&
                !cellElement.closest("a") &&
                !cellElement.closest("button") &&
                !cellElement.closest("select")
              ) {
                if (!params.row.recibido && params.row.demanda_zona_id) {
                  // Try to mark as received, but will still show details even if it fails with 403
                  updateDemandaZona.mutate({
                    id: params.row.demanda_zona_id,
                    demandaId: params.row.id,
                    userId: user.id,
                  })
                } else {
                  handleOpenModal(params.row.id)
                }
              }
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
              // Add specific styles for each estado_demanda
              "& .row-sin-asignar::before": {
                backgroundColor: "#e0e0e0",
              },
              "& .row-constatacion::before": {
                backgroundColor: "#4caf50",
              },
              "& .row-evaluacion::before": {
                backgroundColor: "#2196f3",
              },
              "& .row-pendiente-autorizacion::before": {
                backgroundColor: "#ff9800",
              },
              "& .row-archivada::before": {
                backgroundColor: "#9e9e9e",
              },
              "& .row-admitida::before": {
                backgroundColor: "#673ab7",
              },
              "& .row-respuesta-sin-enviar::before": {
                backgroundColor: "#f44336",
              },
              "& .row-informe-sin-enviar::before": {
                backgroundColor: "#ecff0c",
              },
              "& .row-repuesta-enviada::before": {
                backgroundColor: "#8bc34a",
              },
              "& .row-informe-enviado::before": {
                backgroundColor: "#00bcd4",
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
              const estado = params.row.estado_demanda?.toLowerCase() || ""
              const recibido = params.row.recibido
              return `row-${estado.replace(/_/g, "-")}${recibido ? " row-received" : " row-not-received"}`
            }}
          />
        </div>
      </Paper>
      <Modal
        open={isModalOpen}
        aria-labelledby="demanda-detail-modal"
        aria-describedby="demanda-detail-description"
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
          {selectedDemandaId ? (
            <DemandaDetail params={{ id: selectedDemandaId.toString() }} onClose={handleCloseModal} />
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
        demandaId={selectedDemandaIdForAssignment}
      />
    </>
  )
}

const DemandaTable: React.FC = () => {
  const user = useUser((state) => state.user)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user has the permission
  const hasViewPermission = user?.all_permissions?.includes('view_tdemanda') ||
    user?.is_superuser ||
    user?.is_staff

  useEffect(() => {
    // Simulate a small delay to show the skeleton
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={40} width="30%" />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" height={36} width={120} />
            <Skeleton variant="rectangular" height={36} width={120} />
            <Skeleton variant="rectangular" height={36} width={120} />
          </Box>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Paper>
    )
  }

  if (!hasViewPermission) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          No tiene permisos para ver las demandas
        </Typography>
      </Box>
    )
  }

  return <DemandaTableContent />
}

export default DemandaTable
