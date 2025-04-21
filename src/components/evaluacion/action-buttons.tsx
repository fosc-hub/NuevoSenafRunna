"use client"

import { useState } from "react"
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
import { Save as SaveIcon, Cancel as CancelIcon, Person as PersonIcon } from "@mui/icons-material"

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
  onSave?: () => void
  onPDFGenerated?: (blob: Blob, fileName: string) => void
}

interface ChildOption {
  id: string
  name: string
  type: string
}

// Lista de firmantes disponibles
const firmantesDisponibles = [
  { id: 1, nombre: "María Sosa", cargo: "Trabajador Social" },
  { id: 2, nombre: "Juan Pérez", cargo: "Psicólogo" },
  { id: 3, nombre: "Ana García", cargo: "Abogada" },
  { id: 4, nombre: "Carlos Rodríguez", cargo: "Director" },
  { id: 5, nombre: "Laura Martínez", cargo: "Coordinadora" },
]

export default function ActionButtons({ generatePDF, data, onSave, onPDFGenerated }: ActionButtonsProps) {
  const [selectedChildren, setSelectedChildren] = useState<string[]>([])
  const [firmantes, setFirmantes] = useState<number[]>([])

  const handleChildChange = (event: SelectChangeEvent<typeof selectedChildren>) => {
    const {
      target: { value },
    } = event

    // On autofill we get a stringified value.
    setSelectedChildren(typeof value === "string" ? value.split(",") : value)
  }

  const handleFirmantesChange = (event: SelectChangeEvent<typeof firmantes>) => {
    const {
      target: { value },
    } = event
    setFirmantes(typeof value === "string" ? value.split(',').map(Number) : value)
  }

  const handleAuthorizationAction = async (action: string) => {
    if (action === "autorizar tomar medida" && selectedChildren.length === 0) {
      toast.warning("Por favor seleccione al menos un niño antes de autorizar tomar medida", {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    let message = `Demanda enviada para ${action}`
    if (selectedChildren.length > 0 && action === "autorizar tomar medida") {
      message += ` para ${selectedChildren.length === 1 ? selectedChildren[0] : `${selectedChildren.length} niños seleccionados`}`
    }

    toast.success(message + " exitosamente", {
      position: "top-center",
      autoClose: 3000,
    })
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    } else {
      // Fallback if no onSave function is provided
      console.log("Saving data:", data)
      toast.success("Datos guardados exitosamente", {
        position: "top-center",
        autoClose: 3000,
      })
    }
  }

  const handlePDFGenerated = (blob: Blob, fileName: string) => {
    if (onPDFGenerated) {
      onPDFGenerated(blob, fileName)
    }
  }

  // Get children from data
  const children: ChildOption[] = [
    ...(data.NNYAConvivientes || []).map((nnya: any) => ({
      id: nnya.DNI,
      name: nnya.ApellidoNombre,
      type: "Conviviente",
    })),
    ...(data.NNYANoConvivientes || []).map((nnya: any) => ({
      id: nnya.DNI,
      name: nnya.ApellidoNombre,
      type: "No Conviviente",
    })),
  ]

  // Find child by name
  const getChildType = (name: string): string => {
    const child = children.find((c) => c.name === name)
    return child ? child.type : ""
  }

  // Preparar los datos combinados para el PDF
  const combinedData = {
    ...data,
    // Asegurarse de que todos los datos necesarios estén disponibles
    // Esto se puede expandir según sea necesario
    firmantes: firmantes.map(id => firmantesDisponibles.find(f => f.id === id)).filter(Boolean)
  }

  return (
    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
      <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave}>
        Guardar
      </Button>

      <DownloadPDFButton data={combinedData} onGenerate={handlePDFGenerated} />

      {/* Selector de firmantes */}
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel id="select-firmantes-label" size="small">Firmantes</InputLabel>
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
                const firmante = firmantesDisponibles.find(f => f.id === value);
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
                );
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

      <Button variant="contained" color="secondary" onClick={() => handleAuthorizationAction("autorizar archivar")}>
        Autorizar archivar
      </Button>

      {/* Multi-select for children before "Autorizar tomar medida" */}
      <FormControl sx={{ minWidth: 250 }}>
        <InputLabel id="select-multiple-children-label">Seleccionar NNyA</InputLabel>
        <Select
          labelId="select-multiple-children-label"
          id="select-multiple-children"
          multiple
          value={selectedChildren}
          onChange={handleChildChange}
          input={<OutlinedInput id="select-multiple-chip" label="Seleccionar NNyA" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  size="small"
                  deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                  onDelete={() => {
                    setSelectedChildren(selectedChildren.filter((child) => child !== value))
                  }}
                />
              ))}
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
              <MenuItem key={child.id} value={child.name}>
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

      <Button
        variant="contained"
        color="secondary"
        onClick={() => handleAuthorizationAction("autorizar tomar medida")}
        disabled={selectedChildren.length === 0}
      >
        Autorizar tomar medida
      </Button>

      <Button variant="contained" color="primary" onClick={() => handleAuthorizationAction("autorizar")}>
        Autorizar
      </Button>

      <Button variant="contained" color="error" onClick={() => handleAuthorizationAction("no autorizar")}>
        No autorizar
      </Button>
    </Box>
  )
}
