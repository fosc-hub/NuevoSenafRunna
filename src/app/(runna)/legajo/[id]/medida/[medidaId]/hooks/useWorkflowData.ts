/**
 * useWorkflowData Hook
 *
 * Reusable hook for managing workflow data with CRUD operations,
 * loading states, and automatic refresh functionality.
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import type { WorkflowApiService, WorkflowItem, SectionType } from "../types/workflow"

export interface UseWorkflowDataOptions {
  medidaId: number
  sectionType: SectionType
  apiService: WorkflowApiService
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

export interface UseWorkflowDataReturn {
  // Data
  items: WorkflowItem[]
  lastItem: WorkflowItem | null

  // State
  isLoading: boolean
  error: Error | null

  // Operations
  refresh: () => Promise<void>
  createItem: (data: any) => Promise<WorkflowItem>
  updateItem: (itemId: number, data: any) => Promise<WorkflowItem>
  deleteItem: (itemId: number) => Promise<void>

  // State Actions
  enviarItem: (itemId: number) => Promise<WorkflowItem>
  aprobarItem: (itemId: number) => Promise<WorkflowItem>
  rechazarItem: (itemId: number, reason: string) => Promise<WorkflowItem>

  // File Operations
  uploadFile: (itemId: number, file: File, type?: string) => Promise<any>
  deleteFile: (itemId: number, fileId: number) => Promise<void>
}

export function useWorkflowData(options: UseWorkflowDataOptions): UseWorkflowDataReturn {
  const {
    medidaId,
    sectionType,
    apiService,
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  const [items, setItems] = useState<WorkflowItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Refresh data from API
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`[useWorkflowData] Fetching ${sectionType} data for medida ${medidaId}`)
      const data = await apiService.getList(medidaId, {
        ordering: '-fecha_creacion', // Most recent first
      })

      console.log(`[useWorkflowData] Fetched ${data.length} items`)
      setItems(data)
    } catch (err) {
      console.error(`[useWorkflowData] Error fetching ${sectionType}:`, err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [medidaId, sectionType, apiService])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log(`[useWorkflowData] Auto-refreshing ${sectionType}`)
      refresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh, sectionType])

  // Get last item (most recent)
  const lastItem = useMemo(() => {
    if (items.length === 0) return null
    return items[0] // Already sorted by -fecha_creacion
  }, [items])

  // Create item
  const createItem = useCallback(async (data: any): Promise<WorkflowItem> => {
    try {
      console.log(`[useWorkflowData] Creating ${sectionType}:`, data)
      const newItem = await apiService.create(medidaId, data)
      console.log(`[useWorkflowData] Created successfully:`, newItem)

      // Refresh to get updated list
      await refresh()

      return newItem
    } catch (err) {
      console.error(`[useWorkflowData] Error creating ${sectionType}:`, err)
      throw err
    }
  }, [medidaId, sectionType, apiService, refresh])

  // Update item
  const updateItem = useCallback(async (itemId: number, data: any): Promise<WorkflowItem> => {
    if (!apiService.update) {
      throw new Error(`Update not supported for ${sectionType}`)
    }

    try {
      console.log(`[useWorkflowData] Updating ${sectionType} ${itemId}:`, data)
      const updatedItem = await apiService.update(medidaId, itemId, data)
      console.log(`[useWorkflowData] Updated successfully:`, updatedItem)

      // Refresh to get updated list
      await refresh()

      return updatedItem
    } catch (err) {
      console.error(`[useWorkflowData] Error updating ${sectionType}:`, err)
      throw err
    }
  }, [medidaId, sectionType, apiService, refresh])

  // Delete item
  const deleteItem = useCallback(async (itemId: number): Promise<void> => {
    if (!apiService.delete) {
      throw new Error(`Delete not supported for ${sectionType}`)
    }

    try {
      console.log(`[useWorkflowData] Deleting ${sectionType} ${itemId}`)
      await apiService.delete(medidaId, itemId)
      console.log(`[useWorkflowData] Deleted successfully`)

      // Refresh to get updated list
      await refresh()
    } catch (err) {
      console.error(`[useWorkflowData] Error deleting ${sectionType}:`, err)
      throw err
    }
  }, [medidaId, sectionType, apiService, refresh])

  // State Actions
  const enviarItem = useCallback(async (itemId: number): Promise<WorkflowItem> => {
    if (!apiService.stateActions?.enviar) {
      throw new Error(`Enviar not supported for ${sectionType}`)
    }

    try {
      console.log(`[useWorkflowData] Enviando ${sectionType} ${itemId}`)
      const updatedItem = await apiService.stateActions.enviar(medidaId, itemId)
      console.log(`[useWorkflowData] Enviado successfully:`, updatedItem)

      // Refresh to get updated list
      await refresh()

      return updatedItem
    } catch (err) {
      console.error(`[useWorkflowData] Error enviando ${sectionType}:`, err)
      throw err
    }
  }, [medidaId, sectionType, apiService, refresh])

  const aprobarItem = useCallback(async (itemId: number): Promise<WorkflowItem> => {
    if (!apiService.stateActions?.aprobar) {
      throw new Error(`Aprobar not supported for ${sectionType}`)
    }

    try {
      console.log(`[useWorkflowData] Aprobando ${sectionType} ${itemId}`)
      const updatedItem = await apiService.stateActions.aprobar(medidaId, itemId)
      console.log(`[useWorkflowData] Aprobado successfully:`, updatedItem)

      // Refresh to get updated list
      await refresh()

      return updatedItem
    } catch (err) {
      console.error(`[useWorkflowData] Error aprobando ${sectionType}:`, err)
      throw err
    }
  }, [medidaId, sectionType, apiService, refresh])

  const rechazarItem = useCallback(async (itemId: number, reason: string): Promise<WorkflowItem> => {
    if (!apiService.stateActions?.rechazar) {
      throw new Error(`Rechazar not supported for ${sectionType}`)
    }

    try {
      console.log(`[useWorkflowData] Rechazando ${sectionType} ${itemId}:`, reason)
      const updatedItem = await apiService.stateActions.rechazar(medidaId, itemId, reason)
      console.log(`[useWorkflowData] Rechazado successfully:`, updatedItem)

      // Refresh to get updated list
      await refresh()

      return updatedItem
    } catch (err) {
      console.error(`[useWorkflowData] Error rechazando ${sectionType}:`, err)
      throw err
    }
  }, [medidaId, sectionType, apiService, refresh])

  // File Operations
  const uploadFile = useCallback(async (itemId: number, file: File, type?: string): Promise<any> => {
    if (!apiService.uploadFile) {
      throw new Error(`File upload not supported for ${sectionType}`)
    }

    try {
      console.log(`[useWorkflowData] Uploading file for ${sectionType} ${itemId}:`, file.name)
      const adjunto = await apiService.uploadFile(medidaId, itemId, file, type)
      console.log(`[useWorkflowData] File uploaded successfully:`, adjunto)

      // Refresh to get updated item with new adjunto
      await refresh()

      return adjunto
    } catch (err) {
      console.error(`[useWorkflowData] Error uploading file:`, err)
      throw err
    }
  }, [medidaId, sectionType, apiService, refresh])

  const deleteFile = useCallback(async (itemId: number, fileId: number): Promise<void> => {
    if (!apiService.deleteFile) {
      throw new Error(`File delete not supported for ${sectionType}`)
    }

    try {
      console.log(`[useWorkflowData] Deleting file ${fileId} from ${sectionType} ${itemId}`)
      await apiService.deleteFile(medidaId, itemId, fileId)
      console.log(`[useWorkflowData] File deleted successfully`)

      // Refresh to get updated item without deleted adjunto
      await refresh()
    } catch (err) {
      console.error(`[useWorkflowData] Error deleting file:`, err)
      throw err
    }
  }, [medidaId, sectionType, apiService, refresh])

  return {
    // Data
    items,
    lastItem,

    // State
    isLoading,
    error,

    // Operations
    refresh,
    createItem,
    updateItem,
    deleteItem,

    // State Actions
    enviarItem,
    aprobarItem,
    rechazarItem,

    // File Operations
    uploadFile,
    deleteFile,
  }
}
