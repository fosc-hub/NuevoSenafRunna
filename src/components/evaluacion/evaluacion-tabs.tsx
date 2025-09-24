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
import { toast } from "react-toastify"
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
import DecisionBox from "./decision-box"
import ActionButtons from "./action-buttons"
import FileManagement, { type FileManagementHandle } from "./file-management"
import AdjuntosTab from "./tabs/adjuntos"
import axiosInstance from '@/app/api/utils/axiosInstance';
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

  // Check if user is director
  const isDirector =
    user?.is_superuser ||
    user?.is_staff

  const [vulnerabilityIndicators, setVulnerabilityIndicators] = useState(
    Array.isArray(data.IndicadoresEvaluacion) ? data.IndicadoresEvaluacion.map((indicator: any, index: number) => {
      // Find if there's a previous valoracion for this indicator
      const previousValoracion = Array.isArray(data.valoracionesSeleccionadas) 
        ? data.valoracionesSeleccionadas.find((val: any) => val.indicador === indicator.id)
        : null;
      
      return {
        id: indicator.id || index + 1, // Use the actual ID from the API
        nombre: indicator.NombreIndicador,
        descripcion: indicator.Descripcion,
        peso: indicator.Peso === "Alto" ? 5 : indicator.Peso === "Medio" ? 3 : 1,
        selected: previousValoracion ? previousValoracion.checked : false, // Apply previous selection
      }
    }) : []
  )

  // State for editable data
  const [actividades, setActividades] = useState(Array.isArray(data.Actividades) ? data.Actividades : [])
  const [nnyaConvivientes, setNnyaConvivientes] = useState(Array.isArray(data.NNYAConvivientes) ? data.NNYAConvivientes : [])
  const [nnyaNoConvivientes, setNnyaNoConvivientes] = useState(Array.isArray(data.NNYANoConvivientes) ? data.NNYANoConvivientes : [])
  const [adultosConvivientes, setAdultosConvivientes] = useState(Array.isArray(data.AdultosConvivientes) ? data.AdultosConvivientes : [])
  const [adultosNoConvivientes, setAdultosNoConvivientes] = useState(Array.isArray(data.AdultosNoConvivientes) ? data.AdultosNoConvivientes : [])
  const [valoracionProfesional, setValoracionProfesional] = useState("")
  const [justificacionTecnico, setJustificacionTecnico] = useState("")
  const [justificacionDirector, setJustificacionDirector] = useState("")
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

  // Update vulnerability indicators when data changes (including valoraciones_seleccionadas)
  useEffect(() => {
    if (Array.isArray(data.IndicadoresEvaluacion)) {
      console.log("Updating vulnerability indicators with valoraciones:", data.valoracionesSeleccionadas);
      const updatedIndicators = data.IndicadoresEvaluacion.map((indicator: any, index: number) => {
        // Find if there's a previous valoracion for this indicator
        const previousValoracion = Array.isArray(data.valoracionesSeleccionadas) 
          ? data.valoracionesSeleccionadas.find((val: any) => val.indicador === indicator.id)
          : null;
        
        const indicatorData = {
          id: indicator.id || index + 1, // Use the actual ID from the API
          nombre: indicator.NombreIndicador,
          descripcion: indicator.Descripcion,
          peso: indicator.Peso === "Alto" ? 5 : indicator.Peso === "Medio" ? 3 : 1,
          selected: previousValoracion ? previousValoracion.checked : false, // Apply previous selection
        };
        
        if (previousValoracion) {
          console.log(`Applied valoracion for indicator ${indicator.id}:`, previousValoracion.checked);
        }
        
        return indicatorData;
      });
      setVulnerabilityIndicators(updatedIndicators);
    }
  }, [data.IndicadoresEvaluacion, data.valoracionesSeleccionadas])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleIndicatorChange = (id: number, value: boolean) => {
    setVulnerabilityIndicators(
      vulnerabilityIndicators.map((indicator: VulnerabilityIndicator) => (indicator.id === id ? { ...indicator, selected: value } : indicator)),
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
      DescripcionSituacion: descripcionSituacion,
      ValoracionProfesional: valoracionProfesional,
      adjuntos: adjuntos,
      // Note: justificacionTecnico and justificacionDirector are intentionally not included in the PDF
      IndicadoresEvaluacion: Array.isArray(vulnerabilityIndicators) ? vulnerabilityIndicators.map((indicator: VulnerabilityIndicator) => ({
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
      })) : [],
    }
  }

  const handleSaveData = async () => {
    try {
      const updatedData = collectUpdatedData()

      // Preparar los datos para enviar al API
      const dataToSend = {
        // Aquí transformamos los datos al formato que espera el API
        descripcion: updatedData.DescripcionSituacion,
        observaciones: updatedData.InformacionGeneral?.observaciones || "",
        // Si hay una evaluación, actualizarla
        evaluacion: {
          descripcion_de_la_situacion: updatedData.DescripcionSituacion,
          valoracion_profesional_final: updatedData.ValoracionProfesional,
          justificacion_tecnico: justificacionTecnico,
          justificacion_director: justificacionDirector,
        },
      }

      // Enviar los datos al API
      if (demandaId) {
        await axiosInstance.patch(`/registro-demanda-form/${demandaId}/`, dataToSend)

        toast.success("Datos guardados exitosamente", {
          position: "top-center",
          autoClose: 3000,
        })
      } else {
        toast.error("No se pudo guardar: ID de demanda no disponible", {
          position: "top-center",
          autoClose: 3000,
        })
      }
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
        preloadedScores={data.scores}
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
      <FileManagement ref={fileManagementRef} demandaId={demandaId} />

      <ActionButtons
        generatePDF={() => Promise.resolve(collectUpdatedData())}
        data={collectUpdatedData()}
        onSave={handleSaveData}
        onPDFGenerated={handlePDFGenerated}
        demandaId={demandaId}
        nnyaIds={allNnyaIds}
        valoracionProfesional={valoracionProfesional}
        justificacionTecnico={justificacionTecnico}
        descripcionSituacion={descripcionSituacion}
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
