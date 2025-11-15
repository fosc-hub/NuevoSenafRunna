/**
 * Workflow Section Configurations
 *
 * Declarative configuration for all 4 document types:
 * 1. Intervenciones
 * 2. Nota de Aval
 * 3. Informe Jurídico
 * 4. Ratificación Judicial
 *
 * This is the "brain" of the unified architecture - all behavior is defined here.
 */

import AssignmentIcon from "@mui/icons-material/Assignment"
import ApprovalIcon from "@mui/icons-material/Approval"
import GavelIcon from "@mui/icons-material/Gavel"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import type { SectionConfig } from "../../../types/workflow"
import {
  intervencionApiAdapter,
  notaAvalApiAdapter,
  informeJuridicoApiAdapter,
  ratificacionApiAdapter,
} from "../../../api/workflow-api-facade"

// ============================================================================
// 1. INTERVENCION SECTION CONFIG
// ============================================================================

export const intervencionSectionConfig: SectionConfig = {
  // Display Configuration
  title: "Registro de Intervención",
  icon: <AssignmentIcon color="primary" />,
  description: "Gestión de intervenciones de la medida",
  emptyStateMessage: "No hay intervenciones registradas",

  // API Integration
  apiService: intervencionApiAdapter,

  // Modal Configuration
  modalConfig: {
    title: "Intervención",
    width: "md",

    // Form Fields
    fields: [
      {
        name: "tipo_dispositivo",
        label: "Tipo de Dispositivo",
        type: "select",
        required: true,
        grid: { xs: 12, sm: 6 },
        options: [], // TODO: Load from API - tipos-dispositivos
        helperText: "Seleccione el tipo de dispositivo para esta intervención",
      },
      {
        name: "motivo",
        label: "Motivo",
        type: "select",
        required: true,
        grid: { xs: 12, sm: 6 },
        options: [], // TODO: Load from API - motivos
        dependsOn: "tipo_dispositivo",
      },
      {
        name: "categoria_intervencion",
        label: "Categoría de Intervención",
        type: "select",
        required: true,
        grid: { xs: 12 },
        options: [], // TODO: Load from API - categorias-intervencion
      },
      {
        name: "observaciones",
        label: "Observaciones",
        type: "textarea",
        required: false,
        grid: { xs: 12 },
        rows: 4,
        maxLength: 1000,
        helperText: "Información adicional sobre la intervención",
      },
    ],

    // Actions
    allowEdit: true,
    allowDelete: true,
    editableStates: ["BORRADOR"], // Only allow edit when in BORRADOR state

    // Custom Actions (state transitions)
    customActions: [
      {
        label: "Enviar a Aprobación",
        action: "enviar",
        color: "primary",
        condition: (item) => item.estado === "BORRADOR",
        requiresConfirmation: true,
        confirmationMessage:
          "¿Está seguro que desea enviar esta intervención para aprobación? No podrá editarla después.",
        successMessage: "Intervención enviada exitosamente",
        errorMessage: "Error al enviar intervención",
      },
      {
        label: "Aprobar",
        action: "aprobar",
        color: "success",
        condition: (item) => item.estado === "ENVIADO",
        requiresRole: "JZ",
        requiresConfirmation: true,
        confirmationTitle: "Aprobar Intervención",
        confirmationMessage: "¿Confirma la aprobación de esta intervención?",
        successMessage: "Intervención aprobada exitosamente",
      },
      {
        label: "Rechazar",
        action: "rechazar",
        color: "error",
        condition: (item) => item.estado === "ENVIADO",
        requiresRole: "JZ",
        requiresInput: {
          field: "observaciones_jz",
          label: "Motivo del rechazo",
          type: "textarea",
          required: true,
          minLength: 10,
          helperText: "Indique el motivo del rechazo (mínimo 10 caracteres)",
        },
        requiresConfirmation: true,
        confirmationTitle: "Rechazar Intervención",
        confirmationMessage:
          "La intervención será devuelta a borrador para correcciones.",
        successMessage: "Intervención rechazada. Se notificará al equipo técnico.",
      },
    ],

    // File Upload Configuration
    fileUploadConfig: {
      allowed: true,
      multiple: true,
      types: [
        { value: "MODELO", label: "Modelo de Intervención" },
        { value: "ACTA", label: "Acta" },
        { value: "RESPALDO", label: "Documentación de Respaldo" },
        { value: "INFORME", label: "Informe Técnico" },
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      acceptedFormats: ["application/pdf", "image/jpeg", "image/png"],
      showPreview: true,
      allowDelete: true,
      disableWhenSent: true, // Disable file operations when estado !== BORRADOR
    },
  },

  // Display Configuration
  displayConfig: {
    itemRenderer: "card",
    showStatusChip: true,
    showDate: true,
    showUser: true,
    sortBy: "fecha_creacion",
    sortOrder: "desc",

    // Card Layout
    cardFields: [
      {
        field: "estado_display",
        label: "Estado",
        chip: true,
        chipColor: (value) => {
          switch (value) {
            case "BORRADOR":
              return "default"
            case "ENVIADO":
              return "warning"
            case "APROBADO":
              return "success"
            case "RECHAZADO":
              return "error"
            default:
              return "default"
          }
        },
        priority: 0, // Highest priority - always show
      },
      {
        field: "tipo_dispositivo_detalle.nombre",
        label: "Dispositivo",
        priority: 1,
      },
      {
        field: "motivo_detalle.nombre",
        label: "Motivo",
        priority: 2,
      },
    ],
  },

  // Permissions
  permissions: {
    canView: ["ET", "JZ", "DIRECTOR", "LEGAL", "SUPERUSER"],
    canCreate: ["ET", "SUPERUSER"],
    canEdit: ["ET", "SUPERUSER"],
    canDelete: ["ET", "JZ", "SUPERUSER"],
    canApprove: ["JZ", "SUPERUSER"],
    canSend: ["ET", "SUPERUSER"],
  },

  // Advanced Options
  advanced: {
    autoRefresh: false,
    refreshInterval: 30000,
    enableNotifications: true,
    trackChanges: true,
    enableHistory: true,
  },
}

// ============================================================================
// 2. APROBACIÓN DE SUPERIOR SECTION CONFIG
// ============================================================================

export const notaAvalSectionConfig: SectionConfig = {
  // Display Configuration
  title: "Aprobación de Superior",
  icon: <ApprovalIcon color="primary" />,
  description: "Aprobación por Director de Zona",
  emptyStateMessage: "No hay aprobaciones registradas",

  // API Integration
  apiService: notaAvalApiAdapter,

  // Modal Configuration
  modalConfig: {
    title: "Aprobación de Superior",
    width: "md",

    // Form Fields
    fields: [
      {
        name: "decision",
        label: "Decisión",
        type: "radio",
        required: true,
        grid: { xs: 12 },
        options: [
          { value: "APROBAR", label: "Aprobar" },
          { value: "OBSERVAR", label: "Observar" },
        ],
      },
      {
        name: "comentarios",
        label: "Comentarios",
        type: "textarea",
        required: true,
        grid: { xs: 12 },
        rows: 4,
        minLength: 10,
        helperText: "Obligatorio si se observa (mínimo 10 caracteres)",
      },
    ],

    // Actions
    allowEdit: false, // Immutable once created
    allowDelete: false,

    // File Upload Configuration
    fileUploadConfig: {
      allowed: true,
      types: [{ value: "PDF", label: "Aprobación de Superior (PDF)" }],
      maxSize: 10 * 1024 * 1024,
      acceptedFormats: ["application/pdf"],
      required: true,
      embedded: false,
    },
  },

  // Display Configuration
  displayConfig: {
    itemRenderer: "card",
    showStatusChip: true,
    showDate: true,
    showUser: true,

    cardFields: [
      {
        field: "decision_display",
        label: "Decisión",
        chip: true,
        chipColor: (value) => (value === "APROBAR" ? "success" : "warning"),
        priority: 0,
      },
      {
        field: "emitido_por_detalle.nombre_completo",
        label: "Emitido por",
        priority: 1,
      },
      {
        field: "fecha_emision",
        label: "Fecha",
        format: "date",
        priority: 2,
      },
    ],
  },

  // Permissions
  permissions: {
    canView: ["ET", "JZ", "DIRECTOR", "LEGAL", "SUPERUSER"],
    canCreate: ["DIRECTOR", "SUPERUSER"],
    canEdit: [],
    canDelete: [],
  },

  // Advanced Options
  advanced: {
    autoRefresh: false,
    trackChanges: true,
  },
}

// ============================================================================
// 3. INFORME JURIDICO SECTION CONFIG
// ============================================================================

export const informeJuridicoSectionConfig: SectionConfig = {
  // Display Configuration
  title: "Informe Jurídico",
  icon: <GavelIcon color="primary" />,
  description: "Informe elaborado por Equipo Legal",
  emptyStateMessage: "No hay informes jurídicos registrados",

  // API Integration
  apiService: informeJuridicoApiAdapter,

  // Modal Configuration
  modalConfig: {
    title: "Informe Jurídico",
    width: "md",

    // Form Fields
    fields: [
      {
        name: "instituciones_notificadas",
        label: "Instituciones Notificadas",
        type: "text",
        required: true,
        grid: { xs: 12 },
        helperText: "Listado de instituciones notificadas",
      },
      {
        name: "destinatarios",
        label: "Destinatarios",
        type: "text",
        required: true,
        grid: { xs: 12 },
        helperText: "Nombres de los destinatarios",
      },
      {
        name: "fecha_notificaciones",
        label: "Fecha de Notificaciones",
        type: "date",
        required: true,
        grid: { xs: 12, sm: 6 },
        maxDate: "today",
      },
      {
        name: "medio_notificacion",
        label: "Medio de Notificación",
        type: "select",
        required: false,
        grid: { xs: 12, sm: 6 },
        options: [
          { value: "EMAIL", label: "Email" },
          { value: "CORREO", label: "Correo Postal" },
          { value: "PRESENCIAL", label: "Presencial" },
        ],
      },
      {
        name: "observaciones",
        label: "Observaciones",
        type: "textarea",
        required: false,
        grid: { xs: 12 },
        rows: 4,
      },
    ],

    // Actions
    allowEdit: true,
    allowDelete: false,
    editableStates: ["BORRADOR"], // Only edit when not sent

    // Custom Actions
    customActions: [
      {
        label: "Enviar Informe",
        action: "enviar",
        color: "primary",
        condition: (item) => !item.enviado && item.tiene_informe_oficial,
        requiresConfirmation: true,
        confirmationMessage:
          "Una vez enviado, el informe no podrá ser modificado. ¿Desea continuar?",
        successMessage: "Informe jurídico enviado exitosamente",
      },
    ],

    // File Upload Configuration
    fileUploadConfig: {
      allowed: true,
      types: [
        { value: "INFORME", label: "Informe Oficial" },
        { value: "ACUSE", label: "Acuse de Recibo" },
      ],
      maxSize: 10 * 1024 * 1024,
      acceptedFormats: ["application/pdf"],
      maxFilesByType: {
        INFORME: 1,
        ACUSE: 10,
      },
    },
  },

  // Display Configuration
  displayConfig: {
    itemRenderer: "card",
    showStatusChip: true,
    showDate: true,
    showUser: true,

    cardFields: [
      {
        field: "enviado",
        label: "Estado",
        chip: true,
        chipColor: (value) => (value ? "success" : "default"),
        formatter: (value) => (value ? "Enviado" : "Borrador"),
        priority: 0,
      },
      {
        field: "instituciones_notificadas",
        label: "Instituciones",
        priority: 1,
      },
      {
        field: "fecha_notificaciones",
        label: "Fecha Notificaciones",
        format: "date",
        priority: 2,
      },
    ],
  },

  // Permissions
  permissions: {
    canView: ["ET", "JZ", "DIRECTOR", "LEGAL", "SUPERUSER"],
    canCreate: ["LEGAL", "SUPERUSER"],
    canEdit: ["LEGAL", "SUPERUSER"],
    canDelete: [],
    canSend: ["LEGAL", "SUPERUSER"],
  },

  // Advanced Options
  advanced: {
    autoRefresh: false,
    trackChanges: true,
  },
}

// ============================================================================
// 4. RATIFICACION JUDICIAL SECTION CONFIG
// ============================================================================

export const ratificacionSectionConfig: SectionConfig = {
  // Display Configuration
  title: "Ratificación Judicial",
  icon: <AccountBalanceIcon color="primary" />,
  description: "Ratificación por Poder Judicial",
  emptyStateMessage: "No hay ratificación judicial registrada",

  // API Integration
  apiService: ratificacionApiAdapter,

  // Modal Configuration
  modalConfig: {
    title: "Ratificación Judicial",
    width: "md",

    // Form Fields
    fields: [
      {
        name: "observaciones",
        label: "Observaciones",
        type: "textarea",
        required: false,
        grid: { xs: 12 },
        rows: 4,
      },
      // Note: archivo_resolucion is handled through file upload
    ],

    // Actions
    allowEdit: false, // Read-only after creation
    allowDelete: false,

    // File Upload Configuration
    fileUploadConfig: {
      allowed: true,
      types: [{ value: "RESOLUCION", label: "Resolución Judicial (PDF)" }],
      maxSize: 10 * 1024 * 1024,
      acceptedFormats: ["application/pdf"],
      required: true,
      embedded: false,
    },
  },

  // Display Configuration
  displayConfig: {
    itemRenderer: "card",
    showStatusChip: false,
    showDate: true,
    showUser: true,

    cardFields: [
      {
        field: "fecha_ratificacion",
        label: "Fecha Ratificación",
        format: "date",
        priority: 0,
      },
      {
        field: "cargado_por_detalle.nombre_completo",
        label: "Cargado por",
        priority: 1,
      },
      {
        field: "tiene_archivo_resolucion",
        label: "Resolución",
        formatter: (value) => (value ? "✓ Archivo cargado" : "✗ Sin archivo"),
        priority: 2,
      },
    ],
  },

  // Permissions
  permissions: {
    canView: ["ET", "JZ", "DIRECTOR", "LEGAL", "SUPERUSER"],
    canCreate: ["LEGAL", "JZ", "SUPERUSER"],
    canEdit: [],
    canDelete: [],
  },

  // Advanced Options
  advanced: {
    autoRefresh: false,
    trackChanges: true,
  },
}

// ============================================================================
// CONFIGURATION REGISTRY
// ============================================================================

/**
 * Get section configuration by type
 */
export function getSectionConfig(sectionType: string): SectionConfig {
  switch (sectionType) {
    case "intervencion":
      return intervencionSectionConfig
    case "nota-aval":
      return notaAvalSectionConfig
    case "informe-juridico":
      return informeJuridicoSectionConfig
    case "ratificacion":
      return ratificacionSectionConfig
    default:
      throw new Error(`Unknown section type: ${sectionType}`)
  }
}

/**
 * Get all section configurations for a workflow phase
 */
export function getAllSectionConfigs(): Record<string, SectionConfig> {
  return {
    intervencion: intervencionSectionConfig,
    "nota-aval": notaAvalSectionConfig,
    "informe-juridico": informeJuridicoSectionConfig,
    ratificacion: ratificacionSectionConfig,
  }
}
