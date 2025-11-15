"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material"
import SecurityIcon from "@mui/icons-material/Security"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AddIcon from "@mui/icons-material/Add"
import { useRouter } from "next/navigation"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { getMedidasByLegajo } from "@/app/(runna)/legajo-mesa/api/medidas-api-service"
import type { MedidaBasicResponse } from "@/app/(runna)/legajo-mesa/types/medida-api"

interface MedidasActivasSectionProps {
  legajoData: LegajoDetailResponse
  onAddMedida?: () => void
  showAddButton?: boolean
  refreshTrigger?: number // Prop para forzar recarga
}

export const MedidasActivasSection: React.FC<MedidasActivasSectionProps> = ({
  legajoData,
  onAddMedida,
  showAddButton = false,
  refreshTrigger = 0,
}) => {
  const router = useRouter()
  const [medidas, setMedidas] = useState<MedidaBasicResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log("MedidasActivasSection render - State:", {
    medidasCount: medidas.length,
    isLoading,
    error,
    legajoId: legajoData.legajo.id
  })

  // Cargar medidas al montar el componente y cuando refreshTrigger cambie
  useEffect(() => {
    const loadMedidas = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log(`Fetching medidas for legajo ${legajoData.legajo.id}`)

        // Obtener solo medidas vigentes - API returns array directly
        const response = await getMedidasByLegajo(legajoData.legajo.id, {
          estado_vigencia: "VIGENTE",
        })

        console.log("Medidas fetched (direct array):", response)
        console.log("Number of medidas:", response?.length || 0)

        setMedidas(response || [])
        console.log("State updated, medidas set to:", response || [])
      } catch (err: any) {
        console.error("Error loading medidas:", err)
        setError(err?.message || "Error al cargar las medidas")
        setMedidas([]) // Ensure medidas is always an array
      } finally {
        setIsLoading(false)
        console.log("Loading finished, isLoading set to false")
      }
    }

    if (legajoData.legajo.id) {
      loadMedidas()
    }
  }, [legajoData.legajo.id, refreshTrigger])

  const formatFecha = (fecha: string) => {
    try {
      const date = new Date(fecha)
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return fecha
    }
  }

  // Helper to safely extract string values from potential objects
  const extractString = (value: any, fallback: string = ""): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && 'display' in value) return String(value.display)
    if (value && typeof value === 'object' && 'nombre' in value) return String(value.nombre)
    return fallback
  }

  const getTipoColor = (tipo: string): "primary" | "success" | "warning" => {
    switch (tipo) {
      case "MPI":
        return "primary"
      case "MPE":
        return "success"
      case "MPJ":
        return "warning"
      default:
        return "primary"
    }
  }

  const handleNavigateToMedida = (medidaId: number, tipo: string) => {
    // Navigate to medida detail page using numeric ID (always use ID, not type)
    router.push(`/legajo/${legajoData.legajo.id}/medida/${medidaId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          mb: 4,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Registro de medidas tomadas
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Cargando medidas...
          </Typography>
        </Box>
      </Paper>
    )
  }

  // Error state
  if (error) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          mb: 4,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Registro de medidas tomadas
            </Typography>
          </Box>
          {showAddButton && onAddMedida && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddMedida}
              size="small"
            >
              Tomar Medida
            </Button>
          )}
        </Box>
        <Alert severity="error">
          Error al cargar las medidas: {error}
        </Alert>
      </Paper>
    )
  }

  // Empty state
  if (!medidas || medidas.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          mb: 4,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Registro de medidas tomadas
            </Typography>
          </Box>
          {showAddButton && onAddMedida && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddMedida}
              size="small"
            >
              Tomar Medida
            </Button>
          )}
        </Box>
        <Typography variant="body1" color="text.secondary">
          No hay Registro de medidas tomadas registradas.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Registro de medidas tomadas
          </Typography>
          <Chip
            label={`${medidas.length} activa${medidas.length !== 1 ? "s" : ""}`}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
        {showAddButton && onAddMedida && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddMedida}
            size="small"
          >
            Tomar Medida
          </Button>
        )}
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Número</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fecha Apertura</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Urgencia</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Duración</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medidas.map((medida) => {
              // Safely extract values
              const tipoMedida = extractString(medida.tipo_medida, "N/A")
              const numeroMedida = extractString(medida.numero_medida, "N/A")

              return (
                <TableRow key={medida.id} hover>
                  <TableCell>
                    <Chip
                      label={tipoMedida}
                      color={getTipoColor(tipoMedida)}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {numeroMedida}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {medida.fecha_apertura ? formatFecha(medida.fecha_apertura) : "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={medida.estado_vigencia || "N/A"}
                      color={medida.estado_vigencia === "VIGENTE" ? "success" : "default"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {medida.urgencia ? (
                      <Chip
                        label={medida.urgencia.nombre}
                        color={
                          medida.urgencia.nombre === "ALTA"
                            ? "error"
                            : medida.urgencia.nombre === "MEDIA"
                              ? "warning"
                              : "info"
                        }
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {medida.duracion_dias} {medida.duracion_dias === 1 ? "día" : "días"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle de medida">
                      <IconButton
                        size="small"
                        color="primary"
                        sx={{
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.15)",
                          },
                        }}
                        onClick={() => handleNavigateToMedida(medida.id, tipoMedida)}
                      >
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
