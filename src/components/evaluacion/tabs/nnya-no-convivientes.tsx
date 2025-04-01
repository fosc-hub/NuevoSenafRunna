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

interface NnyaNoConviviente {
  ApellidoNombre: string
  FechaNacimiento: string
  DNI: string
  VinculoConNNYAPrincipal: string
  LegajoRUNNA: string
  Barrio: string
  Calle: string
  NumeroCasa: string
}

interface NnyaNoConvivientesProps {
  nnyaNoConvivientes: NnyaNoConviviente[]
  setNnyaNoConvivientes: React.Dispatch<React.SetStateAction<NnyaNoConviviente[]>>
}

export default function NnyaNoConvivientes({ nnyaNoConvivientes, setNnyaNoConvivientes }: NnyaNoConvivientesProps) {
  const [newNnya, setNewNnya] = useState<NnyaNoConviviente>({
    ApellidoNombre: "",
    FechaNacimiento: "",
    DNI: "",
    VinculoConNNYAPrincipal: "",
    LegajoRUNNA: "",
    Barrio: "",
    Calle: "",
    NumeroCasa: "",
  })

  const handleInputChange = (field: keyof NnyaNoConviviente, value: string) => {
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

    setNnyaNoConvivientes([...nnyaNoConvivientes, newNnya])

    // Reset form
    setNewNnya({
      ApellidoNombre: "",
      FechaNacimiento: "",
      DNI: "",
      VinculoConNNYAPrincipal: "",
      LegajoRUNNA: "",
      Barrio: "",
      Calle: "",
      NumeroCasa: "",
    })
  }

  const handleDeleteNnya = (index: number) => {
    const updatedNnyas = [...nnyaNoConvivientes]
    updatedNnyas.splice(index, 1)
    setNnyaNoConvivientes(updatedNnyas)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        NNYA No Convivientes
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
              <TableCell>Barrio</TableCell>
              <TableCell>Calle</TableCell>
              <TableCell>Número</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nnyaNoConvivientes.map((nnya, index) => (
              <TableRow key={index}>
                <TableCell>{nnya.ApellidoNombre}</TableCell>
                <TableCell>{nnya.FechaNacimiento}</TableCell>
                <TableCell>{nnya.DNI}</TableCell>
                <TableCell>{nnya.VinculoConNNYAPrincipal}</TableCell>
                <TableCell>{nnya.LegajoRUNNA}</TableCell>
                <TableCell>{nnya.Barrio}</TableCell>
                <TableCell>{nnya.Calle}</TableCell>
                <TableCell>{nnya.NumeroCasa}</TableCell>
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
                <TextField
                  value={newNnya.Barrio}
                  onChange={(e) => handleInputChange("Barrio", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Barrio"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newNnya.Calle}
                  onChange={(e) => handleInputChange("Calle", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Calle"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newNnya.NumeroCasa}
                  onChange={(e) => handleInputChange("NumeroCasa", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Número"
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

