'use client'

/**
 * Step 1: Search NNyA (LEG-02)
 * Integrates with LEG-01 to detect duplicate legajos
 *
 * Enhanced to display:
 * - Existing legajo information
 * - Linked demandas count
 * - Active medidas count
 * - Grupo conviviente members
 */

import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  Chip,
  Paper,
  Tabs,
  Tab,
  Grid,
  Tooltip,
  Collapse,
  IconButton,
  Stack,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DescriptionIcon from '@mui/icons-material/Description'
import GavelIcon from '@mui/icons-material/Gavel'
import GroupIcon from '@mui/icons-material/Group'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import InfoIcon from '@mui/icons-material/Info'
import { useSearchNnya } from '../../hooks/useSearchNnya'
import type { BusquedaNnyaResult, GrupoConvivienteMiembro } from '../../types/legajo-creation.types'

interface Props {
  onSelect: (nnya: BusquedaNnyaResult) => void
  onCrearNuevo: () => void
}

/**
 * Component to display grupo conviviente members
 */
function GrupoConvivienteSection({
  grupo,
  expanded,
  onToggle,
}: {
  grupo: GrupoConvivienteMiembro[]
  expanded: boolean
  onToggle: () => void
}) {
  if (grupo.length === 0) return null

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          borderRadius: 1,
          p: 0.5,
        }}
        onClick={onToggle}
      >
        <GroupIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Grupo Conviviente ({grupo.length})
        </Typography>
        <IconButton size="small" sx={{ ml: 'auto' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ pl: 3, pt: 1 }}>
          {grupo.map((miembro) => (
            <Box
              key={miembro.persona_id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Typography variant="body2">{miembro.nombre}</Typography>
              {miembro.vinculo && (
                <Chip
                  label={miembro.vinculo}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
              {miembro.dni && (
                <Typography variant="caption" color="text.secondary">
                  DNI: {miembro.dni}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  )
}

/**
 * Component to display status badges for demandas, medidas, etc.
 */
function StatusBadges({ nnya }: { nnya: BusquedaNnyaResult }) {
  const hasLegajo = !!nnya.legajo_existente
  const demandasCount = nnya.demandas_ids?.length ?? 0
  const medidasCount = nnya.medidas_ids?.length ?? 0

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
      {/* Legajo Status - Primary indicator */}
      {hasLegajo ? (
        <Chip
          icon={<WarningIcon />}
          label="YA TIENE LEGAJO"
          color="error"
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      ) : (
        <Chip
          icon={<CheckCircleIcon />}
          label="Disponible"
          color="success"
          size="small"
        />
      )}

      {/* Demandas indicator */}
      {demandasCount > 0 && (
        <Tooltip title={`${demandasCount} demanda(s) vinculada(s)`}>
          <Chip
            icon={<DescriptionIcon />}
            label={`${demandasCount} Demanda${demandasCount > 1 ? 's' : ''}`}
            color="info"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}

      {/* Medidas indicator */}
      {medidasCount > 0 && (
        <Tooltip title={`${medidasCount} medida(s) activa(s)`}>
          <Chip
            icon={<GavelIcon />}
            label={`${medidasCount} Medida${medidasCount > 1 ? 's' : ''}`}
            color="warning"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}
    </Stack>
  )
}

export default function BusquedaNnyaStep({ onSelect, onCrearNuevo }: Props) {
  const [searchMode, setSearchMode] = useState<'dni' | 'nombre'>('dni')
  const [dniSearch, setDniSearch] = useState('')
  const [nombreSearch, setNombreSearch] = useState('')
  const [apellidoSearch, setApellidoSearch] = useState('')
  const [expandedGrupos, setExpandedGrupos] = useState<Record<number, boolean>>({})

  const { searching, results, searchByDni, searchByNombre, hasResults } = useSearchNnya()

  const handleSearch = async () => {
    if (searchMode === 'dni') {
      if (!dniSearch.trim()) return
      await searchByDni(dniSearch)
    } else {
      if (!nombreSearch.trim() && !apellidoSearch.trim()) return
      await searchByNombre(nombreSearch, apellidoSearch)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSelectNnya = (nnya: BusquedaNnyaResult) => {
    // Check if NNyA already has legajo
    if (nnya.legajo_existente) {
      // Show warning but don't allow selection
      return
    }
    onSelect(nnya)
  }

  const toggleGrupoExpanded = (nnyaId: number) => {
    setExpandedGrupos((prev) => ({
      ...prev,
      [nnyaId]: !prev[nnyaId],
    }))
  }

  const formatFechaNacimiento = (fecha: string | null): string => {
    if (!fecha) return 'No especificada'
    try {
      return new Date(fecha).toLocaleDateString('es-AR')
    } catch {
      return fecha
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: '#0EA5E9', fontWeight: 'bold' }}>
        Paso 1: Buscar NNyA Existente
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Busque por <strong>DNI o nombre completo</strong> para verificar si el NNyA ya existe en el
        sistema. Esto previene la creación de legajos duplicados (LEG-01).
      </Typography>

      {/* Search Mode Tabs */}
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Tabs
          value={searchMode}
          onChange={(_, value) => setSearchMode(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Buscar por DNI" value="dni" />
          <Tab label="Buscar por Nombre" value="nombre" />
        </Tabs>

        {/* Search Box */}
        <Box sx={{ p: 2 }}>
          {searchMode === 'dni' ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="DNI"
                value={dniSearch}
                onChange={(e) => setDniSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                placeholder="Ej: 12345678"
                disabled={searching}
                type="number"
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={searching || !dniSearch.trim()}
                startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{ minWidth: 120 }}
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Nombre"
                  value={nombreSearch}
                  onChange={(e) => setNombreSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  placeholder="Ej: Juan"
                  disabled={searching}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Apellido"
                  value={apellidoSearch}
                  onChange={(e) => setApellidoSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  placeholder="Ej: Pérez"
                  disabled={searching}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searching || (!nombreSearch.trim() && !apellidoSearch.trim())}
                  startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Search Results */}
      {hasResults && (
        <Paper variant="outlined" sx={{ mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: '#e3f2fd' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Se encontraron {results.length} NNyA(s)
            </Typography>
          </Box>

          <List sx={{ maxHeight: 500, overflow: 'auto' }}>
            {results.map((nnya, index) => {
              const hasLegajo = !!nnya.legajo_existente
              const grupoConviviente = nnya.grupo_conviviente || []
              const isGrupoExpanded = expandedGrupos[nnya.id] || false

              return (
                <div key={nnya.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      py: 2,
                      bgcolor: hasLegajo ? '#fff3e0' : 'transparent',
                    }}
                  >
                    {/* Main content row */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                      <ListItemText
                        sx={{ flex: 1 }}
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {nnya.apellido}, {nnya.nombre}
                            </Typography>
                            {nnya.nnya === false && (
                              <Tooltip title="Esta persona no está marcada como NNyA">
                                <Chip
                                  icon={<InfoIcon />}
                                  label="Adulto"
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                />
                              </Tooltip>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            {/* Basic info */}
                            <Typography variant="body2" color="text.secondary">
                              <strong>DNI:</strong> {nnya.dni || 'No especificado'}
                              {' | '}
                              <strong>Nacimiento:</strong>{' '}
                              {formatFechaNacimiento(nnya.fecha_nacimiento)}
                            </Typography>

                            {/* Status badges */}
                            <StatusBadges nnya={nnya} />

                            {/* Legajo info if exists */}
                            {hasLegajo && nnya.legajo_existente && (
                              <Alert severity="error" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                  <strong>Legajo Existente:</strong> {nnya.legajo_existente.numero}
                                  {nnya.legajo_existente.fecha_apertura && (
                                    <>
                                      <br />
                                      <strong>Fecha Apertura:</strong>{' '}
                                      {new Date(
                                        nnya.legajo_existente.fecha_apertura
                                      ).toLocaleDateString('es-AR')}
                                    </>
                                  )}
                                </Typography>
                              </Alert>
                            )}

                            {/* Grupo conviviente */}
                            <GrupoConvivienteSection
                              grupo={grupoConviviente}
                              expanded={isGrupoExpanded}
                              onToggle={() => toggleGrupoExpanded(nnya.id)}
                            />
                          </Box>
                        }
                      />

                      {/* Action button */}
                      {!hasLegajo && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSelectNnya(nnya)}
                          sx={{ ml: 2, minWidth: 140, alignSelf: 'flex-start' }}
                        >
                          Usar este NNyA
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                </div>
              )
            })}
          </List>
        </Paper>
      )}

      {/* No Results Message */}
      {!searching && !hasResults && (dniSearch || nombreSearch || apellidoSearch) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No se encontraron resultados para{' '}
          <strong>
            {searchMode === 'dni' ? `DNI: ${dniSearch}` : `${nombreSearch} ${apellidoSearch}`.trim()}
          </strong>
          . Puede crear un nuevo NNyA usando el botón de abajo.
        </Alert>
      )}

      {/* Create New NNyA */}
      <Divider sx={{ my: 3 }} />

      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          ¿No encontró el NNyA en el sistema?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Puede crear un nuevo registro de NNyA y su legajo
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PersonAddIcon />}
          onClick={onCrearNuevo}
          sx={{ minWidth: 200 }}
        >
          Crear Nuevo NNyA
        </Button>
      </Box>
    </Box>
  )
}
