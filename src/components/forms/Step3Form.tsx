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
import { useDuplicateDetection } from "./hooks/useDuplicateDetection"
import DuplicateDetectionModal from "./components/nnya/duplicate-detection-modal"
import { vincularDemandaALegajo, crearLegajoConDuplicado } from "@/app/(runna)/legajo-mesa/api/legajo-duplicado-api-service"
import type {
  VincularDemandaRequest,
  CrearConDuplicadoRequest,
} from "@/app/(runna)/legajo-mesa/types/legajo-duplicado-types"

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

  // Vinculacion state (legacy - mantener para compatibilidad)
  const [vinculacionResults, setVinculacionResults] = useState<{
    demanda_ids: number[]
    match_descriptions: string[]
    legajos?: any[]
  } | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  // Use the hook from conexionesApi (legacy)
  const { buscarCompleto } = useBusquedaVinculacion(800) // 800ms debounce

  // Memoizar la función handleVinculacionResults para evitar recreaciones innecesarias
  const handleVinculacionResults = useCallback((results: { demanda_ids: number[]; match_descriptions: string[]; legajos?: any[] }) => {
    // Verificar si hay resultados en demanda_ids O en legajos
    const hasDemandas = results.demanda_ids && results.demanda_ids.length > 0
    const hasLegajos = results.legajos && results.legajos.length > 0

    if (hasDemandas || hasLegajos) {
      console.log('Vinculación detectada:', results)
      setVinculacionResults(results)
      setOpenSnackbar(true)
    }
  }, [])

  // Duplicate detection state (LEG-01)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [currentNnyaIndex, setCurrentNnyaIndex] = useState<number | null>(null)
  const [isProcessingDuplicate, setIsProcessingDuplicate] = useState(false)

  // Hook for duplicate detection
  const {
    hasDuplicates,
    duplicatesFound,
    maxAlertLevel,
    isSearching,
    searchDuplicates,
    clearResults,
  } = useDuplicateDetection({
    autoSearch: false, // Manual search triggered by user input
    debounceMs: 500,
    onError: (error) => {
      console.error("[LEG-01] Error en detección de duplicados:", error)
    },
  })

  // Debug: Log cuando cambia el estado de duplicados
  useEffect(() => {
    if (hasDuplicates) {
      console.log('[LEG-01] Duplicados detectados:', {
        cantidad: duplicatesFound.length,
        nivel: maxAlertLevel,
        nnyaIndex: currentNnyaIndex,
        modalOpen: duplicateModalOpen,
      })
    }
  }, [hasDuplicates, duplicatesFound, maxAlertLevel, currentNnyaIndex, duplicateModalOpen])

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

      // Trigger duplicate detection (LEG-01)
      // Solo buscar si no está ya vinculado o marcado para skip
      if (nombre && apellido && !readOnly && !nnya.legajo_existente_vinculado?.fue_vinculado && !nnya.skip_duplicate_check) {
        // Guardar el índice del NNyA actual
        setCurrentNnyaIndex(index)

        const searchData = {
          dni: dniValue > 0 ? dniValue : null,
          nombre: nombre,
          apellido: apellido,
          fecha_nacimiento: nnya.fechaNacimiento ? nnya.fechaNacimiento.toISOString().split('T')[0] : null,
          genero: nnya.genero || null,
          nombre_autopercibido: null,
        }

        console.log(`[LEG-01] Buscando duplicados para NNyA ${index}:`, searchData)
        searchDuplicates(searchData)
      }
    })
  }, [
    fields,
    watchedNnyas,
    buscarCompleto,
    handleVinculacionResults,
    searchDuplicates,
    readOnly,
  ])

  // Effect to show modal when duplicates are found
  useEffect(() => {
    if (hasDuplicates && !readOnly && !duplicateModalOpen && currentNnyaIndex !== null) {
      setDuplicateModalOpen(true)
    }
  }, [hasDuplicates, readOnly, duplicateModalOpen, currentNnyaIndex])

  /**
   * Handler para vincular demanda a legajo existente
   */
  const handleVincularDemanda = async (legajoId: number, data: VincularDemandaRequest) => {
    try {
      setIsProcessingDuplicate(true)
      const response = await vincularDemandaALegajo(legajoId, data)

      // Update form with linked legajo info
      if (currentNnyaIndex !== null) {
        setValue(`ninosAdolescentes.${currentNnyaIndex}.legajo_existente_vinculado`, {
          legajo_id: response.legajo_id,
          legajo_numero: response.legajo_numero,
          fue_vinculado: true,
        })
      }

      // Close modal and clear
      setDuplicateModalOpen(false)
      clearResults()

      // Show success notification
      alert(`Demanda vinculada exitosamente al legajo ${response.legajo_numero}`)
    } catch (error: any) {
      console.error("Error al vincular demanda:", error)

      if (error.response?.status === 403) {
        alert("No tienes permisos para vincular a este legajo. Solicita acceso al responsable.")
      } else {
        alert(`Error al vincular demanda: ${error.message}`)
      }
    } finally {
      setIsProcessingDuplicate(false)
    }
  }

  /**
   * Handler para crear nuevo legajo confirmando duplicado
   */
  const handleCrearNuevoLegajo = async (data: CrearConDuplicadoRequest) => {
    try {
      setIsProcessingDuplicate(true)
      const response = await crearLegajoConDuplicado(data)

      // Update form to indicate duplicate was acknowledged
      if (currentNnyaIndex !== null) {
        setValue(`ninosAdolescentes.${currentNnyaIndex}.skip_duplicate_check`, true)
      }

      // Close modal and clear
      setDuplicateModalOpen(false)
      clearResults()

      // Show success notification
      alert(`Nuevo legajo creado. Justificación registrada en auditoría.`)
    } catch (error: any) {
      console.error("Error al crear legajo con duplicado:", error)
      alert(`Error al crear legajo: ${error.message}`)
    } finally {
      setIsProcessingDuplicate(false)
    }
  }

  /**
   * Handler para solicitar permisos sobre legajo de otra zona
   */
  const handleSolicitarPermisos = async (
    legajoId: number,
    requestData: { tipo: "acceso_temporal" | "transferencia"; motivo: string }
  ) => {
    try {
      setIsProcessingDuplicate(true)

      // TODO: Implement API call to request permissions
      console.log("Solicitar permisos:", { legajoId, requestData })

      alert(`Solicitud de ${requestData.tipo} enviada. Recibirás una notificación cuando sea procesada.`)

      setDuplicateModalOpen(false)
      clearResults()
    } catch (error: any) {
      console.error("Error al solicitar permisos:", error)
      alert(`Error al solicitar permisos: ${error.message}`)
    } finally {
      setIsProcessingDuplicate(false)
    }
  }

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
      // LEG-01: Initialize duplicate detection fields
      legajo_existente_vinculado: null,
      skip_duplicate_check: false,
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

      {/* Duplicate Detection Modal (LEG-01) */}
      {hasDuplicates && maxAlertLevel && (
        <DuplicateDetectionModal
          open={duplicateModalOpen}
          onClose={() => {
            setDuplicateModalOpen(false)
            clearResults()
          }}
          matches={duplicatesFound}
          maxAlertLevel={maxAlertLevel}
          onVincular={handleVincularDemanda}
          onCrearNuevo={handleCrearNuevoLegajo}
          onSolicitarPermisos={handleSolicitarPermisos}
          isProcessing={isProcessingDuplicate}
          demandaData={{
            tipo_demanda: "PROTECCION_INTEGRAL", // TODO: Get from form context
            descripcion: undefined,
          }}
        />
      )}
    </LocalizationProvider>
  )
}

export default Step3Form
