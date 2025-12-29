/**
 * UseFormSubmission Types
 *
 * Type definitions for the useFormSubmission and useSequentialSubmission hooks.
 * Part of the P7 DRY refactoring initiative to eliminate duplicate form submission patterns.
 *
 * @see claudedocs/DRY_REFACTORING_GUIDE.md for full context
 */

import type { QueryKey } from '@tanstack/react-query'

// ============================================================================
// ERROR EXTRACTION
// ============================================================================

/**
 * Function type for extracting error messages from API errors.
 * Handles various error response formats from the backend.
 */
export type ErrorExtractor = (error: unknown) => string

/**
 * Default error extraction logic.
 * Handles common API error response patterns:
 * - error.response.data.detail (DRF standard)
 * - error.response.data.message
 * - error.response.data.error
 * - error.message (generic Error)
 */
export const defaultErrorExtractor: ErrorExtractor = (error: unknown): string => {
  if (!error) return 'Error desconocido'

  // Axios error response patterns
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, any>

    // Check for axios response data
    if (err.response?.data) {
      const data = err.response.data

      // DRF standard error format
      if (typeof data.detail === 'string') return data.detail

      // Array of errors (validation errors)
      if (Array.isArray(data.detail)) {
        return data.detail.map((e: any) => e.msg || e.message || String(e)).join(', ')
      }

      // Alternative formats
      if (typeof data.message === 'string') return data.message
      if (typeof data.error === 'string') return data.error

      // Non-field errors from DRF
      if (Array.isArray(data.non_field_errors)) {
        return data.non_field_errors.join(', ')
      }
    }

    // Generic Error object
    if (err.message && typeof err.message === 'string') {
      return err.message
    }
  }

  // Fallback for string errors
  if (typeof error === 'string') return error

  return 'Error al procesar la solicitud'
}

// ============================================================================
// OPTIONS INTERFACE
// ============================================================================

/**
 * Configuration options for useFormSubmission hook.
 *
 * @template TData - The type of data submitted by the form
 * @template TResponse - The type of response returned by the API
 */
export interface UseFormSubmissionOptions<TData, TResponse = unknown> {
  /**
   * The async function that submits the form data.
   * This is typically an API service call.
   *
   * @example
   * onSubmit: (data) => actividadService.cancel(actividadId, data.motivo)
   */
  onSubmit: (data: TData) => Promise<TResponse>

  /**
   * Callback executed on successful submission.
   * Receives the API response data.
   */
  onSuccess?: (response: TResponse) => void

  /**
   * Callback executed when submission fails.
   * Receives the extracted error.
   */
  onError?: (error: Error) => void

  /**
   * Whether to show a success toast notification.
   * @default false
   */
  showSuccessToast?: boolean

  /**
   * Success toast message.
   * Only used if showSuccessToast is true.
   * @default 'Operación exitosa'
   */
  successMessage?: string

  /**
   * Whether to show an error toast notification.
   * @default true
   */
  showErrorToast?: boolean

  /**
   * Error toast message. Can be a string or a function that receives the error.
   * @default Uses defaultErrorExtractor
   */
  errorMessage?: string | ((error: Error) => string)

  /**
   * TanStack Query keys to invalidate on success.
   * Useful for refetching related data after mutation.
   *
   * @example
   * invalidateQueries: [['actividades'], ['medida', medidaId]]
   */
  invalidateQueries?: QueryKey[]

  /**
   * Transform function applied to data before submission.
   * Useful for data normalization or adding default values.
   *
   * @example
   * transformData: (data) => ({ ...data, timestamp: Date.now() })
   */
  transformData?: (data: TData) => TData

  /**
   * Validation function called before submission.
   * Return an error message string to prevent submission.
   * Return undefined to allow submission.
   *
   * @example
   * validate: (data) => data.motivo.trim() ? undefined : 'Motivo es requerido'
   */
  validate?: (data: TData) => string | undefined

  /**
   * Callback for resetting form state.
   * Called when reset() is invoked.
   */
  onReset?: () => void

  /**
   * Callback for closing the form/dialog.
   * Called when close() is invoked after resetting state.
   */
  onClose?: () => void

  /**
   * Custom error extractor function.
   * Override the default error extraction logic.
   */
  extractError?: ErrorExtractor
}

// ============================================================================
// RETURN TYPE
// ============================================================================

/**
 * Return type for useFormSubmission hook.
 *
 * @template TData - The type of data submitted by the form
 * @template TResponse - The type of response returned by the API
 */
export interface UseFormSubmissionReturn<TData, TResponse = unknown> {
  /**
   * Submit the form with the provided data.
   * Handles loading state, error handling, and callbacks automatically.
   */
  submit: (data: TData) => Promise<void>

  /**
   * Whether a submission is currently in progress.
   */
  isLoading: boolean

  /**
   * Current error message, if any.
   * null if no error occurred.
   */
  error: string | null

  /**
   * Response data from the last successful submission.
   * null if no successful submission has occurred.
   */
  data: TResponse | null

  /**
   * Clear the current error.
   */
  clearError: () => void

  /**
   * Reset the hook state and call onReset callback.
   * Clears error, data, and loading state.
   */
  reset: () => void

  /**
   * Reset state and call onClose callback.
   * Convenience method for dialog close handlers.
   */
  close: () => void
}

// ============================================================================
// SEQUENTIAL SUBMISSION TYPES
// ============================================================================

/**
 * Configuration for a single step in sequential submission.
 *
 * @template TData - The type of data for this step
 * @template TResponse - The type of response from this step
 */
export interface SequentialStep<TData = unknown, TResponse = unknown> {
  /**
   * Unique identifier for this step.
   */
  id: string

  /**
   * Human-readable name for this step.
   */
  name: string

  /**
   * The async function that executes this step.
   * Receives data and context from previous steps.
   */
  execute: (data: TData, context: Record<string, unknown>) => Promise<TResponse>

  /**
   * Optional validation before executing this step.
   */
  validate?: (data: TData) => string | undefined

  /**
   * Whether this step is optional and can be skipped.
   * @default false
   */
  optional?: boolean
}

/**
 * Configuration options for useSequentialSubmission hook.
 */
export interface UseSequentialSubmissionOptions {
  /**
   * Array of steps to execute in order.
   */
  steps: SequentialStep[]

  /**
   * Callback executed when all steps complete successfully.
   */
  onComplete?: (results: Record<string, unknown>) => void

  /**
   * Callback executed when a step fails.
   */
  onStepError?: (stepId: string, error: Error) => void

  /**
   * Whether to show toast notifications for each step.
   * @default false
   */
  showStepToasts?: boolean

  /**
   * TanStack Query keys to invalidate on complete.
   */
  invalidateQueries?: QueryKey[]

  /**
   * Reset callback.
   */
  onReset?: () => void

  /**
   * Close callback.
   */
  onClose?: () => void
}

/**
 * Return type for useSequentialSubmission hook.
 */
export interface UseSequentialSubmissionReturn {
  /**
   * Start the sequential submission process with initial data.
   */
  start: (initialData: Record<string, unknown>) => Promise<void>

  /**
   * Current step index (0-based).
   */
  currentStep: number

  /**
   * Total number of steps.
   */
  totalSteps: number

  /**
   * ID of the current step.
   */
  currentStepId: string | null

  /**
   * Whether submission is in progress.
   */
  isLoading: boolean

  /**
   * Current error message.
   */
  error: string | null

  /**
   * Results from completed steps.
   */
  results: Record<string, unknown>

  /**
   * Whether all steps have completed.
   */
  isComplete: boolean

  /**
   * Clear error.
   */
  clearError: () => void

  /**
   * Reset state.
   */
  reset: () => void

  /**
   * Reset and close.
   */
  close: () => void
}
