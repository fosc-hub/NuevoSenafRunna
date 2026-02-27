"use client"

import type React from "react"
import {
    Box,
    Typography,
    Paper,
    Chip,
    IconButton,
    Button
} from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"

interface SectionCardProps {
    title: string
    chips?: Array<{
        label: string
        color: "primary" | "secondary" | "success" | "error" | "warning" | "info"
        variant?: "filled" | "outlined"
    }>
    date?: string
    additionalInfo?: string[]
    showMessageButton?: boolean
    onMessageClick?: () => void
    showCheckIcon?: boolean
    headerActions?: React.ReactNode
    children: React.ReactNode
    highlight?: boolean
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    chips = [],
    date,
    additionalInfo = [],
    showMessageButton = false,
    onMessageClick,
    showCheckIcon = false,
    headerActions,
    children,
    highlight = false
}) => {
    return (
        <Paper
            elevation={highlight ? 4 : 2}
            sx={{
                p: 2,
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                ...(highlight && {
                    borderLeft: '6px solid',
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(0, 80, 140, 0.02)',
                })
            }}
        >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                        {title}
                    </Typography>
                    {chips.map((chip, index) => (
                        <Chip
                            key={index}
                            label={chip.label}
                            color={chip.color}
                            variant={chip.variant || "filled"}
                            size="small"
                            sx={{ ml: index === 0 ? 0 : 1 }}
                        />
                    ))}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {headerActions}
                    {showMessageButton && (
                        <IconButton
                            onClick={onMessageClick}
                            sx={{
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                }
                            }}
                        >
                            <DescriptionIcon />
                        </IconButton>
                    )}
                    {showCheckIcon && (
                        <IconButton sx={{ color: 'success.main' }}>
                            <CheckCircleIcon />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* Date and additional info */}
            {(date || additionalInfo.length > 0) && (
                <Box sx={{ mb: 3 }}>
                    {date && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Fecha: {date}
                        </Typography>
                    )}
                    {additionalInfo.map((info, index) => (
                        <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {info}
                        </Typography>
                    ))}
                </Box>
            )}

            {/* Content */}
            {children}
        </Paper>
    )
} 