"use client"

import type React from "react"

import { Paper, Typography, TextField } from "@mui/material"

interface DescripcionSituacionProps {
  descripcion: string
  setDescripcion: React.Dispatch<React.SetStateAction<string>>
  disabled?: boolean
}

export default function DescripcionSituacion({ descripcion, setDescripcion, disabled = false }: DescripcionSituacionProps) {
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
        disabled={disabled}
      />
    </Paper>
  )
}

