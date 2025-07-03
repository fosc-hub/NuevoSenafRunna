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
    Card,
    CardContent,
    Tabs,
    Tab,
    Divider
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import DownloadIcon from "@mui/icons-material/Download"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import EmailIcon from "@mui/icons-material/Email"

interface PlanAccionModalProps {
    open: boolean
    onClose: () => void
}

interface Institucion {
    id: number
    nombre: string
    referente: string
}

export const PlanAccionModal: React.FC<PlanAccionModalProps> = ({
    open,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<number>(0)
    const [tipoActividad1, setTipoActividad1] = useState<string>("")
    const [tipoActividad2, setTipoActividad2] = useState<string>("")
    const [nombreUsuario, setNombreUsuario] = useState<string>("")
    const [referenteContacto, setReferenteContacto] = useState<string>("")
    const [nombreInstitucion, setNombreInstitucion] = useState<string>("")
    const [referenteInstitucion, setReferenteInstitucion] = useState<string>("")
    const [fechaPlanificacion, setFechaPlanificacion] = useState<string>("")
    const [fechaResolucion, setFechaResolucion] = useState<string>("")
    const [descripcion, setDescripcion] = useState<string>("")

    const [instituciones, setInstituciones] = useState<Institucion[]>([
        { id: 1, nombre: "Institucion 1", referente: "Referente" },
        { id: 2, nombre: "Institucion 2", referente: "Referente2" }
    ])

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue)
    }

    const handleAddInstitucion = () => {
        if (nombreInstitucion && referenteInstitucion) {
            const newId = instituciones.length + 1
            setInstituciones([...instituciones, {
                id: newId,
                nombre: nombreInstitucion,
                referente: referenteInstitucion
            }])
            setNombreInstitucion("")
            setReferenteInstitucion("")
        }
    }

    const handleRemoveInstitucion = (id: number) => {
        setInstituciones(instituciones.filter(inst => inst.id !== id))
    }

    const handleSave = () => {
        // Handle form submission
        console.log("Guardando plan de acción...")
        onClose()
    }

    const handleCancel = () => {
        // Reset form or show confirmation
        onClose()
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
                    maxHeight: '95vh'
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
                Plan de Acción MPE
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
                    {/* Tipo de actividad */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                            Tipo de actividad
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Select...</InputLabel>
                                <Select
                                    value={tipoActividad1}
                                    onChange={(e) => setTipoActividad1(e.target.value)}
                                    label="Select..."
                                >
                                    <MenuItem value="actividad1">Actividad 1</MenuItem>
                                    <MenuItem value="actividad2">Actividad 2</MenuItem>
                                    <MenuItem value="actividad3">Actividad 3</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Select...</InputLabel>
                                <Select
                                    value={tipoActividad2}
                                    onChange={(e) => setTipoActividad2(e.target.value)}
                                    label="Select..."
                                >
                                    <MenuItem value="subactividad1">Subactividad 1</MenuItem>
                                    <MenuItem value="subactividad2">Subactividad 2</MenuItem>
                                    <MenuItem value="subactividad3">Subactividad 3</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* Tabs */}
                    <Box>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                mb: 3,
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontSize: '0.875rem'
                                }
                            }}
                        >
                            <Tab label="Equipo técnico" />
                            <Tab label="Equipos residenciales" />
                            <Tab label="Adultos responsables/Institución" />
                        </Tabs>

                        {/* Tab Content */}
                        {activeTab === 0 && (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Contenido de Equipo técnico - En desarrollo
                                </Typography>
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Contenido de Equipos residenciales - En desarrollo
                                </Typography>
                            </Box>
                        )}

                        {activeTab === 2 && (
                            <Box>
                                {/* Acta compromiso button */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<AttachFileIcon />}
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: 2,
                                        }}
                                    >
                                        Acta compromiso
                                    </Button>
                                </Box>

                                {/* Referente de la gestión */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                                        Referente de la gestión
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                        <TextField
                                            label="Nombre del usuario"
                                            value={nombreUsuario}
                                            onChange={(e) => setNombreUsuario(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                        <TextField
                                            label="Referente de contacto"
                                            value={referenteContacto}
                                            onChange={(e) => setReferenteContacto(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                </Box>

                                {/* Con quien estoy trabajando la actividad */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                                        Con quien estoy trabajando la actividad (Referente)
                                    </Typography>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 2, alignItems: 'end', mb: 2 }}>
                                        <TextField
                                            label="Nombre de la institución"
                                            value={nombreInstitucion}
                                            onChange={(e) => setNombreInstitucion(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                        <TextField
                                            label="Referente de contacto"
                                            value={referenteInstitucion}
                                            onChange={(e) => setReferenteInstitucion(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                        <IconButton
                                            onClick={handleAddInstitucion}
                                            color="primary"
                                            sx={{
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'primary.dark',
                                                }
                                            }}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>

                                    {/* Institution Cards */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {instituciones.map((institucion) => (
                                            <Card key={institucion.id} variant="outlined">
                                                <CardContent sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    py: 1,
                                                    '&:last-child': { pb: 1 }
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <EmailIcon sx={{ color: 'primary.main', mr: 2 }} />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {institucion.nombre}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {institucion.referente}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <IconButton
                                                        onClick={() => handleRemoveInstitucion(institucion.id)}
                                                        size="small"
                                                        color="error"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Fecha de planificación */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Fecha de planificación de actividad
                        </Typography>
                        <TextField
                            type="date"
                            value={fechaPlanificacion}
                            onChange={(e) => setFechaPlanificacion(e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            placeholder="DD/MM/AAAA"
                        />
                    </Box>

                    {/* Descripción */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Descripción
                        </Typography>
                        <TextField
                            multiline
                            rows={4}
                            fullWidth
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Describe la actividad..."
                            variant="outlined"
                        />
                    </Box>

                    {/* Fecha probable de resolución */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Fecha probable de resolución
                        </Typography>
                        <TextField
                            type="date"
                            value={fechaResolucion}
                            onChange={(e) => setFechaResolucion(e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            placeholder="DD/MM/AAAA"
                        />
                    </Box>

                    {/* File attachment */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<AttachFileIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Adjuntar archivo
                            </Button>
                        </Box>

                        {/* Archivo adjunto */}
                        <Card variant="outlined">
                            <CardContent sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 1,
                                '&:last-child': { pb: 1 }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AttachFileIcon sx={{ color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Archivo 1
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Secondary text
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton size="small">
                                    <DownloadIcon fontSize="small" />
                                </IconButton>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 3, pt: 2, flexDirection: 'column', gap: 2 }}>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                    }}
                >
                    Guardar Plan de Acción
                </Button>
                <Button
                    onClick={handleCancel}
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                    }}
                >
                    Cancelar
                </Button>
            </DialogActions>
        </Dialog>
    )
} 