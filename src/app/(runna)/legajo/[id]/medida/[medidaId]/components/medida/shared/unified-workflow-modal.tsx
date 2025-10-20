"use client"

/**
 * Unified Workflow Modal Component
 *
 * Single modal that adapts to all document types and modes (view/edit/create).
 * Replaces the need for multiple specialized modals.
 *
 * Features:
 * - Dynamic form generation from configuration
 * - Three modes: view, edit, create
 * - Form validation
 * - File upload support
 * - State transition actions (enviar, aprobar, rechazar)
 * - Permission-based actions
 */

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Divider,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import SaveIcon from "@mui/icons-material/Save"
import SendIcon from "@mui/icons-material/Send"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { AttachmentUpload } from "../AttachmentUpload"
import { usePermissions, canPerformStateAction } from "../../../utils/permissions"
import type { UnifiedWorkflowModalProps, WorkflowItem, FieldConfig } from "../../../types/workflow"

export const UnifiedWorkflowModal: React.FC<UnifiedWorkflowModalProps> = ({
  open,
  onClose,
  medidaId,
  itemId,
  sectionType,
  mode: initialMode,
  config,
  apiService,
  legajoData,
  tipoMedida,
  onSaved,
  onDeleted,
}) => {
  const [mode, setMode] = useState(initialMode)
  const [item, setItem] = useState<WorkflowItem | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Get permissions
  const permissions = usePermissions(config.permissions as any)

  // Load item data when in view/edit mode
  useEffect(() => {
    if (open && itemId && (mode === 'view' || mode === 'edit')) {
      loadItemData()
    } else if (open && mode === 'create') {
      // Reset form for create mode
      setItem(null)
      setFormData(getDefaultFormData())
      setErrors({})
      setLoadError(null)
    }
  }, [open, itemId, mode])

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  // Load item data from API
  const loadItemData = async () => {
    if (!itemId) return

    setIsLoading(true)
    setLoadError(null)

    try {
      console.log(`[UnifiedWorkflowModal] Loading ${sectionType} ${itemId}`)
      const data = await apiService.getDetail(medidaId, itemId)
      setItem(data)
      setFormData(data)
      console.log(`[UnifiedWorkflowModal] Loaded successfully:`, data)
    } catch (error: any) {
      console.error(`[UnifiedWorkflowModal] Error loading ${sectionType}:`, error)
      setLoadError(error.message || 'Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  // Get default form data
  const getDefaultFormData = (): Record<string, any> => {
    const defaults: Record<string, any> = {}

    config.fields.forEach((field) => {
      if (field.type === 'checkbox') {
        defaults[field.name] = false
      } else {
        defaults[field.name] = ''
      }
    })

    return defaults
  }

  // Handle form field change
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    config.fields.forEach((field) => {
      const value = formData[field.name]

      // Required field validation
      if (field.required && !value) {
        newErrors[field.name] = `${field.label} es obligatorio`
      }

      // Min length validation
      if (field.minLength && value && value.length < field.minLength) {
        newErrors[field.name] = `${field.label} debe tener al menos ${field.minLength} caracteres`
      }

      // Max length validation
      if (field.maxLength && value && value.length > field.maxLength) {
        newErrors[field.name] = `${field.label} no puede exceder ${field.maxLength} caracteres`
      }

      // Min/Max number validation
      if (field.type === 'number') {
        if (field.min !== undefined && value < field.min) {
          newErrors[field.name] = `${field.label} debe ser mayor o igual a ${field.min}`
        }
        if (field.max !== undefined && value > field.max) {
          newErrors[field.name] = `${field.label} debe ser menor o igual a ${field.max}`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save (create or update)
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      console.log(`[UnifiedWorkflowModal] Saving ${sectionType}:`, formData)

      let savedItem: WorkflowItem

      if (mode === 'create') {
        savedItem = await apiService.create(medidaId, formData)
        console.log(`[UnifiedWorkflowModal] Created successfully:`, savedItem)
      } else if (mode === 'edit' && itemId) {
        if (!apiService.update) {
          throw new Error('Update not supported for this document type')
        }
        savedItem = await apiService.update(medidaId, itemId, formData)
        console.log(`[UnifiedWorkflowModal] Updated successfully:`, savedItem)
      } else {
        throw new Error('Invalid mode or missing itemId')
      }

      // Call success callback
      if (onSaved) {
        onSaved(savedItem)
      }

      // Close modal
      onClose()
    } catch (error: any) {
      console.error(`[UnifiedWorkflowModal] Error saving ${sectionType}:`, error)
      setLoadError(error.message || 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!itemId || !apiService.delete) return

    if (!confirm('¿Está seguro que desea eliminar este registro?')) {
      return
    }

    setIsSaving(true)

    try {
      console.log(`[UnifiedWorkflowModal] Deleting ${sectionType} ${itemId}`)
      await apiService.delete(medidaId, itemId)
      console.log(`[UnifiedWorkflowModal] Deleted successfully`)

      if (onDeleted) {
        onDeleted()
      }

      onClose()
    } catch (error: any) {
      console.error(`[UnifiedWorkflowModal] Error deleting ${sectionType}:`, error)
      setLoadError(error.message || 'Error al eliminar')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle state action (enviar, aprobar, rechazar)
  const handleStateAction = async (action: 'enviar' | 'aprobar' | 'rechazar') => {
    if (!itemId || !item) return

    // Get action config
    const actionConfig = config.customActions?.find((a) => a.action === action)

    // Check if confirmation is required
    if (actionConfig?.requiresConfirmation) {
      const confirmed = confirm(
        actionConfig.confirmationMessage || `¿Está seguro que desea ${action} este registro?`
      )
      if (!confirmed) return
    }

    // Check if input is required (e.g., rejection reason)
    let inputValue: string | undefined
    if (actionConfig?.requiresInput) {
      inputValue = prompt(actionConfig.requiresInput.label)
      if (!inputValue || (actionConfig.requiresInput.minLength && inputValue.length < actionConfig.requiresInput.minLength)) {
        alert('Debe proporcionar un motivo válido')
        return
      }
    }

    setIsSaving(true)

    try {
      console.log(`[UnifiedWorkflowModal] Performing action ${action} on ${sectionType} ${itemId}`)

      let result: WorkflowItem

      if (action === 'enviar' && apiService.stateActions?.enviar) {
        result = await apiService.stateActions.enviar(medidaId, itemId)
      } else if (action === 'aprobar' && apiService.stateActions?.aprobar) {
        result = await apiService.stateActions.aprobar(medidaId, itemId)
      } else if (action === 'rechazar' && apiService.stateActions?.rechazar) {
        result = await apiService.stateActions.rechazar(medidaId, itemId, inputValue || '')
      } else {
        throw new Error(`Action ${action} not supported`)
      }

      console.log(`[UnifiedWorkflowModal] Action ${action} completed:`, result)

      // Reload item data
      await loadItemData()

      // Show success message
      alert(actionConfig?.successMessage || `${action} completado exitosamente`)
    } catch (error: any) {
      console.error(`[UnifiedWorkflowModal] Error performing action ${action}:`, error)
      alert(actionConfig?.errorMessage || `Error al ${action}: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Switch to edit mode
  const handleSwitchToEdit = () => {
    setMode('edit')
  }

  // Render form field
  const renderField = (field: FieldConfig) => {
    const value = formData[field.name] || ''
    const error = errors[field.name]
    const disabled = mode === 'view' || field.disabled

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <TextField
            fullWidth
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={disabled}
            required={field.required}
            error={!!error}
            helperText={error || field.helperText}
            placeholder={field.placeholder}
          />
        )

      case 'textarea':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={disabled}
            required={field.required}
            error={!!error}
            helperText={error || field.helperText}
            placeholder={field.placeholder}
            multiline
            rows={field.rows || 4}
          />
        )

      case 'select':
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              disabled={disabled}
              required={field.required}
              label={field.label}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || field.helperText) && (
              <FormHelperText>{error || field.helperText}</FormHelperText>
            )}
          </FormControl>
        )

      case 'radio':
        return (
          <FormControl component="fieldset" error={!!error}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {field.label} {field.required && '*'}
            </Typography>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  disabled={disabled}
                />
              ))}
            </RadioGroup>
            {(error || field.helperText) && (
              <FormHelperText>{error || field.helperText}</FormHelperText>
            )}
          </FormControl>
        )

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                disabled={disabled}
              />
            }
            label={field.label}
          />
        )

      case 'date':
        return (
          <TextField
            fullWidth
            label={field.label}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            disabled={disabled}
            required={field.required}
            error={!!error}
            helperText={error || field.helperText}
            InputLabelProps={{ shrink: true }}
          />
        )

      default:
        return null
    }
  }

  // Render custom action buttons
  const renderCustomActions = () => {
    if (!config.customActions || mode !== 'view' || !item) return null

    return config.customActions
      .filter((action) => {
        // Check condition
        if (action.condition && !action.condition(item)) {
          return false
        }

        // Check role requirement
        if (action.requiresRole && !canPerformStateAction(item, item, action.action as any, config.permissions as any)) {
          return false
        }

        return true
      })
      .map((action, idx) => {
        let icon = action.icon
        if (action.action === 'enviar') icon = <SendIcon />
        if (action.action === 'aprobar') icon = <CheckCircleIcon />
        if (action.action === 'rechazar') icon = <CancelIcon />

        return (
          <Button
            key={idx}
            variant="contained"
            color={action.color || 'primary'}
            startIcon={icon}
            onClick={() => handleStateAction(action.action as any)}
            disabled={isSaving}
          >
            {action.label}
          </Button>
        )
      })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={config.width || 'md'}
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {mode === 'create' ? `Nuevo ${config.title}` : config.title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : loadError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        ) : (
          <>
            {/* Form Fields */}
            <Grid container spacing={2}>
              {config.fields.map((field) => (
                <Grid item {...(field.grid || { xs: 12 })} key={field.name}>
                  {renderField(field)}
                </Grid>
              ))}
            </Grid>

            {/* File Upload Section */}
            {config.fileUploadConfig?.allowed && itemId && mode !== 'create' && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Archivos Adjuntos
                </Typography>
                <AttachmentUpload
                  medidaId={medidaId}
                  intervencionId={itemId}
                  tipoMedida={tipoMedida || 'MPE'}
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {mode === 'view' ? (
          <>
            {/* View Mode Actions */}
            {renderCustomActions()}

            {config.allowEdit && permissions.canEdit && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleSwitchToEdit}
              >
                Editar
              </Button>
            )}

            {config.allowDelete && permissions.canDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={isSaving}
              >
                Eliminar
              </Button>
            )}

            <Button onClick={onClose}>Cerrar</Button>
          </>
        ) : (
          <>
            {/* Edit/Create Mode Actions */}
            <Button onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : config.submitButtonText || 'Guardar'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
