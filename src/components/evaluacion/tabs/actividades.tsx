"use client"

import type React from "react"

import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  Box,
  IconButton,
  Chip,
} from "@mui/material"
import { KeyboardArrowDown, KeyboardArrowUp, AttachFile as AttachFileIcon } from "@mui/icons-material"
import { useState } from "react"

interface Actividad {
  FechaHora: string
  TipoActividad: string
  Institucion: string
  Descripcion: string
  by_user?: any
  adjuntos?: any[]
  fecha_y_hora_manual?: string
}

interface ActividadesProps {
  actividades: Actividad[]
  setActividades: React.Dispatch<React.SetStateAction<Actividad[]>>
}

// Componente para una fila de actividad con detalles expandibles
function ActividadRow({ actividad, index }: { actividad: Actividad; index: number }) {
  const [open, setOpen] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://web-runna-v2legajos.up.railway.app/api"

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{actividad.FechaHora}</TableCell>
        <TableCell>{actividad.TipoActividad}</TableCell>
        <TableCell>{actividad.Institucion}</TableCell>
        <TableCell>{actividad.Descripcion}</TableCell>
        <TableCell>
          {actividad.adjuntos && actividad.adjuntos.length > 0 && (
            <Chip
              icon={<AttachFileIcon />}
              label={actividad.adjuntos.length}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, py: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalles adicionales
              </Typography>
              <Table size="small" aria-label="detalles">
                <TableHead>
                  <TableRow>
                    <TableCell>Campo</TableCell>
                    <TableCell>Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {actividad.by_user && (
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Usuario
                      </TableCell>
                      <TableCell>
                        {actividad.by_user.first_name} {actividad.by_user.last_name} ({actividad.by_user.username})
                      </TableCell>
                    </TableRow>
                  )}
                  {actividad.fecha_y_hora_manual && (
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Fecha y hora manual
                      </TableCell>
                      <TableCell>{actividad.fecha_y_hora_manual}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {actividad.adjuntos && actividad.adjuntos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Archivos adjuntos:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {actividad.adjuntos.map((adjunto, idx) => {
                      // Extraer el nombre del archivo de la ruta
                      const fileName = adjunto.archivo ? adjunto.archivo.split("/").pop() : `Adjunto ${idx + 1}`
                      // Use relative path for constructing URL to avoid doubling protocol
                      const apiBase = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl
                      const fileUrl = adjunto.archivo ? `${apiBase}${adjunto.archivo}` : "#"

                      return (
                        <Chip
                          key={idx}
                          icon={<AttachFileIcon />}
                          label={fileName}
                          component="a"
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          clickable
                          variant="outlined"
                          sx={{ maxWidth: "100%", overflow: "hidden" }}
                        />
                      )
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default function Actividades({ actividades, setActividades }: ActividadesProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Actividades
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="50px" />
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Tipo de Actividad</TableCell>
              <TableCell>Institución</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Adjuntos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actividades.map((actividad, index) => (
              <ActividadRow key={index} actividad={actividad} index={index} />
            ))}
            {actividades.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay actividades registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
