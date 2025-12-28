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
import CloudUploadIcon from "@mui/icons-material/CloudUpload"

export interface DocumentItem {
    id: number
    nombre: string
    descripcion: string
    icon?: React.ReactNode
}

export interface DocumentUploadModalProps {
    open: boolean
    onClose: () => void
    title: string
    question: string
    addButtonLabel: string
    documents: DocumentItem[]
    instructions: string
    defaultIcon?: React.ReactNode
    onSave?: () => void
    onUpload?: (documentId: number) => void
}

export default function DocumentUploadModal({
    open,
    onClose,
    title,
    question,
    addButtonLabel,
    documents,
    instructions,
    defaultIcon,
    onSave,
    onUpload
}: DocumentUploadModalProps) {
    const [disponible, setDisponible] = useState<string>("Si")

    const handleSave = () => {
        if (onSave) {
            onSave()
        } else {
            console.log("Guardando documentos...")
        }
        onClose()
    }

    const handleUploadClick = (documentId: number) => {
        if (onUpload) {
            onUpload(documentId)
        } else {
            console.log(`Subiendo documento ${documentId}...`)
        }
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
                    {/* Availability Question */}
                    <Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {question}
                        </Typography>
                        <RadioGroup
                            row
                            value={disponible}
                            onChange={(e) => setDisponible(e.target.value)}
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
                            {addButtonLabel}
                        </Button>
                    </Box>

                    {/* Documents List */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {documents.map((documento) => (
                            <Card key={documento.id} variant="outlined">
                                <CardContent sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 1.5,
                                    '&:last-child': { pb: 1.5 }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ color: 'primary.main', mr: 2 }}>
                                            {documento.icon || defaultIcon}
                                        </Box>
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
                                        onClick={() => handleUploadClick(documento.id)}
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
                        {instructions}
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
