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
    IconButton
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import DownloadIcon from "@mui/icons-material/Download"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"

interface AdjuntarNotaModalProps {
    open: boolean
    onClose: () => void
    title?: string
    modeloTexto?: string
    sectionNumber?: string
    sectionTitle?: string
}

export const AdjuntarNotaModal: React.FC<AdjuntarNotaModalProps> = ({
    open,
    onClose,
    title = "Adjuntar nota aprobación",
    modeloTexto = "Descargar modelo de nota",
    sectionNumber = "1",
    sectionTitle = "Nota de Aprobación"
}) => {
    const [fecha, setFecha] = useState<string>("")
    const [observaciones, setObservaciones] = useState<string>("")
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<string>("")

    const handleSave = () => {
        // Handle save logic
        console.log("Guardando nota...")
        onClose()
    }

    const handleDescargarModelo = () => {
        // Handle download model
        console.log("Descargando modelo...")
    }

    const handleSeleccionarArchivo = () => {
        // Handle file selection
        console.log("Seleccionando archivo...")
        setArchivoSeleccionado("documento_ejemplo.pdf")
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh'
                }
            }}
        >
            {/* Header */}
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

            <DialogContent sx={{ px: 4, py: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Nota Section */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                            {sectionNumber}. {sectionTitle}
                        </Typography>

                        {/* Download Model Button */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
                            borderRadius: 1,
                            mb: 2
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                {modeloTexto}
                            </Typography>
                            <IconButton
                                onClick={handleDescargarModelo}
                                sx={{
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    }
                                }}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </Box>

                        {/* Select File Button */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
                            borderRadius: 1
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                {archivoSeleccionado || "Seleccionar archivo"}
                            </Typography>
                            <IconButton
                                onClick={handleSeleccionarArchivo}
                                sx={{
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    }
                                }}
                            >
                                <AttachFileIcon />
                            </IconButton>
                        </Box>
                    </Box>

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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                    }
                                }}
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

                    {/* Observaciones */}
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
                            placeholder="Ingrese sus observaciones aquí"
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                }
                            }}
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
                    startIcon={<AttachFileIcon />}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                    }}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    )
} 