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
import GavelIcon from '@mui/icons-material/Gavel'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import type { Documento } from '../../../types/repositorio-documentos'
import { DocumentoCard } from './DocumentoCard'

interface MedidaSubAccordionProps {
  medidaId: number
  documentos: Documento[]
  expanded: boolean
  onToggle: (medidaId: number) => void
}

export const MedidaSubAccordion: React.FC<MedidaSubAccordionProps> = ({
  medidaId,
  documentos,
  expanded,
  onToggle,
}) => {
  const documentCount = documentos.length

  return (
    <Accordion
      expanded={expanded}
      onChange={() => onToggle(medidaId)}
      elevation={0}
      sx={{
        '&:before': {
          display: 'none',
        },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '6px !important',
        mb: 1.5,
        overflow: 'hidden',
        '&:last-child': {
          mb: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: 'grey.50',
          '&:hover': {
            bgcolor: 'grey.100',
          },
          minHeight: 48,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 1.5,
            my: 1,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'success.main',
          }}
        >
          <GavelIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Medida #{medidaId}
        </Typography>
        <Chip
          label={`${documentCount} doc${documentCount !== 1 ? 's' : ''}`}
          size="small"
          variant="outlined"
          color="success"
          sx={{ height: 22, fontSize: '0.75rem' }}
        />
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2, bgcolor: 'background.paper' }}>
        {documentCount === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 3,
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <FolderOpenIcon sx={{ fontSize: 36, color: 'grey.300', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              No hay documentos en esta medida
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {documentos.map((documento) => (
              <Grid item xs={12} md={6} key={`${documento.tipo_modelo}-${documento.id}`}>
                <DocumentoCard documento={documento} />
              </Grid>
            ))}
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default MedidaSubAccordion
