"use client"

/**
 * IntervencionesSection Component
 *
 * Características:
 * - Enhanced empty state with illustration
 * - Timeline connector between intervention cards
 * - Stats summary chips (total, aprobadas, pendientes)
 * - Expandable cards with detailed information
 * - Status-based coloring
 */

import type React from "react"
import { useState } from "react"
import {
    Typography,
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
import DescriptionIcon from "@mui/icons-material/Description"
import { useQuery } from "@tanstack/react-query"
import { getIntervencionesByMedida } from "../../api/intervenciones-api-service"
import { IntervencionActions } from "../medida/intervencion-actions"
import type { IntervencionResponse } from "../../types/intervencion-api"
import { SectionCard } from "../medida/shared/section-card"

// ============================================================================
// INTERFACES
// ============================================================================

interface IntervencionesSectionProps {
    medidaId: number
    onAddIntervencion: () => void
    onEditIntervencion: (intervencionId: number) => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status color for the timeline dot and card border
 */
const getStatusColor = (estado: string): string => {
    switch (estado) {
        case 'APROBADO':
            return '#4caf50' // success.main
        case 'ENVIADO':
            return '#2196f3' // info.main
        case 'RECHAZADO':
            return '#f44336' // error.main
        default:
            return '#9e9e9e' // grey
    }
}

/**
 * Get chip color for status
 */
const getChipColor = (estado: string): "success" | "info" | "error" | "default" => {
    switch (estado) {
        case 'APROBADO':
            return 'success'
        case 'ENVIADO':
            return 'info'
        case 'RECHAZADO':
            return 'error'
        default:
            return 'default'
    }
}

/**
 * Format date for display
 */
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-'
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    } catch {
        return '-'
    }
}

/**
 * Format datetime for display
 */
const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '-'
    try {
        const date = new Date(dateString)
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return '-'
    }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const IntervencionesSection: React.FC<IntervencionesSectionProps> = ({
    medidaId,
    onAddIntervencion,
    onEditIntervencion,
}) => {
    // ============================================================================
    // STATE
    // ============================================================================
    const [expandedId, setExpandedId] = useState<number | null>(null)

    // Fetch intervenciones using TanStack Query
    const { data: intervencionesData, isLoading, error: queryError, refetch } = useQuery<IntervencionResponse[]>({
        queryKey: [`intervenciones/medida/${medidaId}`, { ordering: '-fecha_creacion' }],
        queryFn: () => getIntervencionesByMedida(medidaId, { ordering: '-fecha_creacion' }),
    })
    const intervenciones = intervencionesData ?? []

    const error = queryError ? String(queryError) : null

    // Calculate stats
    const aprobadas = intervenciones.filter(i => i.estado === 'APROBADO').length
    const pendientes = intervenciones.filter(i => i.estado === 'BORRADOR' || i.estado === 'ENVIADO').length
    const rechazadas = intervenciones.filter(i => i.estado === 'RECHAZADO').length

    const loadIntervenciones = () => {
        refetch()
    }

    // ============================================================================
    // HANDLERS
    // ============================================================================
    const handleExpandClick = (id: number) => {
        setExpandedId(expandedId === id ? null : id)
    }

    // ============================================================================
    // RENDER
    // ============================================================================
    if (isLoading) {
        return (
            <SectionCard title="Intervenciones">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            </SectionCard>
        )
    }

    if (error) {
        return (
            <SectionCard title="Intervenciones">
                <Alert severity="error">
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
            </SectionCard>
        )
    }

    // Build chips array dynamically
    const chips: Array<{ label: string; color: "primary" | "success" | "warning" | "error" }> = [
        { label: `${intervenciones.length} total`, color: 'primary' as const },
    ]
    if (aprobadas > 0) {
        chips.push({ label: `${aprobadas} aprobada${aprobadas > 1 ? 's' : ''}`, color: 'success' as const })
    }
    if (pendientes > 0) {
        chips.push({ label: `${pendientes} pendiente${pendientes > 1 ? 's' : ''}`, color: 'warning' as const })
    }
    if (rechazadas > 0) {
        chips.push({ label: `${rechazadas} rechazada${rechazadas > 1 ? 's' : ''}`, color: 'error' as const })
    }

    return (
        <SectionCard
            title="Intervenciones"
            chips={chips}
            headerActions={
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: "none", borderRadius: 2 }}
                    startIcon={<AddIcon />}
                    onClick={onAddIntervencion}
                >
                    Nueva Intervención
                </Button>
            }
        >
            {intervenciones.length === 0 ? (
                /* ENHANCED EMPTY STATE */
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Sin Intervenciones Registradas
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                        El Equipo Técnico puede registrar intervenciones para documentar las acciones realizadas en esta medida
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAddIntervencion}
                        sx={{ textTransform: 'none' }}
                    >
                        Registrar Primera Intervención
                    </Button>
                </Box>
            ) : (
                /* TIMELINE WITH CARDS */
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {intervenciones.map((intervencion, index) => (
                        <Box
                            key={intervencion.id}
                            sx={{
                                position: 'relative',
                                pl: 4,
                                pb: index < intervenciones.length - 1 ? 2 : 0,
                            }}
                        >
                            {/* Vertical connector line */}
                            {index < intervenciones.length - 1 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 11,
                                        top: 28,
                                        bottom: 0,
                                        width: 2,
                                        bgcolor: 'divider',
                                    }}
                                />
                            )}

                            {/* Timeline dot */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 4,
                                    top: 20,
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: getStatusColor(intervencion.estado),
                                    border: '3px solid',
                                    borderColor: 'background.paper',
                                    boxShadow: 1,
                                    zIndex: 1,
                                }}
                            />

                            {/* Card content */}
                            <Card
                                elevation={1}
                                sx={{
                                    borderLeft: `4px solid ${getStatusColor(intervencion.estado)}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        boxShadow: 3,
                                    },
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
                                                    color={getChipColor(intervencion.estado)}
                                                    size="small"
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(intervencion.fecha_intervencion)}
                                                {' • '}
                                                {intervencion.categoria_intervencion_detalle?.nombre}
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
                                        <strong>Motivo:</strong> {intervencion.motivo_detalle?.nombre}
                                        {intervencion.sub_motivo_detalle && ` - ${intervencion.sub_motivo_detalle.nombre}`}
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
                                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
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
                                                    <strong>Tipo de dispositivo:</strong> {intervencion.tipo_dispositivo_detalle.nombre}
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

                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Registrado por: {intervencion.registrado_por_detalle?.nombre_completo ?? '-'}
                                                </Typography>
                                                {intervencion.aprobado_por_detalle && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Aprobado por: {intervencion.aprobado_por_detalle.nombre_completo}
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Creado: {formatDateTime(intervencion.fecha_creacion)}
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
                        </Box>
                    ))}
                </Box>
            )}
        </SectionCard>
    )
}
