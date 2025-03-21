"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { FormData } from "../types/formTypes"

interface DraftState {
  // Store drafts by ID (or 'new' for a new form)
  drafts: Record<string, FormData>
  // Save draft data
  saveDraft: (formId: string, data: FormData) => void
  // Get draft data
  getDraft: (formId: string) => FormData | null
  // Clear a specific draft
  clearDraft: (formId: string) => void
  // Clear all drafts
  clearAllDrafts: () => void
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: {},

      saveDraft: (formId, data) => {
        set((state) => ({
          drafts: {
            ...state.drafts,
            [formId]: data,
          },
        }))
      },

      getDraft: (formId) => {
        const state = get()
        return state.drafts[formId] || null
      },

      clearDraft: (formId) => {
        set((state) => {
          const newDrafts = { ...state.drafts }
          delete newDrafts[formId]
          return { drafts: newDrafts }
        })
      },

      clearAllDrafts: () => {
        set({ drafts: {} })
      },
    }),
    {
      name: "form-drafts-storage",
    },
  ),
)

