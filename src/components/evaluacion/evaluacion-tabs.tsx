"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
} from "@mui/material"
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material"
import { useSearchParams } from "next/navigation"
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
import ActionButtons from "./action-buttons"
import FileManagement, { type FileManagementHandle } from "./file-management"
import AdjuntosTab from "./tabs/adjuntos"
import { useUser } from "@/utils/auth/userZustand"

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
  { label: "ADJUNTOS", id: "adjuntos" },
]

interface EvaluacionTabsProps {
  data: any
}

// Update the EvaluacionTabs component to handle the expanded data structure
export default function EvaluacionTabs({ data }: EvaluacionTabsProps) {
  const searchParams = useSearchParams()
  const [demandaId, setDemandaId] = useState<number | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const user = useUser((state) => state.user)

  // Check if user is director (superuser, staff, or has Director group, or has director role in zonas)
  const isDirector =
    user?.is_superuser ||
    user?.is_staff ||
    user?.groups?.some((group: any) => group.name === "Director") ||
    user?.zonas?.some((zona: any) => zona.director === true)

  // State for editable data
  const [actividades, setActividades] = useState(Array.isArray(data.Actividades) ? data.Actividades : [])
  const [informacionGeneral, setInformacionGeneral] = useState<any>(data.InformacionGeneral || {})
  const [nnyaConvivientes, setNnyaConvivientes] = useState(Array.isArray(data.NNYAConvivientes) ? data.NNYAConvivientes : [])
  const [nnyaNoConvivientes, setNnyaNoConvivientes] = useState(Array.isArray(data.NNYANoConvivientes) ? data.NNYANoConvivientes : [])
  const [adultosConvivientes, setAdultosConvivientes] = useState(Array.isArray(data.AdultosConvivientes) ? data.AdultosConvivientes : [])
  const [adultosNoConvivientes, setAdultosNoConvivientes] = useState(Array.isArray(data.AdultosNoConvivientes) ? data.AdultosNoConvivientes : [])
  const [valoracionProfesional, setValoracionProfesional] = useState(typeof data.ValoracionProfesional === 'string' ? data.ValoracionProfesional : "")
  const [justificacionTecnico, setJustificacionTecnico] = useState(typeof data.JustificacionTecnico === 'string' ? data.JustificacionTecnico : "")
  const [justificacionDirector, setJustificacionDirector] = useState(typeof data.JustificacionDirector === 'string' ? data.JustificacionDirector : "")
  const [expandedJustificaciones, setExpandedJustificaciones] = useState(true)
  const [adjuntos, setAdjuntos] = useState(Array.isArray(data.adjuntos) ? data.adjuntos : [])

  // Reference to the file management component
  const fileManagementRef = useRef<FileManagementHandle>(null)

  // Convert antecedentes to array if it's not already
  const initialAntecedentes = Array.isArray(data.AntecedentesDemanda)
    ? data.AntecedentesDemanda
    : data.AntecedentesDemanda ? [data.AntecedentesDemanda] : []
  const [antecedentes, setAntecedentes] = useState(initialAntecedentes)


  const [descripcionSituacion, setDescripcionSituacion] = useState(typeof data.DescripcionSituacion === 'string' ? data.DescripcionSituacion : "")

  // Get demandaId from URL query parameter
  useEffect(() => {
    const id = searchParams.get("id")
    if (id && !isNaN(Number(id))) {
      setDemandaId(Number.parseInt(id))
    }
  }, [searchParams])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Function to collect all updated data
  const collectUpdatedData = () => {
    return {
      ...data,
      InformacionGeneral: informacionGeneral,
      Actividades: actividades,
      NNYAConvivientes: nnyaConvivientes,
      NNYANoConvivientes: nnyaNoConvivientes,
      AdultosConvivientes: adultosConvivientes,
      AdultosNoConvivientes: adultosNoConvivientes,
      AntecedentesDemanda: antecedentes,
      DescripcionSituacion: descripcionSituacion,
      ValoracionProfesional: valoracionProfesional,
      adjuntos: adjuntos,
    }
  }


  const handlePDFGenerated = (blob: Blob, fileName: string) => {
    // Add the generated PDF to the file management component
    if (fileManagementRef.current) {
      fileManagementRef.current.addGeneratedPDF(blob, fileName)
    }
  }

  const allNnyaIds = [
    ...(nnyaConvivientes || []).map((nnya: any) => nnya.persona?.id || nnya.id || nnya.ID || nnya.DNI).filter(Boolean),
    ...(nnyaNoConvivientes || []).map((nnya: any) => nnya.persona?.id || nnya.id || nnya.ID || nnya.DNI).filter(Boolean),
  ];

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
          <InformacionGeneral
            data={informacionGeneral}
            onFieldChange={(fieldName: string, value: string) =>
              setInformacionGeneral((prev: any) => ({ ...prev, [fieldName]: value }))
            }
          />
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
          <AdjuntosTab adjuntos={adjuntos} setAdjuntos={setAdjuntos} />
        </TabPanel>
      </Box>

      <Box sx={{ mt: 4 }}>
        <DescripcionSituacion descripcion={descripcionSituacion} setDescripcion={setDescripcionSituacion} />
      </Box>


      {/* Valoración Profesional Final */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0EA5E9", mb: 2 }}>
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
              disabled={isDirector}
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
              disabled={!isDirector}
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
      <FileManagement
        ref={fileManagementRef}
        demandaId={demandaId}
        existingAdjuntos={data.latest_evaluacion?.adjuntos || []}
      />

      <ActionButtons
        generatePDF={() => Promise.resolve(collectUpdatedData())}
        data={collectUpdatedData()}
        onPDFGenerated={handlePDFGenerated}
        demandaId={demandaId}
        nnyaIds={allNnyaIds}
        valoracionProfesional={valoracionProfesional}
        justificacionTecnico={justificacionTecnico}
        descripcionSituacion={descripcionSituacion}
        adjuntos={adjuntos}
        fileManagementRef={fileManagementRef}
      />
    </Box>
  )
}

