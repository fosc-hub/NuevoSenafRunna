"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button, Skeleton, Popover, Box, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"
import FilterList from "@mui/icons-material/FilterList"
import { Check, Mail, FileText, Clock, Send, AlertCircle, FileCheck, Archive, Scale, Shield } from "lucide-react"

interface FilterState {
  envio_de_respuesta: "NO_NECESARIO" | "PENDIENTE" | "ENVIADO" | null
  estado_demanda:
    | "SIN_ASIGNAR"
    | "CONSTATACION"
    | "EVALUACION"
    | "PENDIENTE_AUTORIZACION"
    | "ARCHIVADA"
    | "ADMITIDA"
    | null
  tipo_demanda: "DE_PROTECCION" | "PENAL_JUVENIL" | null
}

interface ButtonsProps {
  isLoading: boolean
  handleNuevoRegistro: () => void
  onFilterChange: (filters: FilterState) => void
}

const Buttons: React.FC<ButtonsProps> = ({ isLoading, handleNuevoRegistro, onFilterChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [filterState, setFilterState] = useState<FilterState>({
    envio_de_respuesta: null,
    estado_demanda: null,
    tipo_demanda: null,
  })

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    setAnchorEl(null)
  }

  const handleFilterChange = (category: keyof FilterState, value: FilterState[keyof FilterState]) => {
    const newState = {
      ...filterState,
      [category]: filterState[category] === value ? null : value,
    }
    setFilterState(newState)
    onFilterChange(newState)
    // Don't close the popover to allow multiple selections
  }

  const clearFilters = () => {
    const newState = {
      envio_de_respuesta: null,
      estado_demanda: null,
      tipo_demanda: null,
    }
    setFilterState(newState)
    onFilterChange(newState)
  }

  return (
    <div className="flex gap-4">
      {isLoading ? (
        <>
          <Skeleton variant="rectangular" width={150} height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </>
      ) : (
        <>
          <Link href="/nuevoingreso" passHref>
            <Button
              component="a"
              variant="contained"
              onClick={handleNuevoRegistro}
              sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
            >
              + Nuevo Registro
            </Button>
          </Link>

          <Button
            onClick={handleFilterClick}
            variant="outlined"
            size="small"
            className="flex items-center gap-2 px-4 py-2 bg-white"
            sx={{
              border: "1px solid rgba(0, 0, 0, 0.12)",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
              borderRadius: "4px",
              "&:hover": {
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <FilterList className="h-4 w-4" />
            <span>Filtros</span>
          </Button>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleFilterClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            PaperProps={{
              sx: {
                width: 280,
                maxHeight: 400,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                mt: 1,
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <div className="flex justify-between items-center mb-4">
                <Typography variant="subtitle1" fontWeight="bold">
                  Filtros
                </Typography>
                <Button size="small" onClick={clearFilters}>
                  Limpiar
                </Button>
              </div>

              <List disablePadding>
                {/* Envío de Respuesta Section */}
                <ListItem sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Envío de Respuesta
                  </Typography>
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("envio_de_respuesta", "NO_NECESARIO")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Mail className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="No Necesario" />
                  {filterState.envio_de_respuesta === "NO_NECESARIO" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("envio_de_respuesta", "PENDIENTE")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Clock className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Pendiente" />
                  {filterState.envio_de_respuesta === "PENDIENTE" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("envio_de_respuesta", "ENVIADO")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Send className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Enviado" />
                  {filterState.envio_de_respuesta === "ENVIADO" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                {/* Estado Demanda Section */}
                <ListItem sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado Demanda
                  </Typography>
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("estado_demanda", "SIN_ASIGNAR")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AlertCircle className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Sin Asignar" />
                  {filterState.estado_demanda === "SIN_ASIGNAR" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("estado_demanda", "CONSTATACION")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FileText className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Constatación" />
                  {filterState.estado_demanda === "CONSTATACION" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("estado_demanda", "EVALUACION")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FileCheck className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Evaluación" />
                  {filterState.estado_demanda === "EVALUACION" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("estado_demanda", "PENDIENTE_AUTORIZACION")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Clock className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Pendiente Autorización" />
                  {filterState.estado_demanda === "PENDIENTE_AUTORIZACION" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("estado_demanda", "ARCHIVADA")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Archive className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Archivada" />
                  {filterState.estado_demanda === "ARCHIVADA" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem button onClick={() => handleFilterChange("estado_demanda", "ADMITIDA")} sx={{ py: 1, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FileCheck className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Admitida" />
                  {filterState.estado_demanda === "ADMITIDA" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                {/* Tipo Demanda Section */}
                <ListItem sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo Demanda
                  </Typography>
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("tipo_demanda", "DE_PROTECCION")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Shield className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="De Protección" />
                  {filterState.tipo_demanda === "DE_PROTECCION" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("tipo_demanda", "PENAL_JUVENIL")}
                  sx={{ py: 1, px: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Scale className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Penal Juvenil" />
                  {filterState.tipo_demanda === "PENAL_JUVENIL" && <Check className="h-4 w-4 text-primary" />}
                </ListItem>
              </List>
            </Box>
          </Popover>
        </>
      )}
    </div>
  )
}

export default Buttons

