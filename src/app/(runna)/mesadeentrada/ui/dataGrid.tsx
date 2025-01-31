"use client"

import type React from "react"
import { useState } from "react"
import { Paper, Button } from "@mui/material"
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid"
import { get, update, create } from "@/app/api/apiService"
import type { TDemanda } from "@/app/interfaces"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PersonAdd, Edit } from "@mui/icons-material"
import { toast } from "react-toastify"

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
        // If precalificacion exists, update it
        return update<TDemanda>(
          "precalificacion-demanda",
          demanda.precalificacion.id, // Use the precalificacion ID, not the demanda ID
          {
            estado_precalificacion: newValue,
            ultima_actualizacion: new Date().toISOString(),
          },
          true,
          "¡Precalificación actualizada con éxito!",
        )
      } else {
        // If precalificacion doesn't exist, create a new one
        const currentDate = new Date().toISOString()
        console.log("Creating new precalificacion:", {
          fecha_y_hora: currentDate,
          descripcion: `Nueva precalificación: ${newValue}`,
          estado_precalificacion: newValue,
          demanda: demandaId,
        })
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
      // Force a refetch of the specific demanda
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
          onChange={(e) => handlePrecalificacionChange(params.row.id, e.target.value)}
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
      width: 120,
      renderCell: () => (
        <Button variant="outlined" color="primary" startIcon={<PersonAdd />}>
          ASIGNAR
        </Button>
      ),
    },
    {
      field: "evaluar",
      headerName: "Evaluar",
      width: 120,
      renderCell: () => (
        <Button variant="contained" color="primary" startIcon={<Edit />}>
          Evaluar
        </Button>
      ),
    },
  ]

  const rows =
    demandasData?.results.map((demanda: TDemanda) => {
      console.log("Precalificacion value:", demanda.precalificacion?.estado_precalificacion)
      return {
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
      }
    }) ?? []

  if (isError) return <div>Error al cargar la data</div>

  return (
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
        />
      </div>
    </Paper>
  )
}

export default DemandaTable

