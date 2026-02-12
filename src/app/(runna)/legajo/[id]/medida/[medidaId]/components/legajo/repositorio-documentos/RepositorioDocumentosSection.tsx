"use client"

import React, { useState, useMemo, useCallback } from 'react'
import { Box, CircularProgress, Alert, Button } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add'
import { SectionCard } from '../../medida/shared/section-card'
import { useRepositorioDocumentos } from '../../../hooks/useRepositorioDocumentos'
import type {
  CategoriaDocumento,
  DocumentosFilterState,
  Documento,
} from '../../../types/repositorio-documentos'
import { CATEGORY_ORDER } from './constants'
import { StatisticsBanner } from './StatisticsBanner'
import { FilterBar } from './FilterBar'
import { CategoryAccordion } from './CategoryAccordion'
import { EmptyState } from './EmptyState'

interface RepositorioDocumentosSectionProps {
  legajoId: number
  puedeAgregarDocumentos?: boolean
  onAddDocumento?: () => void
}

export const RepositorioDocumentosSection: React.FC<RepositorioDocumentosSectionProps> = ({
  legajoId,
  puedeAgregarDocumentos = false,
  onAddDocumento,
}) => {
  // Fetch documents from the API
  const { data, isLoading, isError, refetch } = useRepositorioDocumentos({
    legajo_id: legajoId,
  })

  // Filter state
  const [filters, setFilters] = useState<DocumentosFilterState>({
    categoria: 'TODOS',
    tipoModelo: 'TODOS',
    medidaId: 'TODOS',
  })

  // Expansion state for accordions - default all expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<CategoriaDocumento>>(
    new Set(CATEGORY_ORDER)
  )

  // Check if any filters are active
  const hasActiveFilters =
    filters.categoria !== 'TODOS' ||
    filters.tipoModelo !== 'TODOS' ||
    filters.medidaId !== 'TODOS'

  // Get unique tipo_modelo values for filter dropdown
  const tipoModeloOptions = useMemo(() => {
    if (!data?.documentos) return []
    const uniqueTypes = new Set(data.documentos.map((doc) => doc.tipo_modelo))
    return Array.from(uniqueTypes).sort()
  }, [data?.documentos])

  // Filter documents based on current filter state
  const filteredDocuments = useMemo(() => {
    if (!data?.documentos) return []

    return data.documentos.filter((doc) => {
      if (filters.categoria !== 'TODOS' && doc.categoria !== filters.categoria) {
        return false
      }
      if (filters.tipoModelo !== 'TODOS' && doc.tipo_modelo !== filters.tipoModelo) {
        return false
      }
      // Filter by medida_id (from metadata)
      if (filters.medidaId !== 'TODOS') {
        const metadata = doc.metadata as { medida_id?: number }
        if (metadata?.medida_id !== filters.medidaId) {
          return false
        }
      }
      return true
    })
  }, [data?.documentos, filters])

  // Group documents by category
  const documentsByCategory = useMemo(() => {
    const grouped: Record<CategoriaDocumento, Documento[]> = {
      DEMANDA: [],
      EVALUACION: [],
      MEDIDA: [],
    }

    filteredDocuments.forEach((doc) => {
      if (grouped[doc.categoria]) {
        grouped[doc.categoria].push(doc)
      }
    })

    return grouped
  }, [filteredDocuments])

  // Handle accordion toggle
  const handleToggle = useCallback((categoria: CategoriaDocumento) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoria)) {
        newSet.delete(categoria)
      } else {
        newSet.add(categoria)
      }
      return newSet
    })
  }, [])

  // Expand all accordions
  const handleExpandAll = useCallback(() => {
    setExpandedCategories(new Set(CATEGORY_ORDER))
  }, [])

  // Collapse all accordions
  const handleCollapseAll = useCallback(() => {
    setExpandedCategories(new Set())
  }, [])

  // Calculate stats for display
  const totalDocumentos = data?.total_documentos ?? 0
  const totalSizeMb = data?.total_size_mb ?? 0
  const categorias = data?.categorias ?? {}

  // Determine which categories to show based on filter
  const categoriesToShow = useMemo(() => {
    if (filters.categoria === 'TODOS') {
      return CATEGORY_ORDER
    }
    return [filters.categoria]
  }, [filters.categoria])

  return (
    <SectionCard
      title="Repositorio de Documentos"
      additionalInfo={
        totalDocumentos > 0
          ? [`${totalDocumentos} documento${totalDocumentos !== 1 ? 's' : ''}`]
          : []
      }
      headerActions={
        puedeAgregarDocumentos && onAddDocumento ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddDocumento}
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Agregar documento
          </Button>
        ) : undefined
      }
    >
      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
            >
              Reintentar
            </Button>
          }
        >
          Error al cargar los documentos. Por favor, intente nuevamente.
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !isError && data && (
        <>
          {totalDocumentos === 0 ? (
            <EmptyState
              showAddButton={puedeAgregarDocumentos}
              onAddClick={onAddDocumento}
            />
          ) : (
            <>
              {/* Statistics banner */}
              <StatisticsBanner
                totalDocumentos={totalDocumentos}
                totalSizeMb={totalSizeMb}
                categorias={categorias}
              />

              {/* Filter bar */}
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                tipoModeloOptions={tipoModeloOptions}
                medidasIds={data.medidas_ids || []}
                onExpandAll={handleExpandAll}
                onCollapseAll={handleCollapseAll}
                hasActiveFilters={hasActiveFilters}
              />

              {/* No results after filtering */}
              {filteredDocuments.length === 0 && hasActiveFilters && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No se encontraron documentos con los filtros seleccionados.
                </Alert>
              )}

              {/* Category accordions */}
              {categoriesToShow.map((categoria) => (
                <CategoryAccordion
                  key={categoria}
                  categoria={categoria}
                  documentos={documentsByCategory[categoria]}
                  expanded={expandedCategories.has(categoria)}
                  onToggle={handleToggle}
                  medidas_ids={categoria === 'MEDIDA' ? data.medidas_ids : undefined}
                />
              ))}
            </>
          )}

          {/* Info footer */}
          {totalDocumentos > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
                Los documentos adjuntos son almacenados de forma segura y solo son accesibles
                por usuarios autorizados.
              </Box>
            </Box>
          )}
        </>
      )}
    </SectionCard>
  )
}

export default RepositorioDocumentosSection
