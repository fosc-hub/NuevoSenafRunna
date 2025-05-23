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
  Chip,
  Box,
} from "@mui/material"

interface Antecedente {
  IdDemandaVinculada: string
  NumerosDemanda?: string
}

interface AntecedentesDemandaProps {
  antecedentes: Antecedente[]
  setAntecedentes: React.Dispatch<React.SetStateAction<Antecedente[]>>
}

export default function AntecedentesDemanda({ antecedentes, setAntecedentes }: AntecedentesDemandaProps) {
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
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {antecedentes.map((antecedente, index) => (
              <TableRow key={index}>
                <TableCell>{antecedente.IdDemandaVinculada}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip label="Vinculada" color="primary" size="small" />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {antecedentes.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No hay antecedentes registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
