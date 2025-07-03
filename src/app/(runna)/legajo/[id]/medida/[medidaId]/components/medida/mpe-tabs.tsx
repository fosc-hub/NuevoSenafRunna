"use client"

import type React from "react"
import { useState } from "react"
import { Box, Tabs, Tab, Paper } from "@mui/material"
import { AperturaTab } from "./mpe-tabs/apertura-tab"
import { PlanTrabajoTab } from "./mpe-tabs/plan-trabajo-tab"
import { ProrrogaTab } from "./mpe-tabs/prorroga-tab"
import { CeseTab } from "./mpe-tabs/cese-tab"
import { ResidenciasTab } from "./mpe-tabs/residencias-tab"
import { HistorialSeguimientoTable } from "./historial-seguimiento-table"
import { InformesMensualesTable } from "./informes-mensuales-table"

interface MPETabsProps {
    medidaData: any
}

export const MPETabs: React.FC<MPETabsProps> = ({ medidaData }) => {
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
                    <Tab label="Plan de trabajo" />
                    <Tab label="Cese" />
                    <Tab label="Post cese" />
                    <Tab label="Residencias" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box>
                {activeTab === 0 && <AperturaTab medidaData={medidaData} />}
                {activeTab === 1 && (
                    <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                        Contenido de Innovación - En desarrollo
                    </Box>
                )}
                {activeTab === 2 && <ProrrogaTab />}
                {activeTab === 3 && <PlanTrabajoTab medidaData={medidaData} />}
                {activeTab === 4 && <CeseTab />}
                {activeTab === 5 && (
                    <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                        Contenido de Post cese - En desarrollo
                    </Box>
                )}
                {activeTab === 6 && <ResidenciasTab />}
            </Box>

            {/* Tables outside tabs */}
            <HistorialSeguimientoTable />
            <InformesMensualesTable />
        </Box>
    )
} 