"use client"

import type React from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Paper,
    Divider,
    Card,
    CardContent,
    RadioGroup,
    FormControlLabel,
    Radio,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stepper,
    Step,
    StepLabel,
    Chip,
    Alert,
    LinearProgress,
    CircularProgress,
    FormHelperText,
    Snackbar
} from "@mui/material"
import { useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import DownloadIcon from "@mui/icons-material/Download"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import EmailIcon from "@mui/icons-material/Email"
import SaveIcon from "@mui/icons-material/Save"
import SendIcon from "@mui/icons-material/Send"
import PersonIcon from "@mui/icons-material/Person"
import BusinessIcon from "@mui/icons-material/Business"
import DescriptionIcon from "@mui/icons-material/Description"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { PlanTrabajoTab } from "./mpe-tabs/plan-trabajo-tab"
import { useRegistroIntervencion } from "../../hooks/useRegistroIntervencion"

interface RegistroIntervencionModalProps {
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
    tipoMedida?: 'MPI' | 'MPE' | 'MPJ' // For dynamic title
    onSaved?: () => void // Callback after successful save
}

export const RegistroIntervencionModal: React.FC<RegistroIntervencionModalProps> = ({
    open,
    onClose,
    medidaId,
    intervencionId,
    legajoData,
    tipoMedida = 'MPE',
    onSaved
}) => {
    // ============================================================================
    // HOOK - Registro Intervención
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

    const steps = [
        'Información Básica',
        'Detalles de Intervención',
        'Documentos y Archivos',
        'Plan de Trabajo',
        'Configuración Adicional'
    ]

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
    // HANDLERS
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

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files) {
            setPendingFiles((prev) => [...prev, ...Array.from(files)])
        }
    }

    const handleFileUpload = async (file: File, tipo: string) => {
        await uploadAdjuntoFile(file, tipo)
    }

    const handleRemovePendingFile = (index: number) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    }

    // State transition handlers
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

    const handleRechazarConfirm = async () => {
        if (!observaciones.trim()) {
            setSnackbar({
                open: true,
                message: 'Debe ingresar observaciones para rechazar',
                severity: 'error'
            })
            return
        }

        try {
            const result = await rechazar(observaciones)
            if (result) {
                setSnackbar({
                    open: true,
                    message: 'Intervención rechazada. Se notificará al equipo técnico.',
                    severity: 'success'
                })
                setRechazarDialogOpen(false)
                setObservaciones("")
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
        setObservaciones("")
    }

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false })
    }

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
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
                                <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Información Personal
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                <TextField
                                    label="Código"
                                    value={intervencion?.codigo_intervencion || "Autogenerado"}
                                    disabled
                                    variant="outlined"
                                    helperText="Este código se genera automáticamente al guardar"
                                />
                                <TextField
                                    label="Fecha de intervención"
                                    type="date"
                                    value={formData.fecha_intervencion}
                                    onChange={(e) => updateField('fecha_intervencion', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    disabled={!canEdit}
                                    error={!!validationErrors.fecha_intervencion}
                                    helperText={validationErrors.fecha_intervencion}
                                />
                                <TextField
                                    label="Legajo"
                                    value={legajoData?.numero || intervencion?.legajo_numero || ""}
                                    disabled
                                    variant="outlined"
                                    helperText="Datos del legajo (autocompletado)"
                                />
                                <Box />
                                <TextField
                                    label="Nombre"
                                    value={legajoData?.persona_nombre || intervencion?.persona_nombre || ""}
                                    disabled
                                    variant="outlined"
                                />
                                <TextField
                                    label="Apellido"
                                    value={legajoData?.persona_apellido || intervencion?.persona_apellido || ""}
                                    disabled
                                    variant="outlined"
                                />
                                <TextField
                                    label="Zona/UDER"
                                    value={legajoData?.zona_nombre || intervencion?.zona_nombre || ""}
                                    disabled
                                    variant="outlined"
                                    sx={{ gridColumn: { md: 'span 2' } }}
                                />
                            </Box>
                        </Card>

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

            case 1:
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

            case 2:
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

                                    <Paper
                                        component="label"
                                        sx={{
                                            border: '2px dashed #2196f3',
                                            borderRadius: 2,
                                            p: 4,
                                            textAlign: 'center',
                                            mb: 3,
                                            backgroundColor: 'rgba(33, 150, 243, 0.02)',
                                            cursor: intervencion && canEdit ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s ease',
                                            opacity: intervencion && canEdit ? 1 : 0.5,
                                            '&:hover': intervencion && canEdit ? {
                                                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                                                borderColor: '#1976d2'
                                            } : {}
                                        }}
                                    >
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileSelect}
                                            disabled={!intervencion || !canEdit}
                                        />
                                        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                            Arrastra archivos aquí o haz clic para seleccionar
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {isUploadingAdjunto ? "Subiendo archivo..." : "Selecciona los archivos a adjuntar"}
                                        </Typography>
                                        <Chip
                                            label="Solo archivos .jpg, .png, .pdf - Máximo 10MB"
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Paper>

                                    {/* Pending files to upload */}
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
                                                                onClick={() => handleFileUpload(file, 'RESPALDO')}
                                                                disabled={isUploadingAdjunto}
                                                            >
                                                                Subir
                                                            </Button>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleRemovePendingFile(index)}
                                                                disabled={isUploadingAdjunto}
                                                            >
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Already uploaded files */}
                                    {isLoadingAdjuntos ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : adjuntos.length > 0 ? (
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                                Archivos subidos ({adjuntos.length})
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                                {adjuntos.map((adjunto) => (
                                                    <Paper
                                                        key={adjunto.id}
                                                        elevation={1}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            p: 2,
                                                            borderRadius: 2,
                                                            backgroundColor: 'rgba(76, 175, 80, 0.05)',
                                                            border: '1px solid rgba(76, 175, 80, 0.2)'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <AttachFileIcon sx={{ color: 'success.main', mr: 1 }} />
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    {adjunto.nombre_archivo}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {(adjunto.tamano_bytes / 1024).toFixed(2)} KB • {adjunto.tipo}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <IconButton
                                                                size="small"
                                                                href={adjunto.archivo}
                                                                target="_blank"
                                                                color="primary"
                                                            >
                                                                <DownloadIcon fontSize="small" />
                                                            </IconButton>
                                                            {canEdit && (
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => deleteAdjuntoFile(adjunto.id)}
                                                                >
                                                                    <CloseIcon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Alert severity="info">
                                            No hay archivos adjuntos aún.
                                        </Alert>
                                    )}
                                </>
                            )}
                        </Card>
                    </Box>
                )

            case 3:
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

            case 4:
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
                                                Aprobado por: {intervencion.aprobado_por_detalle.nombre_completo || intervencion.aprobado_por_detalle.username}
                                            </Typography>
                                        )}
                                        {intervencion.rechazado_por_detalle && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Rechazado por: {intervencion.rechazado_por_detalle.nombre_completo || intervencion.rechazado_por_detalle.username}
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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '95vh',
                    height: '95vh'
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '1.5rem',
                position: 'relative',
                pb: 1,
                borderBottom: '1px solid #e0e0e0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                Registro de Intervención {tipoMedida}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white',
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Progress Stepper */}
            <Box sx={{ px: 4, py: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel
                                sx={{
                                    cursor: 'pointer',
                                    '& .MuiStepLabel-label': {
                                        fontSize: '0.875rem',
                                        fontWeight: activeStep === index ? 600 : 400,
                                        color: activeStep === index ? 'primary.main' : 'text.secondary',
                                        '&:hover': {
                                            color: 'primary.main',
                                            fontWeight: 500
                                        }
                                    },
                                    '& .MuiStepIcon-root': {
                                        cursor: 'pointer',
                                        fontSize: '1.5rem',
                                        '&:hover': {
                                            color: 'primary.main',
                                            transform: 'scale(1.1)',
                                            transition: 'all 0.2s ease'
                                        },
                                        '&.Mui-active': {
                                            color: 'primary.main'
                                        },
                                        '&.Mui-completed': {
                                            color: 'success.main'
                                        }
                                    }
                                }}
                                onClick={() => handleStepClick(index)}
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box sx={{ mt: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={((activeStep + 1) / steps.length) * 100}
                        sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }
                        }}
                    />
                </Box>
            </Box>

            <DialogContent sx={{ px: 4, py: 3, overflow: 'auto' }}>
                {validationError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {validationError}
                    </Alert>
                ) : (
                    getStepContent(activeStep)
                )}
            </DialogContent>

            {/* Footer Actions */}
            <DialogActions sx={{ px: 4, py: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
                <Box>
                    <Button
                        disabled={activeStep === 0 || isSaving}
                        onClick={handleBack}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Anterior
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* Loading indicator */}
                    {(isLoading || isSaving) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} />
                            <Typography variant="caption" color="text.secondary">
                                {isLoading ? "Cargando..." : "Guardando..."}
                            </Typography>
                        </Box>
                    )}

                    {/* Save button always available (not just on last step) */}
                    {canEdit && (
                        <Button
                            variant="outlined"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                            {intervencionId ? "Actualizar" : "Guardar Borrador"}
                        </Button>
                    )}

                    {/* State transition buttons */}
                    {/* Enviar a Aprobación - Show for new interventions or BORRADOR state */}
                    {(!intervencion || (canEnviar && currentEstado === 'BORRADOR')) && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SendIcon />}
                            onClick={handleEnviar}
                            disabled={isEnviando || isSaving || isLoading}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                px: 3
                            }}
                        >
                            {isEnviando ? "Enviando..." : "Enviar a Aprobación"}
                        </Button>
                    )}

                    {/* Aprobar - Only for ENVIADO state */}
                    {canAprobarOrRechazar && currentEstado === 'ENVIADO' && (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={handleAprobar}
                                disabled={isAprobando || isRechazando || isLoading}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    px: 3
                                }}
                            >
                                {isAprobando ? "Aprobando..." : "Aprobar"}
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleRechazarClick}
                                disabled={isAprobando || isRechazando || isLoading}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    px: 3
                                }}
                            >
                                Rechazar
                            </Button>
                        </>
                    )}

                    {/* Next/Finish button */}
                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                px: 4,
                                fontWeight: 600,
                            }}
                        >
                            Finalizar
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={isSaving || isLoading}
                            sx={{ textTransform: "none", borderRadius: 2, px: 4 }}
                        >
                            Siguiente
                        </Button>
                    )}
                </Box>
            </DialogActions>

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

            {/* Rejection Dialog */}
            <Dialog
                open={rechazarDialogOpen}
                onClose={handleRechazarCancel}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3
                    }
                }}
            >
                <DialogTitle sx={{
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    color: 'error.main',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    Rechazar Intervención
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Ingrese las observaciones o motivos del rechazo. Esta información será enviada al equipo técnico.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Observaciones *"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Describa los motivos del rechazo..."
                        required
                        error={observaciones.trim() === '' && rechazarDialogOpen}
                        helperText={observaciones.trim() === '' ? "Las observaciones son obligatorias" : ""}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button
                        onClick={handleRechazarCancel}
                        disabled={isRechazando}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRechazarConfirm}
                        disabled={isRechazando || observaciones.trim() === ''}
                        sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                    >
                        {isRechazando ? "Rechazando..." : "Confirmar Rechazo"}
                    </Button>
                </DialogActions>
            </Dialog>

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
        </Dialog>
    )
} 