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
    IconButton
} from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import DownloadIcon from "@mui/icons-material/Download"
import UploadIcon from "@mui/icons-material/Upload"
import { RegistroIntervencionModal } from "../registro-intervencion-modal"
import { NotificacionesModal } from "../notificaciones-modal"
import { AdjuntarNotaModal } from "../adjuntar-nota-modal"
import AdjuntarDNIModal from "../adjuntar-dni-modal"
import AdjuntarActasModal from "../adjuntar-actas-modal"
import { AgregarIntervencionModal } from "../agregar-intervencion-modal"

interface AperturaTabProps {
    medidaData: any
}

export const AperturaTab: React.FC<AperturaTabProps> = ({ medidaData }) => {
    const [registroModalOpen, setRegistroModalOpen] = useState<boolean>(false)
    const [notificationModalOpen, setNotificationModalOpen] = useState<boolean>(false)
    const [dniModalOpen, setDniModalOpen] = useState<boolean>(false)
    const [actasModalOpen, setActasModalOpen] = useState<boolean>(false)
    const [notaAprobacionModalOpen, setNotaAprobacionModalOpen] = useState<boolean>(false)
    const [notaAvalModalOpen, setNotaAvalModalOpen] = useState<boolean>(false)
    const [documentStates, setDocumentStates] = useState({
        notificacionAdultos: true,
        fotocopiaDNI: true,
        actaResguardo: true,
        actaPuestaConocimiento: false,
        notaAprobacion: true,
    })
    const [agregarIntervencionModalOpen, setAgregarIntervencionModalOpen] = useState<boolean>(false)

    const handleDocumentChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentStates(prev => ({
            ...prev,
            [field]: event.target.checked
        }))
    }

    return (
        <Box sx={{ width: "100%" }}>
            {/* 1. Informe de medida adoptada */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                        1. Informe de medida adoptada
                    </Typography>
                    <Chip label="En revisión" color="secondary" size="small" />
                    <Chip label="En proceso" color="warning" size="small" sx={{ ml: 1 }} />
                    <Chip label="Aprobado" color="success" size="small" sx={{ ml: 1 }} />
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
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        Cargar informes
                    </Button>
                </Box>

                {/* Document List */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Informe de medida */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Informe de medida: 1
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DescriptionIcon />}
                                sx={{
                                    borderColor: "#4db6ac",
                                    color: "#4db6ac",
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Nombrearchivo.docx
                            </Button>
                            <IconButton size="small">
                                <DownloadIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Notificaciones a adultos */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={documentStates.notificacionAdultos}
                                        onChange={handleDocumentChange('notificacionAdultos')}
                                        color="primary"
                                    />
                                }
                                label=""
                                sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Notificaciones a adultos: 2
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                No es posible
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => setNotificationModalOpen(true)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Adjuntar Notificación
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DescriptionIcon />}
                                sx={{
                                    borderColor: "#4db6ac",
                                    color: "#4db6ac",
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Nombrearchivo.docx
                            </Button>
                            <IconButton size="small">
                                <DownloadIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Fotocopia del DNI */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={documentStates.fotocopiaDNI}
                                        onChange={handleDocumentChange('fotocopiaDNI')}
                                        color="primary"
                                    />
                                }
                                label=""
                                sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Fotocopia del DNI:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                No es posible
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => setDniModalOpen(true)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                AdjuntarDNI
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DescriptionIcon />}
                                sx={{
                                    borderColor: "#4db6ac",
                                    color: "#4db6ac",
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Nombrearchivo.docx
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DescriptionIcon />}
                                sx={{
                                    borderColor: "#4db6ac",
                                    color: "#4db6ac",
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Nombrearchivo.docx
                            </Button>
                            <IconButton size="small">
                                <DownloadIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Acta de resguardo */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={documentStates.actaResguardo}
                                        onChange={handleDocumentChange('actaResguardo')}
                                        color="primary"
                                    />
                                }
                                label=""
                                sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Acta de resguardo:
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                                startIcon={<DescriptionIcon />}
                                sx={{
                                    borderColor: "#4db6ac",
                                    color: "#4db6ac",
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Nombrearchivo.docx
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DescriptionIcon />}
                                sx={{
                                    borderColor: "#4db6ac",
                                    color: "#4db6ac",
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Nombrearchivo.docx
                            </Button>
                            <IconButton size="small">
                                <DownloadIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Acta de puesta en conocimiento */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={documentStates.actaPuestaConocimiento}
                                    onChange={handleDocumentChange('actaPuestaConocimiento')}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Acta de puesta en conocimiento al NNyA:
                                </Typography>
                            }
                        />
                    </Box>

                    {/* Nota de aprobación */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={documentStates.notaAprobacion}
                                        onChange={handleDocumentChange('notaAprobacion')}
                                        color="primary"
                                    />
                                }
                                label=""
                                sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Nota de aprobación:
                            </Typography>
                        </Box>
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
            </Paper>

            {/* 2. Nota de aprobacion de la medida adoptada */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                        2. Nota de aprobación de la medida adoptada
                    </Typography>
                    <Chip label="En revisión" color="secondary" size="small" />
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

                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <FormControlLabel
                        control={<Checkbox defaultChecked color="primary" />}
                        label=""
                        sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500, mr: 2 }}>
                        Nota de abajo:
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setNotaAvalModalOpen(true)}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Completar Y adjuntar notas
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

            {/* 3. Informe jurídico */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                        3. Informe jurídico
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
                        size="small"
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
                        size="small"
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
                        size="small"
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

            {/* 4. Ratificación de Medida por el poder judicial */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                        4. Ratificación de Medida por el poder judicial
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Ratificado
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Sin ratificar
                    </Button>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
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

            {/* 5. Otras intervenciones */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                            5. Otras intervenciones
                        </Typography>
                        <Chip label="En revisión" color="secondary" size="small" />
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setAgregarIntervencionModalOpen(true)}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        Agregar intervención
                    </Button>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    texto: 1
                </Typography>

                {/* Intervention Cards */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[1, 2, 3].map((index) => (
                        <Paper
                            key={index}
                            elevation={1}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: "rgba(0, 0, 0, 0.02)",
                            }}
                        >
                            <Box sx={{ display: "flex", justifyContent: "between", alignItems: "flex-start", mb: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            backgroundColor: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mr: 2,
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
                                            U
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        UserName
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                    <Typography variant="caption" color="text.secondary">
                                        12/12/2025
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                                        5
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {index === 1
                                    ? "Observación de la intervención"
                                    : "Nice outdoor courts, solid concrete and good hoops for the neighborhood."
                                }
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </Paper>

            {/* Registro Intervención Modal */}
            <RegistroIntervencionModal
                open={registroModalOpen}
                onClose={() => setRegistroModalOpen(false)}
            />

            {/* Notification Modal */}
            <NotificacionesModal
                open={notificationModalOpen}
                onClose={() => setNotificationModalOpen(false)}
                title="Adjuntar Notificación"
            />

            {/* DNI Modal */}
            <AdjuntarDNIModal
                open={dniModalOpen}
                onClose={() => setDniModalOpen(false)}
                title="Adjuntar DNI"
            />

            {/* Actas Modal */}
            <AdjuntarActasModal
                open={actasModalOpen}
                onClose={() => setActasModalOpen(false)}
                title="Adjuntar Actas"
            />

            {/* Nota Aprobación Modal */}
            <AdjuntarNotaModal
                open={notaAprobacionModalOpen}
                onClose={() => setNotaAprobacionModalOpen(false)}
                title="Adjuntar nota aprobación"
                modeloTexto="Descargar modelo de nota"
                sectionNumber="1"
                sectionTitle="Nota de Aprobación"
            />

            {/* Nota Aval Modal */}
            <AdjuntarNotaModal
                open={notaAvalModalOpen}
                onClose={() => setNotaAvalModalOpen(false)}
                title="Adjuntar nota de aval"
                modeloTexto="Descargar modelo de nota"
                sectionNumber="2"
                sectionTitle="Nota de Aval"
            />

            {/* Agregar Intervencion Modal */}
            <AgregarIntervencionModal
                open={agregarIntervencionModalOpen}
                onClose={() => setAgregarIntervencionModalOpen(false)}
            />
        </Box>
    )
} 