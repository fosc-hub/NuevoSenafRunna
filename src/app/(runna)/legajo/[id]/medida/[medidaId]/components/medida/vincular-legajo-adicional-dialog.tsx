"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Alert,
  Box,
} from "@mui/material"
import { useSearchNnya } from "@/features/legajo/hooks/useSearchNnya"
import { vincularLegajoAdicional } from "../../api/medida-legajos-api-service"
import type { BusquedaNnyaResult } from "@/features/legajo/types/legajo-creation.types"

interface VincularLegajoAdicionalDialogProps {
  open: boolean
  onClose: () => void
  medidaId: number
  legajoPrimarioId?: number
  legajosAdicionalesIds?: number[]
  onSuccess: () => void
}

export const VincularLegajoAdicionalDialog: React.FC<VincularLegajoAdicionalDialogProps> = ({
  open,
  onClose,
  medidaId,
  legajoPrimarioId,
  legajosAdicionalesIds = [],
  onSuccess,
}) => {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<BusquedaNnyaResult | null>(null)
  const [motivo, setMotivo] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { search, results, searching, clearResults } = useSearchNnya()

  const yaVinculados = new Set<number>(
    [legajoPrimarioId, ...legajosAdicionalesIds].filter((v): v is number => typeof v === "number")
  )

  const handleSearch = async () => {
    const term = query.trim()
    if (!term) return
    setSelected(null)
    await search(term)
  }

  const handleClose = () => {
    setQuery("")
    setSelected(null)
    setMotivo("")
    clearResults()
    onClose()
  }

  const handleSubmit = async () => {
    if (!selected?.legajo_existente) return
    setSubmitting(true)
    try {
      await vincularLegajoAdicional(medidaId, {
        legajo_id: selected.legajo_existente.id,
        motivo: motivo.trim() || undefined,
      })
      onSuccess()
      handleClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vincular legajo a la medida</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Buscá el NNyA por DNI, nombre o apellido. Solo se pueden vincular
            NNyAs que ya tengan un legajo abierto.
          </Typography>

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              label="DNI / Nombre / Apellido"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSearch()
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={searching || !query.trim()}
            >
              {searching ? <CircularProgress size={20} /> : "Buscar"}
            </Button>
          </Stack>

          {results.length > 0 && (
            <List
              dense
              disablePadding
              sx={{
                maxHeight: 260,
                overflow: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              {results.map((r) => {
                const sinLegajo = !r.legajo_existente
                const yaEsta =
                  !!r.legajo_existente && yaVinculados.has(r.legajo_existente.id)
                const disabled = sinLegajo || yaEsta

                const nombreCompleto =
                  [r.apellido, r.nombre].filter(Boolean).join(", ").trim() ||
                  "Sin nombre"

                return (
                  <ListItemButton
                    key={r.id}
                    selected={selected?.id === r.id}
                    disabled={disabled}
                    onClick={() => setSelected(r)}
                  >
                    <ListItemText
                      disableTypography
                      primary={
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                          <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                            {nombreCompleto}
                          </Typography>
                          {r.dni != null && (
                            <Typography variant="caption" component="span" color="text.secondary">
                              DNI {r.dni}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" component="span" color="text.secondary">
                          {sinLegajo
                            ? "Sin legajo abierto — no se puede vincular"
                            : yaEsta
                              ? "Ya vinculado a esta medida"
                              : `Legajo ${r.legajo_existente!.numero}`}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                )
              })}
            </List>
          )}

          {results.length === 0 && !searching && query.trim() && (
            <Alert severity="info">Sin resultados para "{query.trim()}".</Alert>
          )}

          <TextField
            label="Motivo (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            multiline
            minRows={2}
            placeholder="Ej.: hermano incorporado al mismo SAC"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selected?.legajo_existente || submitting}
        >
          {submitting ? <CircularProgress size={20} /> : "Vincular"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
