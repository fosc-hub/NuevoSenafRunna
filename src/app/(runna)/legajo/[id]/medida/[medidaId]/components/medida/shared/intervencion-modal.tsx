"use client"

/**
 * IntervencionModal - Reusable Intervention Registration Modal
 *
 * Unified modal component that works for MPI, MPE, and MPJ medida types.
 * Extracted and refactored from RegistroIntervencionModal for reusability.
 *
 * Features:
 * - 5-step wizard workflow (Información Básica → Detalles → Documentos → Plan de Trabajo → Configuración)
 * - Workflow states: BORRADOR → ENVIADO → APROBADO/RECHAZADO
 * - Plan de Trabajo integration
 * - File attachment management
 * - Complete validation and error handling
 * - Reusable across MPI, MPE, and MPJ
 *
 * @see useRegistroIntervencion - Business logic hook (preserved as-is)
 */

import type React from "react"
import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Paper,
    Divider,
    Card,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    CircularProgress,
    FormHelperText,
    Snackbar,
    Chip,
} from "@mui/material"
import { useState, useEffect } from "react"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import PersonIcon from "@mui/icons-material/Person"
import BusinessIcon from "@mui/icons-material/Business"
import DescriptionIcon from "@mui/icons-material/Description"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import SaveIcon from "@mui/icons-material/Save"
import SendIcon from "@mui/icons-material/Send"

// Import atomic components
import { WizardModal, type WizardStep } from "./wizard-modal"
import { WorkflowStateActions } from "./workflow-state-actions"
import { PersonalInfoCard } from "./personal-info-card"
import { FileUploadSection, type FileItem } from "./file-upload-section"
import { RejectionDialog } from "./rejection-dialog"

// Import Plan de Trabajo Tab
import { PlanTrabajoTab } from "../mpe-tabs/plan-trabajo-tab"

// Import business logic hook
import { useRegistroIntervencion } from "../../../hooks/useRegistroIntervencion"

// ============================================================================
// TYPES
// ============================================================================

export interface IntervencionModalProps {
    open: boolean
    onClose: () => void
    medidaId?: number // Made optional with validation
    intervencionId?: number // If editing existing intervención
    legajoData?: {
        numero: string
        persona_nombre: string
        persona_apellido: string
        zona_nombre: string
    }
    tipoMedida?: 'MPI' | 'MPE' | 'MPJ' // NEW: For dynamic title and behavior
    workflowPhase?: 'apertura' | 'innovacion' | 'prorroga' | 'cese' // NEW: For MPE/MPJ tabs
    onSaved?: () => void // Callback after successful save
}

// ============================================================================
// COMPONENT
// ============================================================================

export const IntervencionModal: React.FC<IntervencionModalProps> = ({
    open,
    onClose,
    medidaId,
    intervencionId,
    legajoData,
    tipoMedida = 'MPI',
    workflowPhase,
    onSaved
}) => {
    // ============================================================================
    // HOOK - Registro Intervención (PRESERVED AS-IS)
    // ============================================================================
    const {
        formData,
        updateField,
        intervencion,
        currentEstado,
        isLoading,
        isSaving,
        error,
        validationErrors,
        clearErrors,
        guardarBorrador,
        tiposDispositivo,
        motivos,
        subMotivos,
        categorias,
        isLoadingCatalogs,
        adjuntos,
        isLoadingAdjuntos,
        uploadAdjuntoFile,
        deleteAdjuntoFile,
        isUploadingAdjunto,
        canEdit,
        enviar,
        aprobar,
        rechazar,
        isEnviando,
        isAprobando,
        isRechazando,
        canEnviar,
        canAprobarOrRechazar,
    } = useRegistroIntervencion({
        medidaId: medidaId!,
        intervencionId,
        autoLoadCatalogs: true,
    })

    // ============================================================================
    // LOCAL STATE
    // ============================================================================
    const [activeStep, setActiveStep] = useState(0)
    const [validationError, setValidationError] = useState<string | null>(null)

    // Validate medidaId on mount
    useEffect(() => {
        if (open && !medidaId) {
            setValidationError('Error: medidaId no está definido. No se pueden cargar las intervenciones.')
        } else {
            setValidationError(null)
        }
    }, [open, medidaId])

    const [showSuccessMessage, setShowSuccessMessage] = useState(false)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])

    // Rejection dialog state
    const [rechazarDialogOpen, setRechazarDialogOpen] = useState(false)
    const [observaciones, setObservaciones] = useState("")

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{
        open: boolean
        message: string
        severity: 'success' | 'error' | 'info'
    }>({
        open: false,
        message: '',
        severity: 'success'
    })

    // ============================================================================
    // EFFECTS
    // ============================================================================
    useEffect(() => {
        if (open) {
            clearErrors()
            setPendingFiles([])
        }
    }, [open, clearErrors])

    // ============================================================================
    // HANDLERS - Navigation
    // ============================================================================
    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1)
    }

    const handleStepClick = (step: number) => {
        setActiveStep(step)
    }

    // ============================================================================
    // HANDLERS - Save & State Transitions
    // ============================================================================
    const handleSave = async () => {
        const result = await guardarBorrador()
        if (result) {
            setShowSuccessMessage(true)
            if (onSaved) {
                onSaved()
            }
            // Close after short delay to show success message
            setTimeout(() => {
                onClose()
            }, 1500)
        }
    }

    const handleEnviar = async () => {
        try {
            // If no intervencionId, save first
            if (!intervencionId) {
                setSnackbar({
                    open: true,
                    message: 'Guardando intervención antes de enviar...',
                    severity: 'info'
                })
                const saved = await guardarBorrador()
                if (!saved) {
                    setSnackbar({
                        open: true,
                        message: 'Debe guardar la intervención antes de enviar a aprobación',
                        severity: 'error'
                    })
                    return
                }
                // Wait a moment for state to update
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            const result = await enviar()
            if (result) {
                setSnackbar({
                    open: true,
                    message: 'Intervención enviada a aprobación exitosamente',
                    severity: 'success'
                })
                if (onSaved) {
                    onSaved()
                }
                setTimeout(() => {
                    onClose()
                }, 1500)
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al enviar la intervención',
                severity: 'error'
            })
        }
    }

    const handleAprobar = async () => {
        try {
            const result = await aprobar()
            if (result) {
                setSnackbar({
                    open: true,
                    message: 'Intervención aprobada exitosamente',
                    severity: 'success'
                })
                if (onSaved) {
                    onSaved()
                }
                setTimeout(() => {
                    onClose()
                }, 1500)
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al aprobar la intervención',
                severity: 'error'
            })
        }
    }

    const handleRechazarClick = () => {
        setRechazarDialogOpen(true)
    }

    const handleRechazarConfirm = async (observaciones: string) => {
        try {
            const result = await rechazar(observaciones)
            if (result) {
                setSnackbar({
                    open: true,
                    message: 'Intervención rechazada. Se notificará al equipo técnico.',
                    severity: 'success'
                })
                setRechazarDialogOpen(false)
                if (onSaved) {
                    onSaved()
                }
                setTimeout(() => {
                    onClose()
                }, 1500)
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al rechazar la intervención',
                severity: 'error'
            })
        }
    }

    const handleRechazarCancel = () => {
        setRechazarDialogOpen(false)
    }

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false })
    }

    // ============================================================================
    // HANDLERS - File Management
    // ============================================================================
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files) {
            setPendingFiles((prev) => [...prev, ...Array.from(files)])
        }
    }

    const handleFileUpload = async (file: File) => {
        await uploadAdjuntoFile(file, 'RESPALDO')
        // Remove from pending after successful upload
        setPendingFiles((prev) => prev.filter(f => f !== file))
    }

    const handleRemovePendingFile = (index: number) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleDownloadFile = (file: FileItem) => {
        if (file.url) {
            // Use the same base URL approach as axiosInstance
            // NEXT_PUBLIC_API_URL is like: http://localhost:8000/api or https://...railway.app/api
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://web-runna-v2legajos.up.railway.app/api'

            // Extract base origin (remove /api suffix if present)
            const baseOrigin = apiUrl.replace(/\/api\/?$/, '')

            // Construct full URL
            const downloadUrl = file.url.startsWith('http://') || file.url.startsWith('https://')
                ? file.url
                : `${baseOrigin}${file.url}`

            // Open in new tab to trigger download
            window.open(downloadUrl, '_blank')
        }
    }

    // Map adjuntos to FileItem format
    const mappedAdjuntos: FileItem[] = adjuntos.map(adj => ({
        id: adj.id,
        nombre: adj.nombre_original,
        tipo: adj.tipo_display || adj.tipo,
        url: adj.url_descarga || adj.archivo,
        fecha_subida: adj.fecha_subida,
        tamano: adj.tamaño_bytes,
    }))

    // ============================================================================
    // STEP CONTENT DEFINITIONS
    // ============================================================================

    const getStepContent = (step: number): React.ReactNode => {
        switch (step) {
            case 0: // Información Básica
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" onClose={clearErrors}>
                                {error}
                            </Alert>
                        )}

                        {/* Personal Info Card - REFACTORED with atomic component */}
                        <PersonalInfoCard
                            data={{
                                codigo: intervencion?.codigo_intervencion,
                                fecha: formData.fecha_intervencion,
                                legajoNumero: legajoData?.numero || intervencion?.legajo_numero,
                                personaNombre: legajoData?.persona_nombre || intervencion?.persona_nombre,
                                personaApellido: legajoData?.persona_apellido || intervencion?.persona_apellido,
                                zonaNombre: legajoData?.zona_nombre || intervencion?.zona_nombre,
                            }}
                            readOnly={!canEdit}
                            showCodigo={true}
                            showFecha={true}
                            onFechaChange={(fecha) => updateField('fecha_intervencion', fecha)}
                            fechaRequired={true}
                            fechaError={validationErrors.fecha_intervencion}
                        />

                        {/* Tipo de Dispositivo Section - PRESERVED as-is (intervention-specific) */}
                        <Card elevation={2} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <BusinessIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Tipo de Dispositivo
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Tipo de dispositivo (opcional)</InputLabel>
                                    <Select
                                        value={formData.tipo_dispositivo_id || ''}
                                        onChange={(e) => updateField('tipo_dispositivo_id', e.target.value ? Number(e.target.value) : null)}
                                        label="Tipo de dispositivo (opcional)"
                                        disabled={!canEdit || isLoadingCatalogs}
                                    >
                                        <MenuItem value="">Sin especificar</MenuItem>
                                        {tiposDispositivo.map((tipo) => (
                                            <MenuItem key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {intervencion?.tipo_dispositivo_detalle && (
                                        <FormHelperText>
                                            Actual: {intervencion.tipo_dispositivo_detalle.nombre}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Box>
                        </Card>
                    </Box>
                )

            case 1: // Detalles de Intervención - PRESERVED as-is
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" onClose={clearErrors}>
                                {error}
                            </Alert>
                        )}

                        <Card elevation={2} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <DescriptionIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Detalles de la Intervención
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                                <FormControl fullWidth required error={!!validationErrors.motivo_id}>
                                    <InputLabel>Motivo de Intervención</InputLabel>
                                    <Select
                                        value={formData.motivo_id || ''}
                                        onChange={(e) => updateField('motivo_id', Number(e.target.value))}
                                        label="Motivo de Intervención"
                                        disabled={!canEdit || isLoadingCatalogs}
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        {motivos.map((motivo) => (
                                            <MenuItem key={motivo.id} value={motivo.id}>
                                                {motivo.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {validationErrors.motivo_id && (
                                        <FormHelperText>{validationErrors.motivo_id}</FormHelperText>
                                    )}
                                    {intervencion?.motivo_detalle && (
                                        <FormHelperText>Actual: {intervencion.motivo_detalle.nombre}</FormHelperText>
                                    )}
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Submotivo (opcional)</InputLabel>
                                    <Select
                                        value={formData.sub_motivo_id || ''}
                                        onChange={(e) => updateField('sub_motivo_id', e.target.value ? Number(e.target.value) : null)}
                                        label="Submotivo (opcional)"
                                        disabled={!canEdit || !formData.motivo_id || isLoadingCatalogs}
                                    >
                                        <MenuItem value="">Sin especificar</MenuItem>
                                        {subMotivos.map((submotivo) => (
                                            <MenuItem key={submotivo.id} value={submotivo.id}>
                                                {submotivo.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {!formData.motivo_id && (
                                        <FormHelperText>Seleccione primero un motivo</FormHelperText>
                                    )}
                                    {intervencion?.sub_motivo_detalle && (
                                        <FormHelperText>Actual: {intervencion.sub_motivo_detalle.nombre}</FormHelperText>
                                    )}
                                </FormControl>

                                <FormControl fullWidth required error={!!validationErrors.categoria_intervencion_id}>
                                    <InputLabel>Categoría de intervención</InputLabel>
                                    <Select
                                        value={formData.categoria_intervencion_id || ''}
                                        onChange={(e) => updateField('categoria_intervencion_id', Number(e.target.value))}
                                        label="Categoría de intervención"
                                        disabled={!canEdit || isLoadingCatalogs}
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        {categorias.map((categoria) => (
                                            <MenuItem key={categoria.id} value={categoria.id}>
                                                {categoria.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {validationErrors.categoria_intervencion_id && (
                                        <FormHelperText>{validationErrors.categoria_intervencion_id}</FormHelperText>
                                    )}
                                    {intervencion?.categoria_intervencion_detalle && (
                                        <FormHelperText>Actual: {intervencion.categoria_intervencion_detalle.nombre}</FormHelperText>
                                    )}
                                </FormControl>

                                {/* Estado (read-only) */}
                                {intervencion && (
                                    <TextField
                                        label="Estado"
                                        value={intervencion.estado_display}
                                        disabled
                                        variant="outlined"
                                        helperText="El estado cambia según el flujo de aprobación"
                                    />
                                )}
                            </Box>

                            <TextField
                                label="Intervención específica"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData.intervencion_especifica}
                                onChange={(e) => updateField('intervencion_especifica', e.target.value)}
                                placeholder="Descripción específica de la intervención realizada..."
                                required
                                disabled={!canEdit}
                                error={!!validationErrors.intervencion_especifica}
                                helperText={validationErrors.intervencion_especifica || "Obligatorio"}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                label="Descripción detallada"
                                multiline
                                rows={4}
                                fullWidth
                                value={formData.descripcion_detallada}
                                onChange={(e) => updateField('descripcion_detallada', e.target.value)}
                                placeholder="Descripción adicional o contexto de la intervención..."
                                disabled={!canEdit}
                                helperText="Opcional - Proporcione contexto adicional si es necesario"
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                label="Motivo de vulneraciones"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData.motivo_vulneraciones}
                                onChange={(e) => updateField('motivo_vulneraciones', e.target.value)}
                                placeholder="Descripción de vulneraciones de derechos detectadas..."
                                disabled={!canEdit}
                                helperText="Opcional - Describa las vulneraciones de derechos si aplica"
                            />
                        </Card>
                    </Box>
                )

            case 2: // Documentos y Archivos - REFACTORED with atomic component
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Card elevation={2} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <UploadFileIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Documentos y Archivos
                                </Typography>
                            </Box>

                            {!intervencion && (
                                <Alert severity="warning" sx={{ mb: 3 }}>
                                    <Typography variant="body2">
                                        Primero debe guardar la intervención como borrador para poder subir adjuntos.
                                    </Typography>
                                </Alert>
                            )}

                            {intervencion && (
                                <>
                                    <Alert severity="info" sx={{ mb: 3 }}>
                                        <Typography variant="body2">
                                            Adjunte los documentos relacionados con la intervención (modelos, actas, respaldos, informes).
                                        </Typography>
                                    </Alert>

                                    {/* File Upload Section - REFACTORED with atomic component */}
                                    <FileUploadSection
                                        files={mappedAdjuntos}
                                        isLoading={isLoadingAdjuntos}
                                        onUpload={handleFileUpload}
                                        onDownload={handleDownloadFile}
                                        onDelete={(fileId) => deleteAdjuntoFile(Number(fileId))}
                                        allowedTypes=".pdf,.jpg,.jpeg,.png"
                                        maxSizeInMB={10}
                                        disabled={!canEdit}
                                        readOnly={!canEdit}
                                        title="Archivos subidos"
                                        uploadButtonLabel="Seleccionar archivos"
                                        emptyMessage="No hay archivos adjuntos aún."
                                        isUploading={isUploadingAdjunto}
                                    />

                                    {/* Pending files section - PRESERVED */}
                                    {pendingFiles.length > 0 && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                                Archivos pendientes de subir ({pendingFiles.length})
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                                {pendingFiles.map((file, index) => (
                                                    <Paper
                                                        key={index}
                                                        elevation={1}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            p: 2,
                                                            borderRadius: 2,
                                                            backgroundColor: 'rgba(255, 152, 0, 0.05)',
                                                            border: '1px solid rgba(255, 152, 0, 0.2)'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <AttachFileIcon sx={{ color: 'warning.main', mr: 1 }} />
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    {file.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {(file.size / 1024).toFixed(2)} KB • Pendiente
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => handleFileUpload(file)}
                                                                disabled={isUploadingAdjunto}
                                                            >
                                                                Subir
                                                            </Button>
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Card>
                    </Box>
                )

            case 3: // Plan de Trabajo - PRESERVED as-is
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Card elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Plan de Trabajo
                            </Typography>
                            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                                <PlanTrabajoTab medidaData={{}} />
                            </Box>
                        </Card>
                    </Box>
                )

            case 4: // Configuración Adicional - PRESERVED as-is
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Card elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Configuración Adicional
                            </Typography>

                            {/* Informes ampliatorios */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Informes ampliatorios
                                </Typography>
                                <FormControl component="fieldset">
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        ¿Se requieren informes ampliatorios?
                                    </Typography>
                                    <RadioGroup
                                        row
                                        value={formData.requiere_informes_ampliatorios ? "Si" : "No"}
                                        onChange={(e) => updateField('requiere_informes_ampliatorios', e.target.value === "Si")}
                                    >
                                        <FormControlLabel value="Si" control={<Radio />} label="Sí" disabled={!canEdit} />
                                        <FormControlLabel value="No" control={<Radio />} label="No" disabled={!canEdit} />
                                    </RadioGroup>
                                </FormControl>
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Los informes ampliatorios se pueden adjuntar en la sección de documentos
                                </Alert>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Estado actual y acciones */}
                            {intervencion && (
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                        Estado actual
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Chip
                                            label={intervencion.estado_display}
                                            color={
                                                intervencion.estado === 'APROBADO' ? 'success' :
                                                intervencion.estado === 'ENVIADO' ? 'info' :
                                                intervencion.estado === 'RECHAZADO' ? 'error' :
                                                'default'
                                            }
                                            sx={{ fontWeight: 600 }}
                                        />
                                        {intervencion.fecha_envio && (
                                            <Typography variant="caption" color="text.secondary">
                                                Enviado: {new Date(intervencion.fecha_envio).toLocaleString('es-AR')}
                                            </Typography>
                                        )}
                                    </Box>

                                    {intervencion.observaciones_jz && (
                                        <Alert severity="warning" sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                Observaciones del Jefe Zonal:
                                            </Typography>
                                            <Typography variant="body2">
                                                {intervencion.observaciones_jz}
                                            </Typography>
                                        </Alert>
                                    )}

                                    {/* Metadata */}
                                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Registrado por: {intervencion.registrado_por_detalle?.nombre_completo || intervencion.registrado_por_detalle?.username || 'N/A'}
                                        </Typography>
                                        {intervencion.aprobado_por_detalle && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Aprobado por: {intervencion.aprobado_por_detalle.nombre_completo || intervencion.aprobado_por_detalle.username || 'N/A'}
                                            </Typography>
                                        )}
                                        {intervencion.rechazado_por_detalle && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Rechazado por: {intervencion.rechazado_por_detalle.nombre_completo || intervencion.rechazado_por_detalle.username || 'N/A'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Card>
                    </Box>
                )

            default:
                return 'Paso desconocido'
        }
    }

    // ============================================================================
    // WIZARD STEPS CONFIGURATION
    // ============================================================================

    const wizardSteps: WizardStep[] = [
        { label: 'Información Básica', content: getStepContent(0) },
        { label: 'Detalles de Intervención', content: getStepContent(1) },
        { label: 'Documentos y Archivos', content: getStepContent(2) },
        { label: 'Plan de Trabajo', content: getStepContent(3) },
        { label: 'Configuración Adicional', content: getStepContent(4) },
    ]

    // Dynamic title based on tipoMedida
    const modalTitle = `Registro de Intervención ${tipoMedida}${workflowPhase ? ` - ${workflowPhase.charAt(0).toUpperCase() + workflowPhase.slice(1)}` : ''}`

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <>
            {/* Main Wizard Modal - REFACTORED with atomic component */}
            <WizardModal
                open={open}
                onClose={onClose}
                title={modalTitle}
                steps={wizardSteps}
                activeStep={activeStep}
                onNext={handleNext}
                onBack={handleBack}
                onStepClick={handleStepClick}
                maxWidth="lg"
                fullWidth={true}
                showProgress={true}
                allowStepClick={true}
                primaryAction={{
                    label: activeStep === wizardSteps.length - 1 ? "Finalizar" : "Siguiente",
                    onClick: activeStep === wizardSteps.length - 1 ? handleSave : handleNext,
                    disabled: isSaving || isLoading,
                    icon: activeStep === wizardSteps.length - 1 ? <SaveIcon /> : undefined,
                }}
                secondaryActions={[
                    // Save button (always available when canEdit)
                    ...(canEdit ? [{
                        label: intervencionId ? "Actualizar" : "Guardar Borrador",
                        onClick: handleSave,
                        disabled: isSaving || isLoading,
                        icon: <SaveIcon />,
                        variant: "outlined" as const,
                        color: "primary" as const,
                    }] : []),
                    // Enviar button (BORRADOR state)
                    ...(!intervencion || (canEnviar && currentEstado === 'BORRADOR') ? [{
                        label: "Enviar a Aprobación",
                        onClick: handleEnviar,
                        disabled: isEnviando || isSaving || isLoading,
                        icon: <SendIcon />,
                        variant: "contained" as const,
                        color: "primary" as const,
                    }] : []),
                    // Aprobar button (ENVIADO state)
                    ...(canAprobarOrRechazar && currentEstado === 'ENVIADO' ? [{
                        label: "Aprobar",
                        onClick: handleAprobar,
                        disabled: isAprobando || isRechazando || isLoading,
                        icon: <CheckCircleIcon />,
                        variant: "contained" as const,
                        color: "success" as const,
                    }] : []),
                    // Rechazar button (ENVIADO state)
                    ...(canAprobarOrRechazar && currentEstado === 'ENVIADO' ? [{
                        label: "Rechazar",
                        onClick: handleRechazarClick,
                        disabled: isAprobando || isRechazando || isLoading,
                        variant: "outlined" as const,
                        color: "error" as const,
                    }] : []),
                ]}
            />

            {/* Rejection Dialog - PRESERVED (already using atomic component) */}
            <RejectionDialog
                open={rechazarDialogOpen}
                onClose={handleRechazarCancel}
                onConfirm={handleRechazarConfirm}
                title="Rechazar Intervención"
                description="Ingrese las observaciones o motivos del rechazo. Esta información será enviada al equipo técnico."
                observacionesLabel="Observaciones *"
                observacionesPlaceholder="Describa los motivos del rechazo..."
                confirmButtonLabel="Confirmar Rechazo"
                cancelButtonLabel="Cancelar"
                isSubmitting={isRechazando}
                minLength={10}
                required={true}
            />

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccessMessage}
                autoHideDuration={3000}
                onClose={() => setShowSuccessMessage(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowSuccessMessage(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                    icon={<CheckCircleIcon />}
                >
                    Intervención guardada exitosamente
                </Alert>
            </Snackbar>

            {/* State Transition Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}
