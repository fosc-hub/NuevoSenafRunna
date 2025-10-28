"use client"

import { useState, useCallback, useEffect } from 'react'
import type { UnifiedTimelineItem, TComentarioActividad, TAdjuntoActividad, THistorialActividad } from '../types/actividades'
import { actividadService } from '../services/actividadService'

interface UseUnifiedActivityReturn {
  items: UnifiedTimelineItem[]
  loading: boolean
  error: string | null
  loadItems: () => Promise<void>
  addComentario: (texto: string) => Promise<void>
  addAdjunto: (files: File[], tipos: string[], descripciones: string[]) => Promise<void>
  addBoth: (texto: string, files: File[], tipos: string[], descripciones: string[]) => Promise<void>
  filteredItems: (filter: 'all' | 'comentarios' | 'adjuntos') => UnifiedTimelineItem[]
}

export const useUnifiedActivity = (actividadId: number): UseUnifiedActivityReturn => {
  const [items, setItems] = useState<UnifiedTimelineItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Convert comentarios and adjuntos to unified timeline items
   */
  const mergeItems = useCallback((
    comentarios: TComentarioActividad[],
    adjuntos: TAdjuntoActividad[]
  ): UnifiedTimelineItem[] => {
    const comentarioItems: UnifiedTimelineItem[] = comentarios.map(comentario => ({
      id: `c-${comentario.id}`,
      type: 'COMENTARIO' as const,
      timestamp: comentario.fecha_creacion,
      user: {
        id: comentario.autor.id,
        username: comentario.autor.username,
        nombre_completo: comentario.autor.nombre_completo
      },
      data: comentario
    }))

    const adjuntoItems: UnifiedTimelineItem[] = adjuntos.map(adjunto => ({
      id: `a-${adjunto.id}`,
      type: 'ADJUNTO' as const,
      timestamp: adjunto.fecha_subida,
      user: {
        id: adjunto.usuario_carga.id,
        username: adjunto.usuario_carga.username,
        nombre_completo: adjunto.usuario_carga.nombre_completo
      },
      data: adjunto
    }))

    // Merge and sort by timestamp descending (newest first)
    const merged = [...comentarioItems, ...adjuntoItems].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    return merged
  }, [])

  /**
   * Transform historial comentario entries to TComentarioActividad format
   * Note: This is a workaround until backend includes comentarios in actividad GET response
   */
  const transformHistorialToComentario = useCallback((historialEntry: THistorialActividad): TComentarioActividad => {
    return {
      id: historialEntry.id,
      actividad_id: actividadId, // Use actividadId from hook context
      autor: {
        id: historialEntry.usuario.id,
        username: historialEntry.usuario.username,
        nombre_completo: historialEntry.usuario.nombre_completo
      },
      texto: historialEntry.motivo || '', // Comment text is in motivo field
      menciones: [], // Not available in historial - will display as plain text
      fecha_creacion: historialEntry.fecha_accion,
      editado: false, // Not tracked in historial
      notificaciones_enviadas: 0 // Not available in historial
    }
  }, [actividadId])

  /**
   * Load comentarios and adjuntos from API
   * Workaround: Fetch historial for comentarios until backend adds comentarios to actividad GET
   */
  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch both historial and actividad in parallel
      const [historialEntries, actividadDetail] = await Promise.all([
        actividadService.getHistorial(actividadId, {}),
        actividadService.get(actividadId)
      ])

      // Extract comentarios from historial entries with tipo_accion === "COMENTARIO"
      const comentarios: TComentarioActividad[] = historialEntries
        .filter((entry: THistorialActividad) => entry.tipo_accion === 'COMENTARIO')
        .map(transformHistorialToComentario)

      // Get adjuntos from actividad detail
      const adjuntos: TAdjuntoActividad[] = actividadDetail.adjuntos || []

      // Merge and set items
      const mergedItems = mergeItems(comentarios, adjuntos)
      setItems(mergedItems)
    } catch (err: any) {
      console.error('Error loading unified activity items:', err)
      setError(err.message || 'Error al cargar los datos')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [actividadId, mergeItems, transformHistorialToComentario])

  /**
   * Add a new comentario
   */
  const addComentario = useCallback(async (texto: string) => {
    try {
      await actividadService.agregarComentario(actividadId, texto)
      await loadItems() // Reload to get fresh data
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Error al agregar comentario')
    }
  }, [actividadId, loadItems])

  /**
   * Add adjunto(s)
   */
  const addAdjunto = useCallback(async (files: File[], tipos: string[], descripciones: string[]) => {
    try {
      // Upload each file individually
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const tipo = tipos[i] || 'EVIDENCIA'
        const descripcion = descripciones[i] || ''

        await actividadService.addAttachment(actividadId, {
          tipo_adjunto: tipo,
          archivo: file,
          descripcion
        })
      }

      await loadItems() // Reload to get fresh data
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Error al subir archivos')
    }
  }, [actividadId, loadItems])

  /**
   * Add both comentario and adjunto(s) in sequence
   */
  const addBoth = useCallback(async (
    texto: string,
    files: File[],
    tipos: string[],
    descripciones: string[]
  ) => {
    try {
      // Add comentario first if provided
      if (texto.trim()) {
        await actividadService.agregarComentario(actividadId, texto)
      }

      // Then add adjuntos if provided
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const tipo = tipos[i] || 'EVIDENCIA'
          const descripcion = descripciones[i] || ''

          await actividadService.addAttachment(actividadId, {
            tipo_adjunto: tipo,
            archivo: file,
            descripcion
          })
        }
      }

      await loadItems() // Reload to get fresh data
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Error al guardar los datos')
    }
  }, [actividadId, loadItems])

  /**
   * Filter items by type
   */
  const filteredItems = useCallback((filter: 'all' | 'comentarios' | 'adjuntos'): UnifiedTimelineItem[] => {
    if (filter === 'all') return items
    if (filter === 'comentarios') return items.filter(item => item.type === 'COMENTARIO')
    if (filter === 'adjuntos') return items.filter(item => item.type === 'ADJUNTO')
    return items
  }, [items])

  // Load items on mount and when actividadId changes
  useEffect(() => {
    if (actividadId) {
      loadItems()
    }
  }, [actividadId, loadItems])

  return {
    items,
    loading,
    error,
    loadItems,
    addComentario,
    addAdjunto,
    addBoth,
    filteredItems
  }
}
