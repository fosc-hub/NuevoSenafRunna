"use client"

import { useState } from "react"
import { Paper, Button, Modal, Box, Typography, CircularProgress } from "@mui/material"
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid"
import { get, update, create } from "@/app/api/apiService"
import type { TDemanda } from "@/app/interfaces"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PersonAdd, Edit } from "@mui/icons-material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"

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

  const fetchDemandas = async (pageNumber: number, pageSize: number) => {
    try {
      const response = await get<TDemandaPaginated>(`mesa-de-entrada/?page=${pageNumber + 1}&page_size=${pageSize}`)
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
    queryKey: ["demandas", paginationModel.page, paginationModel.pageSize],
    queryFn: () => fetchDemandas(paginationModel.page, paginationModel.pageSize),
  })

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
          "¡Precalificación actualizada con éxito!",
        )
      } else {
        const currentDate = new Date().toISOString()
        return create<TDemanda>(
          `precalificacion-demanda`,
          {
            fecha_y_hora: currentDate,
            descripcion: `Nueva precalificación: ${newValue}`,
            estado_precalificacion: newValue,
            demanda: demandaId,
          },
          true,
          "¡Precalificación creada con éxito!",
        )
      }
    },
    onSuccess: (data, variables) => {
      console.log("Server response:", data)
      queryClient.invalidateQueries({ queryKey: ["demandas"] })
      queryClient.refetchQueries({ queryKey: ["demandas", paginationModel.page, paginationModel.pageSize] })
    },
    onError: (error) => {
      console.error("Error al actualizar la precalificación:", error)
      toast.error("Error al actualizar la precalificación", {
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

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "score", headerName: "Score", width: 100 },
    { field: "origen", headerName: "Origen", width: 150 },
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "dni", headerName: "DNI", width: 100 },
    {
      field: "precalificacion",
      headerName: "Precalificación",
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
      field: "evaluar",
      headerName: "Evaluar",
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          startIcon={<Edit />}
          onClick={(e) => {
            e.stopPropagation()
            handleOpenModal(params.row.id)
          }}
        >
          Evaluar
        </Button>
      ),
    },
    {
      field: "asignar",
      headerName: "Asignar",
      width: 120,
      renderCell: () => (
        <Button variant="outlined" color="primary" startIcon={<PersonAdd />}>
          ASIGNAR
        </Button>
      ),
    },
  ]

  const rows =
    demandasData?.results.map((demanda: TDemanda) => ({
      id: demanda.id,
      score: demanda.demanda_score?.score || "N/A",
      origen: demanda.origen_demanda?.nombre || "N/A",
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
    })) || []

  if (isError) return <Typography color="error">Error al cargar la data</Typography>

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
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
        onClose={handleCloseModal}
        aria-labelledby="demanda-detail-modal"
        aria-describedby="demanda-detail-description"
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
          {selectedDemandaId ? <DemandaDetail params={{ id: selectedDemandaId.toString() }} /> : <CircularProgress />}
        </Box>
      </Modal>
    </>
  )
}

export default DemandaTable

