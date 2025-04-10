"use client"

import type React from "react"
import { useState, useRef, Suspense } from "react"
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
} from "@mui/material"
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material"
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
import FileManagement, { type FileManagementHandle } from "./file-management"
import AdjuntosTab from "./tabs/adjuntos"
import SearchParamsHandler from "./search-params-handler"

// Update the TABS array to include all necessary tabs for the expanded data
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
  { label: "ADJUNTOS", id: "adjuntos" },
]

interface EvaluacionTabsProps {
  data: any
}

// Update the EvaluacionTabs component to handle the expanded data structure
export default function EvaluacionTabs({ data }: EvaluacionTabsProps) {
  const [demandaId, setDemandaId] = useState<number | null>(null)
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
  const [valoracionProfesional, setValoracionProfesional] = useState("")
  const [justificacionTecnico, setJustificacionTecnico] = useState("")
  const [justificacionDirector, setJustificacionDirector] = useState("")
  const [expandedJustificaciones, setExpandedJustificaciones] = useState(true)
  const [adjuntos, setAdjuntos] = useState(data.adjuntos || [])

  // Reference to the file management component
  const fileManagementRef = useRef<FileManagementHandle>(null)

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

  // Function to collect all updated data
  const collectUpdatedData = () => {
    return {
      ...data,
      Actividades: actividades,
      NNYAConvivientes: nnyaConvivientes,
      NNYANoConvivientes: nnyaNoConvivientes,
      AdultosConvivientes: adultosConvivientes,
      AdultosNoConvivientes: adultosNoConvivientes,
      AntecedentesDemanda: antecedentes,
      MotivosActuacion: motivos,
      DescripcionSituacion: descripcionSituacion,
      ValoracionProfesional: valoracionProfesional,
      adjuntos: adjuntos,
      // Note: justificacionTecnico and justificacionDirector are intentionally not included in the PDF
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
  }

  const handleSaveData = async () => {
    try {
      const updatedData = collectUpdatedData()

      // In a real application, you would make an API call here to save the data
      // For example:
      // await apiService.updateDemanda(demandaId, updatedData);

      console.log("Saving data:", {
        ...updatedData,
        JustificacionTecnico: justificacionTecnico,
        JustificacionDirector: justificacionDirector,
      })

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast.success("Datos guardados exitosamente", {
        position: "top-center",
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error saving data:", error)
      toast.error("Error al guardar los datos", {
        position: "top-center",
        autoClose: 3000,
      })
    }
  }

  const handlePDFGenerated = (blob: Blob, fileName: string) => {
    // Add the generated PDF to the file management component
    if (fileManagementRef.current) {
      fileManagementRef.current.addGeneratedPDF(blob, fileName)
    }
  }

  // Handler for demandaId from SearchParamsHandler
  const handleDemandaIdChange = (id: number | null) => {
    setDemandaId(id)
  }

  return (
    <Box>
      {/* Wrap the SearchParams usage in a Suspense boundary */}
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        }
      >
        <SearchParamsHandler onDemandaIdChange={handleDemandaIdChange} />
      </Suspense>

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

        <TabPanel value={tabValue} index={9}>
          <AdjuntosTab adjuntos={adjuntos} setAdjuntos={setAdjuntos} />
        </TabPanel>
      </Box>

      <Box sx={{ mt: 4 }}>
        <DescripcionSituacion descripcion={descripcionSituacion} setDescripcion={setDescripcionSituacion} />
      </Box>

      <DecisionBox
        vulnerabilityIndicators={vulnerabilityIndicators}
        handleIndicatorChange={handleIndicatorChange}
        demandaId={demandaId}
      />

      {/* Valoración Profesional Final */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#0EA5E9" }}>
            VALORACIÓN PROFESIONAL FINAL
          </Typography>
          <TextField
            value={valoracionProfesional}
            onChange={(e) => setValoracionProfesional(e.target.value)}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="Ingrese su valoración profesional final"
          />
        </Paper>
      </Box>

      {/* Justificaciones - Accordion for better UX */}
      <Accordion
        expanded={expandedJustificaciones}
        onChange={() => setExpandedJustificaciones(!expandedJustificaciones)}
        sx={{ mt: 4, mb: 2, boxShadow: "none", border: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="justificaciones-content"
          id="justificaciones-header"
          sx={{
            backgroundColor: "rgba(14, 165, 233, 0.08)",
            "&:hover": {
              backgroundColor: "rgba(14, 165, 233, 0.12)",
            },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0EA5E9" }}>
            JUSTIFICACIONES INTERNAS
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Justificación del Técnico
            </Typography>
            <TextField
              value={justificacionTecnico}
              onChange={(e) => setJustificacionTecnico(e.target.value)}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              placeholder="Ingrese la justificación técnica (no aparecerá en el informe)"
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Justificación del Director
            </Typography>
            <TextField
              value={justificacionDirector}
              onChange={(e) => setJustificacionDirector(e.target.value)}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              placeholder="Ingrese la justificación del director (no aparecerá en el informe)"
            />

            <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                Nota: Estas justificaciones son para uso interno y no se incluirán en el informe PDF.
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* File Management Section */}
      <FileManagement ref={fileManagementRef} demandaId={demandaId} />

      <ActionButtons
        generatePDF={() => Promise.resolve(collectUpdatedData())}
        data={collectUpdatedData()}
        onSave={handleSaveData}
        onPDFGenerated={handlePDFGenerated}
      />
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
