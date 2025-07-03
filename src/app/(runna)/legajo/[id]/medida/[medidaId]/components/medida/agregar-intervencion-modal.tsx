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
    MenuItem
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"

interface AgregarIntervencionModalProps {
    open: boolean
    onClose: () => void
}

const tiposIntervencion = [
    { value: "seguimiento", label: "Seguimiento" },
    { value: "evaluacion", label: "Evaluación" },
    { value: "informe", label: "Informe" },
    { value: "otro", label: "Otro" }
]

export const AgregarIntervencionModal: React.FC<AgregarIntervencionModalProps> = ({ open, onClose }) => {
    const [fecha, setFecha] = useState<string>("")
    const [tipo, setTipo] = useState<string>("")
    const [archivo, setArchivo] = useState<File | null>(null)
    const [observaciones, setObservaciones] = useState<string>("")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setArchivo(e.target.files[0])
        }
    }

    const handleSave = () => {
        // Save logic here
        onClose()
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
        >
            <DialogTitle sx={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '1.25rem',
                position: 'relative',
                pb: 1,
                borderBottom: '1px solid #e0e0e0'
            }}>
                Agregar intervención
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 4, py: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Fecha */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Fecha
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
                    {/* Tipo */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Tipo
                        </Typography>
                        <TextField
                            select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            variant="outlined"
                            fullWidth
                            placeholder="Seleccione tipo"
                            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(0, 0, 0, 0.03)' } }}
                        >
                            {tiposIntervencion.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    {/* Adjuntar documento */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Adjuntar documento
                        </Typography>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<AttachFileIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            {archivo ? archivo.name : "Seleccionar archivo"}
                            <input type="file" hidden onChange={handleFileChange} />
                        </Button>
                    </Box>
                    {/* Observaciones */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Observaciones
                        </Typography>
                        <TextField
                            multiline
                            rows={3}
                            fullWidth
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Ingrese sus observaciones aquí"
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(0, 0, 0, 0.03)' } }}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 4, pb: 3, pt: 2 }}>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ textTransform: "none", borderRadius: 2, py: 1.5, fontWeight: 600 }}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    )
} 