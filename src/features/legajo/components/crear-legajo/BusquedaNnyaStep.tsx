'use client'

/**
 * Step 1: Search NNyA (LEG-02)
 * Integrates with LEG-01 to detect duplicate legajos
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
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useSearchNnya } from '../../hooks/useSearchNnya'
import type { BusquedaNnyaResult } from '../../types/legajo-creation.types'

interface Props {
  onSelect: (nnya: BusquedaNnyaResult) => void
  onCrearNuevo: () => void
}

export default function BusquedaNnyaStep({ onSelect, onCrearNuevo }: Props) {
  const [searchMode, setSearchMode] = useState<'dni' | 'nombre'>('dni')
  const [dniSearch, setDniSearch] = useState('')
  const [nombreSearch, setNombreSearch] = useState('')
  const [apellidoSearch, setApellidoSearch] = useState('')
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: '#0EA5E9', fontWeight: 'bold' }}>
        Paso 1: Buscar NNyA Existente
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Busque por <strong>DNI o nombre completo</strong> para verificar si el NNyA ya existe en el sistema.
        Esto previene la creación de legajos duplicados (LEG-01).
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

          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {results.map((nnya, index) => {
              const hasLegajo = !!nnya.legajo_existente

              return (
                <div key={nnya.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      py: 2,
                      bgcolor: hasLegajo ? '#fff3e0' : 'transparent',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {nnya.apellido}, {nnya.nombre}
                          </Typography>
                          {hasLegajo ? (
                            <Chip
                              icon={<WarningIcon />}
                              label="YA TIENE LEGAJO"
                              color="error"
                              size="small"
                            />
                          ) : (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Disponible"
                              color="success"
                              size="small"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>DNI:</strong> {nnya.dni || 'No especificado'}
                            <br />
                            <strong>Fecha Nacimiento:</strong> {nnya.fecha_nacimiento || 'No especificada'}
                          </Typography>

                          {hasLegajo && nnya.legajo_existente && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                              <Typography variant="body2">
                                <strong>Legajo Existente:</strong> {nnya.legajo_existente.numero}
                                <br />
                                <strong>Fecha Apertura:</strong>{' '}
                                {new Date(nnya.legajo_existente.fecha_apertura).toLocaleDateString('es-AR')}
                              </Typography>
                            </Alert>
                          )}
                        </Box>
                      }
                    />

                    {!hasLegajo && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSelectNnya(nnya)}
                        sx={{ ml: 2, minWidth: 140 }}
                      >
                        Usar este NNyA
                      </Button>
                    )}
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
            {searchMode === 'dni'
              ? `DNI: ${dniSearch}`
              : `${nombreSearch} ${apellidoSearch}`.trim()}
          </strong>.
          Puede crear un nuevo NNyA usando el botón de abajo.
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
