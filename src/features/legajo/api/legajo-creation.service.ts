/**
 * API Service for Legajo Creation (LEG-02)
 * Endpoints: POST /api/legajos/, PUT /api/evaluaciones/{id}/autorizar/
 */

import { create, put } from '@/app/api/apiService'
import { toast } from 'react-toastify'
import type {
  CreateLegajoManualRequest,
  CreateLegajoResponse,
  AutorizarAdmisionRequest,
  AutorizarAdmisionResponse,
} from '../types/legajo-creation.types'

/**
 * Create legajo manually
 * POST /api/legajos/
 *
 * @param data - Request data with NNyA and assignment information
 * @returns Created legajo with full details
 */
export const createLegajo = async (
  data: CreateLegajoManualRequest
): Promise<CreateLegajoResponse> => {
  try {
    console.log('Creating legajo with data:', data)

    // Call API - create() already adds trailing slash
    const response = await create<CreateLegajoResponse>('legajos', data)

    console.log('Legajo created successfully:', response)

    // Show success toast
    toast.success(`Legajo ${response.numero} creado exitosamente`, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    })

    return response
  } catch (error: any) {
    console.error('Error creating legajo:', error)
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })

    // Handle specific error cases
    if (error.response?.status === 409) {
      // Conflict - NNyA already has legajo
      const errorDetail = error.response?.data?.detail || 'El NNyA ya tiene un legajo asignado'
      toast.error(errorDetail, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    } else if (error.response?.status === 403) {
      // Forbidden - Permission denied
      const errorDetail = error.response?.data?.detail || 'No tiene permisos para crear legajos en esta zona'
      toast.error(errorDetail, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    } else if (error.response?.status === 400) {
      // Bad request - Validation error
      const errorDetail = error.response?.data?.detail || 'Error de validación en los datos'
      const errorMsg = typeof errorDetail === 'string'
        ? errorDetail
        : 'Por favor, verifique los datos ingresados'

      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    } else {
      // Generic error
      toast.error('Error al crear legajo. Por favor, intente nuevamente.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    }

    throw error
  }
}

/**
 * Autorizar admision and create legajos automatically
 * PUT /api/evaluaciones/{demanda_pk}/autorizar/?autorizar=true
 *
 * @param demandaId - ID of the demanda being authorized
 * @param data - Authorization data (decision, justification)
 * @returns Response with created and existing legajos
 */
export const autorizarAdmisionYCrearLegajos = async (
  demandaId: number,
  data: AutorizarAdmisionRequest = {}
): Promise<AutorizarAdmisionResponse> => {
  try {
    console.log(`Authorizing admision for demanda ${demandaId}:`, data)

    // REFACTORED: Use apiService.put() instead of axiosInstance
    const response = await put<AutorizarAdmisionResponse>(
      `evaluaciones/${demandaId}/autorizar/?autorizar=true`,
      demandaId,
      {
        decision: data.decision || 'AUTORIZAR_ADMISION',
        justificacion_director: data.justificacion_director || 'Autorizado por Director',
        ...data
      },
      false // Don't show toast - we handle toasts manually below
    )

    console.log('Admision authorized successfully:', response)

    // Check if response has legajos_creados field (expected structure)
    // or if it's just an evaluation response (actual structure)
    // Note: apiService.put() returns data directly, not wrapped in response.data
    if (response.legajos_creados !== undefined) {
      // Expected response structure with legajos
      const { total_creados, total_existentes } = response
      const successMsg = total_existentes > 0
        ? `${total_creados} legajo(s) creado(s), ${total_existentes} vinculado(s) a legajos existentes`
        : `${total_creados} legajo(s) creado(s) exitosamente`

      toast.success(successMsg, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })

      // Show individual legajo creation toasts
      response.legajos_creados.forEach((legajo: any) => {
        toast.info(`Legajo ${legajo.numero} creado para ${legajo.nnya.nombre} ${legajo.nnya.apellido}`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'info',
        })
      })
    } else {
      // Actual response structure - just evaluation object
      const nnyaCount = response.evaluacion_personas?.length || 0
      const successMsg = `Admisión autorizada para ${nnyaCount} NNyA`

      toast.success(successMsg, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      })
    }

    return response
  } catch (error: any) {
    console.error(`Error authorizing admision for demanda ${demandaId}:`, error)
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    })

    // Handle specific error cases
    if (error.response?.status === 403) {
      toast.error('Solo Directores pueden autorizar admisión', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored',
      })
    } else if (error.response?.status === 404) {
      toast.error('Demanda o evaluación no encontrada', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored',
      })
    } else if (error.response?.status === 400) {
      const errorDetail = error.response?.data?.detail || 'Error en la validación de datos'
      toast.error(errorDetail, {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored',
      })
    } else {
      toast.error('Error al autorizar admisión. Por favor, intente nuevamente.', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored',
      })
    }

    throw error
  }
}
