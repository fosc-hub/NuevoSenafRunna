"use client"

import type React from "react"
import { useState } from "react"
import {
    Box,
    Typography,
    Button,
    Avatar,
    Paper,
    Rating,
    TextField
} from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import AddIcon from "@mui/icons-material/Add"
import MessageIcon from "@mui/icons-material/Message"
import BaseDialog from "@/components/shared/BaseDialog"

interface Message {
    id: number
    userName: string
    rating: number
    text: string
    date?: string
}

interface MensajesModalProps {
    open: boolean
    onClose: () => void
    title?: string
}

const mockMessages: Message[] = [
    {
        id: 1,
        userName: "UserName",
        rating: 5,
        text: "Nice outdoor courts, solid concrete and good hoops for the neighborhood."
    },
    {
        id: 2,
        userName: "UserName",
        rating: 5,
        text: "Nice outdoor courts, solid concrete and good hoops for the neighborhood."
    },
    {
        id: 3,
        userName: "UserName",
        rating: 5,
        text: "Nice outdoor courts, solid concrete and good hoops for the neighborhood."
    }
]

export const MensajesModal: React.FC<MensajesModalProps> = ({
    open,
    onClose,
    title = "Mensajes"
}) => {
    const [messages, setMessages] = useState<Message[]>(mockMessages)
    const [showAddMessage, setShowAddMessage] = useState(false)
    const [newMessage, setNewMessage] = useState("")
    const [newRating, setNewRating] = useState<number | null>(5)

    const handleAddMessage = () => {
        if (newMessage.trim()) {
            const message: Message = {
                id: messages.length + 1,
                userName: "Current User",
                rating: newRating || 5,
                text: newMessage.trim()
            }
            setMessages([message, ...messages])
            setNewMessage("")
            setNewRating(5)
            setShowAddMessage(false)
        }
    }

    const handleCancel = () => {
        setNewMessage("")
        setNewRating(5)
        setShowAddMessage(false)
    }

    return (
        <BaseDialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            title={title}
            titleIcon={<MessageIcon />}
            showCloseButton
            contentSx={{ px: 3, py: 2 }}
            actions={[
                {
                    label: 'Cerrar',
                    onClick: onClose,
                    variant: 'outlined'
                }
            ]}
        >
            {/* Add Message Button */}
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddMessage(true)}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        px: 3,
                        py: 1
                    }}
                >
                    Agregar mensaje
                </Button>
            </Box>

            {/* Add Message Form */}
            {showAddMessage && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Nuevo mensaje
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Calificación:
                        </Typography>
                        <Rating
                            value={newRating}
                            onChange={(event, newValue) => setNewRating(newValue)}
                            size="small"
                        />
                    </Box>

                    <TextField
                        label="Mensaje"
                        multiline
                        rows={3}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleAddMessage}
                            disabled={!newMessage.trim()}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                            Agregar
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Messages List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.map((message) => (
                    <Paper
                        key={message.id}
                        elevation={1}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: 'white'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: 'primary.main',
                                fontSize: '0.875rem'
                            }}>
                                <PersonIcon fontSize="small" />
                            </Avatar>

                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {message.userName}
                                    </Typography>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            Overall
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                {message.rating}
                                            </Typography>
                                            <Rating
                                                value={message.rating}
                                                readOnly
                                                size="small"
                                                max={1}
                                                sx={{ color: 'primary.main' }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                                    {message.text}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                ))}
            </Box>
        </BaseDialog>
    )
} 