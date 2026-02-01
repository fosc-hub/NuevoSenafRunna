"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Tabs,
  Tab,
  Typography,
} from "@mui/material"
import TimelineIcon from "@mui/icons-material/Timeline"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import { HistorialTimeline } from "./historial-timeline"
import { TrazabilidadStepper } from "./trazabilidad-stepper"
import { TrazabilidadDetalle } from "./trazabilidad-detalle"

interface HistorialTabProps {
  medidaId: number | undefined
  numeroMedida?: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`historial-tabpanel-${index}`}
    aria-labelledby={`historial-tab-${index}`}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
)

export const HistorialTab: React.FC<HistorialTabProps> = ({
  medidaId,
  numeroMedida = '',
}) => {
  const [activeSubTab, setActiveSubTab] = useState(0)

  if (!medidaId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>No se puede mostrar el historial sin ID de medida.</Typography>
      </Box>
    )
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveSubTab(newValue)
  }

  return (
    <Box>
      {/* Sub-tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeSubTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
            },
          }}
        >
          <Tab
            icon={<TimelineIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Timeline Unificado"
            id="historial-tab-0"
            aria-controls="historial-tabpanel-0"
          />
          <Tab
            icon={<AccountTreeIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Trazabilidad de Etapas"
            id="historial-tab-1"
            aria-controls="historial-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Timeline Tab */}
      <TabPanel value={activeSubTab} index={0}>
        <HistorialTimeline
          medidaId={medidaId}
          numeroMedida={numeroMedida}
        />
      </TabPanel>

      {/* Trazabilidad Tab */}
      <TabPanel value={activeSubTab} index={1}>
        <TrazabilidadStepper
          medidaId={medidaId}
          numeroMedida={numeroMedida}
          orientation="horizontal"
        />
        <TrazabilidadDetalle
          medidaId={medidaId}
          numeroMedida={numeroMedida}
        />
      </TabPanel>
    </Box>
  )
}
