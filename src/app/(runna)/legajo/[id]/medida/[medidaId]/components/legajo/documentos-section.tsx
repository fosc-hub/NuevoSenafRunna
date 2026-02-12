"use client"

import type React from "react"
import { useState, useCallback } from "react"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { useUser } from "@/utils/auth/userZustand"
import { RepositorioDocumentosSection, AgregarDocumentoModal } from "./repositorio-documentos"
import { useQueryClient } from "@tanstack/react-query"

interface DocumentosSectionProps {
  legajoData: LegajoDetailResponse
  isLoadingEnhancements?: boolean
}

export const DocumentosSection: React.FC<DocumentosSectionProps> = ({ legajoData, isLoadingEnhancements = false }) => {
  const permisos = legajoData.permisos_usuario
  const { user } = useUser()
  const queryClient = useQueryClient()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Admins (is_superuser o is_staff) tienen acceso completo
  const isAdmin = user?.is_superuser || user?.is_staff
  const puedeAgregarDocumentos = isAdmin || permisos?.puede_agregar_documentos

  // Extract medidas IDs from legajoData
  const medidasIds = legajoData.medidas?.map((m) => m.id) || []
  const demandaId = legajoData.demanda?.id || null

  const handleAgregarDocumento = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleUploadSuccess = useCallback(() => {
    // Invalidate the repositorio-documentos query to refresh the list
    queryClient.invalidateQueries({
      queryKey: ["repositorio-documentos", { legajo_id: legajoData.legajo.id }],
    })
  }, [queryClient, legajoData.legajo.id])

  return (
    <>
      <RepositorioDocumentosSection
        legajoId={legajoData.legajo.id}
        puedeAgregarDocumentos={puedeAgregarDocumentos}
        onAddDocumento={handleAgregarDocumento}
      />

      {/* Document Upload Modal */}
      <AgregarDocumentoModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleUploadSuccess}
        legajoId={legajoData.legajo.id}
        demandaId={demandaId}
        medidasIds={medidasIds}
      />
    </>
  )
}
