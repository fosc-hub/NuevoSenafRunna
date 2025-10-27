"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  useTheme,
  alpha,
  Button,
  Chip,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import LinkIcon from "@mui/icons-material/Link"
import LinkOffIcon from "@mui/icons-material/LinkOff"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import FolderIcon from "@mui/icons-material/Folder"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { get, create, update } from "@/app/api/apiService"
import SearchModal from "@/components/searchModal/searchModal"
import { useUser } from "@/utils/auth/userZustand"
import { useVinculos } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/hooks/useVinculos"
import CrearVinculoLegajoDialog from "./dialogs/CrearVinculoLegajoDialog"
import DesvincularVinculoDialog from "./dialogs/DesvincularVinculoDialog"

// Type matching actual API response for demanda vinculos
interface VinculoLegajoDemanda {
  id: number
  legajo_origen: number
  legajo_origen_numero: string
  tipo_vinculo: {
    id: number
    codigo: string
    nombre: string
    descripcion: string
    activo: boolean
  }
  tipo_destino: string
  destino_info: {
    tipo: string
    id: number
    objetivo?: string
    fecha_ingreso?: string
  }
  justificacion: string
  activo: boolean
  creado_por: number
  creado_por_username: string
  creado_en: string
  desvinculado_por: number | null
  desvinculado_en: string | null
  justificacion_desvincular: string | null
}

interface Demanda {
  id: number
  descripcion: string
  estado_demanda: string
  fecha_ingreso_senaf: string
}

interface DemandaVinculada {
  id: number
  demanda_preexistente: number
  demanda_entrante: number
  deleted: boolean
}

interface ConexionesDemandaTabProps {
  demandaId: number
}

export function ConexionesDemandaTab({ demandaId }: ConexionesDemandaTabProps) {
  const queryClient = useQueryClient()
  const theme = useTheme()
  const user = useUser((state) => state.user)

  // Check if user has permission to view/access connections
  const hasVinculacionPermission = user?.all_permissions?.includes('view_tdemandavinculada') ||
    user?.all_permissions?.includes('add_tdemandavinculada') ||
    user?.all_permissions?.includes('change_tdemandavinculada') ||
    user?.is_superuser ||
    user?.is_staff

  // States for existing connections
  const [error, setError] = useState<string | null>(null)

  // States for legajo vinculos
  const [crearVinculoDialogOpen, setCrearVinculoDialogOpen] = useState(false)
  const [desvincularDialogOpen, setDesvincularDialogOpen] = useState(false)
  const [vinculoToDesvincular, setVinculoToDesvincular] = useState<VinculoLegajoDemanda | null>(null)
  const [expandedJustificaciones, setExpandedJustificaciones] = useState<Set<number>>(new Set())

  // Hook for legajo vinculos management
  const {
    vinculos: legajoVinculosRaw,
    loadVinculos,
    loading: vinculosLoading,
    error: vinculosError,
  } = useVinculos()

  // Cast vinculos to the demanda-specific type
  const legajoVinculos = legajoVinculosRaw as unknown as VinculoLegajoDemanda[]

  // Fetch all demandas
  const { data: allDemandas = [], isLoading: isLoadingDemandas } = useQuery({
    queryKey: ["allDemandas"],
    queryFn: () => get<Demanda[]>("demanda/"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch existing connections
  const { data: conexiones = [], isLoading: isLoadingConexiones } = useQuery({
    queryKey: ["demandaConexiones", demandaId],
    queryFn: async () => {
      try {
        // Fetch all connections for this demanda
        const data = await get<DemandaVinculada[]>("demanda-vinculada/", {
          demanda_preexistente: demandaId,
        })

        // Get the IDs of connected demandas
        const connectedIds = data.filter((conn: DemandaVinculada) => !conn.deleted).map((conn: DemandaVinculada) => conn.demanda_entrante)

        // Return the connected demandas
        return allDemandas.filter((demanda: Demanda) => connectedIds.includes(demanda.id))
      } catch (err) {
        console.error("Error fetching connections:", err)
        setError("Error al cargar las conexiones de la demanda")
        return []
      }
    },
    enabled: !isLoadingDemandas, // Only run this query after allDemandas is loaded
  })

  // Create connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: (newConnection: Partial<DemandaVinculada>) =>
      create<DemandaVinculada>("demanda-vinculada", newConnection, true, "Demandas conectadas exitosamente"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandaConexiones", demandaId] })
    },
    onError: (err) => {
      console.error("Error connecting demandas:", err)
      toast.error("Error al conectar las demandas")
    },
  })

  // Delete connection mutation
  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectedDemandaId: number) => {
      try {
        // Find the connection
        const connections = await get<DemandaVinculada[]>("demanda-vinculada/", {
          demanda_preexistente: demandaId,
          demanda_entrante: connectedDemandaId,
        })

        if (connections.length === 0) {
          throw new Error("No se encontró la conexión")
        }

        // Mark as deleted
        return await update<DemandaVinculada>(
          "demanda-vinculada",
          connections[0].id,
          { deleted: true },
          true,
          "Conexión eliminada exitosamente",
        )
      } catch (err) {
        console.error("Error deleting connection:", err)
        throw new Error("Error al eliminar la conexión")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandaConexiones", demandaId] })
    },
    onError: (err) => {
      console.error("Error deleting connection:", err)
      toast.error("Error al eliminar la conexión")
    },
  })

  // Load legajo vinculos on mount and when demandaId changes
  // Load vinculos by demanda_destino - backend returns all vinculos related to this demanda
  // This includes both tipo_destino="demanda" AND tipo_destino="medida" (for CARGA_OFICIOS workflow)
  useEffect(() => {
    if (demandaId) {
      console.log('ConexionesDemandaTab: Loading vinculos for demanda:', demandaId)
      loadVinculos({
        demanda_destino: demandaId,
        activo: true,
      })
    }
  }, [demandaId, loadVinculos])

  // Client-side filtering REQUIRED - backend demanda_destino filter is broken
  // Only show vinculos where tipo_destino="demanda" AND destino_info.id matches demandaId
  const filteredLegajoVinculos = useMemo(() => {
    console.log('ConexionesDemandaTab: Filtering vinculos for demanda:', demandaId)
    console.log('  - raw legajoVinculos:', legajoVinculos)
    console.log('  - legajoVinculos length:', legajoVinculos?.length || 0)

    if (!legajoVinculos || !Array.isArray(legajoVinculos)) {
      console.log('  - No vinculos array, returning empty')
      return []
    }

    // STRICT filter: Only vinculos directly linked to THIS demanda
    const filtered = legajoVinculos.filter((vinculo) => {
      const isDemandaType = vinculo.tipo_destino === "demanda"
      const matchesDemandaId = vinculo.destino_info?.id === demandaId
      const shouldInclude = isDemandaType && matchesDemandaId

      console.log(`  - Vinculo ${vinculo.id}: tipo=${vinculo.tipo_destino}, destino_id=${vinculo.destino_info?.id}, include=${shouldInclude}`)
      return shouldInclude
    })

    console.log('  - Filtered result:', filtered)
    console.log('  - Filtered length:', filtered.length)
    return filtered
  }, [legajoVinculos, demandaId])

  // Handlers for legajo vinculos
  const handleOpenCrearVinculo = () => {
    setCrearVinculoDialogOpen(true)
  }

  const handleCloseCrearVinculo = () => {
    setCrearVinculoDialogOpen(false)
  }

  const handleVinculoCreated = () => {
    // Reload vinculos after creation
    loadVinculos({
      demanda_destino: demandaId,
      activo: true,
    })
  }

  const handleOpenDesvincular = (vinculo: VinculoLegajoDemanda) => {
    setVinculoToDesvincular(vinculo)
    setDesvincularDialogOpen(true)
  }

  const handleCloseDesvincular = () => {
    setDesvincularDialogOpen(false)
    setVinculoToDesvincular(null)
  }

  const handleVinculoDesvinculado = () => {
    // Reload vinculos after desvincular
    loadVinculos({
      demanda_destino: demandaId,
      activo: true,
    })
  }

  const toggleJustificacion = (vinculoId: number) => {
    setExpandedJustificaciones((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(vinculoId)) {
        newSet.delete(vinculoId)
      } else {
        newSet.add(vinculoId)
      }
      return newSet
    })
  }

  const getTruncatedText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const formatDestinoInfo = (vinculo: VinculoLegajoDemanda) => {
    const { tipo_destino, destino_info } = vinculo
    if (tipo_destino === "demanda") {
      return `Demanda #${destino_info.id}${destino_info.objetivo ? ` - ${destino_info.objetivo}` : ""}`
    } else if (tipo_destino === "legajo") {
      return `Legajo #${destino_info.id}`
    } else if (tipo_destino === "medida") {
      return `Medida #${destino_info.id}`
    }
    return `${tipo_destino} #${destino_info.id}`
  }

  // Permission check must come after all hooks
  if (!hasVinculacionPermission) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          No tiene permisos para ver las conexiones de la demanda
        </Typography>
      </Box>
    )
  }

  const handleConnect = (demandaId2: number) => {
    // Find the demanda in allDemandas
    const demandaToConnect = allDemandas.find((d: Demanda) => d.id === demandaId2)

    if (demandaToConnect) {
      // Check if already connected
      const isAlreadyConnected = conexiones.some((c: Demanda) => c.id === demandaId2)

      if (isAlreadyConnected) {
        toast.info("Esta demanda ya está conectada")
        return
      }

      // Create connection
      createConnectionMutation.mutate({
        demanda_preexistente: demandaId,
        demanda_entrante: demandaId2,
        deleted: false,
      })
    } else {
      toast.error("No se encontró la demanda a conectar")
    }
  }

  const handleDeleteConnection = (connectedDemandaId: number) => {
    deleteConnectionMutation.mutate(connectedDemandaId)
  }

  const isLoading = isLoadingDemandas || isLoadingConexiones

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Conexiones de la Demanda
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Section - Using the refactored SearchModal component in embedded mode */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <SearchModal
          isModal={false}
          mode="connect"
          onConnect={handleConnect}
          title="Buscar demandas para conectar"
          compact={true}
          demanda={demandaId}
        />
      </Paper>

      {/* Connected Demands Section */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Demandas Conectadas
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conexiones.length > 0 ? (
          <List sx={{ mt: 2 }}>
            {conexiones.map((demanda: Demanda) => (
              <React.Fragment key={demanda.id}>
                <ListItem
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteConnection(demanda.id)}
                      disabled={deleteConnectionMutation.isPending}
                      sx={{
                        color: theme.palette.error.main,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        ID: {demanda.id} - {demanda.descripcion || "Sin descripción"}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Estado: {demanda.estado_demanda} | Fecha: {" "}
                        {new Date(demanda.fecha_ingreso_senaf).toLocaleDateString()}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              border: `1px dashed ${theme.palette.divider}`,
              mt: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No hay demandas conectadas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Utilice la búsqueda para encontrar y conectar demandas relacionadas.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Vínculos con Legajos Section */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mt: 4,
          borderRadius: 2,
          bgcolor: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Vínculos con Legajos (Demanda ID: {demandaId})
          </Typography>
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={handleOpenCrearVinculo}
            size="small"
          >
            Crear Vínculo
          </Button>
        </Box>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="caption">
              Debug: Loading={vinculosLoading ? 'true' : 'false'},
              Raw Count={legajoVinculos?.length || 0},
              Filtered Count={filteredLegajoVinculos?.length || 0},
              Error={vinculosError || 'none'}
            </Typography>
          </Alert>
        )}

        {vinculosError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {vinculosError}
          </Alert>
        )}

        {vinculosLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : filteredLegajoVinculos && filteredLegajoVinculos.length > 0 ? (
          <List sx={{ mt: 2 }}>
            {filteredLegajoVinculos.map((vinculo) => {
              const isExpanded = expandedJustificaciones.has(vinculo.id)
              const shouldTruncate = vinculo.justificacion.length > 100

              return (
                <React.Fragment key={vinculo.id}>
                  <ListItem
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        borderColor: theme.palette.primary.main,
                      },
                      flexDirection: "column",
                      alignItems: "flex-start",
                      py: 2,
                    }}
                  >
                    {/* Header Row */}
                    <Box sx={{ display: "flex", width: "100%", alignItems: "flex-start", mb: 1.5 }}>
                      <FolderIcon sx={{ mr: 1.5, mt: 0.5, color: "primary.main" }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Legajo {vinculo.legajo_origen_numero}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                          <Chip
                            label={vinculo.tipo_vinculo.nombre}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Vinculado con: {formatDestinoInfo(vinculo)}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        edge="end"
                        aria-label="desvincular"
                        onClick={() => handleOpenDesvincular(vinculo)}
                        size="small"
                        sx={{
                          color: theme.palette.error.main,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <LinkOffIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Justificación */}
                    <Box sx={{ width: "100%", pl: 5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Justificación:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          fontStyle: "italic",
                          color: "text.secondary",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {isExpanded || !shouldTruncate
                          ? vinculo.justificacion
                          : getTruncatedText(vinculo.justificacion)}
                      </Typography>
                      {shouldTruncate && (
                        <Button
                          size="small"
                          onClick={() => toggleJustificacion(vinculo.id)}
                          endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          sx={{ mt: 0.5, textTransform: "none" }}
                        >
                          {isExpanded ? "Ver menos" : "Ver más"}
                        </Button>
                      )}
                    </Box>

                    {/* Metadata Footer */}
                    <Box
                      sx={{
                        width: "100%",
                        pl: 5,
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Typography variant="caption" color="text.secondary">
                          Creado por: <strong>{vinculo.creado_por_username}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Fecha:{" "}
                          <strong>
                            {new Date(vinculo.creado_en).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </strong>
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                </React.Fragment>
              )
            })}
          </List>
        ) : (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              border: `1px dashed ${theme.palette.divider}`,
              mt: 2,
            }}
          >
            <FolderIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No hay vínculos con legajos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Cree un vínculo para relacionar esta demanda con un legajo existente.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      <CrearVinculoLegajoDialog
        open={crearVinculoDialogOpen}
        onClose={handleCloseCrearVinculo}
        demandaId={demandaId}
        onVinculoCreated={handleVinculoCreated}
      />

      <DesvincularVinculoDialog
        open={desvincularDialogOpen}
        onClose={handleCloseDesvincular}
        vinculo={vinculoToDesvincular}
        onVinculoDesvinculado={handleVinculoDesvinculado}
      />
    </Box>
  )
}
