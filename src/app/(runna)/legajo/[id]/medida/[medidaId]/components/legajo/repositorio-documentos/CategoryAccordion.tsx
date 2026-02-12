"use client"

import React, { useState, useMemo, useCallback } from 'react'
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
import type { Documento, CategoriaDocumento, DocumentoMetadata } from '../../../types/repositorio-documentos'
import { CATEGORY_CONFIG } from './constants'
import { DocumentoCard } from './DocumentoCard'
import { MedidaSubAccordion } from './MedidaSubAccordion'

interface CategoryAccordionProps {
  categoria: CategoriaDocumento
  documentos: Documento[]
  expanded: boolean
  onToggle: (categoria: CategoriaDocumento) => void
  medidas_ids?: number[]
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
  medidas_ids = [],
}) => {
  const config = CATEGORY_CONFIG[categoria]
  const documentCount = documentos.length

  // Track expanded state for sub-accordions (for MEDIDA category)
  const [expandedMedidas, setExpandedMedidas] = useState<Set<number>>(
    new Set(medidas_ids)
  )

  // Group documents by medida_id for MEDIDA category
  const documentosPorMedida = useMemo(() => {
    if (categoria !== 'MEDIDA' || medidas_ids.length === 0) {
      return null
    }

    const grouped: Record<number, Documento[]> = {}

    // Initialize all medidas (even those with 0 documents)
    medidas_ids.forEach((medidaId) => {
      grouped[medidaId] = []
    })

    // Group documents by their medida_id from metadata
    documentos.forEach((doc) => {
      const metadata = doc.metadata as DocumentoMetadata
      const medidaId = metadata?.medida_id
      if (medidaId && grouped[medidaId] !== undefined) {
        grouped[medidaId].push(doc)
      }
    })

    return grouped
  }, [categoria, documentos, medidas_ids])

  // Handle sub-accordion toggle
  const handleMedidaToggle = useCallback((medidaId: number) => {
    setExpandedMedidas((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(medidaId)) {
        newSet.delete(medidaId)
      } else {
        newSet.add(medidaId)
      }
      return newSet
    })
  }, [])

  // Determine if we should use sub-grouping (MEDIDA category with multiple medidas)
  const useSubGrouping = categoria === 'MEDIDA' && medidas_ids.length > 1 && documentosPorMedida

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
        {useSubGrouping && (
          <Chip
            label={`${medidas_ids.length} medidas`}
            size="small"
            variant="outlined"
            color={config.color}
            sx={{ ml: 0.5 }}
          />
        )}
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
        ) : useSubGrouping && documentosPorMedida ? (
          // Render sub-accordions for each medida
          <Box>
            {medidas_ids.map((medidaId) => (
              <MedidaSubAccordion
                key={medidaId}
                medidaId={medidaId}
                documentos={documentosPorMedida[medidaId] || []}
                expanded={expandedMedidas.has(medidaId)}
                onToggle={handleMedidaToggle}
              />
            ))}
          </Box>
        ) : (
          // Regular grid for other categories or single medida
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
