'use client'

/**
 * Step 4: Summary and Confirmation (LEG-02)
 * Shows all data before creating legajo
 */

import { Box, Typography, Button, CircularProgress, Paper, Grid, Chip, Divider } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface Props {
  formData: any
  nnyaSeleccionado: any
  onConfirmar: () => void
  onBack: () => void
  isSubmitting: boolean
}

export default function ResumenStep({ formData, nnyaSeleccionado, onConfirmar, onBack, isSubmitting }: Props) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: '#0EA5E9', fontWeight: 'bold' }}>
        Paso 4: Confirmar Creación de Legajo
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Revise los datos antes de crear el legajo. Una vez creado, se generará el número automáticamente.
      </Typography>

      {/* Datos del NNyA */}
      <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#0EA5E9' }}>
          Datos del NNyA
        </Typography>

        {formData.nnya ? (
          // Existing NNyA
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Chip label="NNyA Existente" color="success" size="small" sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={6}><strong>ID:</strong></Grid>
            <Grid item xs={6}>{formData.nnya}</Grid>
            {nnyaSeleccionado && (
              <>
                <Grid item xs={6}><strong>Nombre:</strong></Grid>
                <Grid item xs={6}>{nnyaSeleccionado.nombre} {nnyaSeleccionado.apellido}</Grid>
                <Grid item xs={6}><strong>DNI:</strong></Grid>
                <Grid item xs={6}>{nnyaSeleccionado.dni || 'No especificado'}</Grid>
              </>
            )}
          </Grid>
        ) : (
          // New NNyA
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Chip label="Nuevo NNyA" color="primary" size="small" sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={6}><strong>Nombre:</strong></Grid>
            <Grid item xs={6}>{formData.nnya_data?.nombre}</Grid>
            <Grid item xs={6}><strong>Apellido:</strong></Grid>
            <Grid item xs={6}>{formData.nnya_data?.apellido}</Grid>
            <Grid item xs={6}><strong>DNI:</strong></Grid>
            <Grid item xs={6}>{formData.nnya_data?.dni || 'No especificado'}</Grid>
            <Grid item xs={6}><strong>Género:</strong></Grid>
            <Grid item xs={6}>{formData.nnya_data?.genero}</Grid>
            <Grid item xs={6}><strong>Nacionalidad:</strong></Grid>
            <Grid item xs={6}>{formData.nnya_data?.nacionalidad}</Grid>
          </Grid>
        )}
      </Paper>

      {/* Asignación */}
      <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#0EA5E9' }}>
          Asignación
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={6}><strong>Urgencia ID:</strong></Grid>
          <Grid item xs={6}>{formData.urgencia}</Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Equipo de Trabajo
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}><strong>Zona ID:</strong></Grid>
          <Grid item xs={6}>{formData.zona_trabajo_id}</Grid>
          <Grid item xs={6}><strong>Responsable ID:</strong></Grid>
          <Grid item xs={6}>{formData.user_responsable_trabajo_id}</Grid>
        </Grid>

        {formData.local_centro_vida_id && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Centro de Vida
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}><strong>Local ID:</strong></Grid>
              <Grid item xs={6}>{formData.local_centro_vida_id}</Grid>
              <Grid item xs={6}><strong>Zona ID:</strong></Grid>
              <Grid item xs={6}>{formData.zona_centro_vida_id}</Grid>
              <Grid item xs={6}><strong>Responsable ID:</strong></Grid>
              <Grid item xs={6}>{formData.user_responsable_centro_vida_id}</Grid>
            </Grid>
          </>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack} disabled={isSubmitting}>
          Atrás
        </Button>
        <Button
          variant="contained"
          onClick={onConfirmar}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          sx={{ minWidth: 180 }}
        >
          {isSubmitting ? 'Creando Legajo...' : 'Crear Legajo'}
        </Button>
      </Box>

      {isSubmitting && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Por favor espere, el legajo se está creando...
          </Typography>
        </Box>
      )}
    </Box>
  )
}
