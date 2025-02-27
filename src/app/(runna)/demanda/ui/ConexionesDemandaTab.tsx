"use client"

import React, { useState, useMemo } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Autocomplete,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import LinkIcon from "@mui/icons-material/Link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { get, create, update } from "@/app/api/apiService"

interface Demanda {
  id: number
  descripcion: string
  estado_demanda: string
  fecha_ingreso_senaf: string
}

interface DemandaVinculada {
  id: number
  demanda_1: number
  demanda_2: number
  deleted: boolean
}

interface ConexionesDemandaTabProps {
  demandaId: number
}

export function ConexionesDemandaTab({ demandaId }: ConexionesDemandaTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDemanda, setSelectedDemanda] = useState<Demanda | null>(null)
  const [error, setError] = useState<string | null>(null)

  const queryClient = useQueryClient()

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
          demanda_1: demandaId,
        })

        // Get the IDs of connected demandas
        const connectedIds = data.filter((conn) => !conn.deleted).map((conn) => conn.demanda_2)

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

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const lowerQuery = searchQuery.toLowerCase()
    return allDemandas.filter(
      (demanda) =>
        (demanda.id.toString().includes(lowerQuery) ||
          (demanda.descripcion && demanda.descripcion.toLowerCase().includes(lowerQuery))) &&
        demanda.id !== demandaId &&
        !conexiones.some((c) => c.id === demanda.id),
    )
  }, [searchQuery, allDemandas, demandaId, conexiones])

  // Create connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: (newConnection: Partial<DemandaVinculada>) =>
      create<DemandaVinculada>("demanda-vinculada", newConnection, true, "Demandas conectadas exitosamente"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandaConexiones", demandaId] })
      setSelectedDemanda(null)
      setSearchQuery("")
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
          demanda_1: demandaId,
          demanda_2: connectedDemandaId,
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

  const handleConnect = () => {
    if (!selectedDemanda) return

    createConnectionMutation.mutate({
      demanda_1: demandaId,
      demanda_2: selectedDemanda.id,
      deleted: false,
    })
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Buscar demandas para conectar
        </Typography>

        <Box sx={{ display: "flex", mb: 2 }}>
          <Autocomplete
            fullWidth
            freeSolo
            options={searchResults}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : `${option.id} - ${option.descripcion || "Sin descripción"}`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar por ID o descripción"
                variant="outlined"
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
            )}
            onChange={(_, newValue) => {
              if (newValue && typeof newValue !== "string") {
                setSelectedDemanda(newValue)
              }
            }}
            loading={isLoading}
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            onClick={() => setSearchQuery(searchQuery)} // Trigger re-render
            disabled={isLoading || !searchQuery.trim()}
            startIcon={<SearchIcon />}
          >
            Buscar
          </Button>
        </Box>

        {selectedDemanda && (
          <Box sx={{ mt: 2, p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="subtitle2">Demanda seleccionada:</Typography>
            <Typography>
              ID: {selectedDemanda.id} - {selectedDemanda.descripcion || "Sin descripción"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estado: {selectedDemanda.estado_demanda} | Fecha:{" "}
              {new Date(selectedDemanda.fecha_ingreso_senaf).toLocaleDateString()}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 1 }}
              onClick={handleConnect}
              startIcon={<LinkIcon />}
              disabled={createConnectionMutation.isPending}
            >
              {createConnectionMutation.isPending ? "Conectando..." : "Conectar Demandas"}
            </Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Demandas Conectadas
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : conexiones.length > 0 ? (
          <List>
            {conexiones.map((demanda) => (
              <React.Fragment key={demanda.id}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteConnection(demanda.id)}
                      disabled={deleteConnectionMutation.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`ID: ${demanda.id} - ${demanda.descripcion || "Sin descripción"}`}
                    secondary={`Estado: ${demanda.estado_demanda} | Fecha: ${new Date(demanda.fecha_ingreso_senaf).toLocaleDateString()}`}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No hay demandas conectadas
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

