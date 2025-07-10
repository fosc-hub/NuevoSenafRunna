"use client"

import type React from "react"
import {
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DescriptionIcon from "@mui/icons-material/Description"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useRouter } from "next/navigation"

interface MedidaHistorial {
  medida?: string
  fecha_alta: string
  duracion: string
  equipo: string
  juzgado: string
  dispositivo: string
  fecha_cierre: string
  legajos_afectado?: string
}

interface HistorialMedidasProps {
  legajoId: string
  historialMedidas: {
    MPI: MedidaHistorial[]
    MPE: MedidaHistorial[]
    MPJ: MedidaHistorial[]
  }
}

export const HistorialMedidasSection: React.FC<HistorialMedidasProps> = ({ legajoId, historialMedidas }) => {
  const router = useRouter()

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
      {/* MPI Section */}
      <MedidaAccordion
        title="MPI"
        color="primary"
        bgColor="#e3f2fd"
        items={historialMedidas.MPI}
        count={historialMedidas.MPI.length}
        legajoId={legajoId}
        defaultExpanded
      />

      {/* MPE Section */}
      <MedidaAccordion
        title="MPE"
        color="success"
        bgColor="#e8f5e9"
        items={historialMedidas.MPE}
        count={historialMedidas.MPE.length}
        legajoId={legajoId}
        showLegajosAfectados
      />

      {/* MPJ Section */}
      <MedidaAccordion
        title="MPJ"
        color="warning"
        bgColor="#fff3e0"
        items={historialMedidas.MPJ}
        count={historialMedidas.MPJ.length}
        legajoId={legajoId}
      />
    </Paper>
  )
}

interface MedidaAccordionProps {
  title: string
  color: "primary" | "success" | "warning" | "error" | "info" | "default"
  bgColor: string
  items: MedidaHistorial[]
  count: number
  legajoId: string
  defaultExpanded?: boolean
  showLegajosAfectados?: boolean
}

const MedidaAccordion: React.FC<MedidaAccordionProps> = ({
  title,
  color,
  bgColor,
  items,
  count,
  legajoId,
  defaultExpanded = false,
  showLegajosAfectados = false,
}) => {
  const router = useRouter()

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={{
        "&:before": {
          display: "none",
        },
        boxShadow: "none",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        overflow: "hidden",
        mb: 2,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${title.toLowerCase()}-content`}
        id={`${title.toLowerCase()}-header`}
        sx={{
          backgroundColor: bgColor,
          "&.Mui-expanded": {
            minHeight: "48px",
          },
          "& .MuiAccordionSummary-content.Mui-expanded": {
            margin: "12px 0",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Chip label={title} color={color} size="small" sx={{ mr: 2, fontWeight: "bold" }} />
          <Typography>Cantidad ({count})</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <TableContainer sx={{ maxHeight: "400px" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                {title !== "MPE" && <TableCell>Medida</TableCell>}
                <TableCell>Fecha alta</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Equipo</TableCell>
                <TableCell>Juzgado</TableCell>
                <TableCell>Dispositivo</TableCell>
                <TableCell>Fecha cierre</TableCell>
                {showLegajosAfectados && <TableCell>Legajos afectado</TableCell>}
                <TableCell>Informe</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} hover>
                  {title !== "MPE" && <TableCell>{item.medida}</TableCell>}
                  <TableCell>{item.fecha_alta}</TableCell>
                  <TableCell>{item.duracion}</TableCell>
                  <TableCell>{item.equipo}</TableCell>
                  <TableCell>{item.juzgado}</TableCell>
                  <TableCell>{item.dispositivo}</TableCell>
                  <TableCell>{item.fecha_cierre}</TableCell>
                  {showLegajosAfectados && <TableCell>{item.legajos_afectado}</TableCell>}
                  <TableCell>
                    <IconButton size="small">
                      <DescriptionIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      sx={{
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.15)",
                        },
                      }}
                      onClick={() => {
                        const path =
                          title === "MPE"
                            ? `/legajo/${legajoId}/medida/mpe`
                            : `/legajo/${legajoId}/medida/${item.medida}_${item.fecha_alta.replace(/\//g, "-")}`
                        router.push(path)
                      }}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  )
}
