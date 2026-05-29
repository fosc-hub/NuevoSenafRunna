"use client"

import type React from "react"
import {
  Typography,
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
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AddIcon from "@mui/icons-material/Add"
import GroupsIcon from "@mui/icons-material/Groups"
import { useRouter } from "next/navigation"
import { useApiQuery, extractArray } from "@/hooks/useApiQuery"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { getMedidasByLegajo } from "@/app/(runna)/legajo-mesa/api/medidas-api-service"
import type { MedidaBasicResponse } from "@/app/(runna)/legajo-mesa/types/medida-api"
import { SectionCard } from "../medida/shared/section-card"

interface MedidasActivasSectionProps {
  legajoData: LegajoDetailResponse
  prefetchedMedidas?: MedidaBasicResponse[] | any // Optional prefetched data from parent
  onAddMedida?: () => void
  showAddButton?: boolean
  refreshTrigger?: number // Prop para forzar recarga
}

export const MedidasActivasSection: React.FC<MedidasActivasSectionProps> = ({
  legajoData,
  prefetchedMedidas,
  onAddMedida,
  showAddButton = false,
  refreshTrigger = 0,
}) => {
  const router = useRouter()
  const legajoActualId = legajoData.legajo.id

  // Fetch medidas using TanStack Query (only if not prefetched)
  // Use prefetched data to avoid duplicate requests and queuing
  const { data: medidasData, isLoading, error: queryError } = useApiQuery<MedidaBasicResponse[]>(
    `legajo/${legajoActualId}/medidas`,
    { _refresh: refreshTrigger },
    {
      queryFn: () => getMedidasByLegajo(legajoActualId, {}),
      enabled: !!legajoActualId && !prefetchedMedidas, // Only fetch if not prefetched
      initialData: prefetchedMedidas, // Use prefetched data as initial
    }
  )

  // Fuente de datos: el detalle del legajo (GET /api/legajos/{id}/) ya incluye
  // las medidas COMPARTIDAS donde este legajo participa como VINCULADO (Mejora 1,
  // ver claudedocs/MEDIDA_COMPARTIDA_VISTA_LEGAJO_FRONTEND.md). El endpoint
  // /legajos/{id}/medidas/ (getMedidasByLegajo) NO las incluye —solo las
  // primarias—, por eso se prefiere historial_medidas del detalle y la llamada
  // separada queda como fallback. `historial_medidas` cubre todos los estados
  // (VIGENTE/CERRADA/...), igual que el listado /medidas/ sin filtro.
  const medidasFromDetail = (legajoData.historial_medidas ??
    legajoData.medidas_activas ??
    []) as unknown as MedidaBasicResponse[]
  const medidas =
    medidasFromDetail.length > 0 ? medidasFromDetail : extractArray(medidasData)

  const error = queryError ? String(queryError) : null

  console.log("MedidasActivasSection render - State:", {
    medidasCount: medidas.length,
    isLoading,
    error,
    legajoId: legajoData.legajo.id
  })

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

  // Loading state — solo si no tenemos datos del detalle y el fetch sigue cargando
  if (isLoading && medidasFromDetail.length === 0) {
    return (
      <SectionCard
        title="Registro de medidas tomadas"
        headerActions={
          showAddButton && onAddMedida ? (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddMedida} size="small">
              Tomar Medida
            </Button>
          ) : undefined
        }
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Cargando medidas...
          </Typography>
        </Box>
      </SectionCard>
    )
  }

  // Error state
  if (error) {
    return (
      <SectionCard
        title="Registro de medidas tomadas"
        headerActions={
          showAddButton && onAddMedida ? (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddMedida} size="small">
              Tomar Medida
            </Button>
          ) : undefined
        }
      >
        <Alert severity="error">
          Error al cargar las medidas: {error}
        </Alert>
      </SectionCard>
    )
  }

  // Empty state
  if (!medidas || medidas.length === 0) {
    return (
      <SectionCard
        title="Registro de medidas tomadas"
        headerActions={
          showAddButton && onAddMedida ? (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddMedida} size="small">
              Tomar Medida
            </Button>
          ) : undefined
        }
      >
        <Typography variant="body1" color="text.secondary">
          No hay Registro de medidas tomadas registradas.
        </Typography>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="⚖️ Registro de medidas tomadas"
      highlight={true}
      chips={[{
        label: `${medidas.length} medida${medidas.length !== 1 ? "s" : ""}`,
        color: "primary"
      }]}
      headerActions={
        showAddButton && onAddMedida ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddMedida} size="small" disableElevation>
            Tomar Medida
          </Button>
        ) : undefined
      }
    >
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

              // Medida compartida (SAC compartido): tiene legajos vinculados.
              // Si `legajo_id` apunta a otro legajo, este legajo es VINCULADO;
              // si coincide con el legajo actual, es el PRIMARIO.
              const adicionales = medida.legajos_adicionales ?? []
              const esCompartida = adicionales.length > 0
              const esEstePrimario =
                medida.legajo_id === undefined || medida.legajo_id === legajoActualId
              const totalNnyas = adicionales.length + 1
              const tooltipCompartida = esEstePrimario
                ? `Medida compartida · ${totalNnyas} NNyAs · este legajo es el primario`
                : `Medida compartida · ${totalNnyas} NNyAs · este legajo participa como vinculado (primario: legajo #${medida.legajo_id})`

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
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {numeroMedida}
                      </Typography>
                      {esCompartida && (
                        <Tooltip title={tooltipCompartida}>
                          <Chip
                            icon={<GroupsIcon />}
                            label={esEstePrimario ? "Compartida" : "Compartida · vinculado"}
                            size="small"
                            color="info"
                            variant="outlined"
                            sx={{ width: "fit-content", height: 22 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
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
    </SectionCard>
  )
}
