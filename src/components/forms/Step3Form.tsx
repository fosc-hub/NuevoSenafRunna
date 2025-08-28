"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  useTheme,
} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3"
import { es } from "date-fns/locale"
import { Add as AddIcon, Delete as DeleteIcon, ChildCare as ChildIcon } from "@mui/icons-material"
import type { DropdownData, FormData, NnyaData } from "./types/formTypes"
import { useBusquedaVinculacion } from "./utils/conexionesApi"
import VinculacionNotification from "./VinculacionNotificacion"
import NNYACard from "./components/nnya/nnya-card"

interface Step3FormProps {
  dropdownData: DropdownData
  readOnly?: boolean
  adultosConvivientes: FormData["adultosConvivientes"]
  id?: number
}

const Step3Form: React.FC<Step3FormProps> = ({ dropdownData, readOnly = false, adultosConvivientes, id }) => {
  const theme = useTheme()
  const { control, setValue } = useFormContext<FormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ninosAdolescentes",
  })

  // Importante: Usar useWatch en lugar de watch para detectar cambios en tiempo real
  const watchedFields = useWatch({
    control,
    name: "ninosAdolescentes",
  })

  // Vinculacion state
  const [vinculacionResults, setVinculacionResults] = useState<{
    demanda_ids: number[]
    match_descriptions: string[]
  } | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  // Use the hook from conexionesApi
  const { buscarCompleto } = useBusquedaVinculacion(800) // 800ms debounce

  // Memoizar la función handleVinculacionResults para evitar recreaciones innecesarias
  const handleVinculacionResults = useCallback((results: { demanda_ids: number[]; match_descriptions: string[] }) => {
    if (results.demanda_ids.length > 0) {
      setVinculacionResults(results)
      setOpenSnackbar(true)
    }
  }, [])

  // Watch the entire ninosAdolescentes array instead of individual fields
  const watchedNnyas = useWatch({
    control,
    name: "ninosAdolescentes",
  })

  // Effect para manejar cambios SOLO en los campos relevantes para la búsqueda
  useEffect(() => {
    if (!fields.length || !watchedNnyas) return

    // Procesar cada niño/adolescente
    fields.forEach((field, index) => {
      const nnya = watchedNnyas[index]
      if (!nnya) return

      // Obtener los valores actuales
      const nombre = nnya.nombre || ""
      const apellido = nnya.apellido || ""
      const dni = nnya.dni || ""
      const useDefaultLocalizacion = nnya.useDefaultLocalizacion

      // Construir nombre completo
      const nombreCompleto = nombre && apellido ? `${nombre} ${apellido}`.trim() : ""
      const dniValue = dni ? Number.parseInt(dni) : 0

      // Verificar si tiene localización específica
      let localizacionData = undefined
      if (!useDefaultLocalizacion && nnya.localizacion) {
        const localizacion = nnya.localizacion
        if (localizacion) {
          localizacionData = {
            calle: localizacion.calle || "",
            localidad: Number(localizacion.localidad) || 0,
          }
        }
      }

      // La función buscarCompleto ahora se encarga de validar los datos y aplicar el debounce
      buscarCompleto(nombreCompleto, dniValue, "", localizacionData, handleVinculacionResults, id)
    })
  }, [
    fields,
    watchedNnyas,
    buscarCompleto,
    handleVinculacionResults,
  ])

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const [expandedSections, setExpandedSections] = useState<boolean[]>(fields.map(() => true))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const addNinoAdolescente = () => {
    append({
      nombre: "",
      apellido: "",
      fechaNacimiento: null,
      fechaDefuncion: null,
      edadAproximada: "",
      dni: "",
      situacionDni: "",
      genero: "",
      observaciones: "",
      useDefaultLocalizacion: true,
      localizacion: {
        calle: "",
        tipo_calle: "",
        piso_depto: "",
        lote: "",
        mza: "",
        casa_nro: "",
        referencia_geo: "",
        geolocalizacion: "",
        barrio: "",
        localidad: "",
        cpc: "",
      },
      educacion: {
        institucion_educativa: "",
        nivel_alcanzado: "",
        esta_escolarizado: false,
        ultimo_cursado: "",
        tipo_escuela: "",
        comentarios_educativos: "",
        curso: "",
        nivel: "",
        turno: "",
        comentarios: "",
      },
      cobertura_medica: {
        obra_social: "",
        intervencion: "",
        auh: false,
        observaciones: "",
        institucion_sanitaria: "",
        medico_cabecera: "",
      },
      persona_enfermedades: [],
      demanda_persona: {
        conviviente: true,
        vinculo_demanda: "",
        vinculo_con_nnya_principal: "",
      },
      condicionesVulnerabilidad: [],
      vulneraciones: [],
    })
    setExpandedSections([...expandedSections, true])
  }

  const toggleSection = (index: number) => {
    const newExpandedSections = [...expandedSections]
    newExpandedSections[index] = !newExpandedSections[index]
    setExpandedSections(newExpandedSections)
  }

  const openDeleteDialog = (index: number) => {
    setDeleteIndex(index)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setDeleteIndex(null)
  }

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex)
      const newExpandedSections = [...expandedSections]
      newExpandedSections.splice(deleteIndex, 1)
      setExpandedSections(newExpandedSections)
      closeDeleteDialog()
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
            <ChildIcon sx={{ mr: 1 }} /> Niñas, Niños y Adolescentes
          </Typography>
          {!readOnly && fields.length > 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addNinoAdolescente}
              size="small"
              color="primary"
              sx={{ borderRadius: "20px" }}
            >
              Añadir NNYA
            </Button>
          )}
        </Box>

        {fields.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              backgroundColor: "background.paper",
              borderStyle: "dashed",
              borderWidth: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No hay niños, niñas o adolescentes registrados
            </Typography>
            {!readOnly && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addNinoAdolescente}
                sx={{ mt: 2, borderRadius: "20px" }}
              >
                Añadir NNYA
              </Button>
            )}
          </Paper>
        ) : (
          fields.map((field, index) => (
            <NNYACard
              key={field.id}
              index={index}
              field={field}
              control={control}
              dropdownData={dropdownData}
              readOnly={readOnly}
              watchedFields={watchedFields}
              setValue={setValue}
              expanded={expandedSections[index]}
              toggleExpanded={() => toggleSection(index)}
              onDelete={() => openDeleteDialog(index)}
              isPrincipal={index === 0}
            />
          ))
        )}

        {!readOnly && fields.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addNinoAdolescente}
              size="large"
              sx={{ borderRadius: "20px", px: 3 }}
            >
              Añadir Niño, Niña o Adolescente
            </Button>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
            <DeleteIcon color="error" sx={{ mr: 1 }} /> Confirmar eliminación
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar este niño, niña o adolescente? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDeleteDialog} variant="outlined" size="medium">
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            autoFocus
            size="medium"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <VinculacionNotification
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        vinculacionResults={vinculacionResults}
        currentDemandaId={id}
      />
    </LocalizationProvider>
  )
}

export default Step3Form
