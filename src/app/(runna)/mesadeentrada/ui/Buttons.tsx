import type React from "react"
import Link from "next/link"
import { Button, Skeleton } from "@mui/material"
import { FilterList } from "@mui/icons-material"

interface ButtonsProps {
  isLoading: boolean
  user: {
    is_superuser: boolean
    all_permissions: Array<{ codename: string }>
  }
  handleNuevoRegistro: () => void
  handleFilterClick: () => void
}

const Buttons: React.FC<ButtonsProps> = ({ isLoading,  handleNuevoRegistro, handleFilterClick }) => {
  return (
    <div className="flex gap-4">
      {isLoading ? (
        <>
          <Skeleton variant="rectangular" width={150} height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </>
      ) : (
        <>
            <Link href="/nuevoingreso" passHref>
              <Button
                component="a"
                variant="contained"
                onClick={handleNuevoRegistro}
                sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
              >
                + Nuevo Registro
              </Button>
            </Link>

          <Button
            onClick={handleFilterClick}
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
            }}
          >
            <FilterList className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
        </>
      )}
    </div>
  )
}

export default Buttons

