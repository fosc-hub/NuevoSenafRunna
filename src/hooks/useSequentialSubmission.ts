/**
 * UseSequentialSubmission Hook
 *
 * Handles multi-step form submissions where steps must execute in order.
 * Each step can access results from previous steps through a shared context.
 *
 * Part of the P7 DRY refactoring initiative.
 * @see claudedocs/DRY_REFACTORING_GUIDE.md
 *
 * @example
 * const { start, currentStep, totalSteps, isLoading, error, isComplete } = useSequentialSubmission({
 *   steps: [
 *     {
 *       id: 'create-persona',
 *       name: 'Crear Persona',
 *       execute: async (data) => await personaService.create(data.persona),
 *     },
 *     {
 *       id: 'create-vinculo',
 *       name: 'Crear Vínculo',
 *       execute: async (data, context) => {
 *         // context contains { 'create-persona': PersonaResponse }
 *         const personaId = (context['create-persona'] as any).id
 *         return await vinculoService.create({ ...data.vinculo, persona_id: personaId })
 *       },
 *     },
 *   ],
 *   onComplete: (results) => {
 *     console.log('All steps completed:', results)
 *     onClose()
 *   },
 *   invalidateQueries: [['personas'], ['vinculos']],
 * })
 */

'use client'

import { useState, useCallback } from 'react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import {
  type UseSequentialSubmissionOptions,
  type UseSequentialSubmissionReturn,
  defaultErrorExtractor,
} from './useFormSubmission.types'

// ============================================================================
// HOOK
// ============================================================================

/**
 * Generic hook for sequential multi-step form submissions.
 * Executes steps in order, passing context between steps.
 *
 * @param options - Hook configuration options
 * @returns Sequential submission state and control functions
 */
export function useSequentialSubmission(
  options: UseSequentialSubmissionOptions
): UseSequentialSubmissionReturn {
  const {
    steps,
    onComplete,
    onStepError,
    showStepToasts = false,
    invalidateQueries,
    onReset,
    onClose,
  } = options

  // ============================================================================
  // STATE
  // ============================================================================

  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, unknown>>({})
  const [isComplete, setIsComplete] = useState(false)

  const queryClient = useQueryClient()

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const totalSteps = steps.length
  const currentStepId = currentStep < steps.length ? steps[currentStep].id : null

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
   * Reset all state to initial values.
   */
  const reset = useCallback(() => {
    setCurrentStep(0)
    setIsLoading(false)
    setError(null)
    setResults({})
    setIsComplete(false)
    onReset?.()
  }, [onReset])

  /**
   * Reset state and call onClose callback.
   */
  const close = useCallback(() => {
    reset()
    onClose?.()
  }, [reset, onClose])

  /**
   * Start the sequential submission process.
   * Executes all steps in order, collecting results.
   */
  const start = useCallback(
    async (initialData: Record<string, unknown>): Promise<void> => {
      setIsLoading(true)
      setError(null)
      setIsComplete(false)
      setCurrentStep(0)

      const collectedResults: Record<string, unknown> = {}

      try {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i]
          setCurrentStep(i)

          // Run step validation if provided
          if (step.validate) {
            const validationError = step.validate(initialData)
            if (validationError) {
              // If step is optional and validation fails, skip it
              if (step.optional) {
                if (showStepToasts) {
                  toast.info(`Paso "${step.name}" omitido`)
                }
                continue
              }
              throw new Error(validationError)
            }
          }

          // Execute the step
          try {
            const stepResult = await step.execute(initialData, collectedResults)
            collectedResults[step.id] = stepResult

            if (showStepToasts) {
              toast.success(`Paso "${step.name}" completado`)
            }
          } catch (stepError) {
            // If step is optional, log and continue
            if (step.optional) {
              console.warn(`Optional step "${step.id}" failed:`, stepError)
              if (showStepToasts) {
                toast.warning(`Paso opcional "${step.name}" falló`)
              }
              continue
            }

            // Re-throw for required steps
            throw stepError
          }
        }

        // All steps completed successfully
        setResults(collectedResults)
        setIsComplete(true)

        // Invalidate queries if configured
        if (invalidateQueries && invalidateQueries.length > 0) {
          await Promise.all(
            invalidateQueries.map((queryKey: QueryKey) =>
              queryClient.invalidateQueries({ queryKey })
            )
          )
        }

        // Call completion callback
        onComplete?.(collectedResults)
      } catch (err) {
        const extractedError = defaultErrorExtractor(err)
        setError(extractedError)

        // Show error toast
        toast.error(extractedError)

        // Call step error callback
        if (currentStepId) {
          onStepError?.(currentStepId, err as Error)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [steps, showStepToasts, invalidateQueries, queryClient, onComplete, currentStepId, onStepError]
  )

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    start,
    currentStep,
    totalSteps,
    currentStepId,
    isLoading,
    error,
    results,
    isComplete,
    clearError,
    reset,
    close,
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Helper to create a step configuration.
 * Provides type safety for step definitions.
 *
 * @example
 * const createPersonaStep = createStep({
 *   id: 'create-persona',
 *   name: 'Crear Persona',
 *   execute: async (data) => await personaService.create(data),
 * })
 */
export function createStep<TData = unknown, TResponse = unknown>(config: {
  id: string
  name: string
  execute: (data: TData, context: Record<string, unknown>) => Promise<TResponse>
  validate?: (data: TData) => string | undefined
  optional?: boolean
}) {
  return config
}

/**
 * Progress indicator helper.
 * Returns a formatted string for progress display.
 *
 * @example
 * const progress = getStepProgress(currentStep, totalSteps)
 * // Returns: "Paso 2 de 3"
 */
export function getStepProgress(currentStep: number, totalSteps: number): string {
  return `Paso ${currentStep + 1} de ${totalSteps}`
}

/**
 * Calculate progress percentage.
 *
 * @example
 * const percentage = getProgressPercentage(1, 3) // Returns: 33.33
 */
export function getProgressPercentage(currentStep: number, totalSteps: number): number {
  if (totalSteps === 0) return 0
  return Math.round((currentStep / totalSteps) * 100 * 100) / 100
}
