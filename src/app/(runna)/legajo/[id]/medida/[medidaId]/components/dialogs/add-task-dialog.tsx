"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material"

export interface NewTask {
  tarea: string
  objetivo: string
  plazo: string
}

interface AddTaskDialogProps {
  open: boolean
  initialTask?: NewTask
  onClose: () => void
  onSave: (task: NewTask) => void
  isEditing?: boolean
}

export const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  open,
  initialTask = { tarea: "", objetivo: "", plazo: "" },
  onClose,
  onSave,
  isEditing = false,
}) => {
  const [task, setTask] = useState<NewTask>(initialTask)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setTask((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target
    setTask((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    onSave(task)
    setTask({ tarea: "", objetivo: "", plazo: "" })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Editar tarea" : "Añadir nueva tarea"}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            id="tarea"
            name="tarea"
            label="Tarea"
            type="text"
            fullWidth
            variant="outlined"
            value={task.tarea}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="objetivo"
            name="objetivo"
            label="Objetivo"
            type="text"
            fullWidth
            variant="outlined"
            value={task.objetivo}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel id="plazo-label">Plazo</InputLabel>
            <Select
              labelId="plazo-label"
              id="plazo"
              name="plazo"
              value={task.plazo}
              onChange={handleSelectChange}
              label="Plazo"
            >
              <MenuItem value="1 semana">1 semana</MenuItem>
              <MenuItem value="2 semanas">2 semanas</MenuItem>
              <MenuItem value="1 mes">1 mes</MenuItem>
              <MenuItem value="3 meses">3 meses</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          sx={{
            borderRadius: 8,
            textTransform: "none",
          }}
        >
          {isEditing ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
