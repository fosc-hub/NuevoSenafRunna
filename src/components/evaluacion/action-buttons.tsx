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
  Autocomplete,
  TextField,
  type SelectChangeEvent,
} from "@mui/material"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import { Cancel as CancelIcon, Person as PersonIcon } from "@mui/icons-material"
import { create } from "@/app/api/apiService"
import axiosInstance from "@/app/api/utils/axiosInstance"
import { useUser } from "@/utils/auth/userZustand"
import { fetchUsuarios } from "@/app/(runna)/legajo-mesa/api/legajo-asignacion-api-service"
import type { Usuario } from "@/app/(runna)/legajo-mesa/types/asignacion-types"

// Dynamic imports para evitar errores SSR con Next.js
const DownloadPDFButton = dynamic(() => import("./pdf/download-pdf-button"), {
  ssr: false,
  loading: () => (
    <Button variant="contained" color="primary" disabled>
      Cargando PDF...
    </Button>
  ),
})

const DownloadDocxButton = dynamic(() => import("./pdf/download-docx-button"), {
  ssr: false,
  loading: () => (
    <Button variant="outlined" color="primary" disabled>
      Cargando Word...
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
  adjuntos?: any[]
  fileManagementRef?: React.RefObject<any> // Add ref to get files on demand
}

interface ChildOption {
  id: string | number
  name: string
  type: string
  databaseId?: string | number
}

interface Firmante {
  id: number
  nombre: string
  cargo: string
}

// Helper function to derive cargo from user data
const derivarCargo = (usuario: any): string => {
  // Check if user is director
  if (usuario.is_superuser || usuario.is_staff) {
    return "Director/Administrador"
  }

  // Check groups
  if (usuario.groups && usuario.groups.length > 0) {
    const groupName = usuario.groups[0].name
    return groupName
  }

  // Check zonas for director or jefe role
  if (usuario.zonas && usuario.zonas.length > 0) {
    const zona = usuario.zonas[0]
    if (zona.director) {
      return "Director"
    }
    if (zona.jefe) {
      return "Jefe"
    }
  }

  // Default to Técnico
  return "Técnico"
}

export default function ActionButtons({
  generatePDF,
  data,
  onPDFGenerated,
  descripcionSituacion,
  valoracionProfesional,
  justificacionTecnico,
  demandaId,
  nnyaIds,
  adjuntos = [],
  fileManagementRef,
}: ActionButtonsProps) {
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<(string | number)[]>([])
  const [firmantes, setFirmantes] = useState<Firmante[]>([])
  const [firmantesDisponibles, setFirmantesDisponibles] = useState<Firmante[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipoMedidaEvaluado, setTipoMedidaEvaluado] = useState<string>("")
  const user = useUser((state) => state.user)

  // Check if user is director (superuser, staff, or has Director group, or has director role in zonas)
  const isDirector = user?.is_superuser ||
    user?.is_staff ||
    user?.groups?.some((group: any) => group.name === "Director") ||
    user?.zonas?.some((zona: any) => zona.director === true)

  useEffect(() => {
    if (nnyaIds && Array.isArray(nnyaIds) && nnyaIds.length > 0) {
      setSelectedChildrenIds(nnyaIds);
    }
  }, [nnyaIds]);

  // Fetch users from API for firmantes filtered by zona
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        // Get zona ID from demanda data
        const zonaId = data?.relacion_demanda?.demanda_zona?.zona ||
          data?.registrado_por_user_zona?.id ||
          null

        console.log("Loading usuarios for zona:", zonaId)

        // Fetch all usuarios (API doesn't properly filter by zona)
        const allUsuarios = await fetchUsuarios()

        // Filter usuarios by zona and active status on the client side
        let usuarios = allUsuarios
        if (zonaId) {
          usuarios = allUsuarios.filter((usuario: any) => {
            // Only include active users who belong to the target zona
            return usuario.is_active &&
              usuario.zonas &&
              usuario.zonas.some((userZona: any) => userZona.zona === zonaId)
          })
          console.log(`Filtered ${usuarios.length} active usuarios for zona ${zonaId}`)
        } else {
          // If no zona specified, still filter by active status
          usuarios = allUsuarios.filter((usuario: any) => usuario.is_active)
        }

        // Transform usuarios to firmantes format
        const firmantesFromAPI: Firmante[] = usuarios.map((usuario: any) => ({
          id: usuario.id,
          nombre: usuario.nombre_completo || `${usuario.first_name} ${usuario.last_name}`.trim() || usuario.username,
          cargo: derivarCargo(usuario) // Use derivarCargo for all users to get proper role
        }))

        // Add current logged-in user if not already in the list
        if (user) {
          const currentUserExists = firmantesFromAPI.some(f => f.id === user.id)
          const currentUserFirmante: Firmante = {
            id: user.id,
            nombre: `${user.first_name} ${user.last_name}`.trim() || user.username,
            cargo: derivarCargo(user)
          }

          if (!currentUserExists) {
            firmantesFromAPI.unshift(currentUserFirmante)
          } else {
            // Update the cargo for the current user with derived cargo
            const index = firmantesFromAPI.findIndex(f => f.id === user.id)
            if (index !== -1) {
              firmantesFromAPI[index].cargo = derivarCargo(user)
            }
          }

          // Auto-select current user as default firmante
          setFirmantes([currentUserFirmante])
        }

        setFirmantesDisponibles(firmantesFromAPI)
      } catch (error) {
        console.error("Error loading usuarios for firmantes:", error)
        toast.error("Error al cargar lista de usuarios", {
          position: "top-center",
          autoClose: 3000,
        })
      }
    }

    loadUsuarios()
  }, [user, data])

  const handleChildChange = (event: SelectChangeEvent<typeof selectedChildrenIds>) => {
    const {
      target: { value },
    } = event

    // On autofill we get a stringified value.
    setSelectedChildrenIds(typeof value === "string" ? value.split(",") : value)
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

      // Get all adjuntos: existing ones + new files from FileManagement
      const newFiles = fileManagementRef?.current?.getFiles() || []
      const allAdjuntos = [...adjuntos, ...newFiles]

      console.log("Total adjuntos to send:", allAdjuntos.length)
      console.log("Existing adjuntos:", adjuntos.length)
      console.log("New files from FileManagement:", newFiles.length)

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

        // Create FormData for multipart/form-data submission
        const formData = new FormData()

        // Append each nnyas_evaluados_id individually (backend expects multiple fields with same name)
        selectedDatabaseIds.forEach((id) => {
          formData.append("nnyas_evaluados_id", String(id))
        })

        // Append all other fields
        formData.append("descripcion_de_la_situacion", descripcionSituacion || "Blank")
        formData.append("valoracion_profesional_final", valoracionProfesional || "Blank")
        formData.append("justificacion_tecnico", justificacionTecnico || "Blank")
        formData.append("solicitud_tecnico", "TOMAR MEDIDA")
        formData.append("tipo_medida_evaluado", tipoMedidaEvaluado)
        formData.append("demanda", String(demandaId))
        formData.append("localidad_usuario", localidad_usuario)
        formData.append("nombre_usuario", nombre_usuario)
        formData.append("rol_usuario", rol_usuario)

        // Append files using the field name "uploaded_files" as specified in API docs
        const newFilesToUpload = allAdjuntos.filter(adjunto => adjunto instanceof File)
        newFilesToUpload.forEach((file) => {
          console.log("Appending File:", file.name)
          formData.append("uploaded_files", file)
        })

        console.log("Sending FormData with", newFilesToUpload.length, "files")

        // Send as multipart/form-data - apiService.create() supports FormData
        const response = await create<any>("evaluaciones/", formData, false)
        console.log("API Response:", response)

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

        // Create FormData for multipart/form-data submission
        const formData = new FormData()

        // Append each nnyas_evaluados_id individually
        selectedDatabaseIds.forEach((id) => {
          formData.append("nnyas_evaluados_id", String(id))
        })

        // Append all other fields
        formData.append("descripcion_de_la_situacion", descripcionSituacion || "Blank")
        formData.append("valoracion_profesional_final", valoracionProfesional || "Blank")
        formData.append("justificacion_tecnico", justificacionTecnico || "Blank")
        formData.append("solicitud_tecnico", "ARCHIVAR")
        formData.append("demanda", String(demandaId))
        formData.append("localidad_usuario", localidad_usuario)
        formData.append("nombre_usuario", nombre_usuario)
        formData.append("rol_usuario", rol_usuario)

        // Append files using the field name "uploaded_files"
        const newFilesToUpload = allAdjuntos.filter(adjunto => adjunto instanceof File)
        newFilesToUpload.forEach((file) => {
          console.log("Appending File:", file.name)
          formData.append("uploaded_files", file)
        })

        console.log("Sending FormData with", newFilesToUpload.length, "files")

        // Send as multipart/form-data - apiService.create() supports FormData
        const response = await create<any>("evaluaciones", formData, false)
        console.log("API Response:", response)

        toast.success("Solicitud de archivar enviada exitosamente", {
          position: "top-center",
          autoClose: 3000,
        })
      } else if (action === "autorizar" || action === "no autorizar") {
        // Create FormData for multipart/form-data submission
        const formData = new FormData()

        // Append all fields
        formData.append("descripcion_de_la_situacion", descripcionSituacion || "El niño refiere problemas de alimentación y estudio.")
        formData.append("valoracion_profesional_final", valoracionProfesional || "Se propone acompañamiento psicosocial.")
        formData.append("justificacion_tecnico", justificacionTecnico || "Informe de trabajador social adjunto.")
        formData.append("justificacion_director", "Aprobado por coordinación.")
        formData.append("solicitud_tecnico", "TOMAR MEDIDA")
        formData.append("decision_director", action === "autorizar" ? "AUTORIZAR" : "NO AUTORIZAR")
        formData.append("demanda", String(demandaId))
        formData.append("localidad_usuario", localidad_usuario)
        formData.append("nombre_usuario", nombre_usuario)
        formData.append("rol_usuario", rol_usuario)

        if (action === "autorizar") {
          formData.append("decision", "AUTORIZAR_ADMISION")
        }

        // Append files using the field name "uploaded_files"
        const newFilesToUpload = allAdjuntos.filter(adjunto => adjunto instanceof File)
        newFilesToUpload.forEach((file) => {
          console.log("Appending File:", file.name)
          formData.append("uploaded_files", file)
        })

        console.log("Sending FormData with", newFilesToUpload.length, "files")

        if (action === "autorizar") {
          // LEG-02: Autorizar admisión y crear legajos automáticamente
          // Use axiosInstance directly because the put() wrapper appends /${id}/ to the URL,
          // but the demandaId is already part of the endpoint path
          const { data: response } = await axiosInstance.put<any>(
            `evaluaciones/${demandaId}/autorizar/?autorizar=true`,
            formData
          )
          console.log("API Response:", response)

          // Show success message
          const nnyaCount = response.evaluacion_personas?.length || 0
          toast.success(`Admisión autorizada para ${nnyaCount} NNyA`, {
            position: "top-center",
            autoClose: 3000,
          })
        } else {
          // No autorizar - no crea legajos
          const { data: response } = await axiosInstance.put<any>(
            `evaluaciones/${demandaId}/autorizar/?autorizar=false`,
            formData
          )
          console.log("API Response:", response)

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
    firmantes: firmantes,
  }

  return (
    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
      <DownloadPDFButton data={combinedData} onGenerate={handlePDFGenerated} />
      <DownloadDocxButton data={combinedData} />

      {/* Selector de firmantes con búsqueda */}
      <Autocomplete
        multiple
        id="firmantes-autocomplete"
        options={firmantesDisponibles}
        value={firmantes}
        onChange={(event, newValue) => {
          setFirmantes(newValue)
        }}
        getOptionLabel={(option) => `${option.nombre} (${option.cargo})`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Firmantes"
            placeholder="Buscar firmantes..."
            size="small"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={option.nombre}
              size="small"
              icon={<PersonIcon fontSize="small" />}
            />
          ))
        }
        sx={{ minWidth: 300 }}
        size="small"
        limitTags={2}
        filterOptions={(options, state) => {
          const inputValue = state.inputValue.toLowerCase()
          return options.filter(
            (option) =>
              option.nombre.toLowerCase().includes(inputValue) ||
              option.cargo.toLowerCase().includes(inputValue)
          )
        }}
      />

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
