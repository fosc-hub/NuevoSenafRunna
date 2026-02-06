"use client"

import React from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Grid,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DescriptionIcon from '@mui/icons-material/Description'
import AssignmentIcon from '@mui/icons-material/Assignment'
import GavelIcon from '@mui/icons-material/Gavel'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import type { Documento, CategoriaDocumento } from '../../../types/repositorio-documentos'
import { CATEGORY_CONFIG } from './constants'
import { DocumentoCard } from './DocumentoCard'

interface CategoryAccordionProps {
  categoria: CategoriaDocumento
  documentos: Documento[]
  expanded: boolean
  onToggle: (categoria: CategoriaDocumento) => void
}

const CATEGORY_ICONS: Record<CategoriaDocumento, React.ReactNode> = {
  DEMANDA: <DescriptionIcon />,
  EVALUACION: <AssignmentIcon />,
  MEDIDA: <GavelIcon />,
}

export const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  categoria,
  documentos,
  expanded,
  onToggle,
}) => {
  const config = CATEGORY_CONFIG[categoria]
  const documentCount = documentos.length

  return (
    <Accordion
      expanded={expanded}
      onChange={() => onToggle(categoria)}
      elevation={1}
      sx={{
        '&:before': {
          display: 'none',
        },
        borderLeft: `4px solid ${config.borderColor}`,
        borderRadius: '8px !important',
        mb: 2,
        overflow: 'hidden',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: config.bgColor,
          '&:hover': {
            bgcolor: config.bgColor,
          },
          minHeight: 64,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 2,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: config.borderColor,
          }}
        >
          {CATEGORY_ICONS[categoria]}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: config.borderColor }}>
          {config.label}
        </Typography>
        <Chip
          label={`${documentCount} documento${documentCount !== 1 ? 's' : ''}`}
          size="small"
          color={config.color}
          sx={{ ml: 1 }}
        />
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3, bgcolor: 'grey.50' }}>
        {documentCount === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <FolderOpenIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No hay documentos en esta categoría
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {documentos.map((documento) => (
              <Grid item xs={12} md={6} lg={4} key={`${documento.tipo_modelo}-${documento.id}`}>
                <DocumentoCard documento={documento} />
              </Grid>
            ))}
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default CategoryAccordion
