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
import SendIcon from "@mui/icons-material/Send"

interface CompletarInformeModalProps {
    open: boolean
    onClose: () => void
}

export const CompletarInformeModal: React.FC<CompletarInformeModalProps> = ({ open, onClose }) => {
    const [fecha, setFecha] = useState<string>("")
    const [contenido, setContenido] = useState<string>("")
    const [archivo, setArchivo] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setArchivo(e.target.files[0])
        }
    }

    const handleDescargarPlantilla = () => {
        // Download template logic
    }

    const handleAdjuntarJuridico = () => {
        // Trigger file input
        document.getElementById("adjuntar-juridico-input")?.click()
    }

    const handleEnviar = () => {
        // Submit logic
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
                fontSize: '1.5rem',
                position: 'relative',
                pb: 1,
                borderBottom: '1px solid #e0e0e0'
            }}>
                Formulario de Informe mensual (MPI)
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 4, py: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography align="center" variant="body2" sx={{ mt: 1, mb: 2, color: 'grey.700' }}>
                        Fecha del informe*
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDescargarPlantilla}
                        sx={{
                            backgroundColor: '#36d6d0',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: 2,
                            mb: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': { backgroundColor: '#2cc2bc' }
                        }}
                    >
                        Descargar plantilla
                    </Button>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        Contenido del informe*
                    </Typography>
                    <TextField
                        multiline
                        minRows={4}
                        fullWidth
                        value={contenido}
                        onChange={(e) => setContenido(e.target.value)}
                        placeholder="Escriba el contenido detallado del informe aquí..."
                        variant="outlined"
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: 2,
                            mb: 2
                        }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AttachFileIcon />}
                        onClick={handleAdjuntarJuridico}
                        sx={{
                            backgroundColor: '#36d6d0',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: 2,
                            mb: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': { backgroundColor: '#2cc2bc' }
                        }}
                    >
                        Adjuntar informe Jurídico
                        <input
                            id="adjuntar-juridico-input"
                            type="file"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={handleEnviar}
                        sx={{
                            backgroundColor: '#4f3ff0',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': { backgroundColor: '#3a2cc2' }
                        }}
                    >
                        Enviar informe
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    )
} 