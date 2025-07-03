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
    Divider
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import DownloadIcon from "@mui/icons-material/Download"
import AttachFileIcon from "@mui/icons-material/AttachFile"

interface CierreMedidaModalProps {
    open: boolean
    onClose: () => void
}

export const CierreMedidaModal: React.FC<CierreMedidaModalProps> = ({
    open,
    onClose
}) => {
    const [tipoCierre, setTipoCierre] = useState<string>("")
    const [dispositivo, setDispositivo] = useState<string>("")
    const [fundamento, setFundamento] = useState<string>("")
    const [modeloNota, setModeloNota] = useState<string>("")

    const handleSubmit = () => {
        // Handle form submission
        console.log("Guardando cierre de medida...")
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
                    maxHeight: '90vh'
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '1.5rem',
                position: 'relative',
                pb: 1
            }}>
                Formulario de Cierre de Medida (MPI)
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

            <DialogContent sx={{ px: 4, py: 2 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', mb: 4 }}
                >
                    Fecha de cierre: 24/12/2024
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Tipo de cierre */}
                    <FormControl fullWidth required>
                        <InputLabel>Tipo de cierre*</InputLabel>
                        <Select
                            value={tipoCierre}
                            onChange={(e) => setTipoCierre(e.target.value)}
                            label="Tipo de cierre*"
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                Seleccionar tipo de cierre
                            </MenuItem>
                            <MenuItem value="cumplimiento-objetivos">Cumplimiento de objetivos</MenuItem>
                            <MenuItem value="reunion-familiar">Reunión familiar</MenuItem>
                            <MenuItem value="mayoria-edad">Mayoría de edad</MenuItem>
                            <MenuItem value="derivacion">Derivación a otro dispositivo</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Dispositivo */}
                    <FormControl fullWidth>
                        <InputLabel>Dispositivo</InputLabel>
                        <Select
                            value={dispositivo}
                            onChange={(e) => setDispositivo(e.target.value)}
                            label="Dispositivo"
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                Seleccionar dispositivo
                            </MenuItem>
                            <MenuItem value="residencia-1">Residencia 1</MenuItem>
                            <MenuItem value="residencia-2">Residencia 2</MenuItem>
                            <MenuItem value="hogar-convivencia">Hogar de convivencia</MenuItem>
                            <MenuItem value="familia-ampliada">Familia ampliada</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Fundamento del cierre */}
                    <TextField
                        label="Fundamento del cierre"
                        multiline
                        rows={4}
                        fullWidth
                        value={fundamento}
                        onChange={(e) => setFundamento(e.target.value)}
                        variant="outlined"
                        placeholder="Ingrese el fundamento legal y técnico del cierre de la medida..."
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                            },
                        }}
                    />

                    {/* Modelo de nota de cierre */}
                    <TextField
                        label="Modelo de nota de cierre de medida"
                        multiline
                        rows={4}
                        fullWidth
                        value={modeloNota}
                        onChange={(e) => setModeloNota(e.target.value)}
                        variant="outlined"
                        placeholder="Redacte el modelo de nota de cierre que será utilizado..."
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                            },
                        }}
                    />

                    {/* File downloads */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                documento_soporte.pdf
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Descargar
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                evidencia_cierre.jpg
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Descargar
                            </Button>
                        </Box>
                    </Box>

                    {/* Upload button */}
                    <Button
                        variant="outlined"
                        startIcon={<AttachFileIcon />}
                        fullWidth
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            py: 1.5,
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            color: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                                borderStyle: 'dashed',
                            }
                        }}
                    >
                        Adjuntar nota de cierre firmada
                    </Button>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 3, pt: 2 }}>
                <Button
                    onClick={handleSubmit}
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
                    Guardar y cerrar medida
                </Button>
            </DialogActions>
        </Dialog>
    )
} 