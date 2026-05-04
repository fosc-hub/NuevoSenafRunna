"use client"

/**
 * GAP-14: Descarga masiva ZIP
 *
 * Dialog que permite seleccionar múltiples documentos del repositorio
 * (filtrados o no) y descargarlos en un único ZIP.
 *
 * Endpoint: POST /api/repositorio-documentos/descarga-masiva/
 */

import React, { useEffect, useMemo, useState } from "react"
import {
  Box,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import DownloadIcon from "@mui/icons-material/Download"
import BaseDialog from "@/components/shared/BaseDialog"
import {
  descargarAdjuntosMasivo,
  TIPOS_ADJUNTO_DESCARGA_MASIVA,
} from "../../../api/descarga-masiva-api-service"
import type { Documento } from "../../../types/repositorio-documentos"
import { toast } from "react-toastify"

interface DescargaMasivaDialogProps {
  open: boolean
  onClose: () => void
  /** Documentos disponibles para seleccionar (ya filtrados desde el padre). */
  documentos: Documento[]
}

const TIPOS_SOPORTADOS = new Set<string>(TIPOS_ADJUNTO_DESCARGA_MASIVA)

export const DescargaMasivaDialog: React.FC<DescargaMasivaDialogProps> = ({
  open,
  onClose,
  documentos,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedKeys(new Set())
      setSearch("")
    }
  }, [open])

  // Sólo se pueden descargar documentos cuyo tipo_modelo coincida con uno de los soportados.
  const seleccionables = useMemo(
    () => documentos.filter((d) => TIPOS_SOPORTADOS.has(d.tipo_modelo)),
    [documentos]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return seleccionables
    return seleccionables.filter((d) => {
      return (
        (d.nombre_archivo || "").toLowerCase().includes(q) ||
        (d.descripcion || "").toLowerCase().includes(q) ||
        (d.tipo_modelo_display || "").toLowerCase().includes(q) ||
        (d.etiqueta_nombre || "").toLowerCase().includes(q)
      )
    })
  }, [seleccionables, search])

  const keyOf = (doc: Documento) => `${doc.tipo_modelo}-${doc.id}`

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((d) => selectedKeys.has(keyOf(d)))

  const toggleOne = (doc: Documento) => {
    const key = keyOf(doc)
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleAllFiltered = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        filtered.forEach((d) => next.delete(keyOf(d)))
      } else {
        filtered.forEach((d) => next.add(keyOf(d)))
      }
      return next
    })
  }

  const handleDownload = async () => {
    const items = seleccionables
      .filter((d) => selectedKeys.has(keyOf(d)))
      .map((d) => ({ tipo: d.tipo_modelo, id: d.id }))

    if (items.length === 0) return

    setIsDownloading(true)
    try {
      await descargarAdjuntosMasivo(items)
      toast.success(`Descargando ${items.length} documento(s) en ZIP`)
      onClose()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Error al descargar los documentos"
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const omitidos = documentos.length - seleccionables.length

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="Descargar selección (.zip)"
      titleIcon={<DownloadIcon color="primary" />}
      maxWidth="md"
      loading={isDownloading}
      loadingMessage="Generando ZIP..."
      actions={[
        {
          label: "Cancelar",
          onClick: onClose,
          variant: "text",
          disabled: isDownloading,
        },
        {
          label: isDownloading
            ? "Descargando..."
            : `Descargar (${selectedKeys.size})`,
          onClick: handleDownload,
          variant: "contained",
          color: "primary",
          startIcon: <DownloadIcon />,
          disabled: isDownloading || selectedKeys.size === 0,
        },
      ]}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Seleccioná los documentos que querés incluir en el ZIP. Los archivos
          inválidos o no encontrados se omiten silenciosamente.
        </Typography>

        {omitidos > 0 && (
          <Typography variant="caption" color="warning.main">
            {omitidos} documento(s) no soportado(s) por la descarga masiva fueron
            ocultados.
          </Typography>
        )}

        <TextField
          size="small"
          fullWidth
          placeholder="Buscar por nombre, descripción o etiqueta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={allFilteredSelected}
            indeterminate={
              !allFilteredSelected &&
              filtered.some((d) => selectedKeys.has(keyOf(d)))
            }
            onChange={toggleAllFiltered}
            disabled={filtered.length === 0}
          />
          <Typography variant="body2" color="text.secondary">
            Seleccionar todos los visibles ({filtered.length})
          </Typography>
        </Box>

        <Divider />

        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No hay documentos para mostrar.
          </Typography>
        ) : (
          <List
            dense
            sx={{ maxHeight: 400, overflow: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}
          >
            {filtered.map((doc) => {
              const key = keyOf(doc)
              return (
                <ListItem key={key} disablePadding divider>
                  <ListItemButton onClick={() => toggleOne(doc)} dense>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedKeys.has(key)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.nombre_archivo || doc.descripcion || `Documento #${doc.id}`}
                      secondary={
                        <Box
                          component="span"
                          sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mt: 0.5 }}
                        >
                          <Chip
                            size="small"
                            label={doc.tipo_modelo_display || doc.tipo_modelo}
                            variant="outlined"
                          />
                          <Chip size="small" label={doc.categoria} color="info" variant="outlined" />
                          {doc.etiqueta_nombre && (
                            <Chip size="small" label={doc.etiqueta_nombre} variant="outlined" />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {doc.tamanio_mb.toFixed(2)} MB
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        )}
      </Box>
    </BaseDialog>
  )
}
