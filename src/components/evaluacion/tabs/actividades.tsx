"use client"

import type React from "react"

import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  IconButton,
} from "@mui/material"
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material"
import { useState } from "react"

interface Actividad {
  FechaHora: string
  TipoActividad: string
  Institucion: string
  Descripcion: string
}

interface ActividadesProps {
  actividades: Actividad[]
  setActividades: React.Dispatch<React.SetStateAction<Actividad[]>>
}

export default function Actividades({ actividades, setActividades }: ActividadesProps) {
  const [newActividad, setNewActividad] = useState<Actividad>({
    FechaHora: "",
    TipoActividad: "",
    Institucion: "",
    Descripcion: "",
  })

  const handleInputChange = (field: keyof Actividad, value: string) => {
    setNewActividad({
      ...newActividad,
      [field]: value,
    })
  }

  const handleAddActividad = () => {
    // Validate required fields
    if (!newActividad.FechaHora || !newActividad.TipoActividad) {
      return
    }

    setActividades([...actividades, newActividad])

    // Reset form
    setNewActividad({
      FechaHora: "",
      TipoActividad: "",
      Institucion: "",
      Descripcion: "",
    })
  }

  const handleDeleteActividad = (index: number) => {
    const updatedActividades = [...actividades]
    updatedActividades.splice(index, 1)
    setActividades(updatedActividades)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Actividades
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Tipo de Actividad</TableCell>
              <TableCell>Institución</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actividades.map((actividad, index) => (
              <TableRow key={index}>
                <TableCell>{actividad.FechaHora}</TableCell>
                <TableCell>{actividad.TipoActividad}</TableCell>
                <TableCell>{actividad.Institucion}</TableCell>
                <TableCell>{actividad.Descripcion}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteActividad(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Add new actividad row */}
            <TableRow>
              <TableCell>
                <TextField
                  type="datetime-local"
                  value={newActividad.FechaHora}
                  onChange={(e) => handleInputChange("FechaHora", e.target.value)}
                  fullWidth
                  size="small"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newActividad.TipoActividad}
                  onChange={(e) => handleInputChange("TipoActividad", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Tipo de actividad"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newActividad.Institucion}
                  onChange={(e) => handleInputChange("Institucion", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Institución"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newActividad.Descripcion}
                  onChange={(e) => handleInputChange("Descripcion", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Descripción"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddActividad}
                >
                  Agregar
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

