"use client"

import type React from "react"
import { Snackbar, Paper, Typography, Box, Button, Chip, Stack, IconButton, Divider } from "@mui/material"
import { alpha } from "@mui/material/styles"
import LinkRoundedIcon from "@mui/icons-material/LinkRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { create } from "@/app/api/apiService"
import { useUser } from "@/utils/auth/userZustand"
import { hasVinculacionAccess } from "@/utils/auth/permissionUtils"

interface VinculacionResult {
  demanda_ids: number[]
  match_descriptions: string[]
  legajos?: Array<{
    id: number
    numero: string
    fecha_apertura: string
    nnya: number
    urgencia: string | null
  }>
}

interface VinculacionNotificationProps {
  open: boolean
  onClose: () => void
  vinculacionResults: VinculacionResult | null
  currentDemandaId?: string | number
  onVincularLegajo?: (legajoId: number, legajoNumero: string) => void // Callback to add legajo to VinculosManager
}

const VinculacionNotification: React.FC<VinculacionNotificationProps> = ({
  open,
  onClose,
  vinculacionResults,
  currentDemandaId,
  onVincularLegajo,
}) => {
  const router = useRouter()
  const params = useParams()
  const [shouldShow, setShouldShow] = useState(true)
  const [isVinculando, setIsVinculando] = useState(false)
  const user = useUser((state) => state.user)

  // Check if user has permission to view/access connections
  const hasVinculacionPermission = hasVinculacionAccess(user)

  // Verificar si hay resultados (demandas o legajos)
  useEffect(() => {
    if (vinculacionResults) {
      const hasDemandas = vinculacionResults.demanda_ids && vinculacionResults.demanda_ids.length > 0
      const hasLegajos = vinculacionResults.legajos && vinculacionResults.legajos.length > 0

      if (hasDemandas || hasLegajos) {
        // Obtener el ID actual de la demanda desde props o params
        const actualDemandaId = currentDemandaId || params.id
        // Convertir a número para comparación
        const actualIdNum = actualDemandaId ? Number(actualDemandaId) : null

        // Verificar si la demanda actual está en los resultados
        // const isSameDemanda = actualIdNum && vinculacionResults.demanda_ids.includes(actualIdNum)
        // Siempre mostrar la notificación, independientemente de si es la misma demanda o no
        setShouldShow(true)
      } else {
        setShouldShow(false)
      }
    } else {
      setShouldShow(false)
    }
  }, [vinculacionResults, currentDemandaId, params.id])

  // If user doesn't have permission, don't show the notification
  if (!hasVinculacionPermission) {
    return null
  }

  // Si no hay resultados o no se debe mostrar, no renderizar nada
  if (!vinculacionResults || !shouldShow) return null

  // Verificar si hay algún resultado (demandas o legajos)
  const hasDemandas = vinculacionResults.demanda_ids && vinculacionResults.demanda_ids.length > 0
  const hasLegajos = vinculacionResults.legajos && vinculacionResults.legajos.length > 0

  if (!hasDemandas && !hasLegajos) return null

  // Función para abrir la demanda en página completa
  const handleOpenDemanda = (demandaId: number) => {
    router.push(`/demanda/${demandaId}`)
  }

  // Función para abrir el legajo en página completa
  const handleOpenLegajo = (legajoId: number) => {
    router.push(`/legajo/${legajoId}`)
  }

  // Función para vincular demandas
  const handleVincularDemanda = async (demandaId: number) => {
    // Obtener el ID actual de la demanda
    const actualDemandaId = currentDemandaId || params.id
    if (!actualDemandaId) return

    try {
      setIsVinculando(true)

      // Crear objeto para la vinculación
      const vinculacionData = {
        demanda_preexistente: Number(actualDemandaId),
        demanda_entrante: demandaId,
        deleted: false,
      }

      // Llamar a la API para crear la vinculación
      await create("demanda-vinculada", vinculacionData, true, "¡Demandas vinculadas con éxito!")

      // Cerrar la notificación después de vincular
      onClose()

      // Opcional: recargar la página o actualizar los datos
      // router.refresh()
    } catch (error) {
      console.error("Error al vincular demandas:", error)
    } finally {
      setIsVinculando(false)
    }
  }

  // REG-01: Función para vincular legajo (pre-fill VinculosManager)
  const handleVincularLegajo = (legajoId: number, legajoNumero: string) => {
    if (onVincularLegajo) {
      onVincularLegajo(legajoId, legajoNumero)
      onClose() // Close notification after adding to VinculosManager
    }
  }

  const totalCount = vinculacionResults.demanda_ids.length + (vinculacionResults.legajos?.length || 0)

  return (
    <Snackbar
      open={open && shouldShow}
      autoHideDuration={null}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ width: { xs: "calc(100% - 16px)", sm: "auto" } }}
    >
      <Paper
        elevation={8}
        sx={{
          width: { xs: "100%", sm: 420 },
          maxWidth: "calc(100vw - 16px)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "primary.main",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            }}
          >
            <LinkRoundedIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.25}>
              Coincidencias encontradas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalCount} {totalCount === 1 ? "resultado" : "resultados"}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ flexShrink: 0, color: "text.secondary" }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* Contenido scrolleable con scrollbar fino */}
        <Box
          sx={{
            maxHeight: { xs: "55vh", sm: "50vh" },
            overflowY: "auto",
            px: 2,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(0,0,0,0.18)", borderRadius: 3 },
            "&::-webkit-scrollbar-thumb:hover": { bgcolor: "rgba(0,0,0,0.3)" },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0,0,0,0.18) transparent",
          }}
        >
          {/* Demandas */}
          {hasDemandas && (
            <Box sx={{ py: 1.5 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: 0.6, display: "block", mb: 0.5 }}
              >
                Demandas
              </Typography>
              {vinculacionResults.demanda_ids.map((demandaId, index) => (
                <Box
                  key={`demanda-${index}`}
                  sx={{
                    py: 1.25,
                    "&:not(:last-of-type)": { borderBottom: "1px solid", borderColor: "divider" },
                  }}
                >
                  <Typography variant="body2" sx={{ overflowWrap: "anywhere", lineHeight: 1.5 }}>
                    {vinculacionResults.match_descriptions[index]}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                    <Button onClick={() => handleOpenDemanda(demandaId)} size="small" variant="text">
                      Ver demanda
                    </Button>
                    {/* Mostrar botón de vincular solo si hay un ID de demanda actual */}
                    {(currentDemandaId || params.id) && (
                      <Button
                        onClick={() => handleVincularDemanda(demandaId)}
                        size="small"
                        variant="contained"
                        color="primary"
                        disableElevation
                        disabled={isVinculando}
                      >
                        {isVinculando ? "Vinculando..." : "Vincular"}
                      </Button>
                    )}
                  </Stack>
                </Box>
              ))}
            </Box>
          )}

          {/* Legajos */}
          {hasLegajos && (
            <Box sx={{ py: 1.5, ...(hasDemandas && { borderTop: "1px solid", borderColor: "divider" }) }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: 0.6, display: "block", mb: 0.5 }}
              >
                Legajos
              </Typography>
              {vinculacionResults.legajos!.map((legajo, index) => (
                <Box
                  key={`legajo-${index}`}
                  sx={{
                    py: 1.25,
                    "&:not(:last-of-type)": { borderBottom: "1px solid", borderColor: "divider" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                      Legajo {legajo.numero}
                    </Typography>
                    {legajo.urgencia && (
                      <Chip
                        label={`Urgencia ${legajo.urgencia}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ flexShrink: 0, height: 22 }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>
                    Apertura: {new Date(legajo.fecha_apertura).toLocaleDateString("es-AR")}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                    <Button onClick={() => handleOpenLegajo(legajo.id)} size="small" variant="text">
                      Ver legajo
                    </Button>
                    {/* REG-01: Mostrar botón de vincular si hay callback (durante creación de demanda) */}
                    {onVincularLegajo && !currentDemandaId && !params.id && (
                      <Button
                        onClick={() => handleVincularLegajo(legajo.id, legajo.numero)}
                        size="small"
                        variant="contained"
                        color="primary"
                        disableElevation
                      >
                        Vincular
                      </Button>
                    )}
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Snackbar>
  )
}

export default VinculacionNotification
