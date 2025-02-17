"use client"

import type React from "react"
import { useState } from "react"
import { Modal, Box, Typography, IconButton, InputBase, Button, Avatar } from "@mui/material"
import { X, Search, ChevronDown, Plus } from "lucide-react"

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="search-modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 600,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" component="h2">
            Search at Fillio
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X className="h-5 w-5" />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 30,
            px: 2,
            py: 1,
            mb: 3,
          }}
        >
          <Search className="h-5 w-5 text-gray-400" />
          <InputBase
            placeholder="Search item"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ ml: 1, flex: 1 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          I'm looking for...
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ChevronDown className="h-4 w-4" />}
            sx={{ borderRadius: 30 }}
          >
            All Teams
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ChevronDown className="h-4 w-4" />}
            sx={{ borderRadius: 30 }}
          >
            Created by
          </Button>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ChevronDown className="h-4 w-4" />}
            sx={{ borderRadius: 30 }}
          >
            Date
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Recent
        </Typography>

        <Box sx={{ mb: 4 }}>
          {/* Recent items */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 1.5,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Avatar sx={{ bgcolor: "primary.main" }}>R</Avatar>
            <Box>
              <Typography variant="body2">Rafiqur Rahman</Typography>
              <Typography variant="caption" color="text.secondary">
                Team Insights
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create Team
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<Plus className="h-4 w-4" />} sx={{ borderRadius: 1 }}>
            Create new team
          </Button>
          <Button variant="outlined" startIcon={<Plus className="h-4 w-4" />} sx={{ borderRadius: 1 }}>
            Add Member
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            ⌘ Select
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ↵ Open
          </Typography>
        </Box>
      </Box>
    </Modal>
  )
}

export default SearchModal

