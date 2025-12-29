/**
 * UseFormSubmission Hook
 *
 * Consolidates duplicate form submission patterns across 33+ forms in the codebase.
 * Handles loading state, error extraction, toast notifications, and cache invalidation.
 *
 * Part of the P7 DRY refactoring initiative.
 * @see claudedocs/DRY_REFACTORING_GUIDE.md
 *
 * @example
 * // Simple usage
 * const { submit, isLoading, error } = useFormSubmission({
 *   onSubmit: (data) => actividadService.cancel(actividadId, data.motivo),
 *   showSuccessToast: true,
 *   successMessage: 'Actividad cancelada exitosamente',
 *   onSuccess: () => onClose(),
 *   invalidateQueries: [['actividades', medidaId]],
 * })
 *
 * @example
 * // With validation
 * const { submit, isLoading, error, close } = useFormSubmission({
 *   onSubmit: (data) => api.create(data),
 *   validate: (data) => !data.name.trim() ? 'Nombre es requerido' : undefined,
 *   onSuccess: handleSuccess,
 *   onClose: handleClose,
 * })
 */

'use client'

import { useState, useCallback } from 'react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import {
  type UseFormSubmissionOptions,
  type UseFormSubmissionReturn,
  defaultErrorExtractor,
} from './useFormSubmission.types'

// ============================================================================
// HOOK
// ============================================================================

/**
 * Generic hook for form submissions with standardized error handling,
 * loading state management, and TanStack Query integration.
 *
 * @template TData - The type of data submitted by the form
 * @template TResponse - The type of response returned by the API
 * @param options - Hook configuration options
 * @returns Form submission state and control functions
 */
export function useFormSubmission<TData, TResponse = unknown>(
  options: UseFormSubmissionOptions<TData, TResponse>
): UseFormSubmissionReturn<TData, TResponse> {
  const {
    onSubmit,
    onSuccess,
    onError,
    showSuccessToast = false,
    successMessage = 'Operación exitosa',
    showErrorToast = true,
    errorMessage,
    invalidateQueries,
    transformData,
    validate,
    onReset,
    onClose,
    extractError = defaultErrorExtractor,
  } = options

  // ============================================================================
  // STATE
  // ============================================================================

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TResponse | null>(null)

  const queryClient = useQueryClient()

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Clear the current error message.
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Reset all state to initial values and call onReset callback.
   */
  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
    onReset?.()
  }, [onReset])

  /**
   * Reset state and call onClose callback.
   * Convenience method for dialog close handlers.
   */
  const close = useCallback(() => {
    reset()
    onClose?.()
  }, [reset, onClose])

  /**
   * Submit the form data.
   * Handles validation, transformation, API call, and all callbacks.
   */
  const submit = useCallback(
    async (formData: TData): Promise<void> => {
      // Run validation if provided
      if (validate) {
        const validationError = validate(formData)
        if (validationError) {
          setError(validationError)
          return
        }
      }

      setIsLoading(true)
      setError(null)

      try {
        // Transform data if transformer provided
        const dataToSubmit = transformData ? transformData(formData) : formData

        // Execute the submission
        const response = await onSubmit(dataToSubmit)
        setData(response)

        // Show success toast if configured
        if (showSuccessToast) {
          toast.success(successMessage)
        }

        // Invalidate queries if configured
        if (invalidateQueries && invalidateQueries.length > 0) {
          await Promise.all(
            invalidateQueries.map((queryKey: QueryKey) =>
              queryClient.invalidateQueries({ queryKey })
            )
          )
        }

        // Call success callback
        onSuccess?.(response)
      } catch (err) {
        // Extract error message
        const extractedError = extractError(err)
        setError(extractedError)

        // Show error toast if configured
        if (showErrorToast) {
          const toastMessage =
            typeof errorMessage === 'function'
              ? errorMessage(err as Error)
              : errorMessage || extractedError
          toast.error(toastMessage)
        }

        // Call error callback
        onError?.(err as Error)
      } finally {
        setIsLoading(false)
      }
    },
    [
      validate,
      transformData,
      onSubmit,
      showSuccessToast,
      successMessage,
      invalidateQueries,
      queryClient,
      onSuccess,
      showErrorToast,
      errorMessage,
      extractError,
      onError,
    ]
  )

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    submit,
    isLoading,
    error,
    data,
    clearError,
    reset,
    close,
  }
}

// ============================================================================
// CONVENIENCE VARIANTS
// ============================================================================

/**
 * Specialized hook for simple form submissions that just need
 * loading state and basic success/error handling.
 *
 * @example
 * const { submit, isLoading } = useSimpleSubmission({
 *   onSubmit: (data) => api.create(data),
 *   onSuccess: () => router.push('/list'),
 * })
 */
export function useSimpleSubmission<TData, TResponse = unknown>(
  onSubmit: (data: TData) => Promise<TResponse>,
  onSuccess?: (response: TResponse) => void
): Pick<UseFormSubmissionReturn<TData, TResponse>, 'submit' | 'isLoading' | 'error'> {
  const { submit, isLoading, error } = useFormSubmission<TData, TResponse>({
    onSubmit,
    onSuccess,
    showSuccessToast: false,
    showErrorToast: true,
  })

  return { submit, isLoading, error }
}

/**
 * Specialized hook for form submissions that close a dialog on success.
 *
 * @example
 * const { submit, isLoading, error, close } = useDialogSubmission({
 *   onSubmit: (data) => actividadService.update(data),
 *   successMessage: 'Actualizado correctamente',
 *   onClose: handleDialogClose,
 *   invalidateQueries: [['actividades']],
 * })
 */
export function useDialogSubmission<TData, TResponse = unknown>(
  options: Omit<UseFormSubmissionOptions<TData, TResponse>, 'showSuccessToast'> & {
    successMessage: string
  }
): UseFormSubmissionReturn<TData, TResponse> {
  return useFormSubmission<TData, TResponse>({
    ...options,
    showSuccessToast: true,
  })
}

export { defaultErrorExtractor }
