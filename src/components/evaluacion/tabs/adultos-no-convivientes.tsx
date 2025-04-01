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

interface AdultoNoConviviente {
  ApellidoNombre: string
  FechaNacimiento: string
  DNI: string
  VinculoConNNYAPrincipal: string
  Barrio: string
  Calle: string
  NumeroCasa: string
}

interface AdultosNoConvivientesProps {
  adultosNoConvivientes: AdultoNoConviviente[]
  setAdultosNoConvivientes: React.Dispatch<React.SetStateAction<AdultoNoConviviente[]>>
}

export default function AdultosNoConvivientes({
  adultosNoConvivientes,
  setAdultosNoConvivientes,
}: AdultosNoConvivientesProps) {
  const [newAdulto, setNewAdulto] = useState<AdultoNoConviviente>({
    ApellidoNombre: "",
    FechaNacimiento: "",
    DNI: "",
    VinculoConNNYAPrincipal: "",
    Barrio: "",
    Calle: "",
    NumeroCasa: "",
  })

  const handleInputChange = (field: keyof AdultoNoConviviente, value: string) => {
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

    setAdultosNoConvivientes([...adultosNoConvivientes, newAdulto])

    // Reset form
    setNewAdulto({
      ApellidoNombre: "",
      FechaNacimiento: "",
      DNI: "",
      VinculoConNNYAPrincipal: "",
      Barrio: "",
      Calle: "",
      NumeroCasa: "",
    })
  }

  const handleDeleteAdulto = (index: number) => {
    const updatedAdultos = [...adultosNoConvivientes]
    updatedAdultos.splice(index, 1)
    setAdultosNoConvivientes(updatedAdultos)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Adultos No Convivientes
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Apellido y Nombre</TableCell>
              <TableCell>Fecha de Nacimiento</TableCell>
              <TableCell>N° de DNI</TableCell>
              <TableCell>Vínculo con NNyA principal</TableCell>
              <TableCell>Barrio</TableCell>
              <TableCell>Calle</TableCell>
              <TableCell>Número</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adultosNoConvivientes.map((adulto, index) => (
              <TableRow key={index}>
                <TableCell>{adulto.ApellidoNombre}</TableCell>
                <TableCell>{adulto.FechaNacimiento}</TableCell>
                <TableCell>{adulto.DNI}</TableCell>
                <TableCell>{adulto.VinculoConNNYAPrincipal}</TableCell>
                <TableCell>{adulto.Barrio}</TableCell>
                <TableCell>{adulto.Calle}</TableCell>
                <TableCell>{adulto.NumeroCasa}</TableCell>
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
                <TextField
                  value={newAdulto.Barrio}
                  onChange={(e) => handleInputChange("Barrio", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Barrio"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newAdulto.Calle}
                  onChange={(e) => handleInputChange("Calle", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Calle"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newAdulto.NumeroCasa}
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

