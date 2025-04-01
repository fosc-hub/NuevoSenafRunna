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

interface Antecedente {
  IdDemandaVinculada: string
  NumerosDemanda: string
}

interface AntecedentesDemandaProps {
  antecedentes: Antecedente[]
  setAntecedentes: React.Dispatch<React.SetStateAction<Antecedente[]>>
}

export default function AntecedentesDemanda({ antecedentes, setAntecedentes }: AntecedentesDemandaProps) {
  const [newAntecedente, setNewAntecedente] = useState<Antecedente>({
    IdDemandaVinculada: "",
    NumerosDemanda: "",
  })

  const handleInputChange = (field: keyof Antecedente, value: string) => {
    setNewAntecedente({
      ...newAntecedente,
      [field]: value,
    })
  }

  const handleAddAntecedente = () => {
    // Validate required fields
    if (!newAntecedente.IdDemandaVinculada && !newAntecedente.NumerosDemanda) {
      return
    }

    setAntecedentes([...antecedentes, newAntecedente])

    // Reset form
    setNewAntecedente({
      IdDemandaVinculada: "",
      NumerosDemanda: "",
    })
  }

  const handleDeleteAntecedente = (index: number) => {
    const updatedAntecedentes = [...antecedentes]
    updatedAntecedentes.splice(index, 1)
    setAntecedentes(updatedAntecedentes)
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Antecedentes de la Demanda
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Demanda Vinculada</TableCell>
              <TableCell>Números de Demanda</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {antecedentes.map((antecedente, index) => (
              <TableRow key={index}>
                <TableCell>{antecedente.IdDemandaVinculada}</TableCell>
                <TableCell>{antecedente.NumerosDemanda}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteAntecedente(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Add new antecedente row */}
            <TableRow>
              <TableCell>
                <TextField
                  value={newAntecedente.IdDemandaVinculada}
                  onChange={(e) => handleInputChange("IdDemandaVinculada", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="ID Demanda Vinculada"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newAntecedente.NumerosDemanda}
                  onChange={(e) => handleInputChange("NumerosDemanda", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Números de Demanda"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddAntecedente}
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

