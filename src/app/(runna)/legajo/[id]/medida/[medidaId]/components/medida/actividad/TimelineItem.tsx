"use client"

import React from 'react'
import { Box } from '@mui/material'
import type { UnifiedTimelineItem } from '../../../types/actividades'
import { isComentario, isAdjunto } from '../../../types/actividades'
import { ComentarioCard } from './ComentarioCard'
import { AdjuntoCard } from './AdjuntoCard'

interface TimelineItemProps {
  item: UnifiedTimelineItem
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ item }) => {
  return (
    <Box sx={{ mb: 2 }}>
      {isComentario(item) && <ComentarioCard comentario={item.data} />}
      {isAdjunto(item) && <AdjuntoCard adjunto={item.data} />}
    </Box>
  )
}
