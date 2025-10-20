"use client"

/**
 * Apertura Tab - Direct Component Rendering
 *
 * Renders all 4 workflow sections directly (like MPI pattern):
 * - Intervención (AperturaSection)
 * - Nota de Aval
 * - Informe Jurídico
 * - Ratificación Judicial
 *
 * This ensures MPI, MPE, and MPJ use the EXACT same components for consistent UX.
 */

import React from "react"
import { Grid } from "@mui/material"
import { useUser } from "@/utils/auth/userZustand"
import { AperturaSection } from "../apertura-section"
import { NotaAvalSection } from "../nota-aval-section"
import { InformeJuridicoSection } from "../informe-juridico-section"
import { RatificacionJudicialSection } from "../ratificacion-judicial-section"

interface AperturaTabUnifiedProps {
  medidaData: {
    id: number
    tipo_medida: 'MPE' | 'MPI' | 'MPJ'
    numero_medida?: string
    estado?: string
    fecha_apertura?: string
    [key: string]: any
  }
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }
}

export const AperturaTabUnified: React.FC<AperturaTabUnifiedProps> = ({
  medidaData,
  legajoData,
}) => {
  // Get user context for permissions (same pattern as medida-detail.tsx)
  const { user } = useUser()
  const isSuperuser = user?.is_superuser || false
  const isDirector = user?.zonas?.some(z => z.director) || false
  const userLevel = isDirector ? 3 : undefined
  const isJZ = user?.zonas?.some(z => z.jefe) || false
  const isEquipoLegal = false // TODO: Add legal flag to user zonas data

  // Extract estado for sections
  const estadoActual = medidaData.estado || ""

  // Prepare data for AperturaSection
  const aperturaData = {
    fecha: medidaData.fecha_apertura || "",
    estado: estadoActual,
    equipo: "", // TODO: Get from medidaData if available
  }

  return (
    <Grid container spacing={3}>
      {/* Intervención Section */}
      <Grid item xs={12}>
        <AperturaSection
          data={aperturaData}
          isActive={true}
          isCompleted={!!estadoActual}
          onViewForm={() => {}} // Handled internally by AperturaSection
          medidaId={medidaData.id}
          legajoData={legajoData}
        />
      </Grid>

      {/* Nota de Aval Section */}
      <Grid item xs={12}>
        <NotaAvalSection
          medidaId={medidaData.id}
          medidaNumero={medidaData.numero_medida}
          estadoActual={estadoActual}
          userLevel={userLevel}
          isSuperuser={isSuperuser}
          onNotaAvalCreated={() => window.location.reload()}
        />
      </Grid>

      {/* Informe Jurídico Section */}
      <Grid item xs={12}>
        <InformeJuridicoSection
          medidaId={medidaData.id}
          isEquipoLegal={isEquipoLegal}
          isSuperuser={isSuperuser}
          estadoActual={estadoActual}
        />
      </Grid>

      {/* Ratificación Judicial Section */}
      <Grid item xs={12}>
        <RatificacionJudicialSection
          medidaId={medidaData.id}
          isEquipoLegal={isEquipoLegal}
          isJZ={isJZ}
          isSuperuser={isSuperuser}
          estadoActual={estadoActual}
        />
      </Grid>
    </Grid>
  )
}

// Default export for compatibility
export default AperturaTabUnified
