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
    Card,
    CardContent,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import DescriptionIcon from "@mui/icons-material/Description"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"

interface AdjuntarDNIModalProps {
    open: boolean
    onClose: () => void
    title?: string
}

export default function AdjuntarDNIModal({
    open,
    onClose,
    title = "Adjuntar DNI"
}: AdjuntarDNIModalProps) {
    const [dniDisponible, setDniDisponible] = useState<string>("Si")
    const [documentos] = useState([
        { id: 1, nombre: "DNI del NNyA", descripcion: "Fotocopia frente y dorso" },
        { id: 2, nombre: "Documento alternativo", descripcion: "En caso de no contar con DNI" }
    ])

    const handleSave = () => {
        console.log("Guardando documentos DNI...")
        onClose()
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
                    {/* DNI Availability Question */}
                    <Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            ¿El NNyA cuenta con DNI?
                        </Typography>
                        <RadioGroup
                            row
                            value={dniDisponible}
                            onChange={(e) => setDniDisponible(e.target.value)}
                        >
                            <FormControlLabel
                                value="Si"
                                control={<Radio />}
                                label="Sí"
                            />
                            <FormControlLabel
                                value="No"
                                control={<Radio />}
                                label="No"
                            />
                        </RadioGroup>
                    </Box>

                    {/* Add Document Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                fontWeight: 600
                            }}
                        >
                            Agregar documento
                        </Button>
                    </Box>

                    {/* Documents List */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {documentos.map((documento) => (
                            <Card key={documento.id} variant="outlined">
                                <CardContent sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 1.5,
                                    '&:last-child': { pb: 1.5 }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <DescriptionIcon sx={{ color: 'primary.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {documento.nombre}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {documento.descripcion}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                            color: 'primary.main',
                                            '&:hover': {
                                                backgroundColor: 'rgba(63, 81, 181, 0.2)',
                                            }
                                        }}
                                    >
                                        <CloudUploadIcon fontSize="small" />
                                    </IconButton>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* Instructions */}
                    <Typography variant="body2" color="text.secondary" sx={{
                        mt: 1,
                        p: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 1
                    }}>
                        Formatos aceptados: PDF, JPG, PNG (máximo 5MB). Asegúrese de que la imagen sea legible y contenga toda la información necesaria.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 3, pt: 2 }}>
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
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    )
} 