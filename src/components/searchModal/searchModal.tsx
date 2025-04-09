"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Paper,
  InputAdornment,
  Chip,
  Fade,
  Tooltip,
  useTheme,
  alpha,
  Autocomplete,
} from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import BadgeIcon from "@mui/icons-material/Badge"
import CodeIcon from "@mui/icons-material/Code"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import HomeIcon from "@mui/icons-material/Home"
import CloseIcon from "@mui/icons-material/Close"
import SearchIcon from "@mui/icons-material/Search"
import LinkIcon from "@mui/icons-material/Link"
import { create, get } from "@/app/api/apiService"
import { debounce } from "lodash"
import { ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchResult {
  demanda_ids: number[]
  match_descriptions: string[]
}

interface Localidad {
  id: number
  nombre: string
}

interface SearchModalProps {
  // Modal props
  open?: boolean
  onClose?: () => void
  // Mode can be 'connect' for connecting demands or 'view' for just viewing
  mode?: "connect" | "view"
  // Optional callback for when a demand is selected for connection
  onConnect?: (demandaId: number) => void
  // Optional title override
  title?: string
  // Whether to render as a modal or embedded component
  isModal?: boolean
  // Optional compact mode for embedded view
  compact?: boolean
}

export default function SearchModal({
  open = true,
  onClose = () => {},
  mode = "view",
  onConnect,
  title = "Búsqueda Avanzada de Demandas",
  isModal = true,
  compact = false,
}: SearchModalProps) {
  const router = useRouter()
  const theme = useTheme()

  // Search states
  const [searchParams, setSearchParams] = useState({
    nombre_y_apellido: "",
    dni: "",
    codigo: "",
    calle: "",
    localidad: "",
  })
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [activeSearchFields, setActiveSearchFields] = useState<string[]>([])

  // Localidades state
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [loadingLocalidades, setLoadingLocalidades] = useState(false)
  const [selectedLocalidad, setSelectedLocalidad] = useState<Localidad | null>(null)

  // Fetch localidades
  useEffect(() => {
    const fetchLocalidades = async () => {
      setLoadingLocalidades(true)
      try {
        const data = await get<Localidad>("localidad/")
        setLocalidades(data)
      } catch (error) {
        console.error("Error fetching localidades:", error)
      } finally {
        setLoadingLocalidades(false)
      }
    }

    fetchLocalidades()
  }, [])

  // Reset state when modal closes (only for modal mode)
  useEffect(() => {
    if (isModal && !open) {
      setSearchParams({
        nombre_y_apellido: "",
        dni: "",
        codigo: "",
        calle: "",
        localidad: "",
      })
      setSearchResults(null)
      setSearchError(null)
      setSelectedLocalidad(null)
    }
  }, [isModal, open])

  // Update active search fields
  useEffect(() => {
    const active = []
    if (searchParams.nombre_y_apellido) active.push("nombre_y_apellido")
    if (searchParams.dni) active.push("dni")
    if (searchParams.codigo) active.push("codigo")
    if (searchParams.calle) active.push("calle")
    if (searchParams.localidad) active.push("localidad")
    setActiveSearchFields(active)
  }, [searchParams])

  // Search function using the endpoint
  const handleSearch = useCallback(async () => {
    // Don't search if all fields are empty
    if (
      !searchParams.nombre_y_apellido &&
      !searchParams.dni &&
      !searchParams.codigo &&
      !searchParams.calle &&
      !searchParams.localidad
    ) {
      return
    }

    setSearchLoading(true)
    setSearchError(null)

    try {
      // Prepare the payload according to the required format
      const payload = {
        nombre_y_apellido: searchParams.nombre_y_apellido || undefined,
        dni: searchParams.dni ? Number.parseInt(searchParams.dni, 10) : undefined,
        codigo: searchParams.codigo || undefined,
        localizacion:
          searchParams.calle || searchParams.localidad
            ? {
                calle: searchParams.calle || undefined,
                localidad: searchParams.localidad ? Number.parseInt(searchParams.localidad, 10) : undefined,
              }
            : undefined,
      }

      // Remove undefined values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key]
        } else if (typeof payload[key] === "object" && payload[key] !== null) {
          Object.keys(payload[key]).forEach((subKey) => {
            if (payload[key][subKey] === undefined) {
              delete payload[key][subKey]
            }
          })
          // Remove empty objects
          if (Object.keys(payload[key]).length === 0) {
            delete payload[key]
          }
        }
      })

      const result = await create<SearchResult>("demanda-busqueda-vinculacion", payload)

      setSearchResults(result)
    } catch (err) {
      console.error("Error searching:", err)
      setSearchError("Error al buscar. Por favor intente nuevamente.")
    } finally {
      setSearchLoading(false)
    }
  }, [searchParams])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(() => {
      handleSearch()
    }, 500),
    [handleSearch],
  )

  // Trigger search when params change
  useEffect(() => {
    if ((isModal ? open : true) && activeSearchFields.length > 0) {
      debouncedSearch()
    }
    return () => debouncedSearch.cancel()
  }, [searchParams, isModal, open, activeSearchFields.length, debouncedSearch])

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleClearField = (field: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: "",
    }))
    if (field === "localidad") {
      setSelectedLocalidad(null)
    }
  }

  const handleClearAllFields = () => {
    setSearchParams({
      nombre_y_apellido: "",
      dni: "",
      codigo: "",
      calle: "",
      localidad: "",
    })
    setSearchResults(null)
    setSelectedLocalidad(null)
  }

  const handleOpenInFullPage = (id: number) => {
    router.push(`/demanda/${id}`)
    if (isModal) {
      onClose()
    }
  }

  const handleConnectDemanda = (demandaId: number) => {
    if (onConnect) {
      onConnect(demandaId)
    }
  }

  const handleLocalidadChange = (event: React.SyntheticEvent, value: Localidad | null) => {
    setSelectedLocalidad(value)
    setSearchParams((prev) => ({
      ...prev,
      localidad: value ? value.id.toString() : "",
    }))
  }

  // Get icon for search field
  const getFieldIcon = (field: string) => {
    switch (field) {
      case "nombre_y_apellido":
        return <PersonIcon />
      case "dni":
        return <BadgeIcon />
      case "codigo":
        return <CodeIcon />
      case "calle":
        return <LocationOnIcon />
      case "localidad":
        return <HomeIcon />
      default:
        return <SearchIcon />
    }
  }

  // Get label for search field
  const getFieldLabel = (field: string) => {
    switch (field) {
      case "nombre_y_apellido":
        return "Nombre y Apellido"
      case "dni":
        return "DNI"
      case "codigo":
        return "Código"
      case "calle":
        return "Calle"
      case "localidad":
        return "Localidad"
      default:
        return field
    }
  }

  // Get display value for search field in chips
  const getFieldDisplayValue = (field: string, value: string) => {
    if (field === "localidad" && selectedLocalidad) {
      return selectedLocalidad.nombre
    }
    return value
  }

  // The actual search content
  const searchContent = (
    <>
      <Box sx={{ mb: compact ? 2 : 3 }}>
        {/* Active search filters */}
        {activeSearchFields.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: compact ? 0 : 2 }}>
            {activeSearchFields.map((field) => (
              <Chip
                key={field}
                label={`${getFieldLabel(field)}: ${getFieldDisplayValue(field, searchParams[field])}`}
                onDelete={() => handleClearField(field)}
                color="primary"
                variant="outlined"
                size="small"
                icon={getFieldIcon(field)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Search fields in a card */}
      <Paper
        elevation={0}
        sx={{
          p: compact ? 2 : 3,
          mb: compact ? 2 : 3,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {!compact && (
          <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.primary.main }}>
            Criterios de Búsqueda
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: compact ? "1fr 1fr" : "1fr 1fr",
              md: compact ? "1fr 1fr 1fr" : "1fr 1fr",
            },
            gap: compact ? 1.5 : 2,
          }}
        >
          <TextField
            label="Nombre y Apellido"
            fullWidth
            value={searchParams.nombre_y_apellido}
            onChange={handleInputChange("nombre_y_apellido")}
            variant="outlined"
            size={compact ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" fontSize={compact ? "small" : "medium"} />
                </InputAdornment>
              ),
              endAdornment: searchParams.nombre_y_apellido ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleClearField("nombre_y_apellido")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: compact ? 1.5 : 2,
              },
            }}
          />

          <TextField
            label="DNI"
            fullWidth
            value={searchParams.dni}
            onChange={handleInputChange("dni")}
            type="number"
            variant="outlined"
            size={compact ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="action" fontSize={compact ? "small" : "medium"} />
                </InputAdornment>
              ),
              endAdornment: searchParams.dni ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleClearField("dni")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: compact ? 1.5 : 2,
              },
            }}
          />

          <TextField
            label="Código"
            fullWidth
            value={searchParams.codigo}
            onChange={handleInputChange("codigo")}
            variant="outlined"
            size={compact ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CodeIcon color="action" fontSize={compact ? "small" : "medium"} />
                </InputAdornment>
              ),
              endAdornment: searchParams.codigo ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleClearField("codigo")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: compact ? 1.5 : 2,
              },
            }}
          />

          <TextField
            label="Calle"
            fullWidth
            value={searchParams.calle}
            onChange={handleInputChange("calle")}
            variant="outlined"
            size={compact ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="action" fontSize={compact ? "small" : "medium"} />
                </InputAdornment>
              ),
              endAdornment: searchParams.calle ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleClearField("calle")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: compact ? 1.5 : 2,
              },
            }}
          />

          <Autocomplete
            options={localidades}
            getOptionLabel={(option) => option.nombre}
            value={selectedLocalidad}
            onChange={handleLocalidadChange}
            loading={loadingLocalidades}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Localidad"
                variant="outlined"
                size={compact ? "small" : "medium"}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <HomeIcon color="action" fontSize={compact ? "small" : "medium"} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {loadingLocalidades ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: compact ? 1.5 : 2,
                  },
                }}
              />
            )}
            noOptionsText="No se encontraron localidades"
            loadingText="Cargando localidades..."
            sx={{ width: "100%" }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: compact ? 1 : 2 }}>
          <Button variant="text" size="small" onClick={handleClearAllFields} disabled={activeSearchFields.length === 0}>
            Limpiar Filtros
          </Button>
        </Box>
      </Paper>

      {searchLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: compact ? 2 : 4 }}>
          <CircularProgress size={compact ? 24 : 40} />
          <Typography variant="body2" sx={{ ml: 2, color: "text.secondary" }}>
            Buscando demandas...
          </Typography>
        </Box>
      )}

      {searchError && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {searchError}
        </Alert>
      )}

      {/* Search results */}
      {searchResults && !searchLoading && (
        <Fade in={true} timeout={500}>
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                mt: compact ? 2 : 3,
              }}
            >
              <Typography
                variant={compact ? "subtitle2" : "subtitle1"}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              >
                Resultados de la búsqueda
                <Chip label={searchResults.demanda_ids.length} size="small" color="primary" sx={{ ml: 1 }} />
              </Typography>
            </Box>

            {searchResults.demanda_ids.length > 0 ? (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}
              >
                <List disablePadding>
                  {searchResults.match_descriptions.map((description, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          py: compact ? 1.5 : 2,
                          px: compact ? 2 : 3,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", mb: compact ? 0.5 : 1 }}>
                              <Typography
                                variant={compact ? "subtitle2" : "subtitle1"}
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.primary.main,
                                }}
                              >
                                Demanda ID: {searchResults.demanda_ids[index]}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.primary",
                                  mb: compact ? 1 : 2,
                                  lineHeight: 1.6,
                                }}
                              >
                                {description}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1, mt: compact ? 0.5 : 1 }}>
                                {mode === "connect" && onConnect && (
                                  <Tooltip title="Conectar esta demanda">
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<LinkIcon />}
                                      onClick={() => handleConnectDemanda(searchResults.demanda_ids[index])}
                                      sx={{
                                        borderRadius: 2,
                                        boxShadow: "none",
                                        "&:hover": {
                                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                        },
                                      }}
                                    >
                                      Conectar
                                    </Button>
                                  </Tooltip>
                                )}
                                <Tooltip title="Ver detalles de la demanda">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ExternalLink size={16} />}
                                    onClick={() => handleOpenInFullPage(searchResults.demanda_ids[index])}
                                    sx={{
                                      borderRadius: 2,
                                    }}
                                  >
                                    Ver Detalles
                                  </Button>
                                </Tooltip>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < searchResults.match_descriptions.length - 1 && (
                        <Divider variant="fullWidth" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            ) : (
              <Paper
                sx={{
                  p: compact ? 3 : 4,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  border: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No se encontraron resultados para los criterios de búsqueda.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Intente con diferentes términos o criterios.
                </Typography>
              </Paper>
            )}
          </Box>
        </Fade>
      )}

      {/* Empty state when no search has been performed */}
      {!searchResults && !searchLoading && !searchError && activeSearchFields.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: compact ? 3 : 6,
            textAlign: "center",
          }}
        >
          <SearchIcon sx={{ fontSize: compact ? 40 : 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
          <Typography variant={compact ? "body1" : "h6"} color="text.secondary">
            Ingrese criterios de búsqueda
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400 }}>
            Complete al menos uno de los campos de búsqueda para encontrar demandas relacionadas.
          </Typography>
        </Box>
      )}
    </>
  )

  // If it's a modal, wrap the content in a Dialog
  if (isModal) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          },
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3, pt: 0, pb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: theme.palette.text.primary,
            }}
          >
            <SearchIcon fontSize="small" />
            {title}
          </Typography>

          {searchContent}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            justifyContent: "space-between",
          }}
        >
          <Button onClick={handleClearAllFields} color="inherit" disabled={activeSearchFields.length === 0}>
            Limpiar Filtros
          </Button>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  // Otherwise, return the content directly
  return (
    <Box>
      {title && (
        <Typography
          variant={compact ? "subtitle1" : "h6"}
          gutterBottom
          sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}
        >
          {title}
        </Typography>
      )}
      {searchContent}
    </Box>
  )
}
