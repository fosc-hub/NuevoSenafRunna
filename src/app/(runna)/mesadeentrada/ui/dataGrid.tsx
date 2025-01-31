"use client"

import type React from "react"
import { useState } from "react"
import { Paper, Button } from "@mui/material"
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid"
import { get } from "@/app/api/apiService"
import type { TDemanda } from "@/app/interfaces"
import { useQuery } from "@tanstack/react-query"
import { PersonAdd, Edit } from "@mui/icons-material"

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

  const fetchDemandas = async (pageNumber: number, pageSize: number) => {
    try {
      // Expect the paginated shape
      const response = await get<TDemandaPaginated>(
        `mesa-de-entrada/?page=${pageNumber + 1}&page_size=${pageSize}`
      )
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

  const formatPrecalificacionValue = (value: string | undefined) => {
    if (!value) return ""
    const mapping: Record<string, string> = {
      URGENTE: "Urgente",
      NO_URGENTE: "No Urgente",
      COMPLETAR: "Completar",
    }
    return mapping[value] || value
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
          style={{ width: "100%", padding: "8px" }}
        >
          <option value="Urgente">Urgente</option>
          <option value="No Urgente">No Urgente</option>
          <option value="Completar">Completar</option>
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

  // Safely map over demandasData.results if it exists
  const rows = demandasData?.results.map((demanda: TDemanda) => ({
    id: demanda.id,
    score: demanda.demanda_score?.score || "N/A",
    origen: demanda.origen_demanda?.nombre || "N/A",
    nombre: demanda.nnya_principal
      ? `${demanda.nnya_principal.nombre} ${demanda.nnya_principal.apellido}`
      : "N/A",
    dni: demanda.nnya_principal?.dni || "N/A",
    precalificacion: demanda.precalificacion?.estado_precalificacion,
    ultimaActualizacion: new Date(demanda.ultima_actualizacion).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  })) ?? []

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
          loading={isLoading}
        />
      </div>
    </Paper>
  )
}

export default DemandaTable
