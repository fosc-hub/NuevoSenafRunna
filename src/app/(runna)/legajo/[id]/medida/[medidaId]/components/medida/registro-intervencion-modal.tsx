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
    AccordionDetails
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import DownloadIcon from "@mui/icons-material/Download"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import EmailIcon from "@mui/icons-material/Email"
import { PlanTrabajoTab } from "./mpe-tabs/plan-trabajo-tab"

interface RegistroIntervencionModalProps {
    open: boolean
    onClose: () => void
}

export const RegistroIntervencionModal: React.FC<RegistroIntervencionModalProps> = ({
    open,
    onClose
}) => {
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

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
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
                borderBottom: '1px solid #e0e0e0'
            }}>
                Registro de Intervención MPE
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

            <DialogContent sx={{ px: 4, py: 3, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Basic Information */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            label="Código"
                            value="Autogenerado"
                            disabled
                            variant="outlined"
                        />
                        <TextField
                            label="Fecha de intervención"
                            type="date"
                            value="2025-12-12"
                            onChange={(e) => handleInputChange('fechaIntervencion', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Legajo"
                            value={formData.legajo}
                            onChange={(e) => handleInputChange('legajo', e.target.value)}
                            variant="outlined"
                        />
                        <Box />
                        <TextField
                            label="Nombre"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            label="Apellido"
                            value={formData.apellido}
                            onChange={(e) => handleInputChange('apellido', e.target.value)}
                            variant="outlined"
                        />
                    </Box>

                    {/* Dropdowns */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <FormControl fullWidth>
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

                        <FormControl fullWidth>
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

                        <FormControl fullWidth>
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

                        <FormControl fullWidth>
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

                        <FormControl fullWidth>
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

                        <FormControl fullWidth>
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

                        <FormControl fullWidth>
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

                        <FormControl fullWidth>
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
                    </Box>

                    {/* Estado */}
                    <FormControl fullWidth>
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

                    {/* Detalles */}
                    <TextField
                        label="Detalles de la intervención"
                        multiline
                        rows={4}
                        fullWidth
                        value={formData.detalles}
                        onChange={(e) => handleInputChange('detalles', e.target.value)}
                        placeholder="Ingrese los detalles de la intervención..."
                    />

                    {/* File Upload Section */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Descargar modelo de apertura de MPE.
                                <br />
                                Recuerde que luego de completarlo debe adjuntarlo Firmado
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                sx={{ textTransform: "none", borderRadius: 2 }}
                            >
                                Descargar
                            </Button>
                        </Box>

                        <Paper
                            sx={{
                                border: '2px dashed #ccc',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                mb: 2
                            }}
                        >
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1 }}>Upload files</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Upload files by dropping them in this window, OR{" "}
                                <Button variant="text" sx={{ textTransform: "none" }}>
                                    Choose Files
                                </Button>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Only .jpg and .png files. 500KB max file size.
                            </Typography>
                        </Paper>

                        {/* Uploaded Files */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                            {uploadedFiles.map((fileName, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1,
                                        backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                        borderRadius: 1
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AttachFileIcon sx={{ color: 'primary.main', mr: 1 }} />
                                        <Typography variant="body2">{fileName}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                            (1.1 kB)
                                        </Typography>
                                    </Box>
                                    <IconButton size="small">
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="outlined" sx={{ textTransform: "none", borderRadius: 2 }}>
                                Cancel
                            </Button>
                            <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }}>
                                Import Files
                            </Button>
                        </Box>
                    </Box>

                    {/* Plan de trabajo */}
                    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                        <PlanTrabajoTab medidaData={{}} />
                    </Box>

                    {/* Guardar intervención button */}
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: 600,
                        }}
                    >
                        Guardar intervención
                    </Button>

                    {/* Additional sections */}
                    <Divider sx={{ my: 2 }} />

                    {/* Fotocopia del DNI */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                            Fotocopia del DNI 12/12/2025
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                            Adjuntar
                        </Button>
                    </Box>

                    {/* Informes ampliatorios */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Informes ampliatorios
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Es posible enviar notificaciones
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
                                                        Secondary text
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

                    {/* Notificaciones */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Notificaciones
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Es posible enviar notificaciones
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
                                                        Notificacion {num}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Secondary text
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

                    {/* Acta */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Acta
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Es posible enviar notificaciones
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

                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Fecha: 12/12/2025
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }}>
                                        Adjuntar acta de de puesta en conocimiento al NNyA
                                    </Button>
                                    <Button variant="contained" sx={{ textTransform: "none", borderRadius: 2 }}>
                                        Adjuntar acta de resguardo
                                    </Button>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* Motivo de vulneraciones */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Motivo de vulneraciones
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: 600,
                            }}
                        >
                            Enviar a la dirección
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
} 