"use client"

import type React from "react"
import { Breadcrumbs, Link, Typography } from "@mui/material"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import HomeIcon from "@mui/icons-material/Home"
import { useRouter } from "next/navigation"

interface BreadcrumbItem {
  label: string
  path: string
  icon?: React.ReactNode
}

interface NavigationBreadcrumbsProps {
  items: BreadcrumbItem[]
  currentPage: string
}

export const NavigationBreadcrumbs: React.FC<NavigationBreadcrumbsProps> = ({ items, currentPage }) => {
  const router = useRouter()

  return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
      {items.map((item, index) => (
        <Link
          key={index}
          underline="hover"
          sx={{ display: "flex", alignItems: "center" }}
          color="inherit"
          href={item.path}
          onClick={(e) => {
            e.preventDefault()
            router.push(item.path)
          }}
        >
          {item.icon && item.icon}
          {item.label}
        </Link>
      ))}
      <Typography color="text.primary">{currentPage}</Typography>
    </Breadcrumbs>
  )
}

// Predefined breadcrumb configurations
export const getDefaultBreadcrumbs = () => [
  {
    label: "Inicio",
    path: "/",
    icon: <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />,
  },
  {
    label: "Legajos",
    path: "/legajo-mesa",
  },
]
