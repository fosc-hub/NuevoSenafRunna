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
  const [searchTerm, setSearchTerm] = useState('')
  const { searching, results, search, hasResults } = useSearchNnya()

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    await search(searchTerm)
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
        Busque por <strong>DNI, nombre o apellido</strong> para verificar si el NNyA ya existe en el sistema.
        Esto previene la creación de legajos duplicados (LEG-01).
      </Typography>

      {/* Search Box */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="DNI, Nombre o Apellido"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            fullWidth
            placeholder="Ej: 12345678 o Juan Pérez"
            disabled={searching}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching || !searchTerm.trim()}
            startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{ minWidth: 120 }}
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </Button>
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

                          {hasLegajo && (
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
      {!searching && searchTerm && !hasResults && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No se encontraron resultados para <strong>{searchTerm}</strong>.
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
