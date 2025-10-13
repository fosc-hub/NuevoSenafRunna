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
          <Typography variant="body2" sx={{ fontWeight: "normal" }}>
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
            <Typography variant="body2" sx={{ fontWeight: "normal" }}>
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
        field: "medidas_activas_count",
        headerName: "Medidas",
        width: 100,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value || 0}
            size="small"
            color={params.value > 0 ? "primary" : "default"}
            sx={{ minWidth: 40 }}
          />
        ),
      },
      {
        field: "actividades_activas_count",
        headerName: "Actividades",
        width: 110,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value || 0}
            size="small"
            color={params.value > 0 ? "secondary" : "default"}
            sx={{ minWidth: 40 }}
          />
        ),
      },
      {
        field: "oficios_count",
        headerName: "Oficios",
        width: 100,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value || 0}
            size="small"
            color={params.value > 0 ? "info" : "default"}
            sx={{ minWidth: 40 }}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Acciones",
        width: 120,
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
          </Box>
        ),
      },
    ]

    // Add more columns for larger screens
    if (!isMobile) {
      baseColumns.push(
        {
          field: "zona",
          headerName: "Zona",
          width: 130,
          renderCell: (params) => <Typography variant="body2">{params.value || "N/A"}</Typography>,
        },
        {
          field: "equipo_trabajo",
          headerName: "Equipo",
          width: 150,
          renderCell: (params) => <Typography variant="body2">{params.value || "N/A"}</Typography>,
        },
        {
          field: "profesional_asignado",
          headerName: "Profesional",
          width: 150,
          renderCell: (params) => <Typography variant="body2">{params.value || "Sin asignar"}</Typography>,
        },
        {
          field: "jefe_zonal",
          headerName: "Jefe Zonal",
          width: 150,
          renderCell: (params) => <Typography variant="body2">{params.value || "N/A"}</Typography>,
        },
        {
          field: "fecha_apertura",
          headerName: "Fecha Apertura",
          width: 130,
          renderCell: (params) => {
            try {
              const date = new Date(params.value)
              return (
                <Typography variant="body2">
                  {date.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </Typography>
              )
            } catch {
              return <Typography variant="body2">{params.value}</Typography>
            }
          },
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

      // Safely extract counts from arrays
      const medidasCount = Array.isArray(legajo.medidas_activas) ? legajo.medidas_activas.length : 0
      const actividadesCount = Array.isArray(legajo.actividades_activas) ? legajo.actividades_activas.length : 0
      const oficiosCount = Array.isArray(legajo.oficios) ? legajo.oficios.length : 0

      // Safely extract string values from fields that might be strings or objects
      const zonaValue = typeof legajo.zona === "string"
        ? legajo.zona
        : legajo.zona && typeof legajo.zona === "object" && (legajo.zona as any).nombre
        ? (legajo.zona as any).nombre
        : null

      const equipoTrabajoValue = typeof legajo.equipo_trabajo === "string"
        ? legajo.equipo_trabajo
        : legajo.equipo_trabajo && typeof legajo.equipo_trabajo === "object" && (legajo.equipo_trabajo as any).nombre
        ? (legajo.equipo_trabajo as any).nombre
        : null

      const userResponsableValue = typeof legajo.user_responsable === "string"
        ? legajo.user_responsable
        : legajo.user_responsable && typeof legajo.user_responsable === "object" && (legajo.user_responsable as any).nombre_completo
        ? (legajo.user_responsable as any).nombre_completo
        : null

      const jefeZonalValue = typeof legajo.jefe_zonal === "string"
        ? legajo.jefe_zonal
        : legajo.jefe_zonal && typeof legajo.jefe_zonal === "object" && (legajo.jefe_zonal as any).nombre_completo
        ? (legajo.jefe_zonal as any).nombre_completo
        : null

      return {
        id: legajo.id,
        numero_legajo: legajo.numero || `L-${legajo.id}`,
        nombre: legajo.nnya ? legajo.nnya.nombre_completo : "N/A",
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
      }
    }) || []

  // Add this function to handle Excel export
  const handleExportXlsx = () => {
    // Export to Excel with current table data
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
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              },
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
