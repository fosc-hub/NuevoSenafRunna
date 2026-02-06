"use client"

import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import AddIcon from '@mui/icons-material/Add'

interface EmptyStateProps {
  showAddButton?: boolean
  onAddClick?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  showAddButton = false,
  onAddClick,
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 4,
        bgcolor: 'grey.50',
        borderRadius: 2,
        border: '2px dashed',
        borderColor: 'grey.300',
      }}
    >
      <FolderOpenIcon
        sx={{
          fontSize: 80,
          color: 'grey.300',
          mb: 2,
        }}
      />

      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
        No hay documentos adjuntos
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Los documentos de demandas, evaluaciones y medidas aparecerán aquí.
      </Typography>

      {showAddButton && onAddClick && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          sx={{ textTransform: 'none' }}
        >
          Agregar primer documento
        </Button>
      )}
    </Box>
  )
}

export default EmptyState
