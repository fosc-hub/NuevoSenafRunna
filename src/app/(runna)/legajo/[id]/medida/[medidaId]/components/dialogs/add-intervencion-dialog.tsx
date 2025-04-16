"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from "@mui/material"
import AttachFileIcon from "@mui/icons-material/AttachFile"

export interface NewIntervencion {
  descripcion: string
  archivo?: File | null
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
  })
  const [fileName, setFileName] = useState<string>("")

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setIntervencion((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setIntervencion((prev) => ({ ...prev, archivo: file }))
      setFileName(file.name)
    }
  }

  const handleSave = () => {
    onSave(intervencion)
    setIntervencion({ descripcion: "", archivo: null })
    setFileName("")
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar nueva intervención</DialogTitle>
      <DialogContent>
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

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button component="label" startIcon={<AttachFileIcon />} sx={{ textTransform: "none" }}>
              Adjuntar archivo
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {fileName && (
              <Typography variant="body2" sx={{ ml: 2 }}>
                {fileName}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={!intervencion.descripcion}
          sx={{
            borderRadius: 8,
            textTransform: "none",
          }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
