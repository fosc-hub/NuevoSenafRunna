import React from "react"
import { Paper, Typography, Button, Box } from "@mui/material"

interface EmptyStateWithActionProps {
  icon?: React.ReactNode
  title: string
  actionLabel: string
  onAction: () => void
  readOnly?: boolean
}

const EmptyStateWithAction: React.FC<EmptyStateWithActionProps> = ({
  icon,
  title,
  actionLabel,
  onAction,
  readOnly = false,
}) => {
  return (
    <Paper
      sx={{
        p: 4,
        textAlign: "center",
        borderRadius: 2,
        backgroundColor: "background.paper",
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "divider",
      }}
    >
      {icon && (
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          {icon}
        </Box>
      )}
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {!readOnly && (
        <Button
          variant="outlined"
          startIcon={icon}
          onClick={onAction}
          sx={{ mt: 2, borderRadius: "20px" }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  )
}

export default EmptyStateWithAction
