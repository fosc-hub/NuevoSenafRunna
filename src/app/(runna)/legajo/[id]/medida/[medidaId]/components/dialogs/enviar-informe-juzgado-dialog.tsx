"use client"

/**
 * GAP-13: Enviar Informe Jurídico al Juzgado por email
 *
 * Permite seleccionar adjuntos adicionales del informe activo y enviarlo
 * por email al juzgado. El usuario que dispara la acción recibe copia
 * automática (CC).
 *
 * Endpoint: POST /api/medidas/{medida_id}/informe-juridico/enviar-a-juzgado/
 */

import React, { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import EmailIcon from "@mui/icons-material/Email"
import BaseDialog from "@/components/shared/BaseDialog"
import {
  enviarInformeJuridicoAJuzgado,
  getAdjuntosInformeJuridico,
} from "../../api/informe-juridico-api-service"
import type { AdjuntoInformeJuridico } from "../../types/informe-juridico-api"
import { toast } from "react-toastify"

interface EnviarInformeJuzgadoDialogProps {
  open: boolean
  onClose: () => void
  medidaId: number
  informeJuridicoId?: number
  onSuccess?: () => void
}

export const EnviarInformeJuzgadoDialog: React.FC<EnviarInformeJuzgadoDialogProps> = ({
  open,
  onClose,
  medidaId,
  informeJuridicoId,
  onSuccess,
}) => {
  const [adjuntos, setAdjuntos] = useState<AdjuntoInformeJuridico[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isLoadingAdjuntos, setIsLoadingAdjuntos] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setError(null)
    setSelectedIds(new Set())
    setIsLoadingAdjuntos(true)

    const params = informeJuridicoId
      ? { informe_juridico: informeJuridicoId }
      : {}

    getAdjuntosInformeJuridico(medidaId, params)
      .then((items) => {
        if (cancelled) return
        setAdjuntos(items)
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "No se pudieron cargar los adjuntos"
        )
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAdjuntos(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, medidaId, informeJuridicoId])

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSend = async () => {
    setError(null)
    setIsSending(true)
    try {
      const result = await enviarInformeJuridicoAJuzgado(
        medidaId,
        Array.from(selectedIds)
      )
      toast.success(
        `Enviado a ${result.destinatario} (${result.archivos_enviados} archivo(s))`
      )
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      const errorCode = err?.response?.data?.error
      const detail = err?.response?.data?.detalle || err?.message

      if (errorCode === "JUZGADO_SIN_EMAIL") {
        setError(
          detail ||
            "El juzgado asociado no tiene email cargado. Configurá el email del juzgado para poder enviar."
        )
      } else if (errorCode === "INFORME_NO_ENCONTRADO") {
        setError(
          detail ||
            "No existe un informe jurídico activo para esta medida."
        )
      } else {
        setError(detail || "No se pudo enviar el informe al juzgado.")
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Enviar informe al juzgado"
      titleIcon={<EmailIcon color="primary" />}
      maxWidth="sm"
      error={error}
      loading={isSending}
      loadingMessage="Enviando..."
      actions={[
        {
          label: "Cancelar",
          onClick: onClose,
          variant: "text",
          disabled: isSending,
        },
        {
          label: isSending ? "Enviando..." : "Enviar",
          onClick: handleSend,
          variant: "contained",
          color: "primary",
          startIcon: <SendIcon />,
          disabled: isSending || isLoadingAdjuntos,
        },
      ]}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          El informe jurídico activo se enviará por email al juzgado asociado a la
          medida. Vas a recibir copia automática (CC). Opcionalmente, podés incluir
          adjuntos adicionales del informe.
        </Typography>

        {isLoadingAdjuntos ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : adjuntos.length === 0 ? (
          <Alert severity="info">
            No hay adjuntos disponibles para incluir. Se enviará solo el informe
            oficial.
          </Alert>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Adjuntos adicionales ({selectedIds.size} seleccionado
              {selectedIds.size === 1 ? "" : "s"})
            </Typography>
            <List dense disablePadding>
              {adjuntos.map((adj) => (
                <ListItem key={adj.id} disablePadding>
                  <ListItemButton
                    role={undefined}
                    onClick={() => toggleSelection(adj.id)}
                    dense
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedIds.has(adj.id)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={adj.descripcion || `Adjunto #${adj.id}`}
                      secondary={
                        <Box
                          component="span"
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          <Chip
                            size="small"
                            label={adj.tipo_adjunto}
                            color={adj.tipo_adjunto === "INFORME" ? "primary" : "default"}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </BaseDialog>
  )
}
