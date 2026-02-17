/**
 * Unified Workflow Type Definitions
 *
 * Common types for the unified workflow architecture supporting:
 * - MPE (Medida de Protección Excepcional)
 * - MPJ (Medida de Protección Judicial)
 * - MPI (Medida de Protección Inmediata)
 *
 * Document types: intervenciones, nota-aval, informe-juridico, ratificacion-judicial
 *
 * V2 Enhancements:
 * - Integrated with estado-etapa.ts for type-specific estado management
 * - Added TipoEtapa from medida-api.ts for stage-based workflow
 */

import type { ReactNode } from "react"

// Re-export V2 types for convenience
export type { TEstadoEtapaMedida, TipoEtapa, ResponsableTipo } from './estado-etapa'
export type { EtapaMedida, MedidaDetailResponse } from './medida-api'

// ============================================================================
// ENUMS & BASIC TYPES
// ============================================================================

export type SectionType = 'intervencion' | 'nota-aval' | 'informe-juridico' | 'ratificacion'
export type TipoMedida = 'MPE' | 'MPI' | 'MPJ'

/**
 * Workflow Phase - Legacy type for backward compatibility
 * Use TipoEtapa from estado-etapa.ts for V2 implementation
 */
export type WorkflowPhase = 'apertura' | 'innovacion' | 'prorroga' | 'cese'

export type ModalMode = 'view' | 'edit' | 'create'
export type UserRole = 'ET' | 'JZ' | 'DIRECTOR' | 'LEGAL' | 'SUPERUSER'
export type ItemRendererType = 'card' | 'list' | 'table'

// ============================================================================
// GENERIC WORKFLOW ITEM
// ============================================================================

export interface WorkflowItem {
  id: number
  medida: number
  fecha_creacion: string
  creado_por?: number
  creado_por_detalle?: {
    id: number
    nombre_completo: string
  }
  [key: string]: any // Allow additional fields specific to each document type
}

// ============================================================================
// API SERVICE INTERFACE
// ============================================================================

export interface QueryParams {
  estado?: string
  fecha_desde?: string
  fecha_hasta?: string
  ordering?: string
  limit?: number
  offset?: number
  [key: string]: any
}

export interface StateActionService {
  enviar?: (medidaId: number, itemId: number) => Promise<WorkflowItem>
  aprobar?: (medidaId: number, itemId: number) => Promise<WorkflowItem>
  rechazar?: (medidaId: number, itemId: number, reason: string | { observaciones: string }) => Promise<WorkflowItem>
}

export interface WorkflowApiService {
  // Read Operations
  getList: (medidaId: number, params?: QueryParams) => Promise<WorkflowItem[]>
  getDetail: (medidaId: number, itemId: number) => Promise<WorkflowItem>

  // Write Operations
  create: (medidaId: number, data: any) => Promise<WorkflowItem>
  update?: (medidaId: number, itemId: number, data: any) => Promise<WorkflowItem>
  delete?: (medidaId: number, itemId: number) => Promise<void>

  // State Transitions
  stateActions?: StateActionService

  // File Management
  uploadFile?: (medidaId: number, itemId: number, file: File, type?: string) => Promise<any>
  getFiles?: (medidaId: number, itemId: number) => Promise<any[]>
  deleteFile?: (medidaId: number, itemId: number, fileId: number) => Promise<void>

  // Helpers
  getLatest?: (medidaId: number) => Promise<WorkflowItem | null>
  hasItems?: (medidaId: number) => Promise<boolean>
}

// ============================================================================
// FIELD CONFIGURATION
// ============================================================================

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'

export interface FieldOption {
  value: string | number
  label: string
}

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required: boolean
  grid?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
  }

  // Select/Radio options
  options?: FieldOption[]
  apiEndpoint?: string // For dynamic options
  dependsOn?: string // Field name this depends on

  // Validation
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  minDate?: string | 'today'
  maxDate?: string | 'today'
  pattern?: RegExp

  // UI
  helperText?: string
  placeholder?: string
  rows?: number // For textarea
  accept?: string // For file input
  disabled?: boolean
}

// ============================================================================
// MODAL CONFIGURATION
// ============================================================================

export interface ModalAction {
  label: string
  action: string
  icon?: ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  condition?: (item: WorkflowItem) => boolean
  requiresRole?: UserRole
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationMessage?: string
  requiresInput?: {
    field: string
    label: string
    type?: 'text' | 'textarea'
    required?: boolean
    minLength?: number
    helperText?: string
  }
  successMessage?: string
  errorMessage?: string
  customHandler?: boolean
}

export interface FileUploadConfig {
  allowed: boolean
  multiple?: boolean
  types?: Array<{ value: string; label: string }>
  maxSize?: number
  acceptedFormats?: string[]
  showPreview?: boolean
  allowDelete?: boolean
  disableWhenSent?: boolean
  required?: boolean
  embedded?: boolean // File field in form vs separate upload
  maxFilesByType?: Record<string, number>
}

export interface ModalConfig {
  title: string
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  // Form Configuration
  fields: FieldConfig[]
  validationSchema?: any // Yup schema

  // Actions
  allowEdit: boolean
  allowDelete: boolean
  editableStates?: string[] // Only allow edit in these states
  customActions?: ModalAction[]

  // Display
  submitButtonText?: string
  cancelButtonText?: string

  // File Uploads
  fileUploadConfig?: FileUploadConfig
}

// ============================================================================
// DISPLAY CONFIGURATION
// ============================================================================

export interface CardField {
  field: string // Path to field (supports nested: 'tipo_dispositivo_detalle.nombre')
  label: string
  icon?: ReactNode
  priority?: number // 0 = highest (always show), higher = lower priority
  chip?: boolean
  chipColor?: (value: any) => 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  format?: 'date' | 'datetime' | 'currency' | 'number'
  formatString?: string // For date formatting
  formatter?: (value: any) => string | ReactNode
}

export interface StatusChipConfig {
  field: string
  colorMap: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'>
}

export interface EmptyStateConfig {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    icon: ReactNode
  }
}

export interface DisplayConfig {
  itemRenderer: ItemRendererType
  showStatusChip: boolean
  showDate: boolean
  showUser: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'

  // Card Layout
  cardFields?: CardField[]

  // Status Chip
  statusChipConfig?: StatusChipConfig

  // Empty State
  emptyState?: EmptyStateConfig
}

// ============================================================================
// PERMISSION CONFIGURATION
// ============================================================================

export interface PermissionConfig {
  canView: UserRole[]
  canCreate: UserRole[]
  canEdit: UserRole[]
  canDelete: UserRole[]
  canApprove?: UserRole[]
  canSend?: UserRole[]
}

// ============================================================================
// SECTION CONFIGURATION
// ============================================================================

export interface CustomAction {
  label: string
  icon?: ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  variant?: 'contained' | 'outlined' | 'text'
  onClick: () => void
  condition?: (items: WorkflowItem[]) => boolean
}

export interface AdvancedOptions {
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
  enableNotifications?: boolean
  trackChanges?: boolean
  enableComments?: boolean
  enableHistory?: boolean
}

export interface SectionConfig {
  // Display Configuration
  title: string
  icon: ReactNode
  description?: string
  emptyStateMessage?: string

  // API Integration
  apiService: WorkflowApiService

  // Modal Configuration
  modalConfig: ModalConfig

  // Display Configuration
  displayConfig: DisplayConfig

  // Permissions
  permissions: PermissionConfig

  // Custom Behaviors
  customActions?: CustomAction[]

  // Advanced Options
  advanced?: AdvancedOptions
}

// ============================================================================
// PROPS INTERFACES
// ============================================================================

export interface WorkflowSectionProps {
  // Identifiers
  medidaId: number
  sectionType: SectionType
  tipoMedida: TipoMedida
  workflowPhase: WorkflowPhase

  // Configuration
  config: SectionConfig

  // Optional
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }
  onDataChange?: (data: WorkflowItem[]) => void
}

export interface UnifiedWorkflowModalProps {
  // State
  open: boolean
  onClose: () => void

  // Identifiers
  medidaId: number
  itemId?: number
  sectionType: SectionType

  // Mode
  mode: ModalMode

  // Configuration
  config: ModalConfig
  apiService: WorkflowApiService

  // Optional
  legajoData?: {
    numero: string
    persona_nombre: string
    persona_apellido: string
    zona_nombre: string
  }
  tipoMedida?: TipoMedida

  // Callbacks
  onSaved?: (item: WorkflowItem) => void
  onDeleted?: () => void
}

// ============================================================================
// USER & CONTEXT
// ============================================================================

export interface User {
  id: number
  nombre_completo: string
  role: UserRole
  zona_id?: number
  permissions?: string[]
}

// ============================================================================
// STEP PROGRESS & STATUS (for Workflow Stepper UX)
// ============================================================================

/**
 * Step status for visual indication
 * - completed: Step finished successfully (green, checkmark)
 * - current: Currently active step (blue, in progress)
 * - pending: Not started yet but unlocked (gray)
 * - locked: Cannot access until previous step completed (gray, locked icon)
 */
export type StepStatus = "completed" | "current" | "pending" | "locked"

/**
 * Progress information for a workflow step
 */
export interface StepProgress {
  /** Progress percentage (0-100) */
  percentage: number

  /** Number of completed required fields/actions */
  completedFields?: number

  /** Total number of required fields/actions */
  totalFields?: number

  /** Current estado for this step (BORRADOR, ENVIADO, APROBADO, etc.) */
  estado?: string
}

/**
 * Navigation state for stepper
 */
export interface StepNavigationState {
  /** Currently active step index (0-based) */
  activeStep: number

  /** Array of completion status for each step */
  completedSteps: boolean[]

  /** Can navigate to next step */
  canContinue: boolean

  /** Can navigate to previous step */
  canGoBack: boolean
}
