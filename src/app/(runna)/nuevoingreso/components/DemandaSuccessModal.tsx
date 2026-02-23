"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import FolderIcon from "@mui/icons-material/Folder"
import PersonIcon from "@mui/icons-material/Person"
import AssignmentIcon from "@mui/icons-material/Assignment"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import GavelIcon from "@mui/icons-material/Gavel"
import VisibilityIcon from "@mui/icons-material/Visibility"
import ListAltIcon from "@mui/icons-material/ListAlt"
import HomeIcon from "@mui/icons-material/Home"

import BaseModal from "@/components/shared/BaseModal"
import type { DemandaCreatedResponse } from "../types/demanda-response"
import { getNnyaCount, getAdultosCount, OBJETIVO_LABELS } from "../types/demanda-response"
import { UnifiedActividadesTable } from "@/app/(runna)/legajo/actividades/components/UnifiedActividadesTable"
import type { TActividadPlanTrabajo } from "@/app/(runna)/legajo/[id]/medida/[medidaId]/types/actividades"
import { LegalActividadesKanbanInline } from "./LegalActividadesKanbanInline"

interface DemandaSuccessModalProps {
  open: boolean
  onClose: () => void
  data: DemandaCreatedResponse | null
  onNavigateToDemanda?: (demandaId: number) => void
  onNavigateToMesaEntrada?: () => void
}

/**
 * Modal displayed after successful demanda creation
 * Shows summary of created demanda and plan de trabajo (if applicable)
 */
export const DemandaSuccessModal: React.FC<DemandaSuccessModalProps> = ({
  open,
  onClose,
  data,
  onNavigateToDemanda,
  onNavigateToMesaEntrada,
}) => {
  // Local state for actividades - allows updates from bulk operations
  const [localActividades, setLocalActividades] = useState<TActividadPlanTrabajo[]>([])

  // Sync local state when data changes (new demanda created)
  useEffect(() => {
    if (data?.actividades_creadas) {
      setLocalActividades(data.actividades_creadas)
    }
  }, [data])

  // Handle updates from the table (e.g., bulk assign) - only for non-EQUIPO_LEGAL activities
  const handleActividadesUpdate = useCallback((updatedActividades: TActividadPlanTrabajo[]) => {
    setLocalActividades((prev) => {
      // Keep EQUIPO_LEGAL activities unchanged, replace others with updated ones
      const legalActividades = prev.filter((a) => a.actor === "EQUIPO_LEGAL")
      return [...legalActividades, ...updatedActividades]
    })
  }, [])

  // Separate EQUIPO_LEGAL activities for Kanban display
  const { legalActividades, otherActividades } = useMemo(() => {
    const legal: TActividadPlanTrabajo[] = []
    const other: TActividadPlanTrabajo[] = []

    localActividades.forEach((actividad) => {
      if (actividad.actor === "EQUIPO_LEGAL") {
        legal.push(actividad)
      } else {
        other.push(actividad)
      }
    })

    return { legalActividades: legal, otherActividades: other }
  }, [localActividades])

  // Handle updates from the legal kanban
  const handleLegalActividadesUpdate = useCallback((updatedActividades: TActividadPlanTrabajo[]) => {
    setLocalActividades((prev) => {
      // Replace legal activities with updated ones, keep other activities unchanged
      const nonLegalActividades = prev.filter((a) => a.actor !== "EQUIPO_LEGAL")
      return [...nonLegalActividades, ...updatedActividades]
    })
  }, [])

  if (!data) return null

  const { demanda, demanda_zona, personas, medidas_creadas } = data
  const nnyaCount = getNnyaCount(data)
  const adultosCount = getAdultosCount(data)
  const hasPlanTrabajo = localActividades.length > 0
  const hasLegalActividades = legalActividades.length > 0
  const hasOtherActividades = otherActividades.length > 0

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon sx={{ color: "success.main", fontSize: 28 }} />
          <span>Demanda Creada Exitosamente</span>
        </Box>
      }
      width="95%"
      maxWidth={hasPlanTrabajo ? 1200 : 700}
      minHeight={hasPlanTrabajo ? 700 : 400}
      maxHeight="95vh"
      showCloseButton
      showFooterDivider
      actions={[
        {
          label: "Cerrar",
          onClick: onClose,
          variant: "outlined",
          color: "inherit",
        },
        {
          label: "Mesa de Entrada",
          onClick: () => onNavigateToMesaEntrada?.(),
          variant: "outlined",
          color: "primary",
          startIcon: <HomeIcon />,
        },
        {
          label: "Ver Demanda",
          onClick: () => onNavigateToDemanda?.(demanda.id),
          variant: "contained",
          color: "primary",
          startIcon: <VisibilityIcon />,
        },
      ]}
    >
      {/* Summary Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: "success.50",
          border: "1px solid",
          borderColor: "success.200",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "success.dark" }}>
          Resumen de la Demanda
        </Typography>

        <Grid container spacing={3}>
          {/* Demanda Info */}
          <Grid item xs={12} md={hasPlanTrabajo ? 6 : 12}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Demanda ID & Estado */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<FolderIcon />}
                  label={`Demanda #${demanda.id}`}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={demanda.estado_demanda.replace(/_/g, " ")}
                  variant="outlined"
                  color="info"
                />
                <Chip
                  label={OBJETIVO_LABELS[demanda.objetivo_de_demanda]}
                  variant="outlined"
                  color="secondary"
                />
              </Box>

              {/* Zona */}
              {demanda_zona && demanda_zona.zona_nombre && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Zona asignada:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {demanda_zona.zona_nombre}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={hasPlanTrabajo ? 6 : 12}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    textAlign: "center",
                    bgcolor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {nnyaCount}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    NNyA
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    textAlign: "center",
                    bgcolor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 18, color: "info.main" }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "info.main" }}>
                      {adultosCount}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Adultos
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    textAlign: "center",
                    bgcolor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    <GavelIcon sx={{ fontSize: 18, color: "secondary.main" }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "secondary.main" }}>
                      {medidas_creadas.length}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Medidas
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Created Medidas */}
        {medidas_creadas.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Medidas creadas:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {medidas_creadas.map((medida) => (
                <Chip
                  key={medida.id}
                  icon={<GavelIcon />}
                  label={`${medida.tipo_medida} - ${medida.numero_medida}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor:
                      medida.tipo_medida === "MPJ"
                        ? "secondary.main"
                        : medida.tipo_medida === "MPE"
                        ? "info.main"
                        : "primary.main",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Personas list */}
        {personas.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Personas registradas:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {personas.slice(0, 5).map((persona) => (
                <Chip
                  key={persona.id}
                  label={`${persona.nombre} ${persona.apellido}${persona.dni ? ` (${persona.dni})` : ""}`}
                  size="small"
                  variant="outlined"
                />
              ))}
              {personas.length > 5 && (
                <Chip
                  label={`+${personas.length - 5} mas`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Plan de Trabajo Section */}
      {hasPlanTrabajo && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ListAltIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Plan de Trabajo
              </Typography>
              <Chip
                label={`${localActividades.length} actividades creadas`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Las siguientes actividades fueron creadas automaticamente como parte del plan de trabajo.
              Puede asignar responsables y gestionar las actividades desde esta vista.
            </Typography>

            {/* EQUIPO_LEGAL activities in Kanban format */}
            {hasLegalActividades && (
              <LegalActividadesKanbanInline
                actividades={legalActividades}
                onActividadesUpdate={handleLegalActividadesUpdate}
              />
            )}

            {/* Other activities in table format */}
            {hasOtherActividades && (
              <UnifiedActividadesTable
                variant="legajo"
                actividades={otherActividades}
                onActividadesUpdate={handleActividadesUpdate}
                showWrapper={false}
              />
            )}
          </Box>
        </>
      )}

      {/* No plan de trabajo info */}
      {!hasPlanTrabajo && demanda.objetivo_de_demanda !== "CARGA_OFICIOS" && (
        <Box
          sx={{
            p: 2,
            bgcolor: "info.50",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "info.200",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon sx={{ color: "info.main" }} />
            <Typography variant="body2" color="text.secondary">
              El plan de trabajo sera creado una vez que se asigne una medida de proteccion a esta demanda.
            </Typography>
          </Box>
        </Box>
      )}
    </BaseModal>
  )
}

export default DemandaSuccessModal
