"use client"

import type React from "react"

import { useState } from "react"
import { Paper, Button, Modal, Box, Typography, CircularProgress } from "@mui/material"
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid"
import { get, update, create } from "@/app/api/apiService"
import type { TDemanda } from "@/app/interfaces"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PersonAdd, Edit, Warning } from "@mui/icons-material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import Buttons from "./Buttons"
import AsignarModal from "./asignarModal"

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
  const [user, setUser] = useState({ is_superuser: false, all_permissions: [] })
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false)
  const [selectedDemandaIdForAssignment, setSelectedDemandaIdForAssignment] = useState<number | null>(null)

  const fetchDemandas = async (pageNumber: number, pageSize: number) => {
    try {
      const filterParams = Object.entries(filterState)
        .filter(([_, value]) => value)
        .map(([key]) => `${key}=true`)
        .join("&")
      const response = await get<TDemandaPaginated>(
        `mesa-de-entrada/?page=${pageNumber + 1}&page_size=${pageSize}&${filterParams}`,
      )
      console.log("Fetched demandas:", response)
      setTotalCount(response.count)
      return response
    } catch (error) {
      console.error("Error al obtener las demandas:", error)
      throw error
    }
  }

  const {
    data: demandasData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["demandas", paginationModel.page, paginationModel.pageSize, filterState],
    queryFn: () => fetchDemandas(paginationModel.page, paginationModel.pageSize),
  })

  const handleNuevoRegistro = () => {
    // Implement the logic for new registration
    console.log("Nuevo registro clicked")
  }

  const handleFilterClick = () => {
    // This function is no longer needed as filtering is handled in the Buttons component
    console.log("Filter clicked")
  }

  const updatePrecalificacion = useMutation({
    mutationFn: async ({ demandaId, newValue }: { demandaId: number; newValue: string }) => {
      const demanda = demandasData?.results.find((d) => d.id === demandaId)
      if (!demanda) throw new Error("Demanda not found")

      if (demanda.precalificacion) {
        return update<TDemanda>(
          "precalificacion-demanda",
          demanda.precalificacion.id,
          {
            estado_precalificacion: newValue,
            ultima_actualizacion: new Date().toISOString(),
          },
          true,
          "¡Calificación actualizada con éxito!",
        )
      } else {
        const currentDate = new Date().toISOString()
        return create<TDemanda>(
          `precalificacion-demanda`,
          {
            fecha_y_hora: currentDate,
            descripcion: `Nueva Calificación: ${newValue}`,
            estado_precalificacion: newValue,
            demanda: demandaId,
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

  const handlePrecalificacionChange = (demandaId: number, newValue: string) => {
    console.log(`Updating precalificacion for demanda ${demandaId} to ${newValue}`)
    updatePrecalificacion.mutate({ demandaId, newValue })
  }

  const formatPrecalificacionValue = (value: string | undefined | null) => {
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

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {params.value}
          {params.row.precalificacion === "URGENTE" && <Warning color="error" style={{ marginLeft: "8px" }} />}
        </div>
      ),
    },
    { field: "score", headerName: "Score", width: 100 },
    { field: "origen", headerName: "Origen", width: 150 },
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "dni", headerName: "DNI", width: 100 },
    {
      field: "precalificacion",
      headerName: "Calificación",
      width: 200,
      renderCell: (params) => (
        <select
          value={formatPrecalificacionValue(params.value)}
          onChange={(e) => {
            e.stopPropagation()
            handlePrecalificacionChange(params.row.id, e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: "100%", padding: "8px" }}
        >
          {params.value === null && <option value="">Seleccionar</option>}
          <option value="URGENTE">Urgente</option>
          <option value="NO_URGENTE">No Urgente</option>
          <option value="COMPLETAR">Completar</option>
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
        <Button variant="contained" color="primary" startIcon={<Edit />}>
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
  ]

  const rows =
    demandasData?.results.map((demanda: TDemanda) => ({
      id: demanda.id,
      score: demanda.demanda_score?.score || "N/A",
      origen: demanda.bloque_datos_remitente?.nombre || "N/A",
      nombre: demanda.nnya_principal ? `${demanda.nnya_principal.nombre} ${demanda.nnya_principal.apellido}` : "N/A",
      dni: demanda.nnya_principal?.dni || "N/A",
      precalificacion: demanda.precalificacion?.estado_precalificacion || null,
      ultimaActualizacion: new Date(demanda.ultima_actualizacion).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      tipoDeNro: demanda.tipo_de_nro || "N/A",
      nroEspecifico: demanda.codigos_demanda.codigo || "N/A",
      localidad: demanda.localidad.nombre || "N/A",
      cpc: demanda.cpc.nombre || "N/A",
      zonaEquipo: demanda.zona_asignada.nombre || "N/A",
      usuario: demanda.registrado_por_user?.username || "N/A",
      areaSenaf: demanda.area_senaf || "N/A",
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
            loading={isLoading || updatePrecalificacion.isLoading}
            onRowClick={(params, event) => {
              const cellElement = event.target as HTMLElement
              if (!cellElement.closest('.MuiDataGrid-cell[data-field="precalificacion"]')) {
                handleOpenModal(params.row.id)
              }
            }}
            sx={{ cursor: "pointer" }}
          />
        </div>
      </Paper>
      <Modal
        open={isModalOpen}
        aria-labelledby="demanda-detail-modal"
        aria-describedby="demanda-detail-description"
        onClose={(_event, reason) => {
          // Only close if the reason is NOT a backdrop click
          // (and if you like, also ensure it isn't escapeKeyDown)
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

