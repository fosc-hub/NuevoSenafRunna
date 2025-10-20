"use client"

import type React from "react"
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
    ToggleButtonGroup,
    Divider
} from "@mui/material"
import { useState } from "react"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import DescriptionIcon from "@mui/icons-material/Description"
import CierreMedidaModal from "../cierre-medida-modal"
import { RegistroIntervencionModal } from "../registro-intervencion-modal"
import { NotificacionesModal } from "../notificaciones-modal"
import { AdjuntarNotaModal } from "../adjuntar-nota-modal"
import { FormularioDocumentoModal } from "../formulario-documento-modal"
import { CarouselStepper } from "../carousel-stepper"

interface CeseTabProps {
    medidaData: any
}

export const CeseTab: React.FC<CeseTabProps> = ({ medidaData }) => {
    const [ratificacionStatus, setRatificacionStatus] = useState<string>("ratificada")
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [registroModalOpen, setRegistroModalOpen] = useState<boolean>(false)
    const [notificacionesModalOpen, setNotificacionesModalOpen] = useState<boolean>(false)
    const [actasModalOpen, setActasModalOpen] = useState<boolean>(false)
    const [notaAprobacionModalOpen, setNotaAprobacionModalOpen] = useState<boolean>(false)
    const [notaAbalModalOpen, setNotaAbalModalOpen] = useState<boolean>(false)
    const [formularioDocumentoModalOpen, setFormularioDocumentoModalOpen] = useState<boolean>(false)

    const handleRatificacionChange = (
        event: React.MouseEvent<HTMLElement>,
        newValue: string,
    ) => {
        if (newValue !== null) {
            setRatificacionStatus(newValue)
        }
    }

    // Step 1: Informe de medida Cesada
    const step1Content = (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                        Informe de medida Cesada
                    </Typography>
                    <Chip label="En revisión" color="secondary" size="small" />
                    <Chip label="En proceso" color="info" size="small" sx={{ ml: 1 }} />
                    <Chip label="Aprobado" color="success" size="small" sx={{ ml: 1 }} />
                </Box>
                <IconButton sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                    <DescriptionIcon />
                </IconButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fecha: 12/12/2025
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setRegistroModalOpen(true)}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Cargar informe de cese
                </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Preforma de cese de medida: 1
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FormControlLabel
                            control={<Checkbox defaultChecked color="primary" />}
                            label="Notificaciones a adultos responsables: 2"
                            sx={{ mr: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            No es posible
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setNotificacionesModalOpen(true)}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Adjuntar preforma de Notificacion
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AttachFileIcon />}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Nombrearchivo.docs
                    </Button>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <FormControlLabel
                        control={<Checkbox defaultChecked color="primary" />}
                        label="Acta de resguardo:"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setActasModalOpen(true)}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Adjuntar Actas
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AttachFileIcon />}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Nombrearchivo.docs
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AttachFileIcon />}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Nombrearchivo.docs
                    </Button>
                </Box>

                <FormControlLabel
                    control={<Checkbox defaultChecked color="primary" />}
                    label="Acta de puesta en conocimiento al NNyA:"
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <FormControlLabel
                        control={<Checkbox defaultChecked color="primary" />}
                        label="Nota de aprobación:"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setNotaAprobacionModalOpen(true)}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Completar Y adjuntar notas
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Aprobado
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Observar
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Anulado
                </Button>
            </Box>
        </Paper>
    )

    // Step 2: Nota de abal del cese de la Medida
    const step2Content = (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Nota de abal del cese de la Medida
                </Typography>
                <Chip label="En revisión" color="secondary" size="small" />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Fecha: 12/12/2025
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Aprobado: 1
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <FormControlLabel
                    control={<Checkbox defaultChecked color="primary" />}
                    label="Nota de abajo:"
                />
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => setNotaAbalModalOpen(true)}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Completar Y adjuntar notas
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Boton suma la firma!!!
                </Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Aprobado
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Observar
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Anulado
                </Button>
            </Box>
        </Paper>
    )

    // Step 3: Informe jurídico de Cese
    const step3Content = (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Informe jurídico de Cese
                </Typography>
                <Chip label="En revisión" color="secondary" size="small" />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Fecha: 12/12/2025
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Juzgado: 1
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setFormularioDocumentoModalOpen(true)}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Agregar informe jurídico
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Enviar mail
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Adjuntar acuse de recibo
                </Button>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Aprobado
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Observar
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    sx={{
                        flex: 1,
                        textTransform: "none",
                        borderRadius: 2,
                    }}
                >
                    Anulado
                </Button>
            </Box>
        </Paper>
    )

    // Step 4: Ratificación del Cese de Medida por el poder judicial
    const step4Content = (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ratificación del Cese de Medida por el poder judicial
                </Typography>
                <Chip label="En revisión" color="secondary" size="small" />
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
                    Adjunta resolución
                </Button>
            </Box>
        </Paper>
    )

    const carouselSteps = [
        {
            id: "step1",
            title: "Informe de medida Cesada",
            content: step1Content
        },
        {
            id: "step2",
            title: "Nota de abal del cese",
            content: step2Content
        },
        {
            id: "step3",
            title: "Informe jurídico de Cese",
            content: step3Content
        },
        {
            id: "step4",
            title: "Ratificación del Cese",
            content: step4Content
        }
    ]

    return (
        <Box sx={{ width: "100%" }}>
            {/* Header Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                            Cierre de medida
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Fecha: 12/12/2025
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Contador tiempo posterior a CES
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Lugar de resguardo: Residencia 1
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={() => setModalOpen(true)}
                        sx={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            textTransform: "none",
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: '#45a049',
                            }
                        }}
                    >
                        Form de cierre
                    </Button>
                </Box>
            </Paper>

            {/* Carousel Steps */}
            <CarouselStepper steps={carouselSteps} />

            {/* All Modals */}
            <CierreMedidaModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />

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

            <NotificacionesModal
                open={notificacionesModalOpen}
                onClose={() => setNotificacionesModalOpen(false)}
                title="Adjuntar preforma de Notificacion"
            />

            <NotificacionesModal
                open={actasModalOpen}
                onClose={() => setActasModalOpen(false)}
                title="Adjuntar Actas"
            />

            <AdjuntarNotaModal
                open={notaAprobacionModalOpen}
                onClose={() => setNotaAprobacionModalOpen(false)}
                title="Adjuntar nota aprobación"
                modeloTexto="Descargar modelo de nota"
                sectionNumber="1"
                sectionTitle="Nota de Aprobación"
            />

            <AdjuntarNotaModal
                open={notaAbalModalOpen}
                onClose={() => setNotaAbalModalOpen(false)}
                title="Adjuntar abal"
                modeloTexto="Descargar modelo de nota"
                sectionNumber="2"
                sectionTitle="Nota de Aval"
            />

            <FormularioDocumentoModal
                open={formularioDocumentoModalOpen}
                onClose={() => setFormularioDocumentoModalOpen(false)}
            />
        </Box>
    )
} 