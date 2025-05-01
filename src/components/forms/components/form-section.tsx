import type React from "react"
import { Box, Typography } from "@mui/material"

interface FormSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

const FormSection: React.FC<FormSectionProps> = ({ title, icon, children }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Box sx={{ mr: 1, color: "primary.main" }}>{icon}</Box>
      <Typography color="primary" variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ pl: 1 }}>{children}</Box>
  </Box>
)

export default FormSection
