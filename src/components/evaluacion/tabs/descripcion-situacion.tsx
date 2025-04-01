"use client"

import type React from "react"

import { Paper, Typography, TextField } from "@mui/material"

interface DescripcionSituacionProps {
  descripcion: string
  setDescripcion: React.Dispatch<React.SetStateAction<string>>
}

export default function DescripcionSituacion({ descripcion, setDescripcion }: DescripcionSituacionProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Descripción de la Situación
      </Typography>
      <TextField
        value={descripcion || ""}
        onChange={(e) => setDescripcion(e.target.value)}
        multiline
        rows={6}
        fullWidth
        variant="outlined"
        placeholder="Ingrese la descripción de la situación"
      />
    </Paper>
  )
}

