"use client"

import type React from "react"
import {
    Box,
    Typography,
    Paper,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    TextField,
    IconButton,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Grid
} from "@mui/material"
import { useState, useMemo } from "react"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import { PlanTrabajoTab } from "./plan-trabajo-tab"
import { InformacionEducativaSection } from "../shared/InformacionEducativaSection"
import { InformacionSaludSection } from "../shared/InformacionSaludSection"
import { TalleresSection } from "../shared/TalleresSection"
import { mapEducacionFromDemanda, mapSaludFromDemandaEnhanced } from "../../../utils/seguimiento-mapper"

interface SituacionCritica {
    id: number
    tipo: string
    fecha: string
    residencia: string
}

const mockSituaciones: SituacionCritica[] = [
    {
        id: 1,
        tipo: "RSA",
        fecha: "12/12/2025",
        residencia: "San Martin"
    },
    {
        id: 2,
        tipo: "RSA",
        fecha: "12/12/2025",
        residencia: "San Martin"
    }
]

// --- Cambio de lugar de resguardo ---
const mockResguardos = [
    { id: 1, nombre: "Lugar de resguardo 1", fecha: "12/12/2025", residencia: "San Martin" },
    { id: 2, nombre: "Lugar de resguardo 2", fecha: "12/12/2025", residencia: "San Martin 2" },
]

const CambioLugarResguardoSection = () => {
    const [selectedLugar, setSelectedLugar] = useState("")
    const [fecha, setFecha] = useState("12/12/2025")
    const [modalOpen, setModalOpen] = useState(false)
    const [nota, setNota] = useState("")

    return (
        <Box>
            <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
                Cambio de lugar de resguardo
            </Typography>
            <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Typography sx={{ color: "#6C3EB8", fontWeight: 500, mb: 1 }}>
                    <span style={{ color: "#3B3BB3", textDecoration: "underline", cursor: "pointer" }}>
                        Residencia actual: San Martin 4
                    </span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Fecha de entrada a la residencia: 12/12/2025
                </Typography>
            </Paper>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography sx={{ flex: 1 }}>Seleccionar nuevo lugar de resguardo</Typography>
                <TextField
                    select
                    size="small"
                    value={selectedLugar}
                    onChange={e => setSelectedLugar(e.target.value)}
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="">- Seleccionar -</MenuItem>
                    <MenuItem value="San Martin 1">San Martin 1</MenuItem>
                    <MenuItem value="San Martin 2">San Martin 2</MenuItem>
                </TextField>
                <TextField
                    type="date"
                    size="small"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    sx={{ width: 140 }}
                />
                <Button
                    variant="contained"
                    sx={{ background: "#6C3EB8", borderRadius: 2, textTransform: "none" }}
                >
                    Agregar fecha
                </Button>
                <Button
                    variant="contained"
                    sx={{ background: "#3B3BB3", borderRadius: 2, textTransform: "none" }}
                    onClick={() => setModalOpen(true)}
                >
                    Adjuntar nota
                </Button>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {mockResguardos.map(resguardo => (
                    <Card key={resguardo.id} elevation={1} sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {resguardo.nombre}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {resguardo.fecha}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Residencia: {resguardo.residencia}
                                    </Typography>
                                </Box>
                                <IconButton color="primary" sx={{ backgroundColor: "rgba(25, 118, 210, 0.1)" }}>
                                    <AttachFileIcon />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>Adjuntar nota</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nota"
                        multiline
                        minRows={3}
                        value={nota}
                        onChange={e => setNota(e.target.value)}
                        fullWidth
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)} color="secondary">Cancelar</Button>
                    <Button onClick={() => setModalOpen(false)} variant="contained" color="primary">Adjuntar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

// --- Notas de seguimiento ---
const mockNotas = [
    { id: 1, fecha: "12/12/2025", detalle: "Detalle de la nota" },
    { id: 2, fecha: "12/12/2025", detalle: "Detalle de la nota" },
]

// Situación del NNyA en Residencia (MPE specific) - Moved outside parent component
const SituacionResidenciaSection = () => {
    const [tipoSituacion, setTipoSituacion] = useState<'AUTORIZACION' | 'PERMISO' | 'PERMISO_PROLONGADO'>('AUTORIZACION')
    const [fechaSituacion, setFechaSituacion] = useState('')
    const [observaciones, setObservaciones] = useState('')

    return (
        <Box>
            <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
                Situación del NNyA en Residencia
            </Typography>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                Tipo de Situación
                            </Typography>
                            <RadioGroup
                                row
                                value={tipoSituacion}
                                onChange={(e) => setTipoSituacion(e.target.value as 'AUTORIZACION' | 'PERMISO' | 'PERMISO_PROLONGADO')}
                            >
                                <FormControlLabel value="AUTORIZACION" control={<Radio />} label="Autorización" />
                                <FormControlLabel value="PERMISO" control={<Radio />} label="Permiso" />
                                <FormControlLabel value="PERMISO_PROLONGADO" control={<Radio />} label="Permiso Prolongado" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha"
                            value={fechaSituacion}
                            onChange={(e) => setFechaSituacion(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Observaciones"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                            Guardar Situación
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    )
}

const NotasSeguimientoSection = () => {
    const [nota, setNota] = useState("")
    const [fecha, setFecha] = useState("12/12/2025")
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <Box>
            <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}>
                Notas de seguimiento
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <TextField
                    label="Nota"
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                />
                <TextField
                    type="date"
                    size="small"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    sx={{ width: 140 }}
                />
                <Button
                    variant="contained"
                    sx={{ background: "#6C3EB8", borderRadius: 2, textTransform: "none" }}
                >
                    Agregar fecha
                </Button>
                <Button
                    variant="contained"
                    sx={{ background: "#3B3BB3", borderRadius: 2, textTransform: "none" }}
                    onClick={() => setModalOpen(true)}
                >
                    Adjuntar nota
                </Button>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {mockNotas.map(nota => (
                    <Card key={nota.id} elevation={1} sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        Nota de seguimiento
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {nota.fecha}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {nota.detalle}
                                    </Typography>
                                </Box>
                                <IconButton color="primary" sx={{ backgroundColor: "rgba(25, 118, 210, 0.1)" }}>
                                    <AttachFileIcon />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>Adjuntar nota</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nota"
                        multiline
                        minRows={3}
                        value={nota}
                        onChange={e => setNota(e.target.value)}
                        fullWidth
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)} color="secondary">Cancelar</Button>
                    <Button onClick={() => setModalOpen(false)} variant="contained" color="primary">Adjuntar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

interface ResidenciasTabProps {
    demandaData?: any // Full demanda data from the full-detail endpoint
    personaId?: number // Optional specific persona ID to use
}

export const ResidenciasTab: React.FC<ResidenciasTabProps> = ({
    demandaData,
    personaId
}) => {
    const [selectedSection, setSelectedSection] = useState<string>("situacion-residencia")
    const [selectedTipo, setSelectedTipo] = useState<string>("RSA")
    const [fecha, setFecha] = useState<string>("12/12/2025")
    const [situaciones] = useState<SituacionCritica[]>(mockSituaciones)

    // Transform demanda data to seguimiento format
    const educacionData = useMemo(() => {
        if (!demandaData) return undefined
        return mapEducacionFromDemanda(demandaData, personaId)
    }, [demandaData, personaId])

    const saludData = useMemo(() => {
        if (!demandaData) return undefined
        return mapSaludFromDemandaEnhanced(demandaData, personaId)
    }, [demandaData, personaId])

    const sidebarOptions = [
        { id: "situacion-residencia", label: "Situación del NNyA en Residencia" },
        { id: "informacion-educativa", label: "Información Educativa" },
        { id: "informacion-salud", label: "Información de Salud" },
        { id: "talleres", label: "Talleres Recreativos y Sociolaborales" },
        { id: "cambio-lugar", label: "Cambio de Lugar de Resguardo" },
        { id: "notas-seguimiento", label: "Notas de Seguimiento" }
    ]

    const handleTipoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedTipo(event.target.value)
    }

    const renderSituacionesCriticas = () => (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Situaciones críticas
            </Typography>

            {/* Radio buttons for situation types */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                    row
                    value={selectedTipo}
                    onChange={handleTipoChange}
                    sx={{ gap: 3 }}
                >
                    <FormControlLabel
                        value="RSA"
                        control={<Radio color="primary" />}
                        label="RSA"
                    />
                    <FormControlLabel
                        value="BP"
                        control={<Radio color="primary" />}
                        label="BP"
                    />
                    <FormControlLabel
                        value="DCS"
                        control={<Radio color="primary" />}
                        label="DCS"
                    />
                    <FormControlLabel
                        value="SCP"
                        control={<Radio color="primary" />}
                        label="SCP"
                    />
                </RadioGroup>
            </FormControl>

            {/* Date and action buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <TextField
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Agregar fecha
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Adjuntar denuncia
                </Button>
            </Box>

            {/* Situation cards */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {situaciones.map((situacion) => (
                    <Card key={situacion.id} elevation={1} sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                        {situacion.tipo}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        {situacion.fecha}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Residencia: {situacion.residencia}
                                    </Typography>
                                </Box>
                                <IconButton
                                    color="primary"
                                    sx={{
                                        backgroundColor: "rgba(25, 118, 210, 0.1)",
                                        "&:hover": {
                                            backgroundColor: "rgba(25, 118, 210, 0.2)",
                                        }
                                    }}
                                >
                                    <AttachFileIcon />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    )

    const renderContent = () => {
        switch (selectedSection) {
            case "situacion-residencia":
                return <SituacionResidenciaSection />
            case "informacion-educativa":
                return <InformacionEducativaSection data={educacionData} />
            case "informacion-salud":
                return <InformacionSaludSection data={saludData} />
            case "talleres":
                return <TalleresSection maxTalleres={5} />
            case "cambio-lugar":
                return <CambioLugarResguardoSection />
            case "notas-seguimiento":
                return <NotasSeguimientoSection />
            default:
                return <SituacionResidenciaSection />
        }
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", gap: 3 }}>
                {/* Sidebar */}
                <Box sx={{ width: 280, flexShrink: 0 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {sidebarOptions.map((option) => (
                            <Button
                                key={option.id}
                                variant={selectedSection === option.id ? "contained" : "outlined"}
                                color="primary"
                                onClick={() => setSelectedSection(option.id)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    justifyContent: "flex-start",
                                    py: 1.5,
                                    px: 2,
                                    fontWeight: selectedSection === option.id ? 600 : 400,
                                }}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </Box>
                </Box>

                {/* Main content */}
                <Box sx={{ flex: 1 }}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, minHeight: 400 }}>
                        {renderContent()}
                    </Paper>
                </Box>
            </Box>
        </Box>
    )
} 