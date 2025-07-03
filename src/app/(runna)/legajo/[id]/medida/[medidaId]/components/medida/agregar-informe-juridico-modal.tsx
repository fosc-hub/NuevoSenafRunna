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
    Checkbox,
    FormControlLabel,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Divider
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import AddIcon from "@mui/icons-material/Add"
import GroupIcon from "@mui/icons-material/Group"

interface AgregarInformeJuridicoModalProps {
    open: boolean
    onClose: () => void
}

const motivos = [
    { id: 1, motivo: "Discriminación", submotivo: "Discriminación por origen étnico" },
    { id: 2, motivo: "Violencia", submotivo: "Violencia física" }
]

const instituciones = [
    { id: 1, nombre: "Escuela 1" },
    { id: 2, nombre: "Hospital 2" }
]

export const AgregarInformeJuridicoModal: React.FC<AgregarInformeJuridicoModalProps> = ({ open, onClose }) => {
    const [fecha, setFecha] = useState<string>("")
    const [mainMotivo, setMainMotivo] = useState<number>(1)
    const [fundDerechos, setFundDerechos] = useState<string>("")
    const [fundTrayectoria, setFundTrayectoria] = useState<string>("")
    const [fundInforme, setFundInforme] = useState<string>("")
    const [objetivo, setObjetivo] = useState<string>("")
    const [plazo, setPlazo] = useState<string>("")
    const [potencialidades, setPotencialidades] = useState<string>("")
    const [obsPotencialidades, setObsPotencialidades] = useState<string>("")
    const [actorTipo, setActorTipo] = useState<string>("")
    const [actorNombre, setActorNombre] = useState<string>("")
    const [actorContacto, setActorContacto] = useState<string>("")
    const [otrosActores, setOtrosActores] = useState<string>("")
    const [participacionLocal, setParticipacionLocal] = useState<{ articulacion: boolean, derivacion: boolean }>({ articulacion: false, derivacion: false })
    const [areaArticulacion, setAreaArticulacion] = useState<string>("")
    const [areaDerivacion, setAreaDerivacion] = useState<string>("")

    const handleGuardar = () => {
        // Save logic here
        onClose()
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, maxHeight: '95vh' } }}
        >
            <DialogTitle sx={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '1.5rem',
                position: 'relative',
                pb: 1,
                borderBottom: '1px solid #e0e0e0'
            }}>
                Agregar informe jurídico
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 4, py: 3, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Fecha de apertura */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Fecha de apertura
                        </Typography>
                        <Box sx={{ position: 'relative' }}>
                            <TextField
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                variant="outlined"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                placeholder="DD/MM/AAAA"
                                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(0, 0, 0, 0.03)' } }}
                            />
                            <CalendarTodayIcon sx={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'primary.main',
                                pointerEvents: 'none'
                            }} />
                        </Box>
                    </Box>

                    {/* Vulneraciones registradas */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Vulneraciones registradas
                        </Typography>
                        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, background: '#fff' }}>
                            {motivos.map((m) => (
                                <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Motivo: {m.motivo}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Submotivo: {m.submotivo}
                                        </Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={<Checkbox checked={mainMotivo === m.id} onChange={() => setMainMotivo(m.id)} color="primary" />}
                                        label={<Typography variant="body2">Motivo principal</Typography>}
                                        sx={{ mr: 0 }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Fundamentacion de la MPI */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Fundamentación de la MPI
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Se pone a disposición la fundamentación de la evaluación y se puede editar
                        </Typography>
                        <TextField
                            fullWidth
                            value={fundDerechos}
                            onChange={(e) => setFundDerechos(e.target.value)}
                            placeholder="Cuales son los derechos vulnerados"
                            variant="outlined"
                            sx={{ mb: 2, backgroundColor: 'white', borderRadius: 2 }}
                        />
                        <TextField
                            fullWidth
                            value={fundTrayectoria}
                            onChange={(e) => setFundTrayectoria(e.target.value)}
                            placeholder="Trayectoria familiar (relaciones vinculares)"
                            variant="outlined"
                            sx={{ mb: 2, backgroundColor: 'white', borderRadius: 2 }}
                        />
                        <TextField
                            fullWidth
                            value={fundInforme}
                            onChange={(e) => setFundInforme(e.target.value)}
                            placeholder="Traer el texto del informe de evaluación"
                            variant="outlined"
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />
                    </Box>

                    {/* Objetivo general */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Objetivo general
                        </Typography>
                        <TextField
                            fullWidth
                            value={objetivo}
                            onChange={(e) => setObjetivo(e.target.value)}
                            placeholder="Ingrese la conclusión de la constatación..."
                            variant="outlined"
                            sx={{ mb: 2, backgroundColor: 'white', borderRadius: 2 }}
                        />
                        <TextField
                            fullWidth
                            value={plazo}
                            onChange={(e) => setPlazo(e.target.value)}
                            placeholder="Plazo aproximado de la medida"
                            variant="outlined"
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />
                    </Box>

                    {/* Descripcion de potencialidades */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Descripción de potencialidades del NNyA y del grupo familiar para superar la situación
                        </Typography>
                        <TextField
                            fullWidth
                            value={potencialidades}
                            onChange={(e) => setPotencialidades(e.target.value)}
                            placeholder="Potencialidades para el abordaje"
                            variant="outlined"
                            sx={{ mb: 2, backgroundColor: 'white', borderRadius: 2 }}
                        />
                        <TextField
                            fullWidth
                            value={obsPotencialidades}
                            onChange={(e) => setObsPotencialidades(e.target.value)}
                            placeholder="Observaciones de potencialidades"
                            variant="outlined"
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />
                    </Box>

                    {/* Actores con los que se va a trabajar */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Actores con los que se va a trabajar
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={actorTipo}
                                    onChange={(e) => setActorTipo(e.target.value)}
                                    label="Tipo"
                                >
                                    <MenuItem value="">Select...</MenuItem>
                                    <MenuItem value="institucion">Institución</MenuItem>
                                    <MenuItem value="organizacion">Organización</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                placeholder="Nombre de la institución"
                                value={actorNombre}
                                onChange={(e) => setActorNombre(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                placeholder="Referente de contacto"
                                value={actorContacto}
                                onChange={(e) => setActorContacto(e.target.value)}
                            />
                        </Box>
                        <TextField
                            fullWidth
                            placeholder="Otros actores"
                            value={otrosActores}
                            onChange={(e) => setOtrosActores(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Seleccionar motivo principal (en gral es el más grave)
                        </Typography>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<AddIcon />}
                            sx={{ borderColor: '#4f3ff0', color: '#4f3ff0', borderRadius: 2, fontWeight: 600, mb: 2 }}
                        >
                            Agregar vulneración
                        </Button>
                    </Box>

                    {/* Participación local */}
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Participación local
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fff', borderRadius: 2, p: 2, border: '1px solid #e0e0e0' }}>
                                <FormControlLabel
                                    control={<Checkbox checked={participacionLocal.articulacion} onChange={e => setParticipacionLocal(pl => ({ ...pl, articulacion: e.target.checked }))} />}
                                    label={<Typography variant="body2">Articulación con el Área local</Typography>}
                                />
                                <TextField
                                    placeholder="Cual area local"
                                    value={areaArticulacion}
                                    onChange={e => setAreaArticulacion(e.target.value)}
                                    sx={{ flex: 1 }}
                                />
                                <IconButton color="primary">
                                    <GroupIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fff', borderRadius: 2, p: 2, border: '1px solid #e0e0e0' }}>
                                <FormControlLabel
                                    control={<Checkbox checked={participacionLocal.derivacion} onChange={e => setParticipacionLocal(pl => ({ ...pl, derivacion: e.target.checked }))} />}
                                    label={<Typography variant="body2">Derivación al Área local</Typography>}
                                />
                                <TextField
                                    placeholder="Cual area local"
                                    value={areaDerivacion}
                                    onChange={e => setAreaDerivacion(e.target.value)}
                                    sx={{ flex: 1 }}
                                />
                                <IconButton color="primary">
                                    <GroupIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 4, pb: 3, pt: 2, flexDirection: 'column', gap: 2 }}>
                <Button
                    onClick={handleGuardar}
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ textTransform: "none", borderRadius: 2, py: 1.5, fontWeight: 600, backgroundColor: '#4f3ff0', '&:hover': { backgroundColor: '#3a2cc2' } }}
                >
                    Guardar
                </Button>
                <Button
                    onClick={onClose}
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ textTransform: "none", borderRadius: 2, py: 1.5, fontWeight: 600, backgroundColor: '#ece9fd', color: '#4f3ff0', '&:hover': { backgroundColor: '#d1c9f6' } }}
                >
                    cancelar
                </Button>
            </DialogActions>
        </Dialog>
    )
} 