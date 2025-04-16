import type React from "react"
import { Box, Typography, Divider, Paper, Chip } from "@mui/material"

interface SectionCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  isActive?: boolean
  isCompleted?: boolean
  elevation?: number
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  children,
  isActive = false,
  isCompleted = false,
  elevation = 2,
}) => {
  return (
    <Paper
      elevation={elevation}
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
        border: isActive ? "2px solid #2196f3" : "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {icon}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, ml: 1 }}>
          {title}
        </Typography>
        {isCompleted && <Chip label="COMPLETADO" color="success" size="small" sx={{ ml: "auto", fontWeight: 500 }} />}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {children}
    </Paper>
  )
}
