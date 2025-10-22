/**
 * Step Completion Logic
 *
 * Utilities for calculating step completion status, progress percentages,
 * and navigation unlock states.
 *
 * Rules:
 * - Step 1 (Intervención): Completed when estado === "APROBADO"
 * - Step 2 (Nota Aval): Completed when nota exists with decision
 * - Step 3 (Informe Jurídico): Completed when estado === "ENVIADO"
 * - Step 4 (Ratificación): Completed when ratificación exists with PDF (MPE/MPJ only, not MPI)
 *
 * Note: MPI has 3 steps (no Ratificación Judicial), MPE and MPJ have 4 steps
 */

import type { StepStatus, StepProgress } from "../types/workflow"

// ============================================================================
// STEP COMPLETION DETECTION
// ============================================================================

/**
 * Check if Step 1 (Intervención) is completed
 *
 * Step 1 is completed when the estado has moved beyond the approval stage
 * to PENDIENTE_NOTA_AVAL or any later stage
 */
export function isIntervencionCompleted(estado?: string): boolean {
  // Estados that indicate Step 1 is completed (we're past approval)
  const completedEstados = [
    "PENDIENTE_NOTA_AVAL",
    "PENDIENTE_INFORME_JURIDICO",
    "PENDIENTE_RATIFICACION_JUDICIAL",
    "RATIFICADA",
    "NO_RATIFICADA",
    "VIGENTE",
    "CERRADA"
  ]

  return estado ? completedEstados.includes(estado) : false
}

/**
 * Check if Step 2 (Nota de Aval) is completed
 *
 * Step 2 is completed when nota de aval exists with decision,
 * OR when estado has moved to PENDIENTE_INFORME_JURIDICO or beyond
 */
export function isNotaAvalCompleted(notaExists: boolean, hasDecision: boolean, estado?: string): boolean {
  // Estados that indicate Step 2 is completed (we're past nota de aval)
  const completedEstados = [
    "PENDIENTE_INFORME_JURIDICO",
    "PENDIENTE_RATIFICACION_JUDICIAL",
    "RATIFICADA",
    "NO_RATIFICADA",
    "VIGENTE",
    "CERRADA"
  ]

  // Check if estado indicates completion OR if nota exists with decision
  return (estado && completedEstados.includes(estado)) || (notaExists && hasDecision)
}

/**
 * Check if Step 3 (Informe Jurídico) is completed
 *
 * Step 3 is completed when informe exists and has been sent,
 * OR when estado has moved to PENDIENTE_RATIFICACION_JUDICIAL or beyond
 */
export function isInformeJuridicoCompleted(informeExists: boolean, estado?: string): boolean {
  // Estados that indicate Step 3 is completed (we're past informe juridico)
  const completedEstados = [
    "PENDIENTE_RATIFICACION_JUDICIAL",
    "RATIFICADA",
    "NO_RATIFICADA",
    "VIGENTE",
    "CERRADA"
  ]

  // Check if estado indicates completion OR if informe exists
  return (estado && completedEstados.includes(estado)) || informeExists
}

/**
 * Check if Step 4 (Ratificación Judicial) is completed
 *
 * Step 4 is completed when ratificación exists with PDF,
 * OR when estado is RATIFICADA, NO_RATIFICADA, VIGENTE, or CERRADA
 */
export function isRatificacionCompleted(ratificacionExists: boolean, hasPDF: boolean, estado?: string): boolean {
  // Estados that indicate Step 4 is completed (ratificación done)
  const completedEstados = [
    "RATIFICADA",
    "NO_RATIFICADA",
    "VIGENTE",
    "CERRADA"
  ]

  // Check if estado indicates completion OR if ratificacion exists with PDF
  return (estado && completedEstados.includes(estado)) || (ratificacionExists && hasPDF)
}

// ============================================================================
// PROGRESS CALCULATION
// ============================================================================

/**
 * Calculate progress percentage for Step 1 (Intervención)
 */
export function calculateIntervencionProgress(data: {
  hasFormData: boolean
  hasFiles: boolean
  estado?: string
}): number {
  let progress = 0

  // Form data filled: 40%
  if (data.hasFormData) progress += 40

  // Files uploaded: 30%
  if (data.hasFiles) progress += 30

  // Estado progression: BORRADOR (0%), ENVIADO (+15%), APROBADO (+30%)
  if (data.estado === "ENVIADO") progress += 15
  if (data.estado === "APROBADO") progress += 30

  return Math.min(progress, 100)
}

/**
 * Calculate progress percentage for Step 2 (Nota de Aval)
 * Binary: 0% or 100% (either completed or not)
 */
export function calculateNotaAvalProgress(data: {
  notaExists: boolean
  hasDecision: boolean
  hasComentarios: boolean
  hasPDF: boolean
}): number {
  if (!data.notaExists) return 0

  let progress = 0

  // Decision made: 40%
  if (data.hasDecision) progress += 40

  // Comentarios added: 30%
  if (data.hasComentarios) progress += 30

  // PDF uploaded: 30%
  if (data.hasPDF) progress += 30

  return Math.min(progress, 100)
}

/**
 * Calculate progress percentage for Step 3 (Informe Jurídico)
 */
export function calculateInformeJuridicoProgress(data: {
  hasFormData: boolean
  hasInformePDF: boolean
  hasAcuses: boolean
  enviado: boolean
}): number {
  let progress = 0

  // Form data filled: 30%
  if (data.hasFormData) progress += 30

  // Informe oficial uploaded: 40%
  if (data.hasInformePDF) progress += 40

  // Acuses uploaded: 10%
  if (data.hasAcuses) progress += 10

  // Enviado: 20%
  if (data.enviado) progress += 20

  return Math.min(progress, 100)
}

/**
 * Calculate progress percentage for Step 4 (Ratificación Judicial)
 * Binary: 0% or 100% (either completed or not)
 */
export function calculateRatificacionProgress(data: {
  ratificacionExists: boolean
  hasPDF: boolean
}): number {
  if (!data.ratificacionExists) return 0

  let progress = 50 // Exists: 50%

  // PDF uploaded: +50%
  if (data.hasPDF) progress += 50

  return Math.min(progress, 100)
}

// ============================================================================
// STEP STATUS DETERMINATION
// ============================================================================

/**
 * Determine the status of a step based on completion and position
 */
export function determineStepStatus(
  stepIndex: number,
  activeStep: number,
  isCompleted: boolean,
  previousStepCompleted: boolean
): StepStatus {
  // First step is always unlocked
  if (stepIndex === 0) {
    if (isCompleted) return "completed"
    if (activeStep === 0) return "current"
    return "pending"
  }

  // Subsequent steps require previous step completion
  if (!previousStepCompleted) {
    return "locked"
  }

  if (isCompleted) return "completed"
  if (stepIndex === activeStep) return "current"
  if (stepIndex < activeStep) return "pending" // Should not happen if logic is correct
  return "pending"
}

// ============================================================================
// STEP NAVIGATION
// ============================================================================

/**
 * Check if user can navigate to a specific step
 */
export function canNavigateToStep(
  targetStepIndex: number,
  completedSteps: boolean[]
): boolean {
  // Can always navigate to first step
  if (targetStepIndex === 0) return true

  // Can navigate to step if all previous steps are completed
  for (let i = 0; i < targetStepIndex; i++) {
    if (!completedSteps[i]) return false
  }

  return true
}

/**
 * Get the next unlocked step index
 */
export function getNextUnlockedStep(
  currentStep: number,
  completedSteps: boolean[],
  totalSteps: number
): number {
  // If current step not completed, stay on current
  if (!completedSteps[currentStep]) return currentStep

  // Find next incomplete step
  for (let i = currentStep + 1; i < totalSteps; i++) {
    if (!completedSteps[i]) return i
  }

  // All steps completed, stay on last step
  return totalSteps - 1
}

// ============================================================================
// WORKFLOW COMPLETION
// ============================================================================

/**
 * Check if entire workflow is completed
 */
export function isWorkflowCompleted(completedSteps: boolean[]): boolean {
  return completedSteps.every((completed) => completed)
}

/**
 * Calculate overall workflow progress percentage
 */
export function calculateWorkflowProgress(stepProgresses: number[]): number {
  if (stepProgresses.length === 0) return 0

  const totalProgress = stepProgresses.reduce((sum, progress) => sum + progress, 0)
  return Math.round(totalProgress / stepProgresses.length)
}

// ============================================================================
// STEP PROGRESS FACTORY
// ============================================================================

/**
 * Create a StepProgress object
 */
export function createStepProgress(
  percentage: number,
  estado?: string,
  completedFields: number = 0,
  totalFields: number = 0
): StepProgress {
  return {
    percentage: Math.min(Math.max(percentage, 0), 100), // Clamp between 0-100
    completedFields,
    totalFields,
    estado,
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate that step indices are within bounds
 */
export function validateStepIndex(
  stepIndex: number,
  totalSteps: number
): boolean {
  return stepIndex >= 0 && stepIndex < totalSteps
}

/**
 * Get user-friendly step name
 * Note: Step 4 (Ratificación Judicial) is only for MPE and MPJ, not MPI
 */
export function getStepName(stepIndex: number): string {
  const stepNames = [
    "Registro de Intervención",
    "Nota de Aval",
    "Informe Jurídico",
    "Ratificación Judicial",
  ]

  return stepNames[stepIndex] || `Paso ${stepIndex + 1}`
}

/**
 * Get step description
 * Note: Step 4 (Ratificación Judicial) is only for MPE and MPJ, not MPI
 */
export function getStepDescription(stepIndex: number): string {
  const descriptions = [
    "Registro inicial y aprobación de la intervención",
    "Aprobación por el Director de Zona",
    "Informe elaborado por el Equipo Legal",
    "Ratificación por el Poder Judicial",
  ]

  return descriptions[stepIndex] || ""
}
