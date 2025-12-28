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
    IconButton,
    Card,
    CardContent,
    Alert,
    Chip,
    Paper,
    LinearProgress,
    FormHelperText,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stepper,
    Step,
    StepLabel
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import DownloadIcon from "@mui/icons-material/Download"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import DeleteIcon from "@mui/icons-material/Delete"
import VisibilityIcon from "@mui/icons-material/Visibility"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import WarningIcon from "@mui/icons-material/Warning"
import InfoIcon from "@mui/icons-material/Info"
import SaveIcon from "@mui/icons-material/Save"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DescriptionIcon from "@mui/icons-material/Description"
import { FileUploadSection, type FileItem } from "../shared/file-upload-section"

interface AdjuntarNotaModalProps {
    open: boolean
    onClose: () => void
    title?: string
    modeloTexto?: string
    sectionNumber?: string
    sectionTitle?: string
}

interface ArchivoAdjunto {
    id: string
    nombre: string
    tipo: string
    tamaño: number
    fechaSubida: Date
    estado: 'subiendo' | 'completado' | 'error'
    progreso: number
}

export const AdjuntarNotaModal: React.FC<AdjuntarNotaModalProps> = ({
    open,
    onClose,
    title = "Adjuntar nota aprobación",
    modeloTexto = "Descargar modelo de nota",
    sectionNumber = "1",
    sectionTitle = "Nota de Aprobación"
}) => {
    const [activeStep, setActiveStep] = useState(0)
    const [fecha, setFecha] = useState<string>("")
    const [observaciones, setObservaciones] = useState<string>("")
    const [archivosAdjuntos, setArchivosAdjuntos] = useState<ArchivoAdjunto[]>([])
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    const [modeloDescargado, setModeloDescargado] = useState(false)
    const [expandedSection, setExpandedSection] = useState<string | null>('instrucciones')

    const steps = ['Instrucciones', 'Documentos', 'Revisión']

    const tiposArchivosPermitidos = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
    const tamañoMaximo = 5 * 1024 * 1024 // 5MB

    // Convert ArchivoAdjunto[] to FileItem[] for display in FileUploadSection
    const displayFiles: FileItem[] = archivosAdjuntos
        .filter(a => a.estado === 'completado')
        .map((archivo) => ({
            id: archivo.id,
            nombre: archivo.nombre,
            tipo: archivo.tipo,
            tamano: archivo.tamaño,
            fecha_subida: archivo.fechaSubida.toISOString(),
        }))

    // Handle file upload from FileUploadSection
    const handleFileUpload = (file: File) => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!tiposArchivosPermitidos.includes(extension)) {
            return
        }

        if (file.size > tamañoMaximo) {
            return
        }

        const nuevoArchivo: ArchivoAdjunto = {
            id: Math.random().toString(36).substr(2, 9),
            nombre: file.name,
            tipo: file.type,
            tamaño: file.size,
            fechaSubida: new Date(),
            estado: 'subiendo',
            progreso: 0
        }

        setArchivosAdjuntos(prev => [...prev, nuevoArchivo])

        // Simular subida con progreso
        const interval = setInterval(() => {
            setArchivosAdjuntos(prev => prev.map(archivo => {
                if (archivo.id === nuevoArchivo.id) {
                    const nuevoProgreso = Math.min(archivo.progreso + 10, 100)
                    return {
                        ...archivo,
                        progreso: nuevoProgreso,
                        estado: nuevoProgreso === 100 ? 'completado' : 'subiendo'
                    }
                }
                return archivo
            }))
        }, 200)

        setTimeout(() => clearInterval(interval), 2000)
    }

    // Handle file deletion from FileUploadSection
    const handleFileDeleteSection = (fileId: number | string) => {
        setArchivosAdjuntos(prev => prev.filter(a => a.id !== fileId))
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!fecha) {
            errors.fecha = 'La fecha es requerida'
        } else if (new Date(fecha) > new Date()) {
            errors.fecha = 'La fecha no puede ser futura'
        }

        if (!observaciones.trim()) {
            errors.observaciones = 'Las observaciones son requeridas'
        } else if (observaciones.length < 10) {
            errors.observaciones = 'Las observaciones deben tener al menos 10 caracteres'
        }

        if (archivosAdjuntos.filter(a => a.estado === 'completado').length === 0) {
            errors.archivos = 'Debe adjuntar al menos un archivo'
        }

        return errors
    }

    const handleDescargarModelo = () => {
        console.log("Descargando modelo...")
        setModeloDescargado(true)
        // Simular descarga
        setTimeout(() => {
            // Crear un enlace de descarga temporal
            const link = document.createElement('a')
            link.href = '#'
            link.download = 'modelo_nota_aprobacion.docx'
            link.click()
        }, 500)
    }

    const removeArchivo = (id: string) => {
        setArchivosAdjuntos(prev => prev.filter(a => a.id !== id))
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getCompletionPercentage = () => {
        let score = 0
        if (fecha) score += 25
        if (observaciones.trim()) score += 25
        if (archivosAdjuntos.filter(a => a.estado === 'completado').length > 0) score += 25
        if (modeloDescargado) score += 25
        return score
    }

    const canProceed = () => {
        if (activeStep === 0) return true
        if (activeStep === 1) return archivosAdjuntos.filter(a => a.estado === 'completado').length > 0
        if (activeStep === 2) {
            const errors = validateForm()
            return Object.keys(errors).length === 0
        }
        return true
    }

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1)
        }
    }

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1)
        }
    }

    const handleSave = () => {
        const errors = validateForm()
        setValidationErrors(errors)

        if (Object.keys(errors).length === 0) {
            console.log("Guardando nota...")
            onClose()
        }
    }

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                Siga las instrucciones para adjuntar correctamente la nota de aprobación.
                            </Typography>
                        </Alert>

                        <Accordion
                            expanded={expandedSection === 'instrucciones'}
                            onChange={() => setExpandedSection(expandedSection === 'instrucciones' ? null : 'instrucciones')}
                            sx={{ mb: 2 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Instrucciones Generales
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                1.
                                            </Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Descargar el modelo de nota"
                                            secondary="Utilice el modelo oficial para mantener el formato estándar"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                2.
                                            </Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Completar la información requerida"
                                            secondary="Incluya todos los datos necesarios según el caso específico"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                3.
                                            </Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Adjuntar el documento firmado"
                                            secondary="El documento debe estar firmado por la autoridad competente"
                                        />
                                    </ListItem>
                                </List>
                            </AccordionDetails>
                        </Accordion>

                        <Card elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                {sectionNumber}. {sectionTitle}
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 2,
                                        backgroundColor: modeloDescargado ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.03)',
                                        border: modeloDescargado ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: 2
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DescriptionIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {modeloTexto}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Formato: DOCX • Tamaño: ~50KB
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {modeloDescargado && (
                                                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                                            )}
                                            <Button
                                                variant="contained"
                                                startIcon={<DownloadIcon />}
                                                onClick={handleDescargarModelo}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                {modeloDescargado ? 'Descargar nuevamente' : 'Descargar'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Paper>

                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Importante:</strong> El documento debe estar completo y firmado antes de adjuntarlo.
                                        Revise que toda la información esté correcta.
                                    </Typography>
                                </Alert>
                            </Box>
                        </Card>
                    </Box>
                )

            case 1:
                return (
                    <Box>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                Adjunte el documento completado. Puede arrastrar archivos o seleccionarlos manualmente.
                            </Typography>
                        </Alert>

                        {/* File Upload Section */}
                        <FileUploadSection
                            files={displayFiles}
                            onUpload={handleFileUpload}
                            onDelete={handleFileDeleteSection}
                            title="Documentos"
                            multiple={true}
                            allowedTypes={tiposArchivosPermitidos.join(',')}
                            maxSizeInMB={5}
                            emptyMessage="No hay archivos adjuntos. Arrastra archivos o haz clic para seleccionar."
                            dragDropMessage="Arrastra archivos aquí"
                            uploadButtonLabel="Seleccionar archivos"
                            isUploading={archivosAdjuntos.some(a => a.estado === 'subiendo')}
                        />

                        {validationErrors.archivos && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    {validationErrors.archivos}
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                )

            case 2:
                return (
                    <Box>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                Complete los datos adicionales y revise la información antes de guardar.
                            </Typography>
                        </Alert>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Card elevation={2} sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Información Adicional
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                            Fecha del documento
                                        </Typography>
                                        <TextField
                                            type="date"
                                            value={fecha}
                                            onChange={(e) => setFecha(e.target.value)}
                                            variant="outlined"
                                            fullWidth
                                            error={!!validationErrors.fecha}
                                            helperText={validationErrors.fecha}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                            Observaciones
                                        </Typography>
                                        <TextField
                                            multiline
                                            rows={4}
                                            fullWidth
                                            value={observaciones}
                                            onChange={(e) => setObservaciones(e.target.value)}
                                            placeholder="Ingrese observaciones adicionales sobre el documento adjuntado"
                                            variant="outlined"
                                            error={!!validationErrors.observaciones}
                                            helperText={validationErrors.observaciones}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Card>

                            <Card elevation={1} sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Resumen
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Sección:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {sectionNumber}. {sectionTitle}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Archivos adjuntos:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {archivosAdjuntos.filter(a => a.estado === 'completado').length}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Fecha:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {fecha || 'No especificada'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Progreso:
                                        </Typography>
                                        <Chip
                                            label={`${getCompletionPercentage()}% completado`}
                                            color={getCompletionPercentage() === 100 ? "success" : "primary"}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </Card>
                        </Box>
                    </Box>
                )

            default:
                return null
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '95vh',
                    height: '95vh'
                }
            }}
        >
            <DialogTitle sx={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '1.25rem',
                position: 'relative',
                pb: 1,
                borderBottom: '1px solid #e0e0e0'
            }}>
                {title}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'grey.500',
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Progress indicator */}
            <Box sx={{ px: 4, py: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Progreso general
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {getCompletionPercentage()}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={getCompletionPercentage()}
                    sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                />
            </Box>

            {/* Stepper */}
            <Box sx={{ px: 4, py: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <DialogContent sx={{ px: 4, py: 3, overflow: 'auto' }}>
                {getStepContent(activeStep)}
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 3, pt: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                >
                    Anterior
                </Button>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {activeStep === steps.length - 1 ? (
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            disabled={!canProceed()}
                            startIcon={<SaveIcon />}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                fontWeight: 600,
                            }}
                        >
                            Guardar Nota
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            variant="contained"
                            disabled={!canProceed()}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                px: 4
                            }}
                        >
                            Siguiente
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    )
} 