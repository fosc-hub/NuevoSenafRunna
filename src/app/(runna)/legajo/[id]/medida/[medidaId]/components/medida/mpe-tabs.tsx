"use client"

import type React from "react"
import { useState } from "react"
import { Box, Tabs, Tab, Paper } from "@mui/material"
import { AperturaTabUnified as AperturaTab } from "./mpe-tabs/apertura-tab"
import { InnovacionTab } from "./mpe-tabs/innovacion-tab"
import { PlanTrabajoTab } from "./mpe-tabs/plan-trabajo-tab"
import { ProrrogaTab } from "./mpe-tabs/prorroga-tab"
import { CeseTab } from "./mpe-tabs/cese-tab"
import { HistorialSeguimientoTable } from "./historial-seguimiento-table"
import { InformesMensualesTable } from "./informes-mensuales-table"
import { MedidaDocumentosSection } from "./medida-documentos-section"
import type { MedidaDetailResponse } from "../../types/medida-api"

interface MPETabsProps {
    medidaData: any
    medidaApiData?: MedidaDetailResponse
    legajoData?: {
        numero: string
        persona_nombre: string
        persona_apellido: string
        zona_nombre: string
    }
    planTrabajoId?: number
}

export const MPETabs: React.FC<MPETabsProps> = ({ medidaData, medidaApiData, legajoData, planTrabajoId }) => {
    const [activeTab, setActiveTab] = useState(0)

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue)
    }

    return (
        <Box sx={{ width: "100%" }}>
            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: "0.95rem",
                            minHeight: 48,
                        },
                    }}
                >
                    <Tab label="Apertura" />
                    <Tab label="Innovación" />
                    <Tab label="Prórroga" />
                    <Tab label="Cese" />
                    <Tab label="Post cese" />
                    <Tab label="Documentos Demanda" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box>
                {activeTab === 0 && <AperturaTab medidaData={medidaData} medidaApiData={medidaApiData} legajoData={legajoData} />}
                {activeTab === 1 && <InnovacionTab medidaData={medidaData} medidaApiData={medidaApiData} legajoData={legajoData} />}
                {activeTab === 2 && <ProrrogaTab medidaData={medidaData} medidaApiData={medidaApiData} legajoData={legajoData} />}
                {activeTab === 3 && <CeseTab medidaData={medidaData} medidaApiData={medidaApiData} legajoData={legajoData} />}
                {activeTab === 4 && (
                    planTrabajoId ? (
                        <PlanTrabajoTab medidaData={medidaData} planTrabajoId={planTrabajoId} />
                    ) : (
                        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                            No hay Plan de Trabajo asociado a esta medida.
                        </Box>
                    )
                )}
                {activeTab === 5 && medidaApiData && <MedidaDocumentosSection medidaApiData={medidaApiData} />}
            </Box>

            {/* Plan de Trabajo - Always visible */}
            <Box sx={{ mt: 4 }}>
                {planTrabajoId ? (
                    <PlanTrabajoTab medidaData={medidaData} planTrabajoId={planTrabajoId} />
                ) : (
                    <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                        No hay Plan de Trabajo asociado a esta medida.
                    </Paper>
                )}
            </Box>

            {/* Tables outside tabs */}
            <HistorialSeguimientoTable />
            <InformesMensualesTable />
        </Box>
    )
} 