"use client"

import type React from "react"
import { useState } from "react"
import { Modal, Box, Tab, Tabs, Typography, Button } from "@mui/material"

interface AsignarModalProps {
  open: boolean
  onClose: () => void
  demandaId: number | null
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" color="text.primary">
            {children}
          </Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

const AsignarModal: React.FC<AsignarModalProps> = ({ open, onClose, demandaId }) => {
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="asignar-modal-title"
      aria-describedby="asignar-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: 800,
          minHeight: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}
      >
        <Typography
          id="asignar-modal-title"
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            color: "text.primary",
            fontWeight: 500,
            mb: 3,
          }}
        >
          Asignar Demanda {demandaId}
        </Typography>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 3,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="asignar tabs"
            sx={{
              "& .MuiTab-root": {
                fontSize: "1rem",
                fontWeight: 500,
                color: "text.primary",
                textTransform: "uppercase",
              },
              "& .Mui-selected": {
                color: "primary.main",
              },
            }}
          >
            <Tab label="Asignar" {...a11yProps(0)} />
            <Tab label="Ver asignados" {...a11yProps(1)} />
            <Tab label="Historia" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
            Contenido para asignar la demanda
          </Typography>
          {/* Add form or content for assigning the demand */}
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
            Lista de asignados a esta demanda
          </Typography>
          {/* Add list or table of assigned people */}
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
            Historial de asignaciones para esta demanda
          </Typography>
          {/* Add table or list of assignment history */}
        </TabPanel>
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={onClose}
            variant="contained"
            size="large"
            sx={{
              fontSize: "1rem",
              fontWeight: 500,
              px: 4,
            }}
          >
            Cerrar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default AsignarModal

