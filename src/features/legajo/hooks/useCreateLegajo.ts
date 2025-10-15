/**
 * Custom hook for legajo creation (LEG-02)
 * Uses React Query for mutation management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createLegajo } from '../api/legajo-creation.service'
import type { CreateLegajoManualRequest } from '../types/legajo-creation.types'

/**
 * Hook for creating legajo manually
 *
 * Features:
 * - Mutation management with React Query
 * - Automatic cache invalidation on success
 * - Navigation to created legajo detail
 * - Error handling
 *
 * @returns Mutation object with mutate, mutateAsync, isPending, error
 */
export const useCreateLegajo = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: CreateLegajoManualRequest) => createLegajo(data),

    onSuccess: (response) => {
      console.log('Legajo created successfully, invalidating queries and navigating')

      // Invalidate legajos queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['legajos'] })

      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['demandas'] })

      // Navigate to the created legajo detail page
      // Adjust path according to your routing structure
      router.push(`/legajo/${response.id}`)
    },

    onError: (error: any) => {
      console.error('Mutation error in useCreateLegajo:', error)
      // Error toasts are already handled in the service
      // Additional error handling can be added here if needed
    },
  })
}

/**
 * Hook for autorizar admision (automatic legajo creation)
 * PUT /api/evaluaciones/{demanda_pk}/autorizar/
 */
export const useAutorizarAdmision = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ demandaId }: { demandaId: number }) =>
      import('../api/legajo-creation.service').then(m =>
        m.autorizarAdmisionYCrearLegajos(demandaId)
      ),

    onSuccess: (response) => {
      console.log('Admision authorized successfully:', response)

      // Invalidate multiple queries
      queryClient.invalidateQueries({ queryKey: ['legajos'] })
      queryClient.invalidateQueries({ queryKey: ['demandas'] })
      queryClient.invalidateQueries({ queryKey: ['evaluaciones'] })

      // Optionally, redirect to legajos list or first created legajo
      // This can be handled in the component using this hook
    },

    onError: (error: any) => {
      console.error('Error in useAutorizarAdmision:', error)
      // Error handling done in service
    },
  })
}
