"use client"

/**
 * Component for Intervención State Transition Actions
 * Handles: Enviar (ET), Aprobar (JZ), Rechazar (JZ)
 *
 * MED-02b: Transiciones de estado y aprobación
 */

import React, { useState } from "react"
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Chip,
} from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import { useRegistroIntervencion } from "../../hooks/useRegistroIntervencion"
import type { IntervencionResponse, EstadoIntervencion } from "../../types/intervencion-api"

interface IntervencionActionsProps {
    medidaId: number
    intervencionId: number
    currentEstado: EstadoIntervencion
    onActionComplete?: () => void // Callback after action completes
}

export const IntervencionActions: React.FC<IntervencionActionsProps> = ({
    medidaId,
    intervencionId,
    currentEstado,
    onActionComplete,
}) => {
    // ============================================================================
    // HOOK
    // ============================================================================
    const {
        enviar,
        aprobar,
        rechazar,
        isEnviando,
        isAprobando,
        isRechazando,
        canEnviar,
        canAprobarOrRechazar,
        error,
        clearErrors,
    } = useRegistroIntervencion({
        medidaId,
        intervencionId,
        autoLoadCatalogs: false,
    })

    // ============================================================================
    // LOCAL STATE
    // ============================================================================
    const [showRechazarDialog, setShowRechazarDialog] = useState(false)
    const [observaciones, setObservaciones] = useState("")
    const [observacionesError, setObservacionesError] = useState("")

    // ============================================================================
    // HANDLERS
    // ============================================================================
    const handleEnviar = async () => {
        const success = await enviar()
        if (success && onActionComplete) {
            onActionComplete()
        }
    }

    const handleAprobar = async () => {
        const success = await aprobar()
        if (success && onActionComplete) {
            onActionComplete()
        }
    }

    const handleRechazarClick = () => {
        setShowRechazarDialog(true)
        setObservaciones("")
        setObservacionesError("")
        clearErrors()
    }

    const handleRechazarConfirm = async () => {
        // Validate observaciones
        if (!observaciones || observaciones.trim() === "") {
            setObservacionesError("Las observaciones son obligatorias para rechazar")
            return
        }

        const success = await rechazar(observaciones)
        if (success) {
            setShowRechazarDialog(false)
            if (onActionComplete) {
                onActionComplete()
            }
        }
    }

    const handleRechazarCancel = () => {
        setShowRechazarDialog(false)
        setObservaciones("")
        setObservacionesError("")
        clearErrors()
    }

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Estado Badge */}
                <Chip
                    label={
                        currentEstado === 'BORRADOR' ? 'Borrador' :
                        currentEstado === 'ENVIADO' ? 'Enviado' :
                        currentEstado === 'APROBADO' ? 'Aprobado' :
                        currentEstado === 'RECHAZADO' ? 'Rechazado' :
                        currentEstado
                    }
                    color={
                        currentEstado === 'APROBADO' ? 'success' :
                        currentEstado === 'ENVIADO' ? 'info' :
                        currentEstado === 'RECHAZADO' ? 'error' :
                        'default'
                    }
                    sx={{ fontWeight: 600 }}
                />

                {/* Action Buttons based on state and role */}
                {canEnviar && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={isEnviando ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                        onClick={handleEnviar}
                        disabled={isEnviando}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        {isEnviando ? "Enviando..." : "Enviar a Aprobación"}
                    </Button>
                )}

                {canAprobarOrRechazar && (
                    <>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={isAprobando ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                            onClick={handleAprobar}
                            disabled={isAprobando || isRechazando}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                            {isAprobando ? "Aprobando..." : "Aprobar"}
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={isRechazando ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
                            onClick={handleRechazarClick}
                            disabled={isAprobando || isRechazando}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                            Rechazar
                        </Button>
                    </>
                )}
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" onClose={clearErrors} sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Rechazar Dialog */}
            <Dialog
                open={showRechazarDialog}
                onClose={handleRechazarCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Rechazar Intervención
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 3, mt: 1 }}>
                        Al rechazar esta intervención, volverá al estado de borrador y el
                        Equipo Técnico podrá corregir los datos según sus observaciones.
                    </Alert>

                    <TextField
                        label="Observaciones"
                        multiline
                        rows={4}
                        fullWidth
                        value={observaciones}
                        onChange={(e) => {
                            setObservaciones(e.target.value)
                            setObservacionesError("")
                        }}
                        placeholder="Indique las razones del rechazo y qué debe corregirse..."
                        required
                        error={!!observacionesError}
                        helperText={observacionesError || "Obligatorio - Explique el motivo del rechazo"}
                        autoFocus
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleRechazarCancel}
                        disabled={isRechazando}
                        sx={{ textTransform: "none" }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleRechazarConfirm}
                        color="error"
                        variant="contained"
                        disabled={isRechazando}
                        startIcon={isRechazando ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
                        sx={{ textTransform: "none" }}
                    >
                        {isRechazando ? "Rechazando..." : "Rechazar Intervención"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
