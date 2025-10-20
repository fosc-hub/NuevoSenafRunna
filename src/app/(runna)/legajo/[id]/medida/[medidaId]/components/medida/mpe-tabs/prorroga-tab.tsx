"use client"

import type React from "react"
import { useState } from "react"
import {
    Box,
    Typography,
    Paper,
    Checkbox,
    FormControlLabel,
    Button,
    Chip,
    IconButton,
    ToggleButton,
    ToggleButtonGroup
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { RegistroIntervencionModal } from "../registro-intervencion-modal"
import { AgregarInformeJuridicoModal } from "../agregar-informe-juridico-modal"
import { AdjuntarNotaModal } from "../adjuntar-nota-modal"
import { CarouselStepper } from "../carousel-stepper"

interface ProrrogaTabProps {
    medidaData: any
}

export const ProrrogaTab: React.FC<ProrrogaTabProps> = ({ medidaData }) => {
    const [ratificacionStatus, setRatificacionStatus] = useState<string>("ratificada")
    const [registroModalOpen, setRegistroModalOpen] = useState<boolean>(false)
    const [informeJuridicoModalOpen, setInformeJuridicoModalOpen] = useState<boolean>(false)
    const [notaAprobacionModalOpen, setNotaAprobacionModalOpen] = useState<boolean>(false)

    const handleRatificacionChange = (
        event: React.MouseEvent<HTMLElement>,
        newValue: string,
    ) => {
        if (newValue !== null) {
            setRatificacionStatus(newValue)
        }
    }

    // Step 1: Informe de medida adoptada
    const step1Content = (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Informe de medida adoptada
                </Typography>
                <IconButton sx={{ color: 'success.main' }}>
                    <CheckCircleIcon />
                </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Fecha: 12/12/2025
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                texto: 1
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                        control={<Checkbox defaultChecked color="primary" />}
                        label="Notificaciones a adultos: 2"
                        sx={{ mr: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        No es posible
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                        control={<Checkbox defaultChecked color="primary" />}
                        label="Fotocopia del DNI:"
                        sx={{ mr: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        No es posible
                    </Typography>
                </Box>

                <FormControlLabel
                    control={<Checkbox defaultChecked color="primary" />}
                    label="Acta de resguardo:"
                />

                <FormControlLabel
                    control={<Checkbox defaultChecked color="primary" />}
                    label="Acta de puesta en conocimiento al NNyA:"
                />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setRegistroModalOpen(true)}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Cargar informes
                </Button>
            </Box>
        </Paper>
    )

    // Step 2: Nota de aprobación de la medida adoptada
    const step2Content = (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Nota de aprobación de la medida adoptada
                </Typography>
                <IconButton sx={{ color: 'success.main' }}>
                    <CheckCircleIcon />
                </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Fecha: 12/12/2025
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Aprobado: 1
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Hello World
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                <FormControlLabel
                    control={<Checkbox defaultChecked color="primary" />}
                    label="Nota de aprobación:"
                />

                <FormControlLabel
                    control={<Checkbox defaultChecked color="primary" />}
                    label="Nota de abajo:"
                />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setNotaAprobacionModalOpen(true)}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Adjuntar nota aprobación
                </Button>
            </Box>
        </Paper>
    )

    // Step 3: Informe jurídico
    const step3Content = (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Informe jurídico
                </Typography>
                <IconButton sx={{ color: 'success.main' }}>
                    <CheckCircleIcon />
                </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Fecha: 12/12/2025
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                texto: 1
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Hello World
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setInformeJuridicoModalOpen(true)}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Agregar informe jurídico
                </Button>
            </Box>
        </Paper>
    )

    // Step 4: Ratificación de Medida por el poder judicial
    const step4Content = (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ratificación de Medida por el poder judicial
                </Typography>
                <IconButton sx={{ color: 'success.main' }}>
                    <CheckCircleIcon />
                </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Fecha: 12/12/2025
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                texto: 1
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Acuse de recibo: Sí
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <ToggleButtonGroup
                    value={ratificacionStatus}
                    exclusive
                    onChange={handleRatificacionChange}
                    aria-label="ratification status"
                    size="small"
                >
                    <ToggleButton
                        value="ratificada"
                        aria-label="ratificada"
                        sx={{
                            textTransform: "none",
                            borderRadius: 1,
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                            },
                        }}
                    >
                        Ratificada
                    </ToggleButton>
                    <ToggleButton
                        value="sin-ratificar"
                        aria-label="sin ratificar"
                        sx={{
                            textTransform: "none",
                            borderRadius: 1,
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                            },
                        }}
                    >
                        Sin ratificar
                    </ToggleButton>
                </ToggleButtonGroup>

                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Adjunta documento de ratificación
                </Button>
            </Box>
        </Paper>
    )

    const carouselSteps = [
        {
            id: "step1",
            title: "Informe de medida adoptada",
            content: step1Content
        },
        {
            id: "step2",
            title: "Nota de aprobación",
            content: step2Content
        },
        {
            id: "step3",
            title: "Informe jurídico",
            content: step3Content
        },
        {
            id: "step4",
            title: "Ratificación judicial",
            content: step4Content
        }
    ]

    return (
        <Box sx={{ width: "100%" }}>
            <CarouselStepper steps={carouselSteps} />

            {/* All Modals */}
            <RegistroIntervencionModal
                open={registroModalOpen}
                onClose={() => setRegistroModalOpen(false)}
                medidaId={medidaData?.id ? Number(medidaData.id) : undefined}
                legajoData={medidaData ? {
                    numero: medidaData.numero || '',
                    persona_nombre: medidaData.persona?.nombre || '',
                    persona_apellido: '',
                    zona_nombre: medidaData.zona_trabajo || ''
                } : undefined}
                tipoMedida="MPE"
            />

            <AgregarInformeJuridicoModal
                open={informeJuridicoModalOpen}
                onClose={() => setInformeJuridicoModalOpen(false)}
            />

            <AdjuntarNotaModal
                open={notaAprobacionModalOpen}
                onClose={() => setNotaAprobacionModalOpen(false)}
                title="Adjuntar nota aprobación"
                modeloTexto="Descargar modelo de nota"
                sectionNumber="1"
                sectionTitle="Nota de Aprobación"
            />
        </Box>
    )
} 