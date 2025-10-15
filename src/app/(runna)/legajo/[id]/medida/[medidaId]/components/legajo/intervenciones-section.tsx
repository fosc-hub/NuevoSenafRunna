"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
    Typography,
    Paper,
    Box,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Collapse,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import EditIcon from "@mui/icons-material/Edit"
import VisibilityIcon from "@mui/icons-material/Visibility"
import { getIntervencionesByMedida } from "../../api/intervenciones-api-service"
import { IntervencionActions } from "../medida/intervencion-actions"
import type { IntervencionResponse } from "../../types/intervencion-api"

interface IntervencionesSectionProps {
    medidaId: number
    onAddIntervencion: () => void
    onEditIntervencion: (intervencionId: number) => void
}

export const IntervencionesSection: React.FC<IntervencionesSectionProps> = ({
    medidaId,
    onAddIntervencion,
    onEditIntervencion,
}) => {
    // ============================================================================
    // STATE
    // ============================================================================
    const [intervenciones, setIntervenciones] = useState<IntervencionResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<number | null>(null)

    // ============================================================================
    // EFFECTS
    // ============================================================================
    useEffect(() => {
        loadIntervenciones()
    }, [medidaId])

    // ============================================================================
    // HANDLERS
    // ============================================================================
    const loadIntervenciones = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await getIntervencionesByMedida(medidaId, {
                ordering: '-fecha_creacion' // Most recent first
            })
            setIntervenciones(data)
        } catch (err: any) {
            console.error("Error loading intervenciones:", err)
            setError(err?.response?.data?.detail || "Error al cargar las intervenciones")
        } finally {
            setIsLoading(false)
        }
    }

    const handleExpandClick = (id: number) => {
        setExpandedId(expandedId === id ? null : id)
    }

    // ============================================================================
    // RENDER
    // ============================================================================
    if (isLoading) {
        return (
            <Paper elevation={2} sx={{ width: "100%", mb: 4, p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            </Paper>
        )
    }

    if (error) {
        return (
            <Paper elevation={2} sx={{ width: "100%", mb: 4, p: 3, borderRadius: 2 }}>
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={loadIntervenciones}
                        sx={{ textTransform: "none" }}
                    >
                        Reintentar
                    </Button>
                </Box>
            </Paper>
        )
    }

    return (
        <Paper elevation={2} sx={{ width: "100%", mb: 4, p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Intervenciones ({intervenciones.length})
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: "none", borderRadius: 2 }}
                    startIcon={<AddIcon />}
                    onClick={onAddIntervencion}
                >
                    Nueva Intervención
                </Button>
            </Box>

            {intervenciones.length === 0 ? (
                <Alert severity="info">
                    No hay intervenciones registradas aún.
                </Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {intervenciones.map((intervencion) => (
                        <Card
                            key={intervencion.id}
                            elevation={1}
                            sx={{
                                borderLeft: `4px solid ${
                                    intervencion.estado === 'APROBADO' ? '#4caf50' :
                                    intervencion.estado === 'ENVIADO' ? '#2196f3' :
                                    intervencion.estado === 'RECHAZADO' ? '#f44336' :
                                    '#9e9e9e'
                                }`,
                            }}
                        >
                            <CardContent>
                                {/* Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {intervencion.codigo_intervencion}
                                            </Typography>
                                            <Chip
                                                label={intervencion.estado_display}
                                                color={
                                                    intervencion.estado === 'APROBADO' ? 'success' :
                                                    intervencion.estado === 'ENVIADO' ? 'info' :
                                                    intervencion.estado === 'RECHAZADO' ? 'error' :
                                                    'default'
                                                }
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(intervencion.fecha_intervencion).toLocaleDateString('es-AR')}
                                            {' • '}
                                            {intervencion.categoria_intervencion_detalle}
                                        </Typography>
                                    </Box>

                                    <IntervencionActions
                                        medidaId={medidaId}
                                        intervencionId={intervencion.id}
                                        currentEstado={intervencion.estado}
                                        onActionComplete={loadIntervenciones}
                                    />
                                </Box>

                                {/* Summary */}
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    <strong>Motivo:</strong> {intervencion.motivo_detalle}
                                    {intervencion.sub_motivo_detalle && ` - ${intervencion.sub_motivo_detalle}`}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: expandedId === intervencion.id ? 'unset' : 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {intervencion.intervencion_especifica}
                                </Typography>

                                {/* Expanded details */}
                                <Collapse in={expandedId === intervencion.id} timeout="auto" unmountOnExit>
                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                                        {intervencion.descripcion_detallada && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                    Descripción detallada:
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {intervencion.descripcion_detallada}
                                                </Typography>
                                            </Box>
                                        )}

                                        {intervencion.motivo_vulneraciones && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                    Motivo de vulneraciones:
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {intervencion.motivo_vulneraciones}
                                                </Typography>
                                            </Box>
                                        )}

                                        {intervencion.tipo_dispositivo_detalle && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                <strong>Tipo de dispositivo:</strong> {intervencion.tipo_dispositivo_detalle}
                                            </Typography>
                                        )}

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Requiere informes ampliatorios:</strong>{' '}
                                            {intervencion.requiere_informes_ampliatorios ? 'Sí' : 'No'}
                                        </Typography>

                                        {intervencion.observaciones_jz && (
                                            <Alert severity="warning" sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                    Observaciones del Jefe Zonal:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {intervencion.observaciones_jz}
                                                </Typography>
                                            </Alert>
                                        )}

                                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Registrado por: {intervencion.registrado_por_detalle}
                                            </Typography>
                                            {intervencion.aprobado_por_detalle && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Aprobado por: {intervencion.aprobado_por_detalle}
                                                </Typography>
                                            )}
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Creado: {new Date(intervencion.fecha_creacion).toLocaleString('es-AR')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Collapse>
                            </CardContent>

                            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {intervencion.estado === 'BORRADOR' && (
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => onEditIntervencion(intervencion.id)}
                                            sx={{ textTransform: "none" }}
                                        >
                                            Editar
                                        </Button>
                                    )}
                                    {intervencion.adjuntos && (
                                        <Button
                                            size="small"
                                            startIcon={<AttachFileIcon />}
                                            sx={{ textTransform: "none" }}
                                        >
                                            Ver adjuntos
                                        </Button>
                                    )}
                                </Box>

                                <IconButton
                                    onClick={() => handleExpandClick(intervencion.id)}
                                    sx={{
                                        transform: expandedId === intervencion.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s',
                                    }}
                                    size="small"
                                >
                                    <ExpandMoreIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            )}
        </Paper>
    )
}
