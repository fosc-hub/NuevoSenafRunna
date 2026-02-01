"use client"

import type React from "react"
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Skeleton,
  Alert,
  Button,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import DownloadIcon from "@mui/icons-material/Download"
import TimelineIcon from "@mui/icons-material/Timeline"
import {
  useTrazabilidadCompacta,
  useExportTrazabilidad,
} from "../../../hooks/useHistorialSeguimiento"
import type {
  TrazabilidadCompactaResponse,
  TipoEtapa,
} from "../../../types/historial-seguimiento-api"
import { formatFechaSolo } from "../../../types/historial-seguimiento-api"

interface TrazabilidadStepperProps {
  medidaId: number
  numeroMedida?: string
  orientation?: 'horizontal' | 'vertical'
}

interface StepIconProps {
  completed: boolean
  active: boolean
}

const CustomStepIcon: React.FC<StepIconProps> = ({ completed, active }) => {
  if (completed) {
    return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
  }
  if (active) {
    return <RadioButtonCheckedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
  }
  return <RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
}

const getActiveStep = (
  trazabilidad: TrazabilidadCompactaResponse
): number => {
  const activeIndex = trazabilidad.flujo.esperado.findIndex((etapaTipo) => {
    const etapaReal = trazabilidad.etapas.find((e) => e.tipo_etapa === etapaTipo)
    return etapaReal?.esta_activa
  })
  return activeIndex >= 0 ? activeIndex : -1
}

const getStepStatus = (
  etapaTipo: TipoEtapa,
  trazabilidad: TrazabilidadCompactaResponse
): { completed: boolean; active: boolean; data: typeof trazabilidad.etapas[0] | null } => {
  const etapaReal = trazabilidad.etapas.find((e) => e.tipo_etapa === etapaTipo)

  if (!etapaReal) {
    return { completed: false, active: false, data: null }
  }

  return {
    completed: !etapaReal.esta_activa,
    active: etapaReal.esta_activa,
    data: etapaReal,
  }
}

export const TrazabilidadStepper: React.FC<TrazabilidadStepperProps> = ({
  medidaId,
  numeroMedida = '',
  orientation = 'horizontal',
}) => {
  const {
    data: trazabilidad,
    isLoading,
    error,
  } = useTrazabilidadCompacta(medidaId, !!medidaId)

  const exportMutation = useExportTrazabilidad()

  const handleExport = () => {
    exportMutation.mutate({
      medidaId,
      numeroMedida,
    })
  }

  if (isLoading) {
    return (
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={80} />
      </Paper>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error al cargar la trazabilidad: {error.message}
      </Alert>
    )
  }

  if (!trazabilidad) {
    return null
  }

  const activeStep = getActiveStep(trazabilidad)

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Flujo de Etapas
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={trazabilidad.medida.estado_vigencia_display}
            color={trazabilidad.medida.estado_vigencia === 'VIGENTE' ? 'success' : 'default'}
            size="small"
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Medida info */}
      <Box sx={{ mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Tipo de Medida
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {trazabilidad.medida.tipo_medida_display}
          </Typography>
        </Box>
        {trazabilidad.medida.fecha_apertura && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Fecha de Apertura
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatFechaSolo(trazabilidad.medida.fecha_apertura)}
            </Typography>
          </Box>
        )}
        {trazabilidad.medida.fecha_cierre && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Fecha de Cierre
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatFechaSolo(trazabilidad.medida.fecha_cierre)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Stepper */}
      <Box sx={{ overflowX: orientation === 'horizontal' ? 'auto' : 'visible' }}>
        <Stepper
          activeStep={activeStep}
          orientation={orientation}
          alternativeLabel={orientation === 'horizontal'}
          sx={{
            minWidth: orientation === 'horizontal' ? 'max-content' : 'auto',
            pb: orientation === 'horizontal' ? 2 : 0,
          }}
        >
          {trazabilidad.flujo.esperado.map((etapaTipo, index) => {
            const { completed, active, data } = getStepStatus(etapaTipo, trazabilidad)
            const isPending = !completed && !active

            return (
              <Step key={etapaTipo} completed={completed}>
                <StepLabel
                  StepIconComponent={() => (
                    <CustomStepIcon completed={completed} active={active} />
                  )}
                  optional={
                    data && orientation === 'horizontal' ? (
                      <Typography variant="caption" color="text.secondary">
                        {data.duracion_dias !== null
                          ? `${data.duracion_dias} días`
                          : 'En curso'}
                      </Typography>
                    ) : null
                  }
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: active ? 700 : 500,
                      color: isPending ? 'text.disabled' : 'text.primary',
                    }}
                  >
                    {data?.tipo_etapa_display || etapaTipo}
                  </Typography>
                </StepLabel>

                {orientation === 'vertical' && data && (
                  <StepContent>
                    <Box sx={{ py: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Estado: {data.estado_display}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Inicio: {formatFechaSolo(data.fecha_inicio)}
                        {data.fecha_fin && ` | Fin: ${formatFechaSolo(data.fecha_fin)}`}
                      </Typography>
                      {data.duracion_dias !== null && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Duración: {data.duracion_dias} días
                        </Typography>
                      )}
                    </Box>
                  </StepContent>
                )}
              </Step>
            )
          })}
        </Stepper>
      </Box>

      {/* Flujo info */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Etapas completadas: {trazabilidad.etapas.filter((e) => !e.esta_activa).length} de {trazabilidad.flujo.esperado.length}
        </Typography>

        {trazabilidad.flujo.proximas_posibles.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Próximas posibles: {trazabilidad.flujo.proximas_posibles.join(', ')}
          </Typography>
        )}

        {trazabilidad.flujo.completado && (
          <Chip label="Flujo completado" color="success" size="small" />
        )}
      </Box>
    </Paper>
  )
}
