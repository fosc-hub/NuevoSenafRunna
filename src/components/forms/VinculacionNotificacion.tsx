"use client"

import type React from "react"
import { Snackbar, Alert, Typography, Box, Button } from "@mui/material"
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

  return (
    <Snackbar
      open={open && shouldShow}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity="info" sx={{ width: "100%" }}>
        <Typography variant="body2" gutterBottom fontWeight={600}>
          Se encontraron coincidencias:
        </Typography>

        {/* Mostrar demandas existentes */}
        {hasDemandas && (
          <>
            <Typography variant="caption" display="block" sx={{ mt: 1, mb: 0.5 }}>
              Demandas:
            </Typography>
            {vinculacionResults.demanda_ids.map((demandaId, index) => (
              <Box key={`demanda-${index}`} sx={{ mb: 1, ml: 1 }}>
                <Typography variant="body2">
                  {vinculacionResults.match_descriptions[index]}
                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <Button onClick={() => handleOpenDemanda(demandaId)} size="small" variant="outlined">
                      Ver demanda
                    </Button>
                    {/* Mostrar botón de vincular solo si hay un ID de demanda actual */}
                    {(currentDemandaId || params.id) && (
                      <Button
                        onClick={() => handleVincularDemanda(demandaId)}
                        size="small"
                        variant="contained"
                        color="primary"
                        disabled={isVinculando}
                      >
                        {isVinculando ? "Vinculando..." : "Vincular"}
                      </Button>
                    )}
                  </Box>
                </Typography>
              </Box>
            ))}
          </>
        )}

        {/* Mostrar legajos existentes */}
        {hasLegajos && (
          <>
            <Typography variant="caption" display="block" sx={{ mt: 2, mb: 0.5 }}>
              Legajos:
            </Typography>
            {vinculacionResults.legajos!.map((legajo, index) => (
              <Box key={`legajo-${index}`} sx={{ mb: 1, ml: 1 }}>
                <Typography variant="body2">
                  <strong>Legajo {legajo.numero}</strong>
                  {legajo.urgencia && ` - Urgencia: ${legajo.urgencia}`}
                  <Typography variant="caption" display="block" color="text.secondary">
                    Apertura: {new Date(legajo.fecha_apertura).toLocaleDateString('es-AR')}
                  </Typography>
                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <Button onClick={() => handleOpenLegajo(legajo.id)} size="small" variant="outlined">
                      Ver legajo
                    </Button>
                    {/* REG-01: Mostrar botón de vincular si hay callback (durante creación de demanda) */}
                    {onVincularLegajo && !currentDemandaId && !params.id && (
                      <Button
                        onClick={() => handleVincularLegajo(legajo.id, legajo.numero)}
                        size="small"
                        variant="contained"
                        color="primary"
                      >
                        Vincular
                      </Button>
                    )}
                  </Box>
                </Typography>
              </Box>
            ))}
          </>
        )}
      </Alert>
    </Snackbar>
  )
}

export default VinculacionNotification
