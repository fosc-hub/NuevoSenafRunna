"use client"

import type React from "react"
import { Snackbar, Alert, Typography, Box, Button } from "@mui/material"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { create } from "@/app/api/apiService"
import { useUser } from "@/utils/auth/userZustand"

interface VinculacionResult {
  demanda_ids: number[]
  match_descriptions: string[]
}

interface VinculacionNotificationProps {
  open: boolean
  onClose: () => void
  vinculacionResults: VinculacionResult | null
  currentDemandaId?: string | number
}

const VinculacionNotification: React.FC<VinculacionNotificationProps> = ({
  open,
  onClose,
  vinculacionResults,
  currentDemandaId,
}) => {
  const router = useRouter()
  const params = useParams()
  const [shouldShow, setShouldShow] = useState(true)
  const [isVinculando, setIsVinculando] = useState(false)
  const user = useUser((state) => state.user)

  // Check if user has permission to view/access connections
  const hasVinculacionPermission = user?.all_permissions?.includes('view_tdemandavinculada') ||
    user?.all_permissions?.includes('add_tdemandavinculada') ||
    user?.all_permissions?.includes('change_tdemandavinculada') ||
    user?.is_superuser ||
    user?.is_staff

  // Verificar si alguna de las demandas encontradas es la misma que la actual
  useEffect(() => {
    if (vinculacionResults && vinculacionResults.demanda_ids.length > 0) {
      // Obtener el ID actual de la demanda desde props o params
      const actualDemandaId = currentDemandaId || params.id
      // Convertir a número para comparación
      const actualIdNum = actualDemandaId ? Number(actualDemandaId) : null

      // Verificar si la demanda actual está en los resultados
      // const isSameDemanda = actualIdNum && vinculacionResults.demanda_ids.includes(actualIdNum)
      // Siempre mostrar la notificación, independientemente de si es la misma demanda o no
      setShouldShow(true)
    } else {
      setShouldShow(true)
    }
  }, [vinculacionResults, currentDemandaId, params.id])

  // If user doesn't have permission, don't show the notification
  if (!hasVinculacionPermission) {
    return null
  }

  // Si no hay resultados o no se debe mostrar, no renderizar nada
  if (!vinculacionResults || !shouldShow) return null

  // Función para abrir la demanda en página completa
  const handleOpenDemanda = (demandaId: number) => {
    router.push(`/demanda/${demandaId}`)
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

  return (
    <Snackbar
      open={open && shouldShow}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity="info" sx={{ width: "100%" }}>
        <Typography variant="body2" gutterBottom>
          Se encontraron coincidencias con demandas existentes:
        </Typography>
        {vinculacionResults.demanda_ids.map((demandaId, index) => (
          <Box key={index} sx={{ mb: 1 }}>
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
      </Alert>
    </Snackbar>
  )
}

export default VinculacionNotification