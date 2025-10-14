"use client"

import React from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Box,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import RegistroLegajoForm from "./RegistroLegajoForm"

interface RegistroLegajoModalProps {
    open: boolean
    onClose: () => void
    onSuccess?: (data: any) => void
    initialData?: any
    isEditing?: boolean
    legajoId?: number
}

const RegistroLegajoModal: React.FC<RegistroLegajoModalProps> = ({
    open,
    onClose,
    onSuccess,
    initialData,
    isEditing = false,
    legajoId,
}) => {
    const handleSuccess = (data: any) => {
        onSuccess?.(data)
        onClose()
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    minHeight: "80vh",
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Box sx={{ flex: 1 }} />
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: "text.secondary",
                        "&:hover": {
                            color: "text.primary",
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 0 }}>
                <RegistroLegajoForm
                    onSuccess={handleSuccess}
                    onCancel={onClose}
                    initialData={initialData}
                    isEditing={isEditing}
                    legajoId={legajoId}
                />
            </DialogContent>
        </Dialog>
    )
}

export default RegistroLegajoModal
