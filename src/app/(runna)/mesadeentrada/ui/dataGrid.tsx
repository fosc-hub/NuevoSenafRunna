"use client"

import type React from "react"
import { useState } from "react"
import { Paper, Button, Modal, Box, Typography, CircularProgress } from "@mui/material"
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PersonAdd, Edit, Warning } from "@mui/icons-material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import Buttons from "./Buttons"
import AsignarModal from "./asignarModal"

// Assume these imports are available in your project
import { get, update, create } from "@/app/api/apiService"
import type { TDemanda } from "@/app/interfaces"

// Dynamically import DemandaDetail with no SSR to avoid hydration issues
const DemandaDetail = dynamic(() => import("../../demanda/page"), { ssr: false })

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

type TDemandaPaginated = PaginatedResponse<TDemanda>

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
    tipo_demanda: null,
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
      if (apiFilters.tipo_demanda) {
        params.append("tipo_demanda", apiFilters.tipo_demanda)
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
      setDemandasData((prevData) => ({
        ...prevData,
        results: prevData.results.map((demanda) =>
          demanda.demanda_zona_id === data.id
            ? {
                ...demanda,
                demanda_zona: {
                  ...demanda.demanda_zona,
                  recibido: true,
                  fecha_recibido: data.fecha_recibido,
                  recibido_por: data.recibido_por,
                },
              }
            : demanda,
        ),
      }))
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
      default:
        return "transparent"
    }
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
    { field: "origen", headerName: "Origen", width: 150 },
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
          style={{ width: "100%", padding: "8px" }}
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
      width: 135,
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
        >
          Evaluar
        </Button>
      ),
    },
    { field: "tipoDeNro", headerName: "Tipo de Nro", width: 150 },
    { field: "nroEspecifico", headerName: "Nro Específico", width: 150 },
    { field: "localidad", headerName: "Localidad", width: 150 },
    { field: "cpc", headerName: "CPC", width: 100 },
    { field: "zonaEquipo", headerName: "Zona/Equipo", width: 150 },
    { field: "usuario", headerName: "Usuario", width: 150 },
    { field: "areaSenaf", headerName: "Área Senaf", width: 150 },
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
  ]

  const rows =
    demandasData?.results.map((demanda: TDemanda) => ({
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
      tipoDeNro: demanda.tipo_de_nro || "N/A",
      nroEspecifico: demanda.codigos_demanda.codigo || "N/A",
      localidad: demanda.localidad?.nombre || "N/A",
      cpc: demanda.cpc.nombre || "N/A",
      zonaEquipo: demanda.zona_asignada?.nombre || "N/A",
      usuario: demanda.registrado_por_user?.username || "N/A",
      areaSenaf: demanda.area_senaf || "N/A",
      estado_demanda: demanda.estado_demanda,
      recibido: demanda.demanda_zona?.recibido || false,
      demanda_zona_id: demanda.demanda_zona_id,
      envioRespuesta: demanda.envio_de_respuesta || "N/A",
    })) || []

  if (isError) return <Typography color="error">Error al cargar la data</Typography>

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <Buttons
          isLoading={isLoading}
          handleNuevoRegistro={handleNuevoRegistro}
          filterState={filterState}
          setFilterState={setFilterState}
          user={user}
          onFilterChange={handleFilterChange}
        />
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
              if (!cellElement.closest('.MuiDataGrid-cell[data-field="calificacion"]')) {
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
                  width: "4px",
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
              // Add style for non-received rows
              "& .row-not-received": {
                color: "#000000",
                fontWeight: "bold",
              },
            }}
            getRowClassName={(params) => {
              const estado = params.row.estado_demanda?.toLowerCase() || ""
              const recibido = params.row.recibido
              return `row-${estado.replace("_", "-")}${recibido ? "" : " row-not-received"}`
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

