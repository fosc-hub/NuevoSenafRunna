"use client"

import type React from "react"
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import DescriptionIcon from "@mui/icons-material/Description"
import EditIcon from "@mui/icons-material/Edit"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import AssignmentIcon from "@mui/icons-material/Assignment"
import { SectionCard } from "./section-card"

interface Task {
  estado: boolean
  tarea: string
  fecha: string
  objetivo: string
  plazo: string
}

interface PlanAccionSectionProps {
  tasks: Task[]
  isActive: boolean
  onAddTask: () => void
  onViewTaskDetails: (taskIndex: number) => void
  onEditTask: (taskIndex: number) => void
}

export const PlanAccionSection: React.FC<PlanAccionSectionProps> = ({
  tasks,
  isActive,
  onAddTask,
  onViewTaskDetails,
  onEditTask,
}) => {
  return (
    <SectionCard title="Plan de acción" icon={<AssignmentIcon color="primary" />} isActive={isActive}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddTask}
          sx={{
            borderRadius: 8,
            textTransform: "none",
            px: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            "&:hover": {
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            },
          }}
        >
          Añadir tarea
        </Button>
      </Box>

      <TableContainer sx={{ maxHeight: "300px" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Estado</TableCell>
              <TableCell>Tarea</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Objetivo</TableCell>
              <TableCell>Plazo</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, index) => (
              <TableRow
                key={index}
                hover
                sx={{
                  backgroundColor: task.estado ? "rgba(76, 175, 80, 0.04)" : "inherit",
                }}
              >
                <TableCell>
                  <Tooltip title={task.estado ? "Completada" : "Pendiente"}>
                    {task.estado ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                    )}
                  </Tooltip>
                </TableCell>
                <TableCell>{task.tarea}</TableCell>
                <TableCell>{task.fecha}</TableCell>
                <TableCell>{task.objetivo}</TableCell>
                <TableCell>{task.plazo}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" color="primary" onClick={() => onViewTaskDetails(index)}>
                        <DescriptionIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" color="primary" onClick={() => onEditTask(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  )
}
