"use client"

/**
 * IntervencionModal - Reusable Intervention Registration Modal
 *
 * Unified modal component that works for MPI, MPE, and MPJ medida types.
 * Extracted and refactored from RegistroIntervencionModal for reusability.
 *
 * Features:
 * - 3-step wizard workflow (Información Básica → Detalles → Documentos y Configuración)
 * - Workflow states: BORRADOR → ENVIADO → APROBADO/RECHAZADO
 * - File attachment management
 * - Complete validation and error handling
 * - Reusable across MPI, MPE, and MPJ
 *
 * @see useRegistroIntervencion - Business logic hook (preserved as-is)
 */

import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Divider,
    Card,
    CardHeader,
    CardContent,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    CircularProgress,
    FormHelperText,
    Snackbar,
    Chip,
    Paper,
    Avatar,
    IconButton,
} from "@mui/material"
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import PersonIcon from "@mui/icons-material/Person"
import BusinessIcon from "@mui/icons-material/Business"
import DescriptionIcon from "@mui/icons-material/Description"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import SendIcon from "@mui/icons-material/Send"
import SaveIcon from "@mui/icons-material/Save"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import DownloadIcon from "@mui/icons-material/Download"
import DeleteIcon from "@mui/icons-material/Delete"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import InfoIcon from "@mui/icons-material/Info"

// Import atomic components
import { WizardModal, type WizardStep } from "./wizard-modal"
import { WorkflowStateActions } from "./workflow-state-actions"
import { PersonalInfoCard } from "./personal-info-card"
import { FileUploadSection, type FileItem } from "./file-upload-section"
import { RejectionDialog } from "./rejection-dialog"

// Import business logic hook
import { useRegistroIntervencion } from "../../../hooks/useRegistroIntervencion"

// Import subtipo dispositivo service
import { subtipoDispositivoService, type TSubtipoDispositivo } from "../../../services/subtipoDispositivoService"

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
        guardarYEnviar,
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

    // Subtipo dispositivo state (dynamic loading based on tipo_dispositivo)
    const [subtiposDispositivo, setSubtiposDispositivo] = useState<TSubtipoDispositivo[]>([])
    const [isLoadingSubtipos, setIsLoadingSubtipos] = useState(false)

    // Validate medidaId on mount
    useEffect(() => {
        if (open && !medidaId) {
            setValidationError('Error: medidaId no está definido. No se pueden cargar las intervenciones.')
        } else {
            setValidationError(null)
        }
    }, [open, medidaId])

    // Load subtipos when tipo_dispositivo changes
    useEffect(() => {
        const loadSubtipos = async () => {
            if (formData.tipo_dispositivo_id) {
                setIsLoadingSubtipos(true)
                try {
                    const subtipos = await subtipoDispositivoService.list(formData.tipo_dispositivo_id)
                    setSubtiposDispositivo(subtipos)
                } catch (error) {
                    console.error('Error loading subtipos dispositivo:', error)
                    setSubtiposDispositivo([])
                } finally {
                    setIsLoadingSubtipos(false)
                }
            } else {
                setSubtiposDispositivo([])
            }
        }
        loadSubtipos()
    }, [formData.tipo_dispositivo_id])

    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

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

    // Pending files state (for files selected before intervention is created)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [pendingFileTipos, setPendingFileTipos] = useState<string[]>([])

    // Mandatory document state (Informe Obligatorio)
    const [informeObligatorio, setInformeObligatorio] = useState<File | null>(null)
    const [informeObligatorioError, setInformeObligatorioError] = useState<string | null>(null)
    const [isDraggingInformeObligatorio, setIsDraggingInformeObligatorio] = useState(false)
    const informeObligatorioInputRef = useRef<HTMLInputElement>(null)

    // NEW: Check if there's already an "Informe Obligatorio" in the existing attachments
    const hasExistingInforme = useMemo(() => {
        return adjuntos.some(adj => adj.tipo === 'INFORME')
    }, [adjuntos])

    const existingInformeName = useMemo(() => {
        const informe = adjuntos.find(adj => adj.tipo === 'INFORME')
        return informe ? informe.nombre_original : null
    }, [adjuntos])

    // ============================================================================
    // EFFECTS
    // ============================================================================
    useEffect(() => {
        if (open) {
            clearErrors()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // Check if legajo data is available
    const hasLegajoData = !!(legajoData?.numero && legajoData?.persona_nombre && legajoData?.persona_apellido)

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

    /**
     * Combined handler: Save intervention + send for approval
     * Uses guardarYEnviar for new interventions (single API call with files)
     * Uses guardarBorrador + enviar for existing interventions
     */
    const handleSaveAndSend = async () => {
        try {
            // Validate mandatory document: New file OR existing file must be present
            if (!informeObligatorio && !hasExistingInforme) {
                setInformeObligatorioError('El Informe Obligatorio es requerido para enviar la intervención')
                setSnackbar({
                    open: true,
                    message: 'Debe adjuntar el Informe Obligatorio antes de guardar y enviar',
                    severity: 'error'
                })
                // Navigate to step 3 (Documentos) if not already there
                if (activeStep !== 2) {
                    setActiveStep(2)
                }
                return
            }

            const isNewIntervention = !intervencion && !intervencionId

            if (isNewIntervention) {
                // NEW INTERVENTION: Use combined endpoint (create + send + files in one call)
                setSnackbar({
                    open: true,
                    message: 'Creando y enviando intervención...',
                    severity: 'info'
                })

                // Combine informeObligatorio with pending files (filter out null)
                const allFiles = [informeObligatorio, ...pendingFiles].filter((f): f is File => f !== null)
                const allFileTipos = ['INFORME', ...pendingFileTipos]

                const result = await guardarYEnviar(
                    allFiles.length > 0 ? allFiles : undefined,
                    allFileTipos.length > 0 ? allFileTipos : undefined
                )

                if (result) {
                    // Clear pending files and mandatory document after successful creation
                    setPendingFiles([])
                    setPendingFileTipos([])
                    setInformeObligatorio(null)
                    setInformeObligatorioError(null)

                    setSnackbar({
                        open: true,
                        message: 'Intervención creada y enviada a aprobación exitosamente',
                        severity: 'success'
                    })
                    if (onSaved) {
                        onSaved()
                    }
                    setTimeout(() => {
                        onClose()
                    }, 1500)
                } else {
                    setSnackbar({
                        open: true,
                        message: 'Error al crear la intervención',
                        severity: 'error'
                    })
                }
            } else {
                // EXISTING INTERVENTION: Use two-step flow (save + send)
                setSnackbar({
                    open: true,
                    message: 'Guardando intervención...',
                    severity: 'info'
                })

                // Upload informe obligatorio first (if not already uploaded)
                if (informeObligatorio) {
                    setSnackbar({
                        open: true,
                        message: 'Subiendo informe obligatorio...',
                        severity: 'info'
                    })
                    await uploadAdjuntoFile(informeObligatorio, 'INFORME')
                }

                const result = await guardarBorrador()
                if (!result) {
                    setSnackbar({
                        open: true,
                        message: 'Error al guardar la intervención',
                        severity: 'error'
                    })
                    return
                }

                setSnackbar({
                    open: true,
                    message: 'Enviando a aprobación...',
                    severity: 'info'
                })

                // Small delay to ensure state is updated
                await new Promise(resolve => setTimeout(resolve, 300))

                const sendResult = await enviar()
                if (sendResult) {
                    // Clear mandatory document after successful upload
                    setInformeObligatorio(null)
                    setInformeObligatorioError(null)

                    setSnackbar({
                        open: true,
                        message: 'Intervención guardada y enviada a aprobación exitosamente',
                        severity: 'success'
                    })
                    if (onSaved) {
                        onSaved()
                    }
                    setTimeout(() => {
                        onClose()
                    }, 1500)
                }
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al procesar la intervención',
                severity: 'error'
            })
        }
    }

    /**
     * Handler: Save draft only (no send)
     * Allows editing and saving without sending for approval
     */
    const handleSaveDraft = async () => {
        try {
            setSnackbar({
                open: true,
                message: 'Guardando borrador...',
                severity: 'info'
            })

            const result = await guardarBorrador()
            if (result) {
                setSnackbar({
                    open: true,
                    message: 'Borrador guardado exitosamente',
                    severity: 'success'
                })
                if (onSaved) {
                    onSaved()
                }
                setTimeout(() => {
                    onClose()
                }, 1500)
            } else {
                setSnackbar({
                    open: true,
                    message: 'Error al guardar el borrador',
                    severity: 'error'
                })
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al guardar el borrador',
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

    /**
     * Handle file upload for existing intervention
     */
    const handleFileUpload = useCallback(async (file: File) => {
        await uploadAdjuntoFile(file, 'RESPALDO')
    }, [uploadAdjuntoFile])

    /**
     * Handle adding files to pending queue (before intervention exists)
     */
    const handleAddPendingFile = useCallback((file: File, tipo: string = 'RESPALDO') => {
        setPendingFiles(prev => [...prev, file])
        setPendingFileTipos(prev => [...prev, tipo])
    }, [])

    /**
     * Handle removing file from pending queue
     */
    const handleRemovePendingFile = useCallback((index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index))
        setPendingFileTipos(prev => prev.filter((_, i) => i !== index))
    }, [])

    const handleDeleteAdjunto = useCallback((fileId: number | string) => {
        deleteAdjuntoFile(Number(fileId))
    }, [deleteAdjuntoFile])

    const handleDownloadFile = useCallback((file: FileItem) => {
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
    }, [])

    // Map adjuntos to FileItem format (memoized to prevent unnecessary re-renders)
    const mappedAdjuntos: FileItem[] = useMemo(() => adjuntos.map(adj => ({
        id: adj.id,
        nombre: adj.nombre_original,
        tipo: adj.tipo, // Use raw tipo for filtering
        tipo_display: adj.tipo_display || (adj.tipo === 'INFORME' ? 'Informe Obligatorio' : adj.tipo),
        url: adj.url_descarga || adj.archivo,
        fecha_subida: adj.fecha_subida,
        tamano: adj.tamaño_bytes,
    })), [adjuntos])

    // Filtered list for "Additional Documents" section (excludes mandatory report)
    const additionalMappedAdjuntos = useMemo(() =>
        mappedAdjuntos.filter(adj => adj.tipo !== 'INFORME')
        , [mappedAdjuntos])

    // ============================================================================
    // HANDLERS - Informe Obligatorio (Mandatory Document)
    // ============================================================================

    /**
     * Format file size for display
     */
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }, [])

    /**
     * Validate PDF file
     */
    const validatePdfFile = useCallback((file: File): string | null => {
        if (file.type !== 'application/pdf') {
            return `"${file.name}" no es un archivo PDF`
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
            return `"${file.name}" excede el tamaño máximo de 10MB`
        }
        return null
    }, [])

    /**
     * Handle template download
     */
    const handleDownloadTemplate = useCallback(() => {
        const link = document.createElement('a')
        link.href = '/templates/informe-obligatorio-template.pdf'
        link.download = 'plantilla-informe-obligatorio.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [])

    /**
     * Handle informe obligatorio file selection
     */
    const handleInformeObligatorioSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const error = validatePdfFile(file)
        if (error) {
            setInformeObligatorioError(error)
            return
        }

        setInformeObligatorio(file)
        setInformeObligatorioError(null)

        if (informeObligatorioInputRef.current) {
            informeObligatorioInputRef.current.value = ''
        }
    }, [validatePdfFile])

    /**
     * Handle removing informe obligatorio
     */
    const handleRemoveInformeObligatorio = useCallback(() => {
        setInformeObligatorio(null)
        setInformeObligatorioError(null)
    }, [])

    /**
     * Drag-drop handlers for informe obligatorio
     */
    const handleInformeObligatorioDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (canEdit) {
            setIsDraggingInformeObligatorio(true)
        }
    }, [canEdit])

    const handleInformeObligatorioDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingInformeObligatorio(false)
    }, [])

    const handleInformeObligatorioDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleInformeObligatorioDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingInformeObligatorio(false)

        if (!canEdit) return

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            const file = files[0]
            const error = validatePdfFile(file)
            if (error) {
                setInformeObligatorioError(error)
                return
            }
            setInformeObligatorio(file)
            setInformeObligatorioError(null)
        }
    }, [canEdit, validatePdfFile])

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

                        {/* Warning: Legajo data not available yet */}
                        {!hasLegajoData && !intervencion && (
                            <Alert severity="info">
                                <Typography variant="body2">
                                    Los datos del legajo se están cargando... Si no aparecen, por favor cierre y vuelva a abrir el formulario.
                                </Typography>
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
                                        onChange={(e) => {
                                            const newValue = e.target.value ? Number(e.target.value) : null
                                            updateField('tipo_dispositivo_id', newValue)
                                            // Clear subtipo when tipo changes
                                            if (newValue !== formData.tipo_dispositivo_id) {
                                                updateField('subtipo_dispositivo_id', null)
                                            }
                                        }}
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
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Institución / Familia (Subtipo)</InputLabel>
                                    <Select
                                        value={formData.subtipo_dispositivo_id || ''}
                                        onChange={(e) => updateField('subtipo_dispositivo_id', e.target.value ? Number(e.target.value) : null)}
                                        label="Institución / Familia (Subtipo)"
                                        disabled={!canEdit || !formData.tipo_dispositivo_id || isLoadingSubtipos}
                                    >
                                        <MenuItem value="">Sin especificar</MenuItem>
                                        {subtiposDispositivo.map((subtipo) => (
                                            <MenuItem key={subtipo.id} value={subtipo.id}>
                                                {subtipo.nombre}
                                                {subtipo.capacidad_maxima && ` (Cap. ${subtipo.capacidad_maxima})`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {isLoadingSubtipos && (
                                        <FormHelperText>Cargando instituciones/familias...</FormHelperText>
                                    )}
                                    {!formData.tipo_dispositivo_id && (
                                        <FormHelperText>Seleccione primero un tipo de dispositivo</FormHelperText>
                                    )}
                                </FormControl>
                            </Box>

                            {/* Read-only display when approved */}
                            {!canEdit && intervencion && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Configuración de dispositivo registrada:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={`Tipo: ${intervencion.tipo_dispositivo_detalle?.nombre || 'No especificado'}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={`Institución/Familia: ${intervencion.subtipo_dispositivo_detalle?.nombre || 'No especificado'}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Card>

                        {/* Tipo de Cese Section - Only for CESE workflow phase */}
                        {workflowPhase === 'cese' && (
                            <Card elevation={2} sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <BusinessIcon sx={{ color: 'error.main', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Tipo de Cese
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo de cese</InputLabel>
                                        <Select
                                            value={formData.tipo_cese || ''}
                                            onChange={(e) => updateField('tipo_cese', e.target.value || null)}
                                            label="Tipo de cese"
                                            disabled={!canEdit}
                                        >
                                            <MenuItem value="">Sin especificar</MenuItem>
                                            <MenuItem value="RESTITUCION_DERECHOS">Restitución de los derechos</MenuItem>
                                            <MenuItem value="ADOPCION">Adopción</MenuItem>
                                            <MenuItem value="OTRA_MEDIDA">Cese de la medida porque corresponde otro tipo de medida</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth>
                                        <InputLabel>Subtipo de cese</InputLabel>
                                        <Select
                                            value={formData.subtipo_cese || ''}
                                            onChange={(e) => updateField('subtipo_cese', e.target.value || null)}
                                            label="Subtipo de cese"
                                            disabled={!canEdit || !formData.tipo_cese}
                                        >
                                            <MenuItem value="">Sin especificar</MenuItem>
                                            {formData.tipo_cese === 'RESTITUCION_DERECHOS' && (
                                                <>
                                                    <MenuItem value="RESTITUCION_FAMILIA_ORIGEN">Restitución a familia de origen</MenuItem>
                                                    <MenuItem value="RESTITUCION_FAMILIA_AMPLIADA">Restitución a familia ampliada</MenuItem>
                                                </>
                                            )}
                                            {formData.tipo_cese === 'ADOPCION' && (
                                                <>
                                                    <MenuItem value="ADOPCION_PLENA">Adopción plena</MenuItem>
                                                    <MenuItem value="ADOPCION_SIMPLE">Adopción simple</MenuItem>
                                                </>
                                            )}
                                            {formData.tipo_cese === 'OTRA_MEDIDA' && (
                                                <>
                                                    <MenuItem value="CAMBIO_MPE">Cambio a otra MPE</MenuItem>
                                                    <MenuItem value="CAMBIO_MPI">Cambio a MPI</MenuItem>
                                                    <MenuItem value="CAMBIO_MPJ">Cambio a MPJ</MenuItem>
                                                </>
                                            )}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Card>
                        )}
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

            case 2: // Documentos y Configuración - MERGED from previous steps 2 and 3
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* ============================================================ */}
                        {/* INFORME OBLIGATORIO SECTION (Required) */}
                        {/* ============================================================ */}
                        <Card
                            variant="outlined"
                            sx={{
                                borderColor: informeObligatorioError ? 'error.main' : informeObligatorio ? 'success.main' : 'divider',
                                borderWidth: informeObligatorio ? 2 : 1,
                            }}
                        >
                            <CardHeader
                                avatar={
                                    <Avatar sx={{ bgcolor: informeObligatorio ? 'success.main' : 'primary.main' }}>
                                        <DescriptionIcon />
                                    </Avatar>
                                }
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                                            1. Informe Obligatorio de Apertura
                                        </Typography>
                                        <Chip
                                            label={(informeObligatorio || hasExistingInforme) ? "Cargado" : "Pendiente"}
                                            size="small"
                                            color={(informeObligatorio || hasExistingInforme) ? "success" : "info"}
                                            variant={(informeObligatorio || hasExistingInforme) ? "filled" : "outlined"}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>
                                }
                                subheader="Este documento es la pieza central de la intervención y debe ser cargado primero."
                                sx={{ pb: 0 }}
                                action={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Button
                                            variant="text"
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={handleDownloadTemplate}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Ver Plantilla
                                        </Button>
                                    </Box>
                                }
                            />
                            <CardContent sx={{ pt: 1 }}>
                                {informeObligatorio ? (
                                    // NEWLY Uploaded file
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            bgcolor: 'success.50',
                                            borderColor: 'success.300',
                                            borderWidth: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            boxShadow: '0 2px 8px rgba(0, 128, 0, 0.1)',
                                        }}
                                    >
                                        <PictureAsPdfIcon color="error" sx={{ fontSize: 48 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.dark' }}>
                                                {informeObligatorio.name} (Listo para subir)
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatFileSize(informeObligatorio.size)} • PDF
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                                                Archivo seleccionado correctamente
                                            </Typography>
                                        </Box>
                                        {canEdit && (
                                            <IconButton
                                                onClick={handleRemoveInformeObligatorio}
                                                color="error"
                                                size="large"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Paper>
                                ) : hasExistingInforme ? (
                                    // PREVIOUSLY Uploaded file (found in adjuntos)
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            bgcolor: 'info.50',
                                            borderColor: 'primary.light',
                                            borderWidth: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: 6,
                                                bgcolor: 'primary.main',
                                            }
                                        }}
                                    >
                                        <PictureAsPdfIcon color="primary" sx={{ fontSize: 48 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                                                    {existingInformeName}
                                                </Typography>
                                                <Chip label="Documento Base" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Este documento ya forma parte del expediente.
                                            </Typography>
                                            <Button
                                                variant="text"
                                                size="small"
                                                color="primary"
                                                startIcon={<UploadFileIcon />}
                                                disabled={!canEdit}
                                                onClick={() => informeObligatorioInputRef.current?.click()}
                                                sx={{ mt: 0.5, p: 0, minWidth: 0, textTransform: 'none' }}
                                            >
                                                Haga clic aquí si desea reemplazarlo por una nueva versión
                                            </Button>
                                        </Box>
                                        <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                                    </Paper>
                                ) : (
                                    // No file - DRAG & DROP ZONE
                                    <Paper
                                        onDragEnter={handleInformeObligatorioDragEnter}
                                        onDragOver={handleInformeObligatorioDragOver}
                                        onDragLeave={handleInformeObligatorioDragLeave}
                                        onDrop={handleInformeObligatorioDrop}
                                        onClick={() => canEdit && informeObligatorioInputRef.current?.click()}
                                        sx={{
                                            border: '2px dashed',
                                            borderColor: isDraggingInformeObligatorio ? 'primary.main' : informeObligatorioError ? 'error.main' : 'primary.light',
                                            borderRadius: 2,
                                            p: 5,
                                            textAlign: 'center',
                                            cursor: canEdit ? 'pointer' : 'not-allowed',
                                            backgroundColor: isDraggingInformeObligatorio ? 'action.hover' : 'primary.50',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: canEdit ? 'rgba(25, 118, 210, 0.08)' : 'primary.50',
                                                borderColor: 'primary.main',
                                            },
                                        }}
                                    >
                                        <CloudUploadIcon
                                            sx={{
                                                fontSize: 64,
                                                color: 'primary.main',
                                                mb: 2,
                                                opacity: 0.8,
                                            }}
                                        />
                                        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: 'primary.dark' }}>
                                            {isDraggingInformeObligatorio ? "Suelte el archivo" : "Subir Informe Obligatorio"}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                            Pulse aquí para buscar el archivo o arrástrelo y suéltelo
                                        </Typography>
                                        <Typography variant="caption" sx={{
                                            display: 'inline-block',
                                            bgcolor: 'primary.light',
                                            color: 'primary.contrastText',
                                            px: 1.5, py: 0.5, borderRadius: 10,
                                            fontWeight: 600
                                        }}>
                                            PDF • MÁX 10MB
                                        </Typography>
                                        <input
                                            ref={informeObligatorioInputRef}
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            style={{ display: 'none' }}
                                            onChange={handleInformeObligatorioSelect}
                                            disabled={!canEdit}
                                        />
                                    </Paper>
                                )}

                                {/* Error message */}
                                {informeObligatorioError && (
                                    <Alert severity="error" sx={{ mt: 2 }} onClose={() => setInformeObligatorioError(null)}>
                                        {informeObligatorioError}
                                    </Alert>
                                )}

                                {/* Warning if no file */}
                                {!informeObligatorio && !hasExistingInforme && !informeObligatorioError && (
                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                        Este documento es obligatorio para guardar y enviar la intervención.
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* ============================================================ */}
                        {/* DOCUMENTOS ADICIONALES SECTION (Optional) */}
                        {/* ============================================================ */}
                        {/* ============================================================ */}
                        {/* DOCUMENTOS ADICIONALES SECTION (Optional) */}
                        {/* ============================================================ */}
                        <Card variant="outlined" sx={{ mt: 2, borderColor: 'secondary.light', bgcolor: 'rgba(156, 39, 176, 0.02)' }}>
                            <CardHeader
                                avatar={
                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                        <AttachFileIcon sx={{ fontSize: 18 }} />
                                    </Avatar>
                                }
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                                            2. Documentos Adicionales (Opcional)
                                        </Typography>
                                    </Box>
                                }
                                subheader="Adjunte actas, entrevistas, fotos u otros respaldos pertinentes."
                                sx={{ py: 1.5 }}
                                action={
                                    (intervencion ? additionalMappedAdjuntos.length : pendingFiles.length) > 0 && (
                                        <Chip
                                            label={`${intervencion ? additionalMappedAdjuntos.length : pendingFiles.length} archivo${(intervencion ? additionalMappedAdjuntos.length : pendingFiles.length) !== 1 ? 's' : ''}`}
                                            color="secondary"
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    )
                                }
                            />
                            <CardContent sx={{ pt: 0 }}>
                                {intervencion ? (
                                    // EXISTING INTERVENTION: Show uploaded files and allow more uploads
                                    <FileUploadSection
                                        files={additionalMappedAdjuntos}
                                        isLoading={isLoadingAdjuntos}
                                        onUpload={handleFileUpload}
                                        onDownload={handleDownloadFile}
                                        onDelete={handleDeleteAdjunto}
                                        allowedTypes=".pdf,.jpg,.jpeg,.png"
                                        maxSizeInMB={10}
                                        disabled={!canEdit}
                                        readOnly={!canEdit}
                                        title=""
                                        uploadButtonLabel="Seleccionar otros archivos"
                                        emptyMessage="No hay documentos adicionales adjuntos."
                                        isUploading={isUploadingAdjunto}
                                        multiple={true}
                                    />
                                ) : (
                                    // NEW INTERVENTION: Allow queuing files for upload with creation
                                    <>
                                        {/* Pending files list */}
                                        {pendingFiles.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main' }}>
                                                    Archivos seleccionados ({pendingFiles.length}):
                                                </Typography>
                                                {pendingFiles.map((file, index) => (
                                                    <Paper
                                                        key={index}
                                                        variant="outlined"
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            p: 1.5,
                                                            mb: 1,
                                                            bgcolor: 'background.paper',
                                                            borderColor: 'secondary.light',
                                                            borderLeft: 4,
                                                            borderLeftColor: 'secondary.main'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <DescriptionIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{file.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ({formatFileSize(file.size)})
                                                            </Typography>
                                                        </Box>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleRemovePendingFile(index)}
                                                            title="Quitar archivo"
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        )}

                                        {/* File input */}
                                        <Paper
                                            variant="outlined"
                                            component="label"
                                            sx={{
                                                border: '2px dashed',
                                                borderColor: 'secondary.light',
                                                borderRadius: 2,
                                                p: 3,
                                                textAlign: 'center',
                                                cursor: canEdit ? 'pointer' : 'not-allowed',
                                                backgroundColor: 'rgba(156, 39, 176, 0.04)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: canEdit ? 'rgba(156, 39, 176, 0.08)' : 'rgba(156, 39, 176, 0.04)',
                                                    borderColor: 'secondary.main',
                                                },
                                            }}
                                        >
                                            <CloudUploadIcon
                                                sx={{
                                                    fontSize: 40,
                                                    color: 'secondary.main',
                                                    mb: 1,
                                                    opacity: 0.7
                                                }}
                                            />
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'secondary.dark' }}>
                                                Agregar documentos adicionales
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Arrastre aquí o pulse para buscar (PDF, JPG, PNG)
                                            </Typography>
                                            <input
                                                type="file"
                                                hidden
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                multiple
                                                disabled={!canEdit}
                                                onChange={(e) => {
                                                    const files = e.target.files
                                                    if (files) {
                                                        Array.from(files).forEach(file => {
                                                            handleAddPendingFile(file, 'RESPALDO')
                                                        })
                                                        e.target.value = '' // Reset to allow same file selection
                                                    }
                                                }}
                                            />
                                        </Paper>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Configuración Adicional Section */}
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
                            </Box>

                            {/* Estado actual y acciones */}
                            {intervencion && (
                                <>
                                    <Divider sx={{ my: 3 }} />
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
                                </>
                            )}

                            {/* Message for technicians about approval */}
                            {!canAprobarOrRechazar && canEdit && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, p: 1.5, backgroundColor: 'rgba(2, 136, 209, 0.04)', borderRadius: 1 }}>
                                    <InfoIcon sx={{ fontSize: 18, color: 'info.main' }} />
                                    <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 500 }}>
                                        Esta intervención requiere aprobación del Jefe Zonal o Responsable de UDER.
                                    </Typography>
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
        { label: 'Documentos y Configuración', content: getStepContent(2) },
    ]

    // Get display name for workflow phase
    const getWorkflowPhaseDisplayName = (phase?: string): string => {
        const names: Record<string, string> = {
            'apertura': 'Apertura',
            'innovacion': 'Innovación',
            'prorroga': 'Prórroga',
            'cese': 'Cese'
        }
        return phase ? (names[phase] || phase) : ''
    }

    // Dynamic title based on tipoMedida and workflowPhase
    const workflowPhaseDisplay = getWorkflowPhaseDisplayName(workflowPhase)
    const modalTitle = `Registro de Intervención ${tipoMedida}${workflowPhaseDisplay ? ` - ${workflowPhaseDisplay}` : ''}`

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
                primaryAction={
                    // Context-aware primary action
                    activeStep !== wizardSteps.length - 1
                        ? {
                            // Not on last step: just "Siguiente"
                            label: "Siguiente",
                            onClick: handleNext,
                            disabled: isLoading,
                        }
                        : canAprobarOrRechazar && currentEstado === 'ENVIADO'
                            ? {
                                // Reviewing: "Aprobar Intervención" as primary action
                                label: "Aprobar Intervención",
                                onClick: handleAprobar,
                                disabled: isAprobando || isRechazando || isLoading,
                                icon: <CheckCircleIcon />,
                            }
                            : {
                                // Creating/Editing: "Enviar para Aprobación" as single action
                                label: "Enviar para Aprobación",
                                onClick: handleSaveAndSend,
                                disabled: isSaving || isEnviando || isLoading,
                                icon: <SendIcon />,
                            }
                }
                secondaryActions={[
                    // Guardar Borrador button (for editing without sending)
                    ...(canEdit && activeStep === wizardSteps.length - 1 && !(canAprobarOrRechazar && currentEstado === 'ENVIADO') ? [{
                        label: "Guardar Borrador",
                        onClick: handleSaveDraft,
                        disabled: isSaving || isLoading,
                        variant: "outlined" as const,
                        color: "primary" as const,
                        icon: <SaveIcon />,
                    }] : []),
                    // Rechazar button (only for reviewers in ENVIADO state)
                    ...(canAprobarOrRechazar && currentEstado === 'ENVIADO' && activeStep === wizardSteps.length - 1 ? [{
                        label: "Rechazar Intervención",
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
