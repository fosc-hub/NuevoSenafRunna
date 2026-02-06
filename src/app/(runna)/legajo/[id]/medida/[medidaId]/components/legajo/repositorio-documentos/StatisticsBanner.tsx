"use client"

import React from 'react'
import { Box, Paper, Typography, Chip, Divider } from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import StorageIcon from '@mui/icons-material/Storage'
import type { CategoriaDocumento } from '../../../types/repositorio-documentos'
import { CATEGORY_CONFIG, CATEGORY_ORDER } from './constants'

interface StatisticsBannerProps {
  totalDocumentos: number
  totalSizeMb: number
  categorias: Partial<Record<CategoriaDocumento, number>>
}

export const StatisticsBanner: React.FC<StatisticsBannerProps> = ({
  totalDocumentos,
  totalSizeMb,
  categorias,
}) => {
  /**
   * Format size for display
   */
  const formatSize = (sizeMb: number): string => {
    if (sizeMb < 0.01) return '< 0.01 MB'
    if (sizeMb < 1) return `${sizeMb.toFixed(2)} MB`
    return `${sizeMb.toFixed(1)} MB`
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Total documents */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {totalDocumentos}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              documento{totalDocumentos !== 1 ? 's' : ''} total{totalDocumentos !== 1 ? 'es' : ''}
            </Typography>
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        {/* Total size */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {formatSize(totalSizeMb)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              tamaño total
            </Typography>
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        {/* Per-category counts */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {CATEGORY_ORDER.map((categoria) => {
            const count = categorias[categoria] || 0
            const config = CATEGORY_CONFIG[categoria]
            return (
              <Chip
                key={categoria}
                label={`${config.label}: ${count}`}
                size="small"
                color={config.color}
                variant={count > 0 ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 500,
                  opacity: count > 0 ? 1 : 0.6,
                }}
              />
            )
          })}
        </Box>
      </Box>
    </Paper>
  )
}

export default StatisticsBanner
