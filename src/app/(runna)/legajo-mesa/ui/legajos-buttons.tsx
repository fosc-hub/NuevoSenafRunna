"use client"

import type React from "react"
import { useState } from "react"
import { Button, Skeleton } from "@mui/material"
import AssignmentIcon from "@mui/icons-material/Assignment"
import { useRouter } from "next/navigation"
import CrearLegajoDialog from "@/features/legajo/components/crear-legajo/CrearLegajoDialog"

interface FilterState {
  envio_de_respuesta: "NO_NECESARIO" | "PENDIENTE" | "ENVIADO" | null
  estado_demanda:
  | "SIN_ASIGNAR"
  | "CONSTATACION"
  | "EVALUACION"
  | "PENDIENTE_AUTORIZACION"
  | "ARCHIVADA"
  | "ADMITIDA"
  | null
  objetivo_de_demanda: "CONSTATACION" | "PETICION_DE_INFORME" | null
}

interface ButtonsProps {
  isLoading: boolean
  handleNuevoRegistro?: () => void
  onFilterChange?: (filters: FilterState) => void
  onSearch?: () => void
  onLegajoCreated?: (data: any) => void
}

const Buttons: React.FC<ButtonsProps> = ({ isLoading, onLegajoCreated }) => {
  const router = useRouter()
  const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false)

  const handleNuevoLegajo = () => {
    setIsRegistroModalOpen(true)
  }

  const handleLegajoCreated = (data: any) => {
    onLegajoCreated?.(data)
    setIsRegistroModalOpen(false)
  }

  const handleCloseRegistroModal = () => {
    setIsRegistroModalOpen(false)
  }

  const handleGoToActividades = () => {
    router.push('/legajo/actividades')
  }

  return (
    <div className="flex gap-4">
      {isLoading ? (
        <Skeleton variant="rectangular" width={150} height={40} />
      ) : (
        <>
          <Button
            variant="contained"
            onClick={handleNuevoLegajo}
            sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
          >
            + Nuevo Legajo
          </Button>

          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={handleGoToActividades}
            sx={{
              borderColor: "secondary.main",
              color: "secondary.main",
              "&:hover": {
                borderColor: "secondary.dark",
                bgcolor: "rgba(156, 39, 176, 0.04)"
              }
            }}
          >
            Mis Actividades
          </Button>

          <CrearLegajoDialog
            open={isRegistroModalOpen}
            onClose={handleCloseRegistroModal}
          />
        </>
      )}
    </div>
  )
}

export default Buttons
