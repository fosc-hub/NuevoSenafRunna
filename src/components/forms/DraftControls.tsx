"use client"

import type React from "react"

import { useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { useDraftStore } from "./utils/userDraftStore"

interface DraftControlsProps {
  formId: string
  onLoadDraft: () => void
  onClearDraft: () => void
}

export const DraftControls: React.FC<DraftControlsProps> = ({ formId, onLoadDraft, onClearDraft }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const { getDraft, clearDraft } = useDraftStore()

  const hasDraft = Boolean(getDraft(formId))

  const handleClearDraft = () => {
    clearDraft(formId)
    onClearDraft()
    setOpenDialog(false)
  }

  return (
    <>
      {hasDraft && (
        <div className="flex gap-2 mb-4">
          <Button variant="outlined" color="primary" onClick={onLoadDraft}>
            Cargar borrador guardado
          </Button>
          <Button variant="outlined" color="error" onClick={() => setOpenDialog(true)}>
            Eliminar borrador
          </Button>
        </div>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar el borrador guardado? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleClearDraft} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

