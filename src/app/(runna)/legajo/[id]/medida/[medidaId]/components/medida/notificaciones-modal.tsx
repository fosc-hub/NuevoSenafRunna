"use client"

import type React from "react"
import {
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
import EmailIcon from "@mui/icons-material/Email"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import NotificationsIcon from "@mui/icons-material/Notifications"
import BaseDialog from "@/components/shared/BaseDialog"

interface NotificacionesModalProps {
    open: boolean
    onClose: () => void
    title?: string
}

export const NotificacionesModal: React.FC<NotificacionesModalProps> = ({
    open,
    onClose,
    title = "Notificaciones"
}) => {
    const [notificacionesPermitidas, setNotificacionesPermitidas] = useState<string>("Si")
    const [notificaciones] = useState([
        { id: 1, nombre: "Notificacion 1", descripcion: "Secondary text" },
        { id: 2, nombre: "Notificacion 2", descripcion: "Secondary text" }
    ])

    const handleSave = () => {
        // Handle save logic
        console.log("Guardando notificaciones...")
        onClose()
    }

    return (
        <BaseDialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            title={title}
            titleIcon={<NotificationsIcon />}
            centerTitle
            showCloseButton
            contentSx={{ px: 4, py: 3 }}
            actions={[
                {
                    label: 'Guardar',
                    onClick: handleSave,
                    variant: 'contained',
                    color: 'primary',
                    fullWidth: true
                }
            ]}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Permission Question */}
                <Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Es posible enviar notificaciones
                    </Typography>
                    <RadioGroup
                        row
                        value={notificacionesPermitidas}
                        onChange={(e) => setNotificacionesPermitidas(e.target.value)}
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

                {/* Add Notifications Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            fontWeight: 600
                        }}
                    >
                        Agregar notificaciones
                    </Button>
                </Box>

                {/* Notifications List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {notificaciones.map((notificacion) => (
                        <Card key={notificacion.id} variant="outlined">
                            <CardContent sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 1.5,
                                '&:last-child': { pb: 1.5 }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <EmailIcon sx={{ color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {notificacion.nombre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {notificacion.descripcion}
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
            </Box>
        </BaseDialog>
    )
} 