"use client"

import type React from "react"
import { useState } from "react"
import { Button, Skeleton } from "@mui/material"
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
  handleNuevoRegistro: () => void
  onFilterChange: (filters: FilterState) => void
  onSearch?: () => void
  onLegajoCreated?: (data: any) => void
}

const Buttons: React.FC<ButtonsProps> = ({ isLoading, onLegajoCreated }) => {
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
