"use client"

import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import { GlobalActividadesTable } from './components/GlobalActividadesTable'
import { getDefaultBreadcrumbs, NavigationBreadcrumbs } from '../[id]/medida/[medidaId]/components/navigation-breadcrumbs'

/**
 * Actividades Page
 *
 * Displays a global list of activities assigned to the current user or their team.
 * Features:
 * - Filter by estado, actor, origen
 * - Search functionality
 * - Pagination
 * - Quick statistics
 * - Actor-based visibility (users only see their team's activities)
 *
 * URL: /legajo/actividades
 */
export default function ActividadesPage() {
  const breadcrumbItems = [
    ...getDefaultBreadcrumbs(),
    { label: 'Actividades', path: '/legajo/actividades' }
  ]

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 3 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <NavigationBreadcrumbs
            items={breadcrumbItems}
            currentPage="Mis Actividades"
          />
        </Box>

        {/* Main Content */}
        <GlobalActividadesTable />
      </Container>
    </Box>
  )
}
