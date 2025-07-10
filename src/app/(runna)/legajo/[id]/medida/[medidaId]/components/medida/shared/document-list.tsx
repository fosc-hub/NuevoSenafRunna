"use client"

import type React from "react"
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Button,
    IconButton
} from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import DownloadIcon from "@mui/icons-material/Download"
import AttachFileIcon from "@mui/icons-material/AttachFile"

interface DocumentItem {
    id: string
    label: string
    checked?: boolean
    additionalText?: string
    showAttachButton?: boolean
    attachButtonText?: string
    onAttachClick?: () => void
    files?: string[]
    onCheckChange?: (checked: boolean) => void
}

interface DocumentListProps {
    documents: DocumentItem[]
    showActionButtons?: boolean
    actionButtonText?: string
    onActionClick?: () => void
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    showActionButtons = false,
    actionButtonText = "Cargar informes",
    onActionClick
}) => {
    return (
        <Box>
            {showActionButtons && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onActionClick}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        {actionButtonText}
                    </Button>
                </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {documents.map((doc) => (
                    <Box key={doc.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {doc.checked !== undefined && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={doc.checked}
                                            onChange={(e) => doc.onCheckChange?.(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label=""
                                    sx={{ mr: 1 }}
                                />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {doc.label}
                            </Typography>
                            {doc.additionalText && (
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                    {doc.additionalText}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {doc.showAttachButton && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={doc.onAttachClick}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: 2,
                                    }}
                                >
                                    {doc.attachButtonText || "Adjuntar"}
                                </Button>
                            )}

                            {doc.files?.map((file, index) => (
                                <Button
                                    key={index}
                                    variant="outlined"
                                    size="small"
                                    startIcon={<DescriptionIcon />}
                                    sx={{
                                        borderColor: "#4db6ac",
                                        color: "#4db6ac",
                                        textTransform: "none",
                                        borderRadius: 2,
                                    }}
                                >
                                    {file}
                                </Button>
                            ))}

                            {doc.files && doc.files.length > 0 && (
                                <IconButton size="small">
                                    <DownloadIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    )
} 