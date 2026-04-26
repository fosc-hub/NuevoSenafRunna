"use client"

/**
 * AttachmentUpload — wrapper alrededor del componente compartido
 * `FileUploadSection`. Mantiene la API histórica:
 *   onChange(files, tipos, descripciones)
 * pero reemplaza el picker / lista por el componente unificado, agregando
 * controles de "Tipo" y "Descripción" por archivo debajo de la lista.
 *
 * El selector de etiqueta del catálogo (TEtiquetaDocumento) está expuesto por
 * el componente compartido y se aplica al próximo archivo cargado.
 */

import { useState } from "react"
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
} from "@mui/material"
import { FileUploadSection, type FileItem } from "@/components/shared/FileUploadSection"

interface FileWithType {
  file: File
  tipo: string
  descripcion: string
  etiquetaId: number | null
}

interface AttachmentUploadProps {
  files: File[]
  onChange: (
    files: File[],
    tipos?: string[],
    descripciones?: string[],
    etiquetaIds?: Array<number | null>,
  ) => void
  requiereEvidencia?: boolean
}

const TIPOS_ADJUNTO = [
  { value: "ACTA_COMPROMISO", label: "Acta de Compromiso" },
  { value: "EVIDENCIA", label: "Evidencia" },
  { value: "INFORME", label: "Informe" },
  { value: "FOTO", label: "Foto" },
  { value: "OTRO", label: "Otro" },
] as const

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  onChange,
  requiereEvidencia = false,
}) => {
  const [items, setItems] = useState<FileWithType[]>([])
  const [etiquetaActual, setEtiquetaActual] = useState<number | null>(null)

  const update = (next: FileWithType[]) => {
    setItems(next)
    onChange(
      next.map((i) => i.file),
      next.map((i) => i.tipo),
      next.map((i) => i.descripcion),
      next.map((i) => i.etiquetaId),
    )
  }

  const handleUpload = (file: File, etiquetaId?: number | null) => {
    update([
      ...items,
      {
        file,
        tipo: requiereEvidencia ? "EVIDENCIA" : "OTRO",
        descripcion: "",
        etiquetaId: etiquetaId ?? null,
      },
    ])
  }

  const handleDelete = (id: number | string) => {
    const idx = typeof id === "string" ? Number(id.replace("att-", "")) : id
    update(items.filter((_, i) => i !== idx))
  }

  const handleTipoChange = (idx: number, tipo: string) => {
    const next = [...items]
    next[idx] = { ...next[idx], tipo }
    update(next)
  }

  const handleDescripcionChange = (idx: number, descripcion: string) => {
    const next = [...items]
    next[idx] = { ...next[idx], descripcion }
    update(next)
  }

  const fileItems: FileItem[] = items.map((it, i) => ({
    id: `att-${i}`,
    nombre: it.file.name,
    tipo: it.file.type,
    tamano: it.file.size,
  }))

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
        Adjuntos {requiereEvidencia && "(Evidencia requerida)"}
      </Typography>

      <FileUploadSection
        files={fileItems}
        onUpload={handleUpload}
        onDelete={handleDelete}
        multiple
        title="Archivos"
        emptyMessage="No hay archivos seleccionados"
        enableEtiqueta
        etiquetaValue={etiquetaActual}
        onEtiquetaChange={setEtiquetaActual}
        etiquetaHelperText="Etiqueta del catálogo (aplica al próximo archivo)"
      />

      {/* Per-file metadata: tipo + descripción (legacy fields) */}
      {items.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((it, idx) => (
            <Paper
              key={`meta-${idx}`}
              variant="outlined"
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                {it.file.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={it.tipo}
                    label="Tipo"
                    onChange={(e) => handleTipoChange(idx, e.target.value)}
                  >
                    {TIPOS_ADJUNTO.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  size="small"
                  label="Descripción (opcional)"
                  value={it.descripcion}
                  onChange={(e) => handleDescripcionChange(idx, e.target.value)}
                />
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  )
}
