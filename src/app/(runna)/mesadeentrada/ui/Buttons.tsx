"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button, Skeleton, Popover, Box, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"
import FilterList from "@mui/icons-material/FilterList"
import {
  Check,
  Archive,
  ImageOffIcon as PersonOffIcon,
  UserCheckIcon as PersonCheckIcon,
  ClipboardCheck,
  Star,
  FileCheck,
  Mail,
  MailOpen,
  SlidersHorizontal,
} from "lucide-react"
import SearchModal from "./SearchModal"

interface ButtonsProps {
  isLoading: boolean
  handleNuevoRegistro: () => void
  filterState: {
    todos: boolean
    sinAsignar: boolean
    asignados: boolean
    archivados: boolean
    completados: boolean
    sinLeer: boolean
    leidos: boolean
    constatados: boolean
    evaluados: boolean
  }
  setFilterState: React.Dispatch<React.SetStateAction<ButtonsProps["filterState"]>>
  user: {
    is_superuser: boolean
    all_permissions: Array<{ codename: string }>
  }
}

const Buttons: React.FC<ButtonsProps> = ({ isLoading, handleNuevoRegistro, filterState, setFilterState, user }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    setAnchorEl(null)
  }

  const handleFilterChange = (key: keyof typeof filterState) => {
    setFilterState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
      todos: false, // Uncheck 'Todos' when any other filter is selected
    }))
  }

  const handleTodosChange = () => {
    setFilterState((prevState) => ({
      ...Object.keys(prevState).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      todos: !prevState.todos,
    }))
  }

  const handleOpenSearchModal = () => {
    setIsSearchModalOpen(true)
  }

  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false)
  }

  return (
    <div className="flex gap-4">
      {isLoading ? (
        <>
          <Skeleton variant="rectangular" width={150} height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="rectangular" width={130} height={40} />
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

          <Button
            onClick={handleOpenSearchModal}
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
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtros avanzados</span>
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
            <Box
              sx={{
                maxHeight: 400,
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <List disablePadding>
                <ListItem sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                </ListItem>

                <ListItem
                  button
                  onClick={handleTodosChange}
                  sx={{
                    py: 1,
                    px: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Star className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Todos" />
                  {filterState?.todos && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("sinAsignar")}
                  sx={{
                    py: 1,
                    px: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonOffIcon className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Sin Asignar" />
                  {filterState?.sinAsignar && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("asignados")}
                  sx={{
                    py: 1,
                    px: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonCheckIcon className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Asignados" />
                  {filterState?.asignados && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Proceso
                  </Typography>
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("constatados")}
                  sx={{
                    py: 1,
                    px: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ClipboardCheck className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Constatados" />
                  {filterState?.constatados && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("evaluados")}
                  sx={{
                    py: 1,
                    px: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FileCheck className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Evaluados" />
                  {filterState?.evaluados && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Archivo
                  </Typography>
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("archivados")}
                  sx={{
                    py: 1,
                    px: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Archive className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Archivados" />
                  {filterState?.archivados && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                <ListItem
                  button
                  onClick={() => handleFilterChange("completados")}
                  sx={{
                    py: 1,
                    px: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FileCheck className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText primary="Completados" />
                  {filterState?.completados && <Check className="h-4 w-4 text-primary" />}
                </ListItem>

                {!user?.is_superuser && !user?.all_permissions.some((p) => p.codename === "add_tdemandaasignado") && (
                  <>
                    <ListItem sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Lectura
                      </Typography>
                    </ListItem>

                    <ListItem
                      button
                      onClick={() => handleFilterChange("sinLeer")}
                      sx={{
                        py: 1,
                        px: 2,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Mail className="h-4 w-4" />
                      </ListItemIcon>
                      <ListItemText primary="Sin Leer" />
                      {filterState?.sinLeer && <Check className="h-4 w-4 text-primary" />}
                    </ListItem>

                    <ListItem
                      button
                      onClick={() => handleFilterChange("leidos")}
                      sx={{
                        py: 1,
                        px: 2,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MailOpen className="h-4 w-4" />
                      </ListItemIcon>
                      <ListItemText primary="Leídos" />
                      {filterState?.leidos && <Check className="h-4 w-4 text-primary" />}
                    </ListItem>
                  </>
                )}
              </List>
            </Box>
          </Popover>
          <SearchModal open={isSearchModalOpen} onClose={handleCloseSearchModal} />
        </>
      )}
    </div>
  )
}

export default Buttons

