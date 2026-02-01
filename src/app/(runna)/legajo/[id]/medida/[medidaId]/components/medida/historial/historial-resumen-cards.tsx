"use client"

import type React from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
} from "@mui/material"
import EventIcon from "@mui/icons-material/Event"
import AssignmentIcon from "@mui/icons-material/Assignment"
import ScheduleIcon from "@mui/icons-material/Schedule"
import UpdateIcon from "@mui/icons-material/Update"
import type { HistorialResumenResponse, CategoriaEvento } from "../../../types/historial-seguimiento-api"
import { CATEGORIA_CONFIGS, formatFechaSolo } from "../../../types/historial-seguimiento-api"

interface HistorialResumenCardsProps {
  resumen: HistorialResumenResponse | undefined
  loading?: boolean
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
)

const StatCardSkeleton: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="rounded" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={60} height={32} />
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export const HistorialResumenCards: React.FC<HistorialResumenCardsProps> = ({
  resumen,
  loading = false,
}) => {
  if (loading) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (!resumen) {
    return null
  }

  // Find top category
  const topCategory = Object.entries(resumen.por_categoria).reduce(
    (max, [cat, count]) => (count > max.count ? { cat: cat as CategoriaEvento, count } : max),
    { cat: 'ACTIVIDAD' as CategoriaEvento, count: 0 }
  )

  const topCategoryConfig = CATEGORIA_CONFIGS[topCategory.cat]

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total de eventos"
          value={resumen.total_eventos}
          icon={<EventIcon />}
          color="#1976D2"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Categoría principal"
          value={topCategoryConfig.label}
          icon={<AssignmentIcon />}
          color={topCategoryConfig.color}
          subtitle={`${topCategory.count} eventos`}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Primer evento"
          value={resumen.primer_evento ? formatFechaSolo(resumen.primer_evento) : '-'}
          icon={<ScheduleIcon />}
          color="#388E3C"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Último evento"
          value={resumen.ultimo_evento ? formatFechaSolo(resumen.ultimo_evento) : '-'}
          icon={<UpdateIcon />}
          color="#F57C00"
        />
      </Grid>
    </Grid>
  )
}

interface CategoriaBreakdownProps {
  porCategoria: Record<CategoriaEvento, number>
}

export const CategoriaBreakdown: React.FC<CategoriaBreakdownProps> = ({ porCategoria }) => {
  const entries = Object.entries(porCategoria) as [CategoriaEvento, number][]
  const sortedEntries = entries.sort((a, b) => b[1] - a[1])

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Eventos por categoría
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {sortedEntries.map(([categoria, count]) => {
            const config = CATEGORIA_CONFIGS[categoria]
            return (
              <Box
                key={categoria}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: config.backgroundColor,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: config.color, fontWeight: 500 }}
                >
                  {config.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: config.color,
                    fontWeight: 700,
                    backgroundColor: 'white',
                    px: 1,
                    borderRadius: 1,
                  }}
                >
                  {count}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}
