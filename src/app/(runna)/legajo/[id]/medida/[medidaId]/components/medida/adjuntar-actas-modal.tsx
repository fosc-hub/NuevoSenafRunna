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
import AssignmentIcon from "@mui/icons-material/Assignment"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"

interface AdjuntarActasModalProps {
    open: boolean
    onClose: () => void
    title?: string
}

export default function AdjuntarActasModal({
    open,
    onClose,
    title = "Adjuntar Actas"
}: AdjuntarActasModalProps) {
    const [actasDisponibles, setActasDisponibles] = useState<string>("Si")
    const [actas] = useState([
        { id: 1, nombre: "Acta de resguardo del NNyA", descripcion: "Documento principal requerido" },
        { id: 2, nombre: "Acta de puesta en conocimiento", descripcion: "Notificación al NNyA" },
        { id: 3, nombre: "Documentación adicional", descripcion: "Otros documentos relevantes" }
    ])

    const handleSave = () => {
        console.log("Guardando actas...")
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
                    {/* Actas Availability Question */}
                    <Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            ¿Se cuenta con las actas requeridas?
                        </Typography>
                        <RadioGroup
                            row
                            value={actasDisponibles}
                            onChange={(e) => setActasDisponibles(e.target.value)}
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
                            Agregar acta
                        </Button>
                    </Box>

                    {/* Actas List */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {actas.map((acta) => (
                            <Card key={acta.id} variant="outlined">
                                <CardContent sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 1.5,
                                    '&:last-child': { pb: 1.5 }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AssignmentIcon sx={{ color: 'primary.main', mr: 2 }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {acta.nombre}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {acta.descripcion}
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
                        Puede adjuntar múltiples documentos. Formatos aceptados: PDF, DOC, DOCX (máximo 10MB cada uno). Asegúrese de incluir todas las actas requeridas.
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