"use client"

import type React from "react"
import { useState } from "react"
import { Box, Tabs, Tab } from "@mui/material"
import { toast } from "react-toastify"
import TabPanel from "./tab-panel"
import InformacionGeneral from "./tabs/informacion-general"
import DatosLocalizacion from "./tabs/datos-localizacion"
import DescripcionSituacion from "./tabs/descripcion-situacion"
import Actividades from "./tabs/actividades"
import NnyaConvivientes from "./tabs/nnya-convivientes"
import NnyaNoConvivientes from "./tabs/nnya-no-convivientes"
import AdultosConvivientes from "./tabs/adultos-convivientes"
import AdultosNoConvivientes from "./tabs/adultos-no-convivientes"
import AntecedentesDemanda from "./tabs/antecedentes-demanda"
import MotivosActuacion from "./tabs/motivos-actuacion"
import DecisionBox from "./decision-box"
import ActionButtons from "./action-buttons"

// Define tab structure for dynamic rendering
const TABS = [
  { label: "INFORMACIÓN GENERAL", id: "info-general" },
  { label: "DATOS DE LOCALIZACIÓN", id: "datos-localizacion" },
  { label: "ACTIVIDADES", id: "actividades" },
  { label: "NNYA CONVIVIENTES", id: "nnya-convivientes" },
  { label: "NNYA NO CONVIVIENTES", id: "nnya-no-convivientes" },
  { label: "ADULTOS CONVIVIENTES", id: "adultos-convivientes" },
  { label: "ADULTOS NO CONVIVIENTES", id: "adultos-no-convivientes" },
  { label: "ANTECEDENTES DEMANDA", id: "antecedentes-demanda" },
  { label: "MOTIVOS ACTUACIÓN", id: "motivos-actuacion" },
]

interface EvaluacionTabsProps {
  data: any
}

export default function EvaluacionTabs({ data }: EvaluacionTabsProps) {
  const [tabValue, setTabValue] = useState(0)
  const [vulnerabilityIndicators, setVulnerabilityIndicators] = useState(
    data.IndicadoresEvaluacion.map((indicator: any, index: number) => ({
      id: index + 1,
      nombre: indicator.NombreIndicador,
      descripcion: indicator.Descripcion,
      peso: indicator.Peso === "Alto" ? 5 : indicator.Peso === "Medio" ? 3 : 1,
      selected: false,
    })),
  )

  // State for editable data
  const [actividades, setActividades] = useState(data.Actividades || [])
  const [nnyaConvivientes, setNnyaConvivientes] = useState(data.NNYAConvivientes || [])
  const [nnyaNoConvivientes, setNnyaNoConvivientes] = useState(data.NNYANoConvivientes || [])
  const [adultosConvivientes, setAdultosConvivientes] = useState(data.AdultosConvivientes || [])
  const [adultosNoConvivientes, setAdultosNoConvivientes] = useState(data.AdultosNoConvivientes || [])

  // Convert antecedentes to array if it's not already
  const initialAntecedentes = Array.isArray(data.AntecedentesDemanda)
    ? data.AntecedentesDemanda
    : [data.AntecedentesDemanda]
  const [antecedentes, setAntecedentes] = useState(initialAntecedentes)

  // Convert motivos to array if it's not already
  const initialMotivos = Array.isArray(data.MotivosActuacion) ? data.MotivosActuacion : [data.MotivosActuacion]
  const [motivos, setMotivos] = useState(initialMotivos)

  const [descripcionSituacion, setDescripcionSituacion] = useState(data.DescripcionSituacion || "")

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleIndicatorChange = (id: number, value: boolean) => {
    setVulnerabilityIndicators(
      vulnerabilityIndicators.map((indicator) => (indicator.id === id ? { ...indicator, selected: value } : indicator)),
    )
  }

  const generatePDF = async (data: any) => {
    try {
      // Combine all updated data
      const updatedData = {
        ...data,
        Actividades: actividades,
        NNYAConvivientes: nnyaConvivientes,
        NNYANoConvivientes: nnyaNoConvivientes,
        AdultosConvivientes: adultosConvivientes,
        AdultosNoConvivientes: adultosNoConvivientes,
        AntecedentesDemanda: antecedentes,
        MotivosActuacion: motivos,
        DescripcionSituacion: descripcionSituacion,
        IndicadoresEvaluacion: vulnerabilityIndicators.map((indicator) => ({
          NombreIndicador: indicator.nombre,
          Descripcion: indicator.descripcion,
          Peso:
            typeof indicator.peso === "number"
              ? indicator.peso >= 5
                ? "Alto"
                : indicator.peso >= 3
                  ? "Medio"
                  : "Bajo"
              : indicator.peso,
        })),
      }

      console.log("Generating PDF with data:", updatedData)
      toast.success("Generando PDF...", {
        position: "top-center",
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Error al generar el PDF", {
        position: "top-center",
        autoClose: 3000,
      })
    }
  }

  return (
    <Box>
      <Box>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="evaluacion tabs"
          sx={{
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-selected": {
                color: "white",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "white",
            },
            bgcolor: "#0EA5E9",
          }}
        >
          {TABS.map((tab, index) => (
            <Tab key={tab.id} label={tab.label} id={`tab-${index}`} aria-controls={`tabpanel-${index}`} />
          ))}
        </Tabs>
      </Box>

      <Box>
        <TabPanel value={tabValue} index={0}>
          <InformacionGeneral data={data.InformacionGeneral} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DatosLocalizacion data={data.DatosLocalizacion} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Actividades actividades={actividades} setActividades={setActividades} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <NnyaConvivientes nnyaConvivientes={nnyaConvivientes} setNnyaConvivientes={setNnyaConvivientes} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <NnyaNoConvivientes nnyaNoConvivientes={nnyaNoConvivientes} setNnyaNoConvivientes={setNnyaNoConvivientes} />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <AdultosConvivientes
            adultosConvivientes={adultosConvivientes}
            setAdultosConvivientes={setAdultosConvivientes}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <AdultosNoConvivientes
            adultosNoConvivientes={adultosNoConvivientes}
            setAdultosNoConvivientes={setAdultosNoConvivientes}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={7}>
          <AntecedentesDemanda antecedentes={antecedentes} setAntecedentes={setAntecedentes} />
        </TabPanel>

        <TabPanel value={tabValue} index={8}>
          <MotivosActuacion motivos={motivos} setMotivos={setMotivos} />
        </TabPanel>
      </Box>

      <Box sx={{ mt: 4 }}>
        <DescripcionSituacion descripcion={descripcionSituacion} setDescripcion={setDescripcionSituacion} />
      </Box>

      <DecisionBox vulnerabilityIndicators={vulnerabilityIndicators} handleIndicatorChange={handleIndicatorChange} />

      <ActionButtons generatePDF={generatePDF} data={data} />
    </Box>
  )
}

// Types
export interface VulnerabilityIndicator {
  id: number
  nombre: string
  descripcion: string | null
  peso: number | string
  selected?: boolean
}

