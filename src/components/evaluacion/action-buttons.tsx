"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  type SelectChangeEvent,
} from "@mui/material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import { Cancel as CancelIcon, Person as PersonIcon } from "@mui/icons-material"
import axiosInstance from '@/app/api/utils/axiosInstance';
import { useUser } from "@/utils/auth/userZustand"
import { autorizarAdmisionYCrearLegajos } from "@/features/legajo/api/legajo-creation.service"

// Dynamic import para evitar errores SSR con Next.js
const DownloadPDFButton = dynamic(() => import("./pdf/download-pdf-button"), {
  ssr: false,
  loading: () => (
    <Button variant="contained" color="primary" disabled>
      Cargando PDF...
    </Button>
  ),
})

interface ActionButtonsProps {
  generatePDF: (data: any) => Promise<any>
  data: any
  onPDFGenerated?: (blob: Blob, fileName: string) => void
  // Add these new props
  descripcionSituacion?: string
  valoracionProfesional?: string
  justificacionTecnico?: string
  demandaId?: number | null
  nnyaIds?: (string | number)[]
}

interface ChildOption {
  id: string | number
  name: string
  type: string
  databaseId?: string | number
}

// Lista de firmantes disponibles
const firmantesDisponibles = [
  { id: 1, nombre: "María Sosa", cargo: "Trabajador Social" },
  { id: 2, nombre: "Juan Pérez", cargo: "Psicólogo" },
  { id: 3, nombre: "Ana García", cargo: "Abogada" },
  { id: 4, nombre: "Carlos Rodríguez", cargo: "Director" },
  { id: 5, nombre: "Laura Martínez", cargo: "Coordinadora" },
]

export default function ActionButtons({
  generatePDF,
  data,
  onPDFGenerated,
  descripcionSituacion,
  valoracionProfesional,
  justificacionTecnico,
  demandaId,
  nnyaIds,
}: ActionButtonsProps) {
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<(string | number)[]>([])
  const [firmantes, setFirmantes] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipoMedidaEvaluado, setTipoMedidaEvaluado] = useState<string>("")
  const user = useUser((state) => state.user)

  // Check if user is director
  const isDirector = user?.is_superuser ||
    user?.is_staff

  useEffect(() => {
    if (nnyaIds && Array.isArray(nnyaIds) && nnyaIds.length > 0) {
      setSelectedChildrenIds(nnyaIds);
    }
  }, [nnyaIds]);

  const handleChildChange = (event: SelectChangeEvent<typeof selectedChildrenIds>) => {
    const {
      target: { value },
    } = event

    // On autofill we get a stringified value.
    setSelectedChildrenIds(typeof value === "string" ? value.split(",") : value)
  }

  const handleFirmantesChange = (event: SelectChangeEvent<typeof firmantes>) => {
    const {
      target: { value },
    } = event
    setFirmantes(typeof value === "string" ? value.split(",").map(Number) : value)
  }

  // Get children from data with their IDs
  const children: ChildOption[] = [
    ...(data.NNYAConvivientes || []).map((nnya: any) => ({
      id: nnya.persona?.id || nnya.id || nnya.ID || nnya.DNI,
      name: nnya.ApellidoNombre || nnya.apellido_nombre,
      type: "Conviviente",
      databaseId: nnya.persona?.id, // Store the database ID separately
    })),
    ...(data.NNYANoConvivientes || []).map((nnya: any) => ({
      id: nnya.persona?.id || nnya.id || nnya.ID || nnya.DNI,
      name: nnya.ApellidoNombre || nnya.apellido_nombre,
      type: "No Conviviente",
      databaseId: nnya.persona?.id, // Store the database ID separately
    })),
  ]

  const handleAuthorizationAction = async (action: string) => {
    try {
      setIsSubmitting(true)

      if (!demandaId) {
        toast.error("No se pudo procesar: ID de demanda no disponible", {
          position: "top-center",
          autoClose: 3000,
        })
        return
      }

      // Get user data for all authorization actions
      const localidad_usuario = data?.InformacionGeneral?.Localidad || "string"
      const nombre_usuario = data?.InformacionGeneral?.NombreApellido || "string"
      const rol_usuario = data?.InformacionGeneral?.CargoFuncion || "string"

      if (action === "autorizar tomar medida") {
        if (selectedChildrenIds.length === 0) {
          toast.warning("Por favor seleccione al menos un niño antes de autorizar tomar medida", {
            position: "top-center",
            autoClose: 3000,
          })
          return
        }

        if (!tipoMedidaEvaluado) {
          toast.warning("Por favor seleccione el tipo de medida a tomar", {
            position: "top-center",
            autoClose: 3000,
          })
          return
        }

        // Get the database IDs for the selected children
        const selectedDatabaseIds = selectedChildrenIds.map(selectedId => {
          const child = children.find(c => c.id === selectedId);
          return child?.databaseId || selectedId;
        });

        const payload = {
          nnyas_evaluados_id: selectedDatabaseIds,
          descripcion_de_la_situacion: descripcionSituacion || "Blank",
          valoracion_profesional_final: valoracionProfesional || "Blank",
          justificacion_tecnico: justificacionTecnico || "Blank",
          solicitud_tecnico: "TOMAR MEDIDA",
          tipo_medida_evaluado: tipoMedidaEvaluado,
          demanda: demandaId,
          localidad_usuario,
          nombre_usuario,
          rol_usuario
        }

        console.log("Sending payload:", payload)

        const response = await axiosInstance.post("/evaluaciones/", payload)
        console.log("API Response:", response.data)

        toast.success("Solicitud de tomar medida enviada exitosamente", {
          position: "top-center",
          autoClose: 3000,
        })
      } else if (action === "autorizar archivar") {
        // Include selected NNyA IDs in the archivar request as well
        const selectedDatabaseIds = selectedChildrenIds.map(selectedId => {
          const child = children.find(c => c.id === selectedId);
          return child?.databaseId || selectedId;
        });

        const payload = {
          nnyas_evaluados_id: selectedDatabaseIds,
          descripcion_de_la_situacion: descripcionSituacion || "Blank",
          valoracion_profesional_final: valoracionProfesional || "Blank",
          justificacion_tecnico: justificacionTecnico || "Blank",
          solicitud_tecnico: "ARCHIVAR",
          demanda: demandaId,
          localidad_usuario,
          nombre_usuario,
          rol_usuario
        }

        console.log("Sending payload:", payload)

        const response = await axiosInstance.post("/evaluaciones/", payload)
        console.log("API Response:", response.data)

        toast.success("Solicitud de archivar enviada exitosamente", {
          position: "top-center",
          autoClose: 3000,
        })
      } else if (action === "autorizar" || action === "no autorizar") {
        const payload = {
          descripcion_de_la_situacion: descripcionSituacion || "El niño refiere problemas de alimentación y estudio.",
          valoracion_profesional_final: valoracionProfesional || "Se propone acompañamiento psicosocial.",
          justificacion_tecnico: justificacionTecnico || "Informe de trabajador social adjunto.",
          justificacion_director: "Aprobado por coordinación.",
          solicitud_tecnico: "TOMAR MEDIDA",
          decision_director: action === "autorizar" ? "AUTORIZAR" : "NO AUTORIZAR",
          demanda: demandaId,
          localidad_usuario,
          nombre_usuario,
          rol_usuario
        }

        console.log("Sending payload:", payload)

        if (action === "autorizar") {
          // LEG-02: Autorizar admisión y crear legajos automáticamente
          const response = await autorizarAdmisionYCrearLegajos(demandaId, payload)
          console.log("API Response:", response)

          // Response is already handled by autorizarAdmisionYCrearLegajos service
          // No additional toast needed here as the service already shows appropriate messages
        } else {
          // No autorizar - no crea legajos
          const response = await axiosInstance.put(`/evaluaciones/${demandaId}/autorizar/?autorizar=false`, payload)
          console.log("API Response:", response.data)

          toast.success("Solicitud no autorizar enviada exitosamente", {
            position: "top-center",
            autoClose: 3000,
          })
        }
      }
    } catch (error) {
      console.error(`Error in ${action}:`, error)
      toast.error(`Error al procesar la solicitud de ${action}`, {
        position: "top-center",
        autoClose: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  const handlePDFGenerated = (blob: Blob, fileName: string) => {
    if (onPDFGenerated) {
      onPDFGenerated(blob, fileName)
    }
  }

  // Preparar los datos combinados para el PDF
  const combinedData = {
    ...data,
    // Asegurarse de que todos los datos necesarios estén disponibles
    // Esto se puede expandir según sea necesario
    firmantes: firmantes.map((id) => firmantesDisponibles.find((f) => f.id === id)).filter(Boolean),
  }

  return (
    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
      <DownloadPDFButton data={combinedData} onGenerate={handlePDFGenerated} />

      {/* Selector de firmantes */}
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel id="select-firmantes-label" size="small">
          Firmantes
        </InputLabel>
        <Select
          labelId="select-firmantes-label"
          id="select-firmantes"
          multiple
          value={firmantes}
          onChange={handleFirmantesChange}
          input={<OutlinedInput id="select-multiple-firmantes" label="Firmantes" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => {
                const firmante = firmantesDisponibles.find((f) => f.id === value)
                return (
                  <Chip
                    key={value}
                    label={firmante?.nombre}
                    size="small"
                    icon={<PersonIcon fontSize="small" />}
                    onDelete={() => {
                      setFirmantes(firmantes.filter((id) => id !== value))
                    }}
                    deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                  />
                )
              })}
            </Box>
          )}
          size="small"
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 224,
                width: 250,
              },
            },
          }}
        >
          {firmantesDisponibles.map((firmante) => (
            <MenuItem key={firmante.id} value={firmante.id}>
              {firmante.nombre} ({firmante.cargo})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Show these buttons only if user is NOT a director */}
      {!isDirector && (
        <>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleAuthorizationAction("autorizar archivar")}
            disabled={isSubmitting}
          >
            Autorizar archivar
          </Button>

          {/* Multi-select for children before "Autorizar tomar medida" */}
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="select-multiple-children-label">Seleccionar NNyA</InputLabel>
            <Select
              labelId="select-multiple-children-label"
              id="select-multiple-children"
              multiple
              value={selectedChildrenIds}
              onChange={handleChildChange}
              input={<OutlinedInput id="select-multiple-chip" label="Seleccionar NNyA" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const child = children.find((c) => c.id === value)
                    return (
                      <Chip
                        key={value}
                        label={child ? child.name : value}
                        size="small"
                        deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                        onDelete={() => {
                          setSelectedChildrenIds(selectedChildrenIds.filter((id) => id !== value))
                        }}
                      />
                    )
                  })}
                </Box>
              )}
              size="small"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 224,
                    width: 250,
                  },
                },
              }}
            >
              {children.length > 0 ? (
                children.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {child.name} ({child.type})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No hay NNyA registrados
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Tipo de Medida selector */}
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="select-tipo-medida-label">Tipo de Medida *</InputLabel>
            <Select
              labelId="select-tipo-medida-label"
              id="select-tipo-medida"
              value={tipoMedidaEvaluado}
              onChange={(e) => setTipoMedidaEvaluado(e.target.value)}
              input={<OutlinedInput label="Tipo de Medida *" />}
              size="small"
            >
              <MenuItem value="MPI">Medida de Protección Integral (MPI)</MenuItem>
              <MenuItem value="MPE">Medida de Protección Excepcional (MPE)</MenuItem>
              <MenuItem value="MPJ">Medida Penal Juvenil (MPJ)</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleAuthorizationAction("autorizar tomar medida")}
            disabled={selectedChildrenIds.length === 0 || !tipoMedidaEvaluado || isSubmitting}
          >
            Autorizar tomar medida
          </Button>
        </>
      )}

      {/* Show these buttons only if user IS a director */}
      {isDirector && (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAuthorizationAction("autorizar")}
            disabled={isSubmitting}
          >
            Autorizar
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => handleAuthorizationAction("no autorizar")}
            disabled={isSubmitting}
          >
            No autorizar
          </Button>
        </>
      )}
    </Box>
  )
}
