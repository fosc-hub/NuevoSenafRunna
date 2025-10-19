"use client"

import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteIcon from '@mui/icons-material/Delete'

interface FileWithType {
  file: File
  tipo: string
  descripcion: string
}

interface AttachmentUploadProps {
  files: File[]
  onChange: (files: File[], tipos?: string[], descripciones?: string[]) => void
  requiereEvidencia?: boolean
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  onChange,
  requiereEvidencia = false
}) => {
  const [filesWithMetadata, setFilesWithMetadata] = useState<FileWithType[]>([])

  const tiposAdjunto = [
    { value: 'ACTA_COMPROMISO', label: 'Acta de Compromiso' },
    { value: 'EVIDENCIA', label: 'Evidencia' },
    { value: 'INFORME', label: 'Informe' },
    { value: 'FOTO', label: 'Foto' },
    { value: 'OTRO', label: 'Otro' }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        file,
        tipo: requiereEvidencia ? 'EVIDENCIA' : 'OTRO',
        descripcion: ''
      }))
      const updatedFilesWithMetadata = [...filesWithMetadata, ...newFiles]
      setFilesWithMetadata(updatedFilesWithMetadata)
      updateParent(updatedFilesWithMetadata)
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFilesWithMetadata = filesWithMetadata.filter((_, i) => i !== index)
    setFilesWithMetadata(newFilesWithMetadata)
    updateParent(newFilesWithMetadata)
  }

  const handleTipoChange = (index: number, tipo: string) => {
    const newFilesWithMetadata = [...filesWithMetadata]
    newFilesWithMetadata[index].tipo = tipo
    setFilesWithMetadata(newFilesWithMetadata)
    updateParent(newFilesWithMetadata)
  }

  const handleDescripcionChange = (index: number, descripcion: string) => {
    const newFilesWithMetadata = [...filesWithMetadata]
    newFilesWithMetadata[index].descripcion = descripcion
    setFilesWithMetadata(newFilesWithMetadata)
    updateParent(newFilesWithMetadata)
  }

  const updateParent = (filesData: FileWithType[]) => {
    const files = filesData.map(f => f.file)
    const tipos = filesData.map(f => f.tipo)
    const descripciones = filesData.map(f => f.descripcion)
    onChange(files, tipos, descripciones)
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
        Adjuntos {requiereEvidencia && '(Evidencia requerida)'}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<AttachFileIcon />}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Seleccionar archivos
          <input
            type="file"
            hidden
            multiple
            onChange={handleFileSelect}
          />
        </Button>
      </Box>

      {filesWithMetadata.length > 0 && (
        <List>
          {filesWithMetadata.map((fileData, index) => (
            <ListItem
              key={index}
              sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1, flexDirection: 'column', alignItems: 'stretch', p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ flex: 1, mr: 2 }}>
                  <ListItemText
                    primary={fileData.file.name}
                    secondary={`${(fileData.file.size / 1024).toFixed(2)} KB`}
                  />
                </Box>
                <FormControl size="small" sx={{ minWidth: 180, mr: 1 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={fileData.tipo}
                    onChange={(e) => handleTipoChange(index, e.target.value)}
                    label="Tipo"
                  >
                    {tiposAdjunto.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton edge="end" onClick={() => handleRemoveFile(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Descripción (opcional)"
                value={fileData.descripcion}
                onChange={(e) => handleDescripcionChange(index, e.target.value)}
                placeholder="Agregar una descripción del archivo"
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
