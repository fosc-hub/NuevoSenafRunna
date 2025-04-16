"use client"

import type React from "react"
import { Box, Typography, IconButton, Tooltip } from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import DownloadIcon from "@mui/icons-material/Download"
import { SectionCard } from "./section-card"

interface UltimoInformeSectionProps {
  data: {
    fecha: string
    autor: string
    archivo: string
  }
  onViewAttachment: (fileName: string) => void
  onDownload: (fileName: string) => void
}

export const UltimoInformeSection: React.FC<UltimoInformeSectionProps> = ({ data, onViewAttachment, onDownload }) => {
  return (
    <SectionCard title="Último informe" icon={<DescriptionIcon color="primary" />}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Fecha:</strong> {data.fecha}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        <strong>Autor:</strong> {data.autor}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          bgcolor: "#f5f5f5",
          borderRadius: 2,
          border: "1px dashed #ccc",
          transition: "background-color 0.2s ease",
          "&:hover": {
            backgroundColor: "#e3f2fd",
            cursor: "pointer",
          },
        }}
        onClick={() => onViewAttachment(data.archivo)}
      >
        <DescriptionIcon sx={{ mr: 1 }} />
        <Typography variant="body2">{data.archivo}</Typography>
        <Box sx={{ ml: "auto", display: "flex" }}>
          <Tooltip title="Descargar">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation()
                onDownload(data.archivo)
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </SectionCard>
  )
}
