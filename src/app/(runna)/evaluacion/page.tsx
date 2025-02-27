"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

// Assume these imports are available in your project
import { get, update } from "@/app/api/apiService"
import type { TDemanda } from "@/app/interfaces"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

export default function EvaluacionPage() {
  const searchParams = useSearchParams()
  const demandaId = searchParams.get("id")
  const queryClient = useQueryClient()
  const [evaluacionData, setEvaluacionData] = useState({
    conclusion: "",
    recomendaciones: "",
    estado_evaluacion: "PENDIENTE",
    observaciones: "",
  })
  const [tabValue, setTabValue] = useState(0)

  // Fetch demanda details
  const {
    data: demanda,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["demanda", demandaId],
    queryFn: () => (demandaId ? get<TDemanda>(`registro-demanda-form/${demandaId}/`) : null),
    enabled: !!demandaId,
  })

  // Update evaluacion mutation
  const updateEvaluacion = useMutation({
    mutationFn: async (data: typeof evaluacionData) => {
      if (!demandaId) throw new Error("Demanda ID is required")

      // If evaluacion exists, update it, otherwise create it
      if (demanda?.evaluacion?.id) {
        return update(
          "evaluacion",
          demanda.evaluacion.id,
          {
            ...data,
            ultima_actualizacion: new Date().toISOString(),
          },
          true,
          "Evaluación actualizada con éxito",
        )
      } else {
        // Create new evaluacion
        return update(
          "evaluacion",
          null,
          {
            ...data,
            demanda: demandaId,
            fecha_creacion: new Date().toISOString(),
            ultima_actualizacion: new Date().toISOString(),
          },
          true,
          "Evaluación creada con éxito",
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demanda", demandaId] })
      toast.success("Evaluación guardada correctamente", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
      })
    },
    onError: (error) => {
      console.error("Error al guardar la evaluación:", error)
      toast.error("Error al guardar la evaluación", {
        position: "top-center",
        autoClose: 3000,
      })
    },
  })

  // Load existing evaluacion data if available
  useEffect(() => {
    if (demanda?.evaluacion) {
      setEvaluacionData({
        conclusion: demanda.evaluacion.conclusion || "",
        recomendaciones: demanda.evaluacion.recomendaciones || "",
        estado_evaluacion: demanda.evaluacion.estado_evaluacion || "PENDIENTE",
        observaciones: demanda.evaluacion.observaciones || "",
      })
    }
  }, [demanda])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEvaluacionData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target
    setEvaluacionData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateEvaluacion.mutate(evaluacionData)
  }

  const handleGoBack = () => {
    window.location.href = "/"
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !demanda) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">Error al cargar los datos de la demanda</Typography>
      </Box>
    )
  }

  return (
    <main className="max-w-[1200px] mx-auto p-5">
      <Box>
        {/* Fixed position tabs */}
        <Box
          sx={{
            position: "sticky",
            top: "64px", // Add top offset for navbar
            bgcolor: "#0EA5E9",
            zIndex: 1100,
            width: "100%",
            p: 0,
          }}
        >
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
            }}
          >
            <Tab label="INFORMACIÓN GENERAL" />
            <Tab label="DATOS DE LOCALIZACIÓN" />
            <Tab label="DESCRIPCIÓN DE LA SITUACIÓN INICIAL" />
            <Tab label="ACTIVIDADES" />
            <Tab label="NNYA CONVIVIENTES" />
            <Tab label="NNYA NO CONVIVIENTES" />
            <Tab label="ADULTO" />
          </Tabs>
        </Box>

        {/* Content area with top margin to account for both navbar and tabs */}
        <Box>
          <CustomTabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} sx={{ mt: 0, borderRadius: 0 }}>
              <Table sx={{ minWidth: 650 }} aria-label="información general table">
                <TableHead>
                  <TableRow>
                    <TableCell>Localidad</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Cargo/Función</TableCell>
                    <TableCell>Nombre y Apellido</TableCell>
                    <TableCell>N° de Sticker SUAC</TableCell>
                    <TableCell>N° de Sticker sac</TableCell>
                    <TableCell>N° de Oficio Web</TableCell>
                    <TableCell>Origen</TableCell>
                    <TableCell>Suborigen</TableCell>
                    <TableCell>Institución</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>2025-02-1</TableCell>
                    <TableCell>superuser</TableCell>
                    <TableCell></TableCell>
                    <TableCell>62</TableCell>
                    <TableCell>77</TableCell>
                    <TableCell>31</TableCell>
                    <TableCell>if</TableCell>
                    <TableCell>go</TableCell>
                    <TableCell>soon</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={1}>
            <Typography variant="h6">Datos de Localización</Typography>
            {/* Add table for location data */}
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={2}>
            <Typography variant="h6">Descripción de la Situación Inicial</Typography>
            {/* Add content for initial situation */}
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={3}>
            <Typography variant="h6">Actividades</Typography>
            {/* Add table for activities */}
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={4}>
            <Typography variant="h6">NNYA Convivientes</Typography>
            {/* Add table for cohabiting NNYA */}
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={5}>
            <Typography variant="h6">NNYA No Convivientes</Typography>
            {/* Add table for non-cohabiting NNYA */}
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={6}>
            <Typography variant="h6">Adulto</Typography>
            {/* Add table for adult information */}
          </CustomTabPanel>
        </Box>
      </Box>
    </main>
  )
}

