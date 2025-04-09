"use client"

import type React from "react"

import { Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material"

interface Motivo {
  Motivos: string
}

interface MotivosActuacionProps {
  motivos: Motivo[]
  setMotivos: React.Dispatch<React.SetStateAction<Motivo[]>>
}

export default function MotivosActuacion({ motivos, setMotivos }: MotivosActuacionProps) {
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
            </TableRow>
          </TableHead>
          <TableBody>
            {motivos.map((motivo, index) => (
              <TableRow key={index}>
                <TableCell>{motivo.Motivos}</TableCell>
              </TableRow>
            ))}
            {motivos.length === 0 && (
              <TableRow>
                <TableCell align="center">No hay motivos registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
