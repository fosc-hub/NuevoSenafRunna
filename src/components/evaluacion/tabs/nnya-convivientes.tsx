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

interface NnyaConviviente {
  ApellidoNombre: string
  FechaNacimiento: string
  DNI: string
  VinculoConNNYAPrincipal: string
  LegajoRUNNA: string
}

interface NnyaConvivientesProps {
  nnyaConvivientes: NnyaConviviente[]
  setNnyaConvivientes: React.Dispatch<React.SetStateAction<NnyaConviviente[]>>
}

export default function NnyaConvivientes({ nnyaConvivientes, setNnyaConvivientes }: NnyaConvivientesProps) {
  const [newNnya, setNewNnya] = useState<NnyaConviviente>({
    ApellidoNombre: "",
    FechaNacimiento: "",
    DNI: "",
    VinculoConNNYAPrincipal: "",
    LegajoRUNNA: "",
  })

  const handleInputChange = (field: keyof NnyaConviviente, value: string) => {
    setNewNnya({
      ...newNnya,
      [field]: value,
    })
  }

  const handleAddNnya = () => {
    // Validate required fields
    if (!newNnya.ApellidoNombre || !newNnya.DNI) {
      return
    }

    setNnyaConvivientes([...nnyaConvivientes, newNnya])

    // Reset form
    setNewNnya({
      ApellidoNombre: "",
      FechaNacimiento: "",
      DNI: "",
      VinculoConNNYAPrincipal: "",
      LegajoRUNNA: "",
    })
  }

  const handleDeleteNnya = (index: number) => {
    const updatedNnyas = [...nnyaConvivientes]
    updatedNnyas.splice(index, 1)
    setNnyaConvivientes(updatedNnyas)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        NNYA Convivientes
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Apellido y Nombre</TableCell>
              <TableCell>Fecha de Nacimiento</TableCell>
              <TableCell>N° de DNI</TableCell>
              <TableCell>Vínculo con NNyA principal</TableCell>
              <TableCell>N° de Legajo RUNNA</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nnyaConvivientes.map((nnya, index) => (
              <TableRow key={index}>
                <TableCell>{nnya.ApellidoNombre}</TableCell>
                <TableCell>{nnya.FechaNacimiento}</TableCell>
                <TableCell>{nnya.DNI}</TableCell>
                <TableCell>{nnya.VinculoConNNYAPrincipal}</TableCell>
                <TableCell>{nnya.LegajoRUNNA}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteNnya(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Add new NNYA row */}
            <TableRow>
              <TableCell>
                <TextField
                  value={newNnya.ApellidoNombre}
                  onChange={(e) => handleInputChange("ApellidoNombre", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Apellido y Nombre"
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="date"
                  value={newNnya.FechaNacimiento}
                  onChange={(e) => handleInputChange("FechaNacimiento", e.target.value)}
                  fullWidth
                  size="small"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newNnya.DNI}
                  onChange={(e) => handleInputChange("DNI", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="DNI"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newNnya.VinculoConNNYAPrincipal}
                  onChange={(e) => handleInputChange("VinculoConNNYAPrincipal", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Vínculo"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newNnya.LegajoRUNNA}
                  onChange={(e) => handleInputChange("LegajoRUNNA", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Legajo RUNNA"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddNnya}
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

