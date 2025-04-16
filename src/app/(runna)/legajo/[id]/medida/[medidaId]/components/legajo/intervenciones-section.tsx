"use client"

import type React from "react"
import { Typography, Paper, Box, Button } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import AttachFileIcon from "@mui/icons-material/AttachFile"

interface Intervencion {
  fecha: string
  descripcion: string
  hora: string
}

interface IntervencionesSectionProps {
  intervenciones: Intervencion[]
  onAddIntervencion: () => void
  onViewAttachment: (fileName: string) => void
}

export const IntervencionesSection: React.FC<IntervencionesSectionProps> = ({
  intervenciones,
  onAddIntervencion,
  onViewAttachment,
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        borderRadius: 2,
      }}
    >
      {intervenciones.map((intervencion, index) => (
        <Box
          key={index}
          sx={{
            mb: 3,
            pb: 3,
            borderLeft: "3px solid #2196f3",
            pl: 3,
            position: "relative",
            "&:not(:last-child)": {
              borderBottom: "1px solid #e0e0e0",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {intervencion.fecha}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ backgroundColor: "#f5f5f5", px: 1, py: 0.5, borderRadius: 1 }}
            >
              {intervencion.hora}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ my: 1 }}>
            {intervencion.descripcion}
          </Typography>

          {intervencion.descripcion.includes("adjunta") && (
            <Button
              size="small"
              startIcon={<AttachFileIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                color: "primary.main",
              }}
              onClick={() => {
                const fileName = intervencion.descripcion.split("adjunta ")[1]
                onViewAttachment(fileName)
              }}
            >
              Ver adjunto
            </Button>
          )}
        </Box>
      ))}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          sx={{ textTransform: "none" }}
          startIcon={<AddIcon />}
          onClick={onAddIntervencion}
        >
          Agregar nueva intervención
        </Button>
      </Box>
    </Paper>
  )
}
