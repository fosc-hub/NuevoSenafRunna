"use client"

import type React from "react"
import { useState } from "react"
import { Box, Tabs, Tab } from "@mui/material"
import { PlanTrabajoTab } from "./mpe-tabs/plan-trabajo-tab"

interface MPJTabsProps {
    medidaData: any
    legajoData?: {
        numero: string
        persona_nombre: string
        persona_apellido: string
        zona_nombre: string
    }
    planTrabajoId?: number
}

export const MPJTabs: React.FC<MPJTabsProps> = ({ medidaData, legajoData, planTrabajoId }) => {
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
                </Tabs>
            </Box>

            {/* Tab Content - Each tab shows activities filtered by etapa */}
            <Box>
                {planTrabajoId ? (
                    <>
                        {/* Tab Apertura */}
                        {activeTab === 0 && (
                            <PlanTrabajoTab
                                medidaData={medidaData}
                                planTrabajoId={planTrabajoId}
                                filterEtapa="APERTURA"
                            />
                        )}

                        {/* Tab Proceso */}
                        {activeTab === 1 && (
                            <PlanTrabajoTab
                                medidaData={medidaData}
                                planTrabajoId={planTrabajoId}
                                filterEtapa="PROCESO"
                            />
                        )}

                        {/* Tab Cese */}
                        {activeTab === 2 && (
                            <PlanTrabajoTab
                                medidaData={medidaData}
                                planTrabajoId={planTrabajoId}
                                filterEtapa="CESE"
                            />
                        )}
                    </>
                ) : (
                    <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                        No hay Plan de Trabajo asociado a esta medida.
                    </Box>
                )}
            </Box>
        </Box>
    )
}
