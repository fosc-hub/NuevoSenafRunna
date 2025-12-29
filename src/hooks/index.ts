/**
 * Centralized Hook Exports
 *
 * This file provides a single entry point for importing all shared hooks.
 * Part of the DRY refactoring initiative.
 *
 * @example
 * import { useApiQuery, useFormSubmission, useSequentialSubmission } from '@/hooks'
 */

// ============================================================================
// API QUERY HOOKS
// ============================================================================

export {
  useApiQuery,
  useCatalogData,
  useConditionalData,
  type UseApiQueryOptions,
} from './useApiQuery'

// ============================================================================
// FORM SUBMISSION HOOKS
// ============================================================================

export {
  useFormSubmission,
  useSimpleSubmission,
  useDialogSubmission,
  defaultErrorExtractor,
} from './useFormSubmission'

export {
  useSequentialSubmission,
  createStep,
  getStepProgress,
  getProgressPercentage,
} from './useSequentialSubmission'

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Error extraction
  ErrorExtractor,
  // Form submission
  UseFormSubmissionOptions,
  UseFormSubmissionReturn,
  // Sequential submission
  SequentialStep,
  UseSequentialSubmissionOptions,
  UseSequentialSubmissionReturn,
} from './useFormSubmission.types'
