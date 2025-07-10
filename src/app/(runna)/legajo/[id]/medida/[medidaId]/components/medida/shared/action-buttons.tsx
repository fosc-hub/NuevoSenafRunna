"use client"

import type React from "react"
import {
    Box,
    Button
} from "@mui/material"

interface ActionButtonsProps {
    showApprovalButtons?: boolean
    onApprove?: () => void
    onObserve?: () => void
    onCancel?: () => void
    approveText?: string
    observeText?: string
    cancelText?: string
    customButtons?: Array<{
        text: string
        variant: "contained" | "outlined"
        color: "primary" | "secondary" | "success" | "error" | "warning" | "info"
        onClick: () => void
    }>
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    showApprovalButtons = false,
    onApprove,
    onObserve,
    onCancel,
    approveText = "Aprobado",
    observeText = "Observar",
    cancelText = "Anulado",
    customButtons = []
}) => {
    if (!showApprovalButtons && customButtons.length === 0) {
        return null
    }

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            {showApprovalButtons ? (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onApprove}
                        sx={{
                            flex: 1,
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        {approveText}
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={onObserve}
                        sx={{
                            flex: 1,
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        {observeText}
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={onCancel}
                        sx={{
                            flex: 1,
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        {cancelText}
                    </Button>
                </>
            ) : (
                customButtons.map((button, index) => (
                    <Button
                        key={index}
                        variant={button.variant}
                        color={button.color}
                        onClick={button.onClick}
                        sx={{
                            flex: 1,
                            textTransform: "none",
                            borderRadius: 2,
                        }}
                    >
                        {button.text}
                    </Button>
                ))
            )}
        </Box>
    )
} 