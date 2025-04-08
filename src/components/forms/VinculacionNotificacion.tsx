"use client"

import type React from "react"
import { Snackbar, Alert, Typography, Box, Button } from "@mui/material"

interface VinculacionResult {
  demanda_ids: number[]
  match_descriptions: string[]
}

interface VinculacionNotificationProps {
  open: boolean
  onClose: () => void
  vinculacionResults: VinculacionResult | null
}

const VinculacionNotification: React.FC<VinculacionNotificationProps> = ({ open, onClose, vinculacionResults }) => {
  if (!vinculacionResults) return null

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity="info" sx={{ width: "100%" }}>
        <Typography variant="body2" gutterBottom>
          Se encontraron coincidencias con demandas existentes:
        </Typography>
        {vinculacionResults.demanda_ids.map((demandaId, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2">
              {vinculacionResults.match_descriptions[index]}
              <Button
                component="a"
                href={`http://localhost:3000/demanda/${demandaId}`}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="outlined"
                sx={{ ml: 2 }}
              >
                Ver demanda
              </Button>
            </Typography>
          </Box>
        ))}
      </Alert>
    </Snackbar>
  )
}

export default VinculacionNotification
