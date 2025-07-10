"use client"

import type React from "react"
import { Box, Button } from "@mui/material"
import { SectionCard } from "./section-card"
import { DocumentList } from "./document-list"
import { ActionButtons } from "./action-buttons"
import type { SectionConfig } from "./section-configs"

interface SectionRendererProps {
    config: SectionConfig
    onActionClick?: () => void
    onMessageClick?: () => void
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
    config,
    onActionClick,
    onMessageClick
}) => {
    return (
        <SectionCard
            title={config.title}
            chips={config.chips}
            date={config.date}
            additionalInfo={config.additionalInfo}
            showMessageButton={config.showMessageButton}
            onMessageClick={onMessageClick}
            showCheckIcon={config.showCheckIcon}
            headerActions={
                config.customButtons && config.customButtons.length > 0 ? (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {config.customButtons.slice(0, -1).map((button, index) => (
                            <Button
                                key={index}
                                variant={button.variant}
                                color={button.color}
                                onClick={button.onClick}
                                size="small"
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                {button.text}
                            </Button>
                        ))}
                    </Box>
                ) : undefined
            }
        >
            {config.documents.length > 0 && (
                <DocumentList
                    documents={config.documents}
                    showActionButtons={config.showActionButtons}
                    actionButtonText={config.actionButtonText}
                    onActionClick={onActionClick}
                />
            )}

            {config.showApprovalButtons && (
                <ActionButtons
                    showApprovalButtons={true}
                    onApprove={() => { }}
                    onObserve={() => { }}
                    onCancel={() => { }}
                />
            )}

            {config.customButtons && config.customButtons.length > 0 && !config.showApprovalButtons && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                    {config.customButtons.slice(-1).map((button, index) => (
                        <Button
                            key={index}
                            variant={button.variant}
                            color={button.color}
                            onClick={button.onClick}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                            }}
                        >
                            {button.text}
                        </Button>
                    ))}
                </Box>
            )}
        </SectionCard>
    )
} 