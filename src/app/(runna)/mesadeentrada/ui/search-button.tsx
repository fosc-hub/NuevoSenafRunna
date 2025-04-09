"use client"

import { useState } from "react"
import { Button } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import SearchModal from "@/components/searchModal/searchModal"

interface SearchButtonProps {
  // Optional custom button text
  buttonText?: string
  // Optional custom button styling
  buttonSx?: object
}

export default function SearchButton({ buttonText = "Buscar Demandas", buttonSx = {} }: SearchButtonProps) {
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  const handleOpenSearchModal = () => {
    setSearchModalOpen(true)
  }

  const handleCloseSearchModal = () => {
    setSearchModalOpen(false)
  }

  return (
    <>
      <Button
        onClick={handleOpenSearchModal}
        variant="outlined"
        size="small"
        className="flex items-center gap-2 px-4 py-2 bg-white"
        sx={{
          border: "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "4px",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
          ...buttonSx,
        }}
        startIcon={<SearchIcon className="h-4 w-4" />}
      >
        {buttonText}
      </Button>

      {/* View-only search modal */}
      <SearchModal
        open={searchModalOpen}
        onClose={handleCloseSearchModal}
        mode="view"
        title="Búsqueda de Demandas"
        isModal={true}
        compact={true}
      />
    </>
  )
}
