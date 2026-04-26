"use client"

import type React from "react"
import { useState } from "react"
import { TextField, Box } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import BaseDialog from "@/components/shared/BaseDialog"
import { FileUploadSection, type FileItem } from "@/components/shared/FileUploadSection"

export interface NewIntervencion {
  descripcion: string
  archivo?: File | null
  etiquetaId?: number | null
}

interface AddIntervencionDialogProps {
  open: boolean
  onClose: () => void
  onSave: (intervencion: NewIntervencion) => void
}

export const AddIntervencionDialog: React.FC<AddIntervencionDialogProps> = ({ open, onClose, onSave }) => {
  const [intervencion, setIntervencion] = useState<NewIntervencion>({
    descripcion: "",
    archivo: null,
    etiquetaId: null,
  })
  const [etiquetaActual, setEtiquetaActual] = useState<number | null>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setIntervencion((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpload = (file: File, etiquetaId?: number | null) => {
    setIntervencion((prev) => ({ ...prev, archivo: file, etiquetaId: etiquetaId ?? null }))
  }

  const handleDelete = () => {
    setIntervencion((prev) => ({ ...prev, archivo: null, etiquetaId: null }))
  }

  const handleSave = () => {
    onSave(intervencion)
    setIntervencion({ descripcion: "", archivo: null, etiquetaId: null })
    setEtiquetaActual(null)
  }

  const fileItems: FileItem[] = intervencion.archivo
    ? [
        {
          id: "current",
          nombre: intervencion.archivo.name,
          tipo: intervencion.archivo.type,
          tamano: intervencion.archivo.size,
        },
      ]
    : []

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      title="Agregar nueva intervención"
      titleIcon={<AddIcon />}
      showCloseButton
      actions={[
        { label: "Cancelar", onClick: onClose, variant: "text" },
        {
          label: "Guardar",
          onClick: handleSave,
          variant: "contained",
          color: "primary",
          disabled: !intervencion.descripcion,
        },
      ]}
    >
      <Box sx={{ mt: 2 }}>
        <TextField
          autoFocus
          margin="dense"
          id="descripcion"
          name="descripcion"
          label="Descripción"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={intervencion.descripcion}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
        />

        <FileUploadSection
          files={fileItems}
          onUpload={handleUpload}
          onDelete={handleDelete}
          multiple={false}
          title="Archivo adjunto (opcional)"
          emptyMessage="No hay archivo seleccionado"
          enableEtiqueta
          etiquetaValue={etiquetaActual}
          onEtiquetaChange={setEtiquetaActual}
          etiquetaHelperText="Etiqueta clasificatoria del archivo (opcional)"
        />
      </Box>
    </BaseDialog>
  )
}
