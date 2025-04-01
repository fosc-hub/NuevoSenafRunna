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

interface AdultoConviviente {
  ApellidoNombre: string
  FechaNacimiento: string
  DNI: string
  VinculoConNNYAPrincipal: string
}

interface AdultosConvivientesProps {
  adultosConvivientes: AdultoConviviente[]
  setAdultosConvivientes: React.Dispatch<React.SetStateAction<AdultoConviviente[]>>
}

export default function AdultosConvivientes({ adultosConvivientes, setAdultosConvivientes }: AdultosConvivientesProps) {
  const [newAdulto, setNewAdulto] = useState<AdultoConviviente>({
    ApellidoNombre: "",
    FechaNacimiento: "",
    DNI: "",
    VinculoConNNYAPrincipal: "",
  })

  const handleInputChange = (field: keyof AdultoConviviente, value: string) => {
    setNewAdulto({
      ...newAdulto,
      [field]: value,
    })
  }

  const handleAddAdulto = () => {
    // Validate required fields
    if (!newAdulto.ApellidoNombre || !newAdulto.DNI) {
      return
    }

    setAdultosConvivientes([...adultosConvivientes, newAdulto])

    // Reset form
    setNewAdulto({
      ApellidoNombre: "",
      FechaNacimiento: "",
      DNI: "",
      VinculoConNNYAPrincipal: "",
    })
  }

  const handleDeleteAdulto = (index: number) => {
    const updatedAdultos = [...adultosConvivientes]
    updatedAdultos.splice(index, 1)
    setAdultosConvivientes(updatedAdultos)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Adultos Convivientes
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Apellido y Nombre</TableCell>
              <TableCell>Fecha de Nacimiento</TableCell>
              <TableCell>N° de DNI</TableCell>
              <TableCell>Vínculo con NNyA principal</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adultosConvivientes.map((adulto, index) => (
              <TableRow key={index}>
                <TableCell>{adulto.ApellidoNombre}</TableCell>
                <TableCell>{adulto.FechaNacimiento}</TableCell>
                <TableCell>{adulto.DNI}</TableCell>
                <TableCell>{adulto.VinculoConNNYAPrincipal}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteAdulto(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Add new adulto row */}
            <TableRow>
              <TableCell>
                <TextField
                  value={newAdulto.ApellidoNombre}
                  onChange={(e) => handleInputChange("ApellidoNombre", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Apellido y Nombre"
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="date"
                  value={newAdulto.FechaNacimiento}
                  onChange={(e) => handleInputChange("FechaNacimiento", e.target.value)}
                  fullWidth
                  size="small"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newAdulto.DNI}
                  onChange={(e) => handleInputChange("DNI", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="DNI"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newAdulto.VinculoConNNYAPrincipal}
                  onChange={(e) => handleInputChange("VinculoConNNYAPrincipal", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Vínculo"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddAdulto}
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

