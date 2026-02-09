"use client"

import type React from "react"
import type { LegajoDetailResponse } from "@/app/(runna)/legajo-mesa/types/legajo-api"
import { useUser } from "@/utils/auth/userZustand"
import { RepositorioDocumentosSection } from "./repositorio-documentos"

interface DocumentosSectionProps {
  legajoData: LegajoDetailResponse
  isLoadingEnhancements?: boolean
}

export const DocumentosSection: React.FC<DocumentosSectionProps> = ({ legajoData, isLoadingEnhancements = false }) => {
  const permisos = legajoData.permisos_usuario
  const { user } = useUser()

  // Admins (is_superuser o is_staff) tienen acceso completo
  const isAdmin = user?.is_superuser || user?.is_staff
  const puedeAgregarDocumentos = isAdmin || permisos?.puede_agregar_documentos

  const handleAgregarDocumento = () => {
    console.log("Agregar nuevo documento")
    // TODO: Implement document upload modal
  }

  return (
    <RepositorioDocumentosSection
      legajoId={legajoData.legajo.id}
      puedeAgregarDocumentos={puedeAgregarDocumentos}
      onAddDocumento={handleAgregarDocumento}
    />
  )
}
