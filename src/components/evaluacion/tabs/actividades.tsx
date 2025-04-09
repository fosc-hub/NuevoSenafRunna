"use client"

import type React from "react"

import { Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material"

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
            </TableRow>
          </TableHead>
          <TableBody>
            {actividades.map((actividad, index) => (
              <TableRow key={index}>
                <TableCell>{actividad.FechaHora}</TableCell>
                <TableCell>{actividad.TipoActividad}</TableCell>
                <TableCell>{actividad.Institucion}</TableCell>
                <TableCell>{actividad.Descripcion}</TableCell>
              </TableRow>
            ))}
            {actividades.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay actividades registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
