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
    LinearProgress
} from "@mui/material"
import { useState } from "react"
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
import { PlanTrabajoTab } from "./mpe-tabs/plan-trabajo-tab"

interface RegistroIntervencionModalProps {
    open: boolean
    onClose: () => void
}

export const RegistroIntervencionModal: React.FC<RegistroIntervencionModalProps> = ({
    open,
    onClose
}) => {
    const [activeStep, setActiveStep] = useState(0)
    const [formData, setFormData] = useState({
        legajo: "",
        fechaIntervencion: "12/12/2025",
        nombre: "",
        apellido: "",
        zonaUder: "",
        origenDemanda: "",
        tipoDispositivo: "",
        dispositivo: "",
        motivoIntervencion: "",
        submotivo: "",
        categoriaIntervencion: "",
        intervencion: "",
        estado: "",
        detalles: ""
    })

    const [uploadedFiles, setUploadedFiles] = useState<string[]>([
        "Uploaded File Name",
        "Uploaded File Name",
        "Uploaded File Name",
        "Uploaded File Name",
        "Uploaded File Name"
    ])

    const [notificacionesPermitidas, setNotificacionesPermitidas] = useState("Si")
    const [informesPermitidos, setInformesPermitidos] = useState("Si")
    const [actaPermitida, setActaPermitida] = useState("Si")

    const steps = [
        'Información Básica',
        'Detalles de Intervención',
        'Documentos y Archivos',
        'Plan de Trabajo',
        'Configuración Adicional'
    ]

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1)
    }

    const handleStepClick = (step: number) => {
        setActiveStep(step)
    }

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                                    value="Autogenerado"
                                    disabled
                                    variant="outlined"
                                    helperText="Este código se genera automáticamente"
                                />
                                <TextField
                                    label="Fecha de intervención"
                                    type="date"
                                    value="2025-12-12"
                                    onChange={(e) => handleInputChange('fechaIntervencion', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                                <TextField
                                    label="Legajo"
                                    value={formData.legajo}
                                    onChange={(e) => handleInputChange('legajo', e.target.value)}
                                    variant="outlined"
                                    required
                                    placeholder="Ingrese el número de legajo"
                                />
                                <Box />
                                <TextField
                                    label="Nombre"
                                    value={formData.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                    variant="outlined"
                                    required
                                    placeholder="Ingrese el nombre"
                                />
                                <TextField
                                    label="Apellido"
                                    value={formData.apellido}
                                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                                    variant="outlined"
                                    required
                                    placeholder="Ingrese el apellido"
                                />
                            </Box>
                        </Card>

                        <Card elevation={2} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <BusinessIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Información Institucional
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Zona/UDER</InputLabel>
                                    <Select
                                        value={formData.zonaUder}
                                        onChange={(e) => handleInputChange('zonaUder', e.target.value)}
                                        label="Zona/UDER"
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        <MenuItem value="zona1">Zona 1</MenuItem>
                                        <MenuItem value="zona2">Zona 2</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Origen de la demanda</InputLabel>
                                    <Select
                                        value={formData.origenDemanda}
                                        onChange={(e) => handleInputChange('origenDemanda', e.target.value)}
                                        label="Origen de la demanda"
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        <MenuItem value="judicial">Judicial</MenuItem>
                                        <MenuItem value="administrativo">Administrativo</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Tipo de dispositivo</InputLabel>
                                    <Select
                                        value={formData.tipoDispositivo}
                                        onChange={(e) => handleInputChange('tipoDispositivo', e.target.value)}
                                        label="Tipo de dispositivo"
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        <MenuItem value="residencia">Residencia</MenuItem>
                                        <MenuItem value="hogar">Hogar</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Dispositivo</InputLabel>
                                    <Select
                                        value={formData.dispositivo}
                                        onChange={(e) => handleInputChange('dispositivo', e.target.value)}
                                        label="Dispositivo"
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        <MenuItem value="dispositivo1">Dispositivo 1</MenuItem>
                                        <MenuItem value="dispositivo2">Dispositivo 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Card>
                    </Box>
                )

            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Card elevation={2} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <DescriptionIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Detalles de la Intervención
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                                <FormControl fullWidth required>
                                    <InputLabel>Motivo de Intervención</InputLabel>
                                    <Select
                                        value={formData.motivoIntervencion}
                                        onChange={(e) => handleInputChange('motivoIntervencion', e.target.value)}
                                        label="Motivo de Intervención"
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        <MenuItem value="vulneracion">Vulneración de derechos</MenuItem>
                                        <MenuItem value="seguimiento">Seguimiento</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Submotivo</InputLabel>
                                    <Select
                                        value={formData.submotivo}
                                        onChange={(e) => handleInputChange('submotivo', e.target.value)}
                                        label="Submotivo"
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        <MenuItem value="submotivo1">Submotivo 1</MenuItem>
                                        <MenuItem value="submotivo2">Submotivo 2</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Categoría de intervención</InputLabel>
                                    <Select
                                        value={formData.categoriaIntervencion}
                                        onChange={(e) => handleInputChange('categoriaIntervencion', e.target.value)}
                                        label="Categoría de intervención"
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        <MenuItem value="categoria1">Categoría 1</MenuItem>
                                        <MenuItem value="categoria2">Categoría 2</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required>
                                    <InputLabel>Intervención</InputLabel>
                                    <Select
                                        value={formData.intervencion}
                                        onChange={(e) => handleInputChange('intervencion', e.target.value)}
                                        label="Intervención"
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        <MenuItem value="intervencion1">Intervención 1</MenuItem>
                                        <MenuItem value="intervencion2">Intervención 2</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth required sx={{ gridColumn: { md: 'span 2' } }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={formData.estado}
                                        onChange={(e) => handleInputChange('estado', e.target.value)}
                                        label="Estado"
                                    >
                                        <MenuItem value="">Seleccionar</MenuItem>
                                        <MenuItem value="activo">Activo</MenuItem>
                                        <MenuItem value="cerrado">Cerrado</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <TextField
                                label="Detalles de la intervención"
                                multiline
                                rows={4}
                                fullWidth
                                value={formData.detalles}
                                onChange={(e) => handleInputChange('detalles', e.target.value)}
                                placeholder="Ingrese los detalles de la intervención..."
                                helperText="Proporcione una descripción detallada de la intervención realizada"
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

                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body2">
                                    Descargar modelo de apertura de MPE. Recuerde que luego de completarlo debe adjuntarlo firmado.
                                </Typography>
                            </Alert>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    size="large"
                                    sx={{ textTransform: "none", borderRadius: 2 }}
                                >
                                    Descargar Modelo MPE
                                </Button>
                            </Box>

                            <Paper
                                sx={{
                                    border: '2px dashed #2196f3',
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    mb: 3,
                                    backgroundColor: 'rgba(33, 150, 243, 0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(33, 150, 243, 0.05)',
                                        borderColor: '#1976d2'
                                    }
                                }}
                            >
                                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                    Arrastra archivos aquí
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    o{" "}
                                    <Button variant="text" sx={{ textTransform: "none", fontWeight: 600 }}>
                                        selecciona archivos
                                    </Button>
                                </Typography>
                                <Chip
                                    label="Solo archivos .jpg, .png, .pdf - Máximo 5MB"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Paper>

                            {uploadedFiles.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                        Archivos subidos ({uploadedFiles.length})
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                        {uploadedFiles.map((fileName, index) => (
                                            <Paper
                                                key={index}
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
                                                            {fileName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            1.1 KB • Subido correctamente
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <IconButton size="small" color="error">
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    sx={{ textTransform: "none", borderRadius: 2 }}
                                >
                                    Limpiar archivos
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{ textTransform: "none", borderRadius: 2 }}
                                    disabled={uploadedFiles.length === 0}
                                >
                                    Confirmar archivos
                                </Button>
                            </Box>
                        </Card>

                        <Card elevation={2} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Fotocopia del DNI
                                </Typography>
                                <Chip label="12/12/2025" size="small" color="primary" variant="outlined" />
                            </Box>
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ textTransform: "none", borderRadius: 2 }}
                            >
                                Adjuntar DNI
                            </Button>
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
                        {/* Informes ampliatorios */}
                        <Card elevation={2}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Informes ampliatorios
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            ¿Es posible enviar informes ampliatorios?
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={informesPermitidos}
                                            onChange={(e) => setInformesPermitidos(e.target.value)}
                                            sx={{ mb: 2 }}
                                        >
                                            <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                            <FormControlLabel value="No" control={<Radio />} label="No" />
                                        </RadioGroup>

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                            <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }}>
                                                Agregar Informes
                                            </Button>
                                        </Box>

                                        {[1, 2].map((num) => (
                                            <Card key={num} variant="outlined" sx={{ mb: 1 }}>
                                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <EmailIcon sx={{ color: 'primary.main', mr: 2 }} />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                Informe {num}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Documento adjunto
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <IconButton>
                                                        <CloudUploadIcon />
                                                    </IconButton>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </Card>

                        {/* Notificaciones */}
                        <Card elevation={2}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Notificaciones
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            ¿Es posible enviar notificaciones?
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={notificacionesPermitidas}
                                            onChange={(e) => setNotificacionesPermitidas(e.target.value)}
                                            sx={{ mb: 2 }}
                                        >
                                            <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                            <FormControlLabel value="No" control={<Radio />} label="No" />
                                        </RadioGroup>

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                            <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }}>
                                                Agregar notificaciones
                                            </Button>
                                        </Box>

                                        {[1, 2].map((num) => (
                                            <Card key={num} variant="outlined" sx={{ mb: 1 }}>
                                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <EmailIcon sx={{ color: 'primary.main', mr: 2 }} />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                Notificación {num}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Documento adjunto
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <IconButton>
                                                        <CloudUploadIcon />
                                                    </IconButton>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </Card>

                        {/* Acta */}
                        <Card elevation={2}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Acta
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            ¿Es posible adjuntar acta?
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={actaPermitida}
                                            onChange={(e) => setActaPermitida(e.target.value)}
                                            sx={{ mb: 2 }}
                                        >
                                            <FormControlLabel value="Si" control={<Radio />} label="Sí" />
                                            <FormControlLabel value="No" control={<Radio />} label="No" />
                                        </RadioGroup>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Typography variant="body2">Fecha:</Typography>
                                            <Chip label="12/12/2025" size="small" color="primary" variant="outlined" />
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }}>
                                                Adjuntar acta de puesta en conocimiento al NNyA
                                            </Button>
                                            <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }}>
                                                Adjuntar acta de resguardo
                                            </Button>
                                        </Box>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </Card>

                        {/* Motivo de vulneraciones */}
                        <Card elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Motivo de vulneraciones
                            </Typography>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<SendIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    py: 1.5,
                                    fontWeight: 600,
                                }}
                            >
                                Enviar a la dirección
                            </Button>
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
                Registro de Intervención MPE
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
                {getStepContent(activeStep)}
            </DialogContent>

            {/* Footer Actions */}
            <DialogActions sx={{ px: 4, py: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
                <Box>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Anterior
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {activeStep === steps.length - 1 ? (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<SaveIcon />}
                                sx={{ textTransform: "none", borderRadius: 2 }}
                            >
                                Guardar Borrador
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                size="large"
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    px: 4,
                                    fontWeight: 600,
                                }}
                            >
                                Guardar Intervención
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ textTransform: "none", borderRadius: 2, px: 4 }}
                        >
                            Siguiente
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    )
} 