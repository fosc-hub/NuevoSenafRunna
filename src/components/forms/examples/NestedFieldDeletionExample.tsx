/**
 * Example component demonstrating how to handle deletion of nested field data
 * This shows the implementation strategy for when a user wants to delete
 * existing nested field data (educacion, cobertura_medica, etc.)
 */

import React, { useState } from 'react'
import { Button, Box, Typography, Alert, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material'
import { markNestedFieldForDeletion, isFieldLoaded } from '../utils/submitCleanFormData'

interface NestedFieldDeletionExampleProps {
  nnyaIndex: number
  existingEducacionId?: number
  existingCoberturaId?: number
  onUpdate: (updates: any) => void
}

const NestedFieldDeletionExample: React.FC<NestedFieldDeletionExampleProps> = ({
  nnyaIndex,
  existingEducacionId,
  existingCoberturaId,
  onUpdate
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fieldToDelete, setFieldToDelete] = useState<'educacion' | 'cobertura_medica' | null>(null)

  const handleDeleteField = (fieldType: 'educacion' | 'cobertura_medica') => {
    setFieldToDelete(fieldType)
    setDeleteDialogOpen(true)
  }

  const confirmDeletion = () => {
    if (!fieldToDelete) return

    let deletionMarker: any = null
    let fieldPath = ''

    if (fieldToDelete === 'educacion' && existingEducacionId) {
      deletionMarker = markNestedFieldForDeletion('educacion', existingEducacionId)
      fieldPath = `ninosAdolescentes.${nnyaIndex}.educacion`
    } else if (fieldToDelete === 'cobertura_medica' && existingCoberturaId) {
      deletionMarker = markNestedFieldForDeletion('cobertura_medica', existingCoberturaId)
      fieldPath = `ninosAdolescentes.${nnyaIndex}.cobertura_medica`
    }

    if (deletionMarker) {
      // Update the form to mark the field for deletion
      onUpdate({
        [fieldPath]: deletionMarker
      })
    }

    setDeleteDialogOpen(false)
    setFieldToDelete(null)
  }

  const cancelDeletion = () => {
    setDeleteDialogOpen(false)
    setFieldToDelete(null)
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Gestión de Campos Anidados
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Estrategia de eliminación:</strong> Cuando un campo anidado ya existe en la base de datos
          y el usuario quiere eliminarlo, marcamos el campo con <code>deleted: true</code> en lugar de omitirlo.
          Esto permite al backend saber que debe eliminar el registro existente.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {existingEducacionId && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteField('educacion')}
            size="small"
          >
            Eliminar Educación
          </Button>
        )}

        {existingCoberturaId && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteField('cobertura_medica')}
            size="small"
          >
            Eliminar Cobertura Médica
          </Button>
        )}
      </Box>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Caso de uso:</strong> Utiliza estos botones cuando un NNYA ya tiene datos de educación
          o cobertura médica guardados, pero el usuario quiere eliminar esa información completamente.
          El campo se marcará como <code>deleted: true</code> y será eliminado en el próximo envío al API.
        </Typography>
      </Alert>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Lógica implementada:</strong>
        </Typography>
        <Typography variant="body2" component="pre" sx={{
          backgroundColor: 'grey.100',
          p: 1,
          borderRadius: 1,
          fontSize: '0.75rem',
          overflow: 'auto'
        }}>
{`// En submitCleanFormData.ts

function createEducacionData(educacion: any, existingEducacionId?: number): any {
  if (!educacion) return null

  const hasMeaningfulData = /* check if has data */

  // Si no hay datos significativos pero existe un registro,
  // marcarlo para eliminación
  if (!hasMeaningfulData) {
    return existingEducacionId ? { id: existingEducacionId, deleted: true } : null
  }

  // Si hay datos, crear el objeto normal
  return { /* datos de educación */ }
}`}
        </Typography>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeletion}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            ¿Está seguro de que desea eliminar los datos de{' '}
            <strong>{fieldToDelete === 'educacion' ? 'educación' : 'cobertura médica'}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta acción marcará el campo para eliminación en la base de datos cuando se guarde el formulario.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeletion} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={confirmDeletion}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default NestedFieldDeletionExample

/**
 * Usage example in a form component:
 *
 * ```tsx
 * import NestedFieldDeletionExample from './examples/NestedFieldDeletionExample'
 *
 * // In your NNYA form component:
 * <NestedFieldDeletionExample
 *   nnyaIndex={index}
 *   existingEducacionId={nnya.educacion?.id}
 *   existingCoberturaId={nnya.cobertura_medica?.id}
 *   onUpdate={(updates) => {
 *     // Update your form state
 *     Object.entries(updates).forEach(([path, value]) => {
 *       setValue(path, value)
 *     })
 *   }}
 * />
 * ```
 */