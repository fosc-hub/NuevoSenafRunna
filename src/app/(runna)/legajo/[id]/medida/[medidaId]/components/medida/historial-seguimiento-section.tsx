"use client"

import type React from "react"
import { Box, Button, List, ListItem, ListItemText, Typography, IconButton, Tooltip } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import EventNoteIcon from "@mui/icons-material/EventNote"
import { SectionCard } from "./section-card"

interface SeguimientoItem {
  fecha: string
  descripcion: string
  hora: string
}

interface HistorialSeguimientoSectionProps {
  items: SeguimientoItem[]
  onAddSeguimiento: () => void
  onViewAttachment: (fileName: string) => void
}

export const HistorialSeguimientoSection: React.FC<HistorialSeguimientoSectionProps> = ({
  items,
  onAddSeguimiento,
  onViewAttachment,
}) => {
  return (
    <SectionCard title="Historial de seguimiento" icon={<EventNoteIcon color="primary" />}>
      <List sx={{ p: 0, maxHeight: "300px", overflow: "auto" }}>
        {items.map((item, index) => (
          <ListItem
            key={index}
            alignItems="flex-start"
            sx={{
              px: 0,
              py: 1,
              borderLeft: "2px solid #2196f3",
              pl: 2,
              mb: 2,
              transition: "background-color 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(33, 150, 243, 0.04)",
              },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.fecha}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ backgroundColor: "#f5f5f5", px: 1, py: 0.5, borderRadius: 1 }}
                  >
                    {item.hora}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography variant="body2" component="span" sx={{ mt: 1, display: "block" }}>
                  {item.descripcion}
                </Typography>
              }
            />
            {item.descripcion.includes("adjunta") && (
              <Tooltip title="Ver adjunto">
                <IconButton
                  size="small"
                  sx={{ color: "primary.main", ml: 1 }}
                  onClick={() => {
                    const fileName = item.descripcion.split("adjunta ")[1]
                    onViewAttachment(fileName)
                  }}
                >
                  <AttachFileIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddSeguimiento}
          sx={{
            textTransform: "none",
            borderRadius: 8,
          }}
        >
          Agregar seguimiento
        </Button>
      </Box>
    </SectionCard>
  )
}
