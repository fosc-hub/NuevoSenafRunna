"use client"

import React, { useState } from "react"
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
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { get, create, update } from "@/app/api/apiService"
import SearchModal from "@/components/searchModal/searchModal"
import { useUser } from "@/utils/auth/userZustand"

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

  // Fetch all demandas
  const { data: allDemandas = [], isLoading: isLoadingDemandas } = useQuery({
    queryKey: ["allDemandas"],
    queryFn: () => get<Demanda>("demanda/"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch existing connections
  const { data: conexiones = [], isLoading: isLoadingConexiones } = useQuery({
    queryKey: ["demandaConexiones", demandaId],
    queryFn: async () => {
      try {
        // Fetch all connections for this demanda
        const data = await get<DemandaVinculada>("demanda-vinculada/", {
          demanda_preexistente: demandaId,
        })

        // Get the IDs of connected demandas
        const connectedIds = data.filter((conn) => !conn.deleted).map((conn) => conn.demanda_entrante)

        // Return the connected demandas
        return allDemandas.filter((demanda) => connectedIds.includes(demanda.id))
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
        const connections = await get<DemandaVinculada>("demanda-vinculada/", {
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
    const demandaToConnect = allDemandas.find((d) => d.id === demandaId2)

    if (demandaToConnect) {
      // Check if already connected
      const isAlreadyConnected = conexiones.some((c) => c.id === demandaId2)

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
            {conexiones.map((demanda) => (
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
    </Box>
  )
}
