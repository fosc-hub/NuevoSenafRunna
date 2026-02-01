"use client"

import type React from "react"
import { useState } from "react"
import { Box, Tabs, Tab } from "@mui/material"
import { PlanTrabajoTab } from "./mpe-tabs/plan-trabajo-tab"
import { MedidaDocumentosSection } from "./medida-documentos-section"
import { InformesMensualesTable } from "./informes-mensuales-table"
import { HistorialTab } from "./historial/historial-tab"
import type { MedidaDetailResponse } from "../../types/medida-api"

interface MPJTabsProps {
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

export const MPJTabs: React.FC<MPJTabsProps> = ({ medidaData, medidaApiData, legajoData, planTrabajoId }) => {
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
                    <Tab label="Proceso" />
                    <Tab label="Cese" />
                    <Tab label="Documentos Demanda" />
                    <Tab label="Historial" />
                </Tabs>
            </Box>

            {/* Tab Content - Each tab shows activities filtered by etapa */}
            <Box>
                {/* Tab Apertura */}
                {activeTab === 0 && (
                    planTrabajoId ? (
                        <PlanTrabajoTab
                            medidaData={medidaData}
                            planTrabajoId={planTrabajoId}
                            filterEtapa="APERTURA"
                        />
                    ) : (
                        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                            No hay Plan de Trabajo asociado a esta medida.
                        </Box>
                    )
                )}

                {/* Tab Proceso */}
                {activeTab === 1 && (
                    planTrabajoId ? (
                        <PlanTrabajoTab
                            medidaData={medidaData}
                            planTrabajoId={planTrabajoId}
                            filterEtapa="PROCESO"
                        />
                    ) : (
                        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                            No hay Plan de Trabajo asociado a esta medida.
                        </Box>
                    )
                )}

                {/* Tab Cese */}
                {activeTab === 2 && (
                    planTrabajoId ? (
                        <PlanTrabajoTab
                            medidaData={medidaData}
                            planTrabajoId={planTrabajoId}
                            filterEtapa="CESE"
                        />
                    ) : (
                        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                            No hay Plan de Trabajo asociado a esta medida.
                        </Box>
                    )
                )}

                {/* Tab Documentos Demanda */}
                {activeTab === 3 && medidaApiData && <MedidaDocumentosSection medidaApiData={medidaApiData} />}

                {/* Tab Historial */}
                {activeTab === 4 && (
                    <HistorialTab
                        medidaId={medidaApiData?.id}
                        numeroMedida={typeof medidaApiData?.numero_medida === 'string'
                            ? medidaApiData.numero_medida
                            : `MED-${medidaApiData?.id}`}
                    />
                )}
            </Box>

            {/* Informes Mensuales Table */}
            {medidaApiData?.id && <InformesMensualesTable medidaId={medidaApiData.id} />}
        </Box>
    )
}
