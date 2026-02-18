"use client"

/**
 * ObjetivoSelectionStep - Step 0 for selecting the objective of the demanda
 *
 * Displays 3 clickable cards for:
 * - PROTECCION: Standard protection flow (continues to full 3-step form)
 * - PETICION_DE_INFORME: Information request (continues to full 3-step form)
 * - CARGA_OFICIOS: Judicial documents (redirects to specialized CARGA_OFICIOS form)
 */

import type React from "react"
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  alpha,
} from "@mui/material"
import {
  Shield as ShieldIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"
import type { ObjetivoDemanda, FormVariant } from "../carga-oficios/types/carga-oficios.types"

interface ObjetivoOption {
  key: ObjetivoDemanda
  label: string
  description: string
  icon: React.ElementType
  color: string
  variant: FormVariant
  badge?: string
}

const OBJETIVO_OPTIONS: ObjetivoOption[] = [
  {
    key: "PROTECCION",
    label: "Protección",
    description:
      "Registro de demanda para medidas de protección integral de niños, niñas y adolescentes.",
    icon: ShieldIcon,
    color: "#2563eb", // Blue
    variant: "STANDARD",
  },
  {
    key: "PETICION_DE_INFORME",
    label: "Petición de Informe",
    description:
      "Solicitud de informes sobre situación de niños, niñas y adolescentes bajo intervención.",
    icon: DescriptionIcon,
    color: "#7c3aed", // Purple
    variant: "STANDARD",
  },
  {
    key: "CARGA_OFICIOS",
    label: "Carga de Oficios",
    description:
      "Registro de oficios judiciales, medidas tutelares y comunicaciones del poder judicial.",
    icon: GavelIcon,
    color: "#059669", // Green
    variant: "CARGA_OFICIOS",
    badge: "Formulario especializado",
  },
]

interface ObjetivoSelectionStepProps {
  selected: ObjetivoDemanda | null
  onSelect: (objetivo: ObjetivoDemanda, variant: FormVariant) => void
  disabled?: boolean
}

const ObjetivoSelectionStep: React.FC<ObjetivoSelectionStepProps> = ({
  selected,
  onSelect,
  disabled = false,
}) => {
  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: 2 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: "12px",
          bgcolor: "primary.light",
          color: "white",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Nuevo Registro de Demanda
        </Typography>
        <Typography variant="body2">
          Seleccione el tipo de objetivo para iniciar el registro. Cada opción tiene un flujo de
          trabajo específico.
        </Typography>
      </Paper>

      {/* Selection Cards */}
      <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
        ¿Cuál es el objetivo de la demanda?
      </Typography>

      <Grid container spacing={3}>
        {OBJETIVO_OPTIONS.map((option) => {
          const isSelected = selected === option.key
          const IconComponent = option.icon

          return (
            <Grid item xs={12} md={4} key={option.key}>
              <Card
                elevation={isSelected ? 8 : 2}
                sx={{
                  height: "100%",
                  position: "relative",
                  transition: "all 0.3s ease",
                  border: isSelected ? `2px solid ${option.color}` : "2px solid transparent",
                  borderRadius: "12px",
                  overflow: "visible",
                  "&:hover": {
                    elevation: 6,
                    transform: disabled ? "none" : "translateY(-4px)",
                    boxShadow: disabled ? undefined : `0 12px 24px ${alpha(option.color, 0.15)}`,
                  },
                }}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: -12,
                      bgcolor: option.color,
                      borderRadius: "50%",
                      p: 0.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: 2,
                      zIndex: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "white", fontSize: 24 }} />
                  </Box>
                )}

                <CardActionArea
                  onClick={() => !disabled && onSelect(option.key, option.variant)}
                  disabled={disabled}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    p: 0,
                  }}
                >
                  <CardContent
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      p: 3,
                    }}
                  >
                    {/* Icon and Badge */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "12px",
                          bgcolor: alpha(option.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconComponent
                          sx={{
                            fontSize: 32,
                            color: option.color,
                          }}
                        />
                      </Box>
                      {option.badge && (
                        <Chip
                          label={option.badge}
                          size="small"
                          sx={{
                            bgcolor: alpha(option.color, 0.1),
                            color: option.color,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: isSelected ? option.color : "text.primary",
                      }}
                    >
                      {option.label}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.6,
                        flexGrow: 1,
                      }}
                    >
                      {option.description}
                    </Typography>

                    {/* Flow indicator */}
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                        }}
                      >
                        {option.variant === "CARGA_OFICIOS"
                          ? "→ Formulario judicial"
                          : "→ Formulario estándar"}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Help text */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Seleccione una opción y presione <strong>Siguiente</strong> para continuar con el
          registro.
        </Typography>
      </Box>
    </Box>
  )
}

export default ObjetivoSelectionStep
