"use client"

import React from "react"
import { Chip, Box, Tooltip, LinearProgress, Typography, Badge } from "@mui/material"
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material"
import type {
  IndicadoresLegajo,
  OficioConSemaforo,
  SemaforoEstado,
  AndarielEstado,
  MedidaAndarivel,
  Alerta,
} from "../types/legajo-api"
import {
  SEMAFORO_COLORS,
  ANDARIVEL_COLORS,
  PT_STATE_COLORS,
  PROGRESS_BAR_COLORS,
  getSemaforoColor,
  getAndarielColor,
  getPTStateColor,
  calculateSemaforo,
} from "../config/legajo-theme"

/**
 * Chip para mostrar contador de Demandas PI
 */
export const ChipDemandaPI: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) {
    return <Typography variant="body2" color="text.disabled">-</Typography>
  }

  return (
    <Tooltip title={`${count} Demanda${count > 1 ? "s" : ""} PI`}>
      <Chip
        label="PI"
        size="small"
        color="secondary"
        sx={{
          fontWeight: "bold",
          minWidth: 45,
        }}
        icon={
          <Badge badgeContent={count} color="error" max={99}>
            <DescriptionIcon fontSize="small" />
          </Badge>
        }
      />
    </Tooltip>
  )
}

/**
 * Chips para mostrar Oficios con semáforo de vencimiento
 */
export const ChipsOficios: React.FC<{ oficios: OficioConSemaforo[] }> = ({ oficios }) => {
  if (oficios.length === 0) {
    return <Typography variant="body2" color="text.disabled">Sin oficios</Typography>
  }

  // Agrupar oficios por tipo
  const oficiosPorTipo = oficios.reduce((acc, oficio) => {
    if (!acc[oficio.tipo]) {
      acc[oficio.tipo] = []
    }
    acc[oficio.tipo].push(oficio)
    return acc
  }, {} as Record<string, OficioConSemaforo[]>)

  const getSemaforoIcon = (semaforo: SemaforoEstado) => {
    switch (semaforo) {
      case "verde":
        return <CheckCircleIcon fontSize="small" />
      case "amarillo":
        return <WarningIcon fontSize="small" />
      case "rojo":
        return <ErrorIcon fontSize="small" />
      default:
        return undefined
    }
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {Object.entries(oficiosPorTipo).map(([tipo, oficiosTipo]) => {
        // Tomar el semáforo más crítico (rojo > amarillo > verde)
        const semaforoMasCritico = oficiosTipo.reduce((prev, curr) => {
          if (curr.semaforo === "rojo") return "rojo"
          if (curr.semaforo === "amarillo" && prev !== "rojo") return "amarillo"
          return prev
        }, "verde" as SemaforoEstado)

        const tooltipText = `${tipo}: ${oficiosTipo.length} oficio${oficiosTipo.length > 1 ? "s" : ""}`
        const colors = getSemaforoColor(semaforoMasCritico)

        return (
          <Tooltip key={tipo} title={tooltipText}>
            <Chip
              label={tipo.substring(0, 3).toUpperCase()}
              size="small"
              icon={getSemaforoIcon(semaforoMasCritico)}
              sx={{
                fontWeight: "500",
                fontSize: "0.75rem",
                bgcolor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                "& .MuiChip-icon": {
                  color: colors.icon,
                },
              }}
            />
          </Tooltip>
        )
      })}
    </Box>
  )
}

/**
 * Andarivel de Medidas - Barra de progreso visual
 */
export const AndarielMedidas: React.FC<{ estado: MedidaAndarivel | AndarielEstado | null }> = ({ estado }) => {
  if (!estado) {
    return <Typography variant="body2" color="text.disabled">Sin medidas</Typography>
  }

  // Extract the estado string from object if needed
  let estadoString: string
  let estadoObj: MedidaAndarivel | null = null

  if (typeof estado === 'string') {
    estadoString = estado
  } else if (typeof estado === 'object' && estado !== null) {
    // Safely extract etapa_nombre, ensuring we handle all edge cases
    if (estado.etapa_nombre) {
      estadoString = String(estado.etapa_nombre)
      estadoObj = estado
    } else {
      // If no etapa_nombre, fallback to showing generic message
      return <Typography variant="body2" color="text.disabled">Sin medidas</Typography>
    }
  } else {
    // Unexpected type, fallback
    return <Typography variant="body2" color="text.disabled">Sin medidas</Typography>
  }

  const etapas: AndarielEstado[] = ["Intervención", "Aval", "Informe Jurídico", "Ratificación"]
  const etapaIndex = etapas.indexOf(estadoString as AndarielEstado)

  // If estado is not valid, show generic message
  if (etapaIndex === -1) {
    return <Typography variant="body2" color="text.secondary">{estadoString}</Typography>
  }

  const progreso = ((etapaIndex + 1) / etapas.length) * 100
  const colors = getAndarielColor(estadoString as AndarielEstado)

  // Build tooltip with additional info if available
  let tooltipContent = `Etapa: ${estadoString}`
  if (estadoObj) {
    const parts = [`Etapa: ${estadoString}`]
    if (estadoObj.numero_medida) parts.push(`Medida: ${String(estadoObj.numero_medida)}`)
    if (estadoObj.etapa_estado) parts.push(`Estado: ${String(estadoObj.etapa_estado)}`)
    tooltipContent = parts.join(' | ')
  }

  return (
    <Tooltip title={tooltipContent}>
      <Box sx={{ width: "100%", minWidth: 120 }}>
        <LinearProgress
          variant="determinate"
          value={progreso}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "#e5e7eb",
            "& .MuiLinearProgress-bar": {
              backgroundColor: colors.border,
              borderRadius: 4,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.7rem",
            mt: 0.5,
            display: "block",
            color: colors.text,
            fontWeight: 500,
          }}
        >
          {estadoString}
        </Typography>
      </Box>
    </Tooltip>
  )
}

/**
 * Contadores de Plan de Trabajo (PT)
 */
export const ContadoresPT: React.FC<{
  actividades: {
    pendientes: number
    en_progreso: number
    vencidas: number
    realizadas: number
  }
}> = ({ actividades }) => {
  const total =
    actividades.pendientes + actividades.en_progreso + actividades.vencidas + actividades.realizadas

  if (total === 0) {
    return <Typography variant="body2" color="text.disabled">Sin PT</Typography>
  }

  const pendientesColors = getPTStateColor("pendientes")
  const enProgresoColors = getPTStateColor("en_progreso")
  const vencidasColors = getPTStateColor("vencidas")
  const realizadasColors = getPTStateColor("realizadas")

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {actividades.pendientes > 0 && (
        <Tooltip title={`${actividades.pendientes} Pendiente${actividades.pendientes > 1 ? "s" : ""}`}>
          <Chip
            label={actividades.pendientes}
            size="small"
            sx={{
              bgcolor: pendientesColors.bg,
              color: pendientesColors.text,
              border: `1px solid ${pendientesColors.border}`,
              fontWeight: "bold",
              minWidth: 30,
            }}
          />
        </Tooltip>
      )}

      {actividades.en_progreso > 0 && (
        <Tooltip title={`${actividades.en_progreso} En progreso`}>
          <Chip
            label={actividades.en_progreso}
            size="small"
            sx={{
              bgcolor: enProgresoColors.bg,
              color: enProgresoColors.text,
              border: `1px solid ${enProgresoColors.border}`,
              fontWeight: "bold",
              minWidth: 30,
            }}
          />
        </Tooltip>
      )}

      {actividades.vencidas > 0 && (
        <Tooltip title={`${actividades.vencidas} Vencida${actividades.vencidas > 1 ? "s" : ""}`}>
          <Chip
            label={actividades.vencidas}
            size="small"
            icon={<WarningIcon fontSize="small" />}
            sx={{
              bgcolor: vencidasColors.bg,
              color: vencidasColors.text,
              border: `1px solid ${vencidasColors.border}`,
              fontWeight: "bold",
              minWidth: 30,
              "& .MuiChip-icon": {
                color: vencidasColors.icon,
              },
            }}
          />
        </Tooltip>
      )}

      {actividades.realizadas > 0 && (
        <Tooltip title={`${actividades.realizadas} Realizada${actividades.realizadas > 1 ? "s" : ""}`}>
          <Chip
            label={actividades.realizadas}
            size="small"
            sx={{
              bgcolor: realizadasColors.bg,
              color: realizadasColors.text,
              border: `1px solid ${realizadasColors.border}`,
              fontWeight: "bold",
              minWidth: 30,
            }}
          />
        </Tooltip>
      )}
    </Box>
  )
}

/**
 * Chip de Alertas
 */
export const AlertasChip: React.FC<{
  alertas: Alerta[],
  virtualAlerts?: Alerta[]
}> = ({ alertas, virtualAlerts = [] }) => {
  const allAlertas = [...alertas, ...virtualAlerts]

  if (allAlertas.length === 0) {
    return null
  }

  const tooltipContent = (
    <Box>
      {allAlertas.map((alerta, index) => (
        <Typography key={index} variant="caption" sx={{ display: "block", mb: 0.5 }}>
          • {alerta.mensaje}
        </Typography>
      ))}
    </Box>
  )

  return (
    <Tooltip title={tooltipContent}>
      <Chip
        label={allAlertas.length}
        size="small"
        color={virtualAlerts.length > 0 ? "error" : "warning"}
        icon={<WarningIcon fontSize="small" />}
        sx={{
          fontWeight: "bold",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          "@keyframes pulse": {
            "0%, 100%": {
              opacity: 1,
            },
            "50%": {
              opacity: 0.7,
            },
          },
        }}
      />
    </Tooltip>
  )
}

/**
 * Componente principal que agrupa todos los indicadores
 */
export const IndicadoresColumn: React.FC<{
  indicadores: IndicadoresLegajo,
  medidas_activas?: any[],
  userPermissions?: any
}> = ({ indicadores, medidas_activas = [], userPermissions }) => {

  // Generar alertas "virtuales" basadas en el rol y estado de las medidas
  const virtualAlerts: Alerta[] = []

  if (userPermissions) {
    const allStates = new Set<string>()
    if (indicadores.medida_andarivel && typeof indicadores.medida_andarivel === 'object') {
      if (indicadores.medida_andarivel.etapa_estado) allStates.add(indicadores.medida_andarivel.etapa_estado.toUpperCase())
    }

    medidas_activas.forEach(m => {
      if (m.estado) allStates.add(m.estado.toUpperCase())
      if (m.etapa_estado) allStates.add(m.etapa_estado.toUpperCase())
    })

    const has = (keyword: string) => Array.from(allStates).some(s => s.includes(keyword.toUpperCase()))

    if (userPermissions.isDirector && (has("NOTA_AVAL") || has("PENDIENTE_NOTA_AVAL"))) {
      virtualAlerts.push({ tipo: 'URGENTE', severidad: 'alta', mensaje: 'Pendiente Nota de Aval' })
    }

    if (userPermissions.isLegales && (has("JURIDICO") || has("PENDIENTE_INFORME_JURIDICO"))) {
      virtualAlerts.push({ tipo: 'URGENTE', severidad: 'alta', mensaje: 'Pendiente Informe Jurídico' })
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, py: 0.5 }}>
      {/* Demanda PI */}
      {indicadores.demanda_pi_count > 0 && <ChipDemandaPI count={indicadores.demanda_pi_count} />}

      {/* Oficios */}
      {indicadores.oficios_por_tipo && Object.keys(indicadores.oficios_por_tipo).length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", fontWeight: 600 }}>
            Oficios
          </Typography>
          {/* Aquí deberíamos pasar los oficios con semáforo, pero por ahora mostramos solo contadores */}
        </Box>
      )}

      {/* Andarivel de Medidas */}
      {indicadores.medida_andarivel && <AndarielMedidas estado={indicadores.medida_andarivel} />}

      {/* Plan de Trabajo */}
      <ContadoresPT actividades={indicadores.pt_actividades} />

      {/* Alertas */}
      {(indicadores.alertas.length > 0 || virtualAlerts.length > 0) && (
        <AlertasChip alertas={indicadores.alertas} virtualAlerts={virtualAlerts} />
      )}
    </Box>
  )
}
