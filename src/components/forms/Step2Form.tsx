"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useFieldArray, type Control, useWatch } from "react-hook-form"
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
} from "@mui/material"
import { Add as AddIcon, Delete as DeleteIcon, Person as PersonIcon } from "@mui/icons-material"
import type { DropdownData, FormData, AdultoData } from "./types/formTypes"
import { useBusquedaVinculacion } from "./utils/conexionesApi"
import VinculacionNotification from "./VinculacionNotificacion"
import AdultoCard from "./components/adulto/adulto-card"

interface Step2FormProps {
  control: Control<FormData>
  dropdownData: DropdownData
  readOnly?: boolean
  id?: number
}

const Step2Form: React.FC<Step2FormProps> = ({ control, dropdownData, readOnly = false, id }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "adultosConvivientes",
  })
  const watchedFields = useWatch({ control, name: "adultosConvivientes" })
  const [expandedSections, setExpandedSections] = useState<boolean[]>(fields.map(() => true))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

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

  // Watch the entire adultosConvivientes array instead of individual fields
  const watchedAdultos = useWatch({
    control,
    name: "adultosConvivientes",
  })

  // Effect para manejar cambios SOLO en los campos relevantes para la búsqueda
  useEffect(() => {
    if (!fields.length || !watchedAdultos) return

    // Procesar cada adulto
    fields.forEach((field, index) => {
      const adulto = watchedAdultos[index]
      if (!adulto) return

      // Obtener los valores actuales
      const nombre = adulto.nombre || ""
      const apellido = adulto.apellido || ""
      const dni = adulto.dni || ""
      const useDefaultLocalizacion = adulto.useDefaultLocalizacion

      // Construir nombre completo
      const nombreCompleto = nombre && apellido ? `${nombre} ${apellido}`.trim() : ""
      const dniValue = dni ? Number.parseInt(dni) : 0

      // Verificar si tiene localización específica
      let localizacionData = undefined
      if (!useDefaultLocalizacion && adulto.localizacion) {
        const localizacion = adulto.localizacion
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
    watchedAdultos,
    buscarCompleto,
    handleVinculacionResults,
  ])

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const addAdultoConviviente = () => {
    append({
      nombre: "",
      apellido: "",
      fechaNacimiento: null,
      fechaDefuncion: null,
      edadAproximada: "",
      dni: "",
      situacionDni: "",
      genero: "",
      conviviente: false,
      legalmenteResponsable: false,
      ocupacion: "",
      supuesto_autordv: "",
      garantiza_proteccion: false,
      observaciones: "",
      useDefaultLocalizacion: true,
      telefono: "",
      vinculacion: "",
      vinculo_con_nnya_principal: 0,
      vinculo_demanda: "",
      condicionesVulnerabilidad: [],
      nacionalidad: "",
    })
    setExpandedSections((prev) => [...prev, true])
  }

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const newExpandedSections = [...prev]
      newExpandedSections[index] = !newExpandedSections[index]
      return newExpandedSections
    })
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
      setExpandedSections((prev) => {
        const newExpandedSections = [...prev]
        newExpandedSections.splice(deleteIndex, 1)
        return newExpandedSections
      })
      closeDeleteDialog()
    }
  }

  return (
    <>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
            <PersonIcon sx={{ mr: 1 }} /> Adultos Convivientes
          </Typography>
          {!readOnly && fields.length > 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addAdultoConviviente}
              size="small"
              color="primary"
              sx={{ borderRadius: "20px" }}
            >
              Añadir Adulto
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
              No hay adultos registrados
            </Typography>
            {!readOnly && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addAdultoConviviente}
                sx={{ mt: 2, borderRadius: "20px" }}
              >
                Añadir Adulto
              </Button>
            )}
          </Paper>
        ) : (
          fields.map((field, index) => (
            <AdultoCard
              key={field.id}
              index={index}
              field={field}
              control={control}
              dropdownData={dropdownData}
              readOnly={readOnly}
              watchedField={watchedFields?.[index] || {}}
              expanded={expandedSections[index]}
              toggleExpanded={() => toggleSection(index)}
              onDelete={() => openDeleteDialog(index)}
            />
          ))
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
            ¿Está seguro de que desea eliminar este adulto? Esta acción no se puede deshacer.
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

      {/* Use the modular VinculacionNotification component */}
      <VinculacionNotification
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        vinculacionResults={vinculacionResults}
        currentDemandaId={id}
      />
    </>
  )
}

export default Step2Form
