"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Paper, Button, Modal, Box, Typography, CircularProgress, Link, Popover } from "@mui/material"
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PersonAdd, Edit, Warning, AttachFile } from "@mui/icons-material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import Buttons from "./Buttons"
import AsignarModal from "./asignarModal"

// Assume these imports are available in your project
import { get, update, create } from "@/app/api/apiService"
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

// Custom component for rendering adjuntos
const AdjuntosCell = (props: { adjuntos: Adjunto[] }) => {
  const { adjuntos } = props
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  if (!adjuntos || !Array.isArray(adjuntos) || adjuntos.length === 0) {
    return <Typography>Sin adjuntos</Typography>
  }

  // Debug log
  console.log("Rendering adjuntos:", JSON.stringify(adjuntos))

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
      <div
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          padding: "4px",
          borderRadius: "4px",
          backgroundColor: "#f5f5f5",
          width: "fit-content",
        }}
      >
        <AttachFile style={{ fontSize: "1rem", marginRight: "4px", flexShrink: 0 }} />
        <Typography variant="body2">
          {adjuntos.length} {adjuntos.length === 1 ? "adjunto" : "adjuntos"}
        </Typography>
      </div>

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
                console.log("Invalid adjunto at index", index, adjunto)
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
                    padding: "4px 8px",
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

const DemandaTable: React.FC = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
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
  const [user, setUser] = useState({ id: 1, is_superuser: false, all_permissions: [] })
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false)
  const [selectedDemandaIdForAssignment, setSelectedDemandaIdForAssignment] = useState<number | null>(null)
  const [demandasData, setDemandasData] = useState<TDemandaPaginated | null>(null)

  const [apiFilters, setApiFilters] = useState({
    envio_de_respuesta: null,
    estado_demanda: null,
    objetivo_de_demanda: null,
  })

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

  const { data, isLoading, isError } = useQuery({
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
    mutationFn: async ({ id, userId }: { id: number; userId: number }) => {
      const currentDate = new Date().toISOString()
      const updateData = {
        fecha_recibido: currentDate,
        recibido: true,
        recibido_por: userId,
      }
      return update<TDemanda>("demanda-zona", id, updateData, true, "Demanda marcada como recibida")
    },
    onSuccess: (data) => {
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
      // Open DemandaDetalle modal after successful update
      handleOpenModal(data.demanda)
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

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {params.value}
          {params.row.calificacion === "URGENTE" && <Warning color="error" style={{ marginLeft: "8px" }} />}
        </div>
      ),
    },
    { field: "score", headerName: "Score", width: 100 },
    { field: "origen", headerName: "Bloque de Datos del Remitente", width: 150 },
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "dni", headerName: "DNI", width: 100 },
    {
      field: "calificacion",
      headerName: "Calificación",
      width: 200,
      renderCell: (params) => (
        <select
          value={formatCalificacionValue(params.value)}
          onChange={(e) => {
            e.stopPropagation()
            handleCalificacionChange(params.row.id, e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
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
          }}
        >
          {params.value === null && <option value="">Seleccionar</option>}
          <option value="URGENTE">Urgente</option>
          <option value="NO_URGENTE">No Urgente</option>
          <option value="COMPLETAR">Completar</option>
          <option value="NO_PERTINENTE_SIPPDD">No Pertinente (SIPPDD)</option>
          <option value="NO_PERTINENTE_OTRAS_PROVINCIAS">No Pertinente (Otras Provincias)</option>
          <option value="NO_PERTINENTE_OFICIOS_INCOMPLETOS">No Pertinente (Oficios Incompletos)</option>
          <option value="NO_PERTINENTE_LEY_9944">No Pertinente (Ley 9944)</option>
          <option value="PASA_A_LEGAJO">Pasa a Legajo</option>
        </select>
      ),
    },
    { field: "ultimaActualizacion", headerName: "Última Actualización", width: 200 },
    {
      field: "asignar",
      headerName: "Asignar",
      width: 145,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PersonAdd />}
          onClick={(e) => {
            e.stopPropagation()
            handleOpenAsignarModal(params.row.id)
          }}
        >
          ASIGNAR
        </Button>
      ),
    },
    {
      field: "evaluar",
      headerName: "Evaluar",
      width: 135,
      renderCell: (params) => (
        <Button
          variant="contained"
          color={params.row.estado_demanda === "EVALUACION" ? "primary" : "inherit"}
          startIcon={<Edit />}
          disabled={params.row.estado_demanda !== "EVALUACION"}
          onClick={(e) => {
            e.stopPropagation()
            if (params.row.estado_demanda === "EVALUACION") {
              // Navigate to the evaluation page without ID in the URL
              window.location.href = `/evaluacion?id=${params.row.id}`
            }
          }}
        >
          Evaluar
        </Button>
      ),
    },
    {
      field: "codigosDemanda",
      headerName: "Números Demanda",
      width: 200,
      renderCell: (params) => {
        if (!params.value || params.value.length === 0) return "N/A"
        return (
          <div>
            {params.value.map((codigo: any, index: number) => (
              <div key={index}>
                <Typography variant="body2">
                  Número: {codigo.codigo} - Tipo: {codigo.tipo_codigo_nombre}
                </Typography>
              </div>
            ))}
          </div>
        )
      },
    },
    { field: "localidad", headerName: "Localidad", width: 150 },
    { field: "cpc", headerName: "CPC", width: 100 },
    { field: "zonaEquipo", headerName: "Zona/Equipo", width: 150 },
    { field: "usuario", headerName: "Usuario", width: 150 },
    {
      field: "envioRespuesta",
      headerName: "Envío Respuesta",
      width: 150,
      renderCell: (params) => {
        const value = params.value as string
        let displayText = value
        let color = "inherit"

        switch (value) {
          case "NO_NECESARIO":
            displayText = "No Necesario"
            color = "text.secondary"
            break
          case "PENDIENTE":
            displayText = "Pendiente"
            color = "warning.main"
            break
          case "ENVIADO":
            displayText = "Enviado"
            color = "success.main"
            break
          default:
            displayText = "N/A"
            break
        }

        return <Typography color={color}>{displayText}</Typography>
      },
    },
    {
      field: "objetivoDemanda",
      headerName: "Objetivo de Demanda",
      width: 180,
      renderCell: (params) => {
        return <Typography>{formatUnderscoreText(params.value)}</Typography>
      },
    },
    {
      field: "etiqueta",
      headerName: "Etiqueta",
      width: 150,
      renderCell: (params) => {
        return <Typography>{formatUnderscoreText(params.value)}</Typography>
      },
    },
    {
      field: "adjuntos",
      headerName: "Adjuntos",
      width: 180,
      renderCell: (params) => {
        return <AdjuntosCell adjuntos={params.value} />
      },
    },
  ]

  const rows =
    demandasData?.results.map((demanda: TDemanda) => {
      // Debug log for adjuntos
      console.log(`Demanda ${demanda.id} adjuntos:`, demanda.adjuntos)
      if (demanda.adjuntos && Array.isArray(demanda.adjuntos)) {
        console.log(`Demanda ${demanda.id} has ${demanda.adjuntos.length} adjuntos`)
      }

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
      }
    }) || []

  // Debug effect to log rows data
  useEffect(() => {
    if (rows.length > 0) {
      console.log("First row adjuntos:", rows[0].adjuntos)
    }
  }, [rows])

  if (isError) return <Typography color="error">Error al cargar la data</Typography>

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
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
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25]}
            rowCount={totalCount}
            paginationMode="server"
            loading={isLoading || updateCalificacion.isLoading || updateDemandaZona.isLoading}
            onRowClick={(params, event) => {
              const cellElement = event.target as HTMLElement
              if (
                !cellElement.closest('.MuiDataGrid-cell[data-field="calificacion"]') &&
                !cellElement.closest("a") &&
                !cellElement.closest("button")
              ) {
                if (!params.row.recibido && params.row.demanda_zona_id) {
                  updateDemandaZona.mutate({ id: params.row.demanda_zona_id, userId: user.id })
                } else {
                  handleOpenModal(params.row.id)
                }
              }
            }}
            sx={{
              cursor: "pointer",
              "& .MuiDataGrid-row": {
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "5px", // Increased from 4px to 5px (25% increase)
                },
              },
              // Add specific styles for each estado_demanda
              "& .row-sin-asignar::before": {
                backgroundColor: "#e0e0e0",
                width: "7px", // Increased by approximately 30%
              },
              "& .row-constatacion::before": {
                backgroundColor: "#4caf50",
                width: "7px", // Increased by approximately 30%
              },
              "& .row-evaluacion::before": {
                backgroundColor: "#2196f3",
                width: "7px", // Increased by approximately 30%
              },
              "& .row-pendiente-autorizacion::before": {
                backgroundColor: "#ff9800",
                width: "7px", // Increased by approximately 30%
              },
              "& .row-archivada::before": {
                backgroundColor: "#9e9e9e",
                width: "7px", // Increased by approximately 30%
              },
              "& .row-admitida::before": {
                backgroundColor: "#673ab7",
                width: "7px", // Increased by approximately 30%
              },
              "& .row-respuesta-sin-enviar::before": {
                backgroundColor: "#f44336",
                width: "7px", // Increased by approximately 30%
              },
              "& .row-informe-sin-enviar::before": {
                backgroundColor: "#ecff0c",
                width: "7px", // Increased by approximately 30%
              },
              "& .row-repuesta-enviada::before": {
                backgroundColor: "#8bc34a",
                width: "7px", // Increased by approximately 30%
              },
              "& .row-informe-enviado::before": {
                backgroundColor: "#00bcd4",
                width: "7px", // Increased by approximately 30%
              },
              // Add style for non-received rows
              "& .row-not-received": {
                color: "#333333", // Lighter black color
                fontWeight: "bold",
              },
              // Add a new style for received rows
              "& .row-received": {
                color: "#666666", // Slightly darker gray
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
            width: "80%",
            maxWidth: 800,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {selectedDemandaId ? (
            <DemandaDetail params={{ id: selectedDemandaId.toString() }} onClose={handleCloseModal} />
          ) : (
            <CircularProgress />
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

export default DemandaTable
