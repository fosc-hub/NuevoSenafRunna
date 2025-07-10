"use client"

import type React from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Card,
    CardContent,
    Alert,
    Chip,
    Stepper,
    Step,
    StepLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Paper,
    Divider,
    LinearProgress,
    Snackbar,
    Switch
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import SaveIcon from "@mui/icons-material/Save"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import AssignmentIcon from "@mui/icons-material/Assignment"
import EventIcon from "@mui/icons-material/Event"
import PersonIcon from "@mui/icons-material/Person"
import GavelIcon from "@mui/icons-material/Gavel"
import DescriptionIcon from "@mui/icons-material/Description"
import InfoIcon from "@mui/icons-material/Info"

interface CierreMedidaModalProps {
    open: boolean
    onClose: () => void
    title?: string
}

interface RequisitosCierre {
    informeFinal: boolean
    evaluacionResultados: boolean
    documentacionCompleta: boolean
    aprobacionSupervisor: boolean
    notificacionJudicial: boolean
    registroSistema: boolean
}

export default function CierreMedidaModal({
    open,
    onClose,
    title = "Cierre de Medida"
}: CierreMedidaModalProps) {
    const [activeStep, setActiveStep] = useState(0)
    const [motivoCierre, setMotivoCierre] = useState("")
    const [tipoCierre, setTipoCierre] = useState("")
    const [fechaCierre, setFechaCierre] = useState("")
    const [observaciones, setObservaciones] = useState("")
    const [responsable, setResponsable] = useState("")
    const [requisitos, setRequisitos] = useState<RequisitosCierre>({
        informeFinal: false,
        evaluacionResultados: false,
        documentacionCompleta: false,
        aprobacionSupervisor: false,
        notificacionJudicial: false,
        registroSistema: false
    })
    const [confirmacionCierre, setConfirmacionCierre] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    const [showConfirmation, setShowConfirmation] = useState(false)

    const steps = ['Información', 'Requisitos', 'Confirmación']

    const motivosCierre = [
        { value: 'cumplimiento_objetivos', label: 'Cumplimiento de objetivos' },
        { value: 'mejora_situacion', label: 'Mejora sustancial de la situación' },
        { value: 'cambio_medida', label: 'Cambio por otra medida' },
        { value: 'mayoria_edad', label: 'Mayoría de edad del NNyA' },
        { value: 'solicitud_judicial', label: 'Solicitud judicial' },
        { value: 'otros', label: 'Otros motivos' }
    ]

    const tiposCierre = [
        { value: 'exitoso', label: 'Exitoso', color: 'success' },
        { value: 'parcial', label: 'Parcialmente exitoso', color: 'warning' },
        { value: 'administrativo', label: 'Administrativo', color: 'info' },
        { value: 'judicial', label: 'Por orden judicial', color: 'primary' }
    ]

    const responsables = [
        'Coordinador de Área',
        'Supervisor Técnico',
        'Jefe de Departamento',
        'Director Regional'
    ]

    const requisitosInfo = [
        {
            key: 'informeFinal' as keyof RequisitosCierre,
            label: 'Informe Final',
            descripcion: 'Informe técnico final con evaluación de resultados y recomendaciones',
            obligatorio: true
        },
        {
            key: 'evaluacionResultados' as keyof RequisitosCierre,
            label: 'Evaluación de Resultados',
            descripcion: 'Evaluación del cumplimiento de objetivos y metas establecidas',
            obligatorio: true
        },
        {
            key: 'documentacionCompleta' as keyof RequisitosCierre,
            label: 'Documentación Completa',
            descripcion: 'Verificación de que toda la documentación esté completa y archivada',
            obligatorio: true
        },
        {
            key: 'aprobacionSupervisor' as keyof RequisitosCierre,
            label: 'Aprobación del Supervisor',
            descripcion: 'Visto bueno del supervisor técnico para el cierre',
            obligatorio: true
        },
        {
            key: 'notificacionJudicial' as keyof RequisitosCierre,
            label: 'Notificación Judicial',
            descripcion: 'Comunicación al juzgado correspondiente sobre el cierre',
            obligatorio: false
        },
        {
            key: 'registroSistema' as keyof RequisitosCierre,
            label: 'Registro en Sistema',
            descripcion: 'Actualización del estado en el sistema de gestión',
            obligatorio: false
        }
    ]

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!motivoCierre) {
            errors.motivoCierre = 'Debe seleccionar un motivo de cierre'
        }
        if (!tipoCierre) {
            errors.tipoCierre = 'Debe seleccionar un tipo de cierre'
        }
        if (!fechaCierre) {
            errors.fechaCierre = 'Debe especificar la fecha de cierre'
        }
        if (!responsable) {
            errors.responsable = 'Debe asignar un responsable'
        }
        if (!observaciones.trim()) {
            errors.observaciones = 'Las observaciones son requeridas'
        }

        // Validar fecha no sea futura
        if (fechaCierre && new Date(fechaCierre) > new Date()) {
            errors.fechaCierre = 'La fecha de cierre no puede ser futura'
        }

        return errors
    }

    const getRequisitosCumplidos = () => {
        return Object.values(requisitos).filter(Boolean).length
    }

    const getRequisitosObligatorios = () => {
        return requisitosInfo.filter(r => r.obligatorio).length
    }

    const getRequisitosObligatoriosCumplidos = () => {
        return requisitosInfo
            .filter(r => r.obligatorio)
            .filter(r => requisitos[r.key])
            .length
    }

    const canProceed = () => {
        if (activeStep === 0) {
            const errors = validateForm()
            return Object.keys(errors).length === 0
        }
        if (activeStep === 1) {
            return getRequisitosObligatoriosCumplidos() === getRequisitosObligatorios()
        }
        if (activeStep === 2) {
            return confirmacionCierre
        }
        return true
    }

    const handleNext = () => {
        if (activeStep === 0) {
            const errors = validateForm()
            setValidationErrors(errors)
            if (Object.keys(errors).length === 0) {
                setActiveStep(activeStep + 1)
            }
        } else if (canProceed()) {
            setActiveStep(activeStep + 1)
        }
    }

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1)
        }
    }

    const handleToggleRequisito = (key: keyof RequisitosCierre) => {
        setRequisitos(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleSave = () => {
        setShowConfirmation(true)
    }

    const handleConfirmSave = () => {
        console.log("Cerrando medida...")
        setShowConfirmation(false)
        onClose()
    }

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                Complete la información básica para el cierre de la medida. Todos los campos son obligatorios.
                            </Typography>
                        </Alert>

                        <Card elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Información del Cierre
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <FormControl fullWidth error={!!validationErrors.motivoCierre}>
                                    <InputLabel>Motivo del Cierre</InputLabel>
                                    <Select
                                        value={motivoCierre}
                                        onChange={(e) => setMotivoCierre(e.target.value)}
                                        label="Motivo del Cierre"
                                    >
                                        {motivosCierre.map((motivo) => (
                                            <MenuItem key={motivo.value} value={motivo.value}>
                                                {motivo.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {validationErrors.motivoCierre && (
                                        <FormHelperText>{validationErrors.motivoCierre}</FormHelperText>
                                    )}
                                </FormControl>

                                <FormControl fullWidth error={!!validationErrors.tipoCierre}>
                                    <InputLabel>Tipo de Cierre</InputLabel>
                                    <Select
                                        value={tipoCierre}
                                        onChange={(e) => setTipoCierre(e.target.value)}
                                        label="Tipo de Cierre"
                                    >
                                        {tiposCierre.map((tipo) => (
                                            <MenuItem key={tipo.value} value={tipo.value}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Chip
                                                        size="small"
                                                        label={tipo.label}
                                                        color={tipo.color as any}
                                                        sx={{ mr: 1 }}
                                                    />
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {validationErrors.tipoCierre && (
                                        <FormHelperText>{validationErrors.tipoCierre}</FormHelperText>
                                    )}
                                </FormControl>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Fecha de Cierre"
                                        value={fechaCierre}
                                        onChange={(e) => setFechaCierre(e.target.value)}
                                        error={!!validationErrors.fechaCierre}
                                        helperText={validationErrors.fechaCierre}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                    />

                                    <FormControl fullWidth error={!!validationErrors.responsable}>
                                        <InputLabel>Responsable del Cierre</InputLabel>
                                        <Select
                                            value={responsable}
                                            onChange={(e) => setResponsable(e.target.value)}
                                            label="Responsable del Cierre"
                                        >
                                            {responsables.map((resp) => (
                                                <MenuItem key={resp} value={resp}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <PersonIcon sx={{ mr: 1 }} />
                                                        {resp}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {validationErrors.responsable && (
                                            <FormHelperText>{validationErrors.responsable}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Observaciones del Cierre"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    error={!!validationErrors.observaciones}
                                    helperText={validationErrors.observaciones || "Describa las razones específicas, resultados obtenidos y recomendaciones"}
                                    required
                                />
                            </Box>
                        </Card>

                        {/* Información adicional según el motivo */}
                        {motivoCierre === 'cumplimiento_objetivos' && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    <strong>Cierre por cumplimiento de objetivos:</strong> Asegúrese de incluir en las observaciones los logros específicos alcanzados y la evaluación final del caso.
                                </Typography>
                            </Alert>
                        )}

                        {motivoCierre === 'cambio_medida' && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    <strong>Cambio de medida:</strong> Especifique en las observaciones la nueva medida a implementar y los motivos del cambio.
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                )

            case 1:
                return (
                    <Box>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                Verifique que se cumplan todos los requisitos necesarios para el cierre de la medida.
                            </Typography>
                        </Alert>

                        <Card elevation={2} sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Requisitos de Cierre
                                </Typography>
                                <Chip
                                    label={`${getRequisitosCumplidos()}/${requisitosInfo.length} completados`}
                                    color={getRequisitosObligatoriosCumplidos() === getRequisitosObligatorios() ? "success" : "warning"}
                                    size="small"
                                />
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={(getRequisitosCumplidos() / requisitosInfo.length) * 100}
                                sx={{ mb: 3, height: 8, borderRadius: 4 }}
                            />

                            <List>
                                {requisitosInfo.map((requisito) => (
                                    <ListItem key={requisito.key} sx={{ px: 0 }}>
                                        <ListItemIcon>
                                            <Checkbox
                                                checked={requisitos[requisito.key]}
                                                onChange={() => handleToggleRequisito(requisito.key)}
                                                color="primary"
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {requisito.label}
                                                    </Typography>
                                                    {requisito.obligatorio && (
                                                        <Chip
                                                            label="Obligatorio"
                                                            size="small"
                                                            color="error"
                                                            sx={{ ml: 1 }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={requisito.descripcion}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Card>

                        {getRequisitosObligatoriosCumplidos() < getRequisitosObligatorios() && (
                            <Alert severity="warning">
                                <Typography variant="body2">
                                    <strong>Atención:</strong> Debe completar todos los requisitos obligatorios antes de continuar con el cierre.
                                </Typography>
                            </Alert>
                        )}

                        {getRequisitosObligatoriosCumplidos() === getRequisitosObligatorios() && (
                            <Alert severity="success">
                                <Typography variant="body2">
                                    <strong>¡Perfecto!</strong> Todos los requisitos obligatorios han sido completados.
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                )

            case 2:
                return (
                    <Box>
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>Importante:</strong> Una vez confirmado el cierre, no podrá revertir esta acción. Revise cuidadosamente toda la información.
                            </Typography>
                        </Alert>

                        <Card elevation={2} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Resumen del Cierre
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Motivo:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {motivosCierre.find(m => m.value === motivoCierre)?.label}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Tipo:
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={tiposCierre.find(t => t.value === tipoCierre)?.label}
                                        color={tiposCierre.find(t => t.value === tipoCierre)?.color as any}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Fecha:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {fechaCierre}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Responsable:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {responsable}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Observaciones:
                                    </Typography>
                                    <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                        <Typography variant="body2">
                                            {observaciones}
                                        </Typography>
                                    </Paper>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Requisitos completados: {getRequisitosCumplidos()}/{requisitosInfo.length}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {requisitosInfo
                                            .filter(r => requisitos[r.key])
                                            .map(r => (
                                                <Chip
                                                    key={r.key}
                                                    label={r.label}
                                                    size="small"
                                                    color="success"
                                                    icon={<CheckCircleIcon />}
                                                />
                                            ))
                                        }
                                    </Box>
                                </Box>
                            </Box>
                        </Card>

                        <Card elevation={1} sx={{ p: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={confirmacionCierre}
                                        onChange={(e) => setConfirmacionCierre(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        Confirmo que he revisado toda la información y autorizo el cierre de la medida.
                                        Entiendo que esta acción no se puede revertir.
                                    </Typography>
                                }
                            />
                        </Card>
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GavelIcon sx={{ mr: 1, color: 'warning.main' }} />
                    {title}
                </Box>
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
                            color="warning"
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
                            Cerrar Medida
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

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', color: 'warning.main' }}>
                    <WarningIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">
                        Confirmar Cierre de Medida
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
                        ¿Está seguro que desea cerrar esta medida?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Esta acción no se puede revertir y la medida quedará marcada como cerrada definitivamente.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={() => setShowConfirmation(false)}
                        sx={{ textTransform: 'none', mr: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmSave}
                        variant="contained"
                        color="warning"
                        startIcon={<SaveIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        Confirmar Cierre
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    )
} 