"use client"

/**
 * Workflow Section Component
 *
 * Generic, reusable section component for all workflow document types.
 * Follows the MPI pattern: simple, data-driven, dynamic loading.
 *
 * Features:
 * - Dynamic data fetching from configured API service
 * - "Ver Último [Type]" button (enabled when items exist)
 * - "Agregar Nuevo [Type]" button (always available)
 * - Permission-based action visibility
 * - Auto-refresh after modal operations
 */

import React, { useState, useMemo, memo, lazy, Suspense } from "react"
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
} from "@mui/material"
import PostAddIcon from "@mui/icons-material/PostAdd"
import DescriptionIcon from "@mui/icons-material/Description"
import { SectionCard } from "../section-card"
import { useWorkflowData } from "../../../hooks/useWorkflowData"
import { usePermissions } from "../../../utils/permissions"
import type { WorkflowSectionProps } from "../../../types/workflow"

// Lazy load the modals for better initial page load performance
const UnifiedWorkflowModal = lazy(() => import("./unified-workflow-modal").then(module => ({ default: module.UnifiedWorkflowModal })))
const IntervencionModal = lazy(() => import("./intervencion-modal").then(module => ({ default: module.IntervencionModal })))

const WorkflowSectionComponent: React.FC<WorkflowSectionProps> = ({
  medidaId,
  sectionType,
  tipoMedida,
  workflowPhase,
  config,
  legajoData,
  onDataChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view')
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined)

  // Get permissions for this section
  const permissions = usePermissions(config.permissions)

  // Load data using the hook
  const {
    items,
    lastItem,
    isLoading,
    error,
    refresh,
  } = useWorkflowData({
    medidaId,
    sectionType,
    apiService: config.apiService,
    autoRefresh: config.advanced?.autoRefresh,
    refreshInterval: config.advanced?.refreshInterval,
  })

  // Notify parent of data changes
  useMemo(() => {
    if (onDataChange) {
      onDataChange(items)
    }
  }, [items, onDataChange])

  // Check if legajo data is available (only for intervention sections)
  const hasLegajoData = sectionType !== 'intervencion' || !!(
    legajoData?.numero &&
    legajoData?.persona_nombre &&
    legajoData?.persona_apellido
  )

  // Get display title (e.g., "Intervención", "Nota de Aval", etc.)
  const itemTypeName = config.title.replace('Registro de ', '').replace('Nota de ', '')

  // Handle "Ver Último" button click
  const handleViewLast = () => {
    if (lastItem) {
      setSelectedItemId(lastItem.id)
      setModalMode('view')
      setModalOpen(true)
    }
  }

  // Handle "Agregar Nuevo" button click
  const handleCreateNew = () => {
    setSelectedItemId(undefined)
    setModalMode('create')
    setModalOpen(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedItemId(undefined)
    // Refresh data after modal closes (in case changes were made)
    refresh()
  }

  // Handle successful save
  const handleSaved = () => {
    // Modal will close and trigger refresh
    handleModalClose()
  }

  // Render item display (simple version - could be enhanced with cards)
  const renderItemDisplay = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={30} />
        </Box>
      )
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar {config.title.toLowerCase()}: {error.message}
        </Alert>
      )
    }

    if (items.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {config.emptyStateMessage || `No hay ${config.title.toLowerCase()} registrados`}
        </Typography>
      )
    }

    // Show summary of latest item
    if (lastItem && config.displayConfig.cardFields) {
      return (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {config.displayConfig.cardFields.slice(0, 3).map((fieldConfig, idx) => {
                const value = getNestedValue(lastItem, fieldConfig.field)

                if (fieldConfig.chip && value) {
                  const chipColor = fieldConfig.chipColor
                    ? fieldConfig.chipColor(value)
                    : 'default'

                  return (
                    <Chip
                      key={idx}
                      label={`${fieldConfig.label}: ${value}`}
                      color={chipColor}
                      size="small"
                    />
                  )
                }

                if (value) {
                  return (
                    <Typography key={idx} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {fieldConfig.icon}
                      <strong>{fieldConfig.label}:</strong> {formatValue(value, fieldConfig.format)}
                    </Typography>
                  )
                }

                return null
              })}
            </Box>

            <Typography variant="caption" color="text.secondary">
              Total: {items.length} {items.length === 1 ? 'registro' : 'registros'}
            </Typography>
          </CardContent>
        </Card>
      )
    }

    // Fallback: simple text display
    return (
      <Typography variant="body2" sx={{ mb: 2 }}>
        <strong>Total:</strong> {items.length} {items.length === 1 ? 'registro' : 'registros'}
      </Typography>
    )
  }

  // Check if user has authorization
  if (!permissions.isAuthorized) {
    return (
      <SectionCard
        title={config.title}
        icon={config.icon}
        isActive={false}
        isCompleted={false}
      >
        <Alert severity="warning">
          No tiene permisos para ver esta sección
        </Alert>
      </SectionCard>
    )
  }

  return (
    <>
      <SectionCard
        title={config.title}
        icon={config.icon}
        isActive={true}
        isCompleted={items.length > 0}
      >
        {config.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {config.description}
          </Typography>
        )}

        {/* Item Display */}
        {renderItemDisplay()}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Ver Último Button */}
          <Button
            variant="outlined"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={20} /> : <DescriptionIcon />}
            onClick={handleViewLast}
            disabled={isLoading || !lastItem || !permissions.canView || !hasLegajoData}
            title={!hasLegajoData ? "Esperando datos del legajo..." : lastItem ? `Ver último ${itemTypeName.toLowerCase()}` : `No hay ${itemTypeName.toLowerCase()}s`}
            sx={{
              borderRadius: 8,
              textTransform: "none",
              px: 3,
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            {isLoading
              ? "Cargando..."
              : lastItem
              ? `Ver Último ${itemTypeName}`
              : `Sin ${itemTypeName}s`}
          </Button>

          {/* Agregar Nuevo Button */}
          {permissions.canCreate && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PostAddIcon />}
              onClick={handleCreateNew}
              disabled={isLoading || !hasLegajoData}
              title={!hasLegajoData ? "Esperando datos del legajo..." : `Crear nuevo ${itemTypeName.toLowerCase()}`}
              sx={{
                borderRadius: 8,
                textTransform: "none",
                px: 3,
              }}
            >
              Nuevo {itemTypeName}
            </Button>
          )}

          {/* Custom Action Buttons */}
          {config.customActions?.map((action, idx) => {
            // Check condition if provided
            if (action.condition && !action.condition(items)) {
              return null
            }

            return (
              <Button
                key={idx}
                variant={action.variant || 'outlined'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                sx={{
                  borderRadius: 8,
                  textTransform: "none",
                  px: 3,
                }}
              >
                {action.label}
              </Button>
            )
          })}
        </Box>
      </SectionCard>

      {/* Modal - Lazy loaded with Suspense */}
      {/* Use new IntervencionModal for intervention sections, UnifiedWorkflowModal for others */}
      {modalOpen && (
        <Suspense fallback={<CircularProgress />}>
          {sectionType === 'intervencion' ? (
            <IntervencionModal
              open={modalOpen}
              onClose={handleModalClose}
              medidaId={medidaId}
              intervencionId={selectedItemId}
              legajoData={legajoData}
              tipoMedida={tipoMedida}
              workflowPhase={workflowPhase}
              onSaved={handleSaved}
            />
          ) : (
            <UnifiedWorkflowModal
              open={modalOpen}
              onClose={handleModalClose}
              medidaId={medidaId}
              itemId={selectedItemId}
              sectionType={sectionType}
              mode={modalMode}
              config={config.modalConfig}
              apiService={config.apiService}
              legajoData={legajoData}
              tipoMedida={tipoMedida}
              onSaved={handleSaved}
            />
          )}
        </Suspense>
      )}
    </>
  )
}

/**
 * Memoized export with custom comparison for performance optimization
 * Only re-renders when medidaId, sectionType, workflowPhase, or config identity changes
 */
export const WorkflowSection = memo(WorkflowSectionComponent, (prevProps, nextProps) => {
  return (
    prevProps.medidaId === nextProps.medidaId &&
    prevProps.sectionType === nextProps.sectionType &&
    prevProps.workflowPhase === nextProps.workflowPhase &&
    prevProps.tipoMedida === nextProps.tipoMedida &&
    prevProps.config === nextProps.config &&
    prevProps.legajoData === nextProps.legajoData
  )
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue(obj, 'user.profile.name')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Format value based on type
 */
function formatValue(value: any, format?: string): string {
  if (value === null || value === undefined) return '-'

  switch (format) {
    case 'date':
      return new Date(value).toLocaleDateString('es-AR')
    case 'datetime':
      return new Date(value).toLocaleString('es-AR')
    case 'currency':
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
    case 'number':
      return new Intl.NumberFormat('es-AR').format(value)
    default:
      return String(value)
  }
}
