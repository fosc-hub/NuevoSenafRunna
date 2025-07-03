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

interface FormularioDocumentoModalProps {
    open: boolean
    onClose: () => void
    title?: string
}

export const FormularioDocumentoModal: React.FC<FormularioDocumentoModalProps> = ({
    open,
    onClose,
    title = "Formulario de Documento"
}) => {
    const [fechaDocumento, setFechaDocumento] = useState<string>("")
    const [observaciones, setObservaciones] = useState<string>("")

    const handleSave = () => {
        // Handle save logic
        console.log("Guardando formulario de documento...")
        onClose()
    }

    const handleDescargarPlantilla = () => {
        // Handle download template
        console.log("Descargando plantilla...")
    }

    const handleAdjuntarInforme = () => {
        // Handle attach report
        console.log("Adjuntando informe jurídico...")
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
                    {/* Fecha del documento */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Fecha del documento
                        </Typography>
                        <TextField
                            type="date"
                            value={fechaDocumento}
                            onChange={(e) => setFechaDocumento(e.target.value)}
                            variant="outlined"
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    {/* Descargar plantilla */}
                    <Box>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleDescargarPlantilla}
                            startIcon={<DownloadIcon />}
                            sx={{
                                backgroundColor: '#4dd0e1',
                                color: 'white',
                                textTransform: "none",
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#26c6da',
                                }
                            }}
                        >
                            Descargar plantilla
                        </Button>
                    </Box>

                    {/* Adjuntar informe jurídico */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                            Adjuntar informe jurídico
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleAdjuntarInforme}
                            startIcon={<AttachFileIcon />}
                            sx={{
                                backgroundColor: '#4dd0e1',
                                color: 'white',
                                textTransform: "none",
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#26c6da',
                                }
                            }}
                        >
                            Adjuntar informe Jurídico
                        </Button>
                    </Box>

                    {/* Observaciones */}
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Observaciones
                        </Typography>
                        <TextField
                            multiline
                            rows={6}
                            fullWidth
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder=""
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
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