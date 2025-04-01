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

interface Motivo {
  Motivos: string
}

interface MotivosActuacionProps {
  motivos: Motivo[]
  setMotivos: React.Dispatch<React.SetStateAction<Motivo[]>>
}

export default function MotivosActuacion({ motivos, setMotivos }: MotivosActuacionProps) {
  const [newMotivo, setNewMotivo] = useState<Motivo>({
    Motivos: "",
  })

  const handleInputChange = (value: string) => {
    setNewMotivo({
      Motivos: value,
    })
  }

  const handleAddMotivo = () => {
    // Validate required fields
    if (!newMotivo.Motivos.trim()) {
      return
    }

    setMotivos([...motivos, newMotivo])

    // Reset form
    setNewMotivo({
      Motivos: "",
    })
  }

  const handleDeleteMotivo = (index: number) => {
    const updatedMotivos = [...motivos]
    updatedMotivos.splice(index, 1)
    setMotivos(updatedMotivos)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Motivos de Actuación
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Motivos</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {motivos.map((motivo, index) => (
              <TableRow key={index}>
                <TableCell>{motivo.Motivos}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteMotivo(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Add new motivo row */}
            <TableRow>
              <TableCell>
                <TextField
                  value={newMotivo.Motivos}
                  onChange={(e) => handleInputChange(e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  placeholder="Ingrese un motivo de actuación"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddMotivo}
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

