/**
 * Instituto and Sector options for MPJ SEGUIMIENTO EN DISPOSITIVO
 * Data source: https://docs.google.com/spreadsheets/d/1qwbevOLXnB-87EzPlGbyIU1KvWwM7asr5GWZkYmWWKk/edit?usp=sharing
 */

import type { InstitutoOption } from '../types/seguimiento-dispositivo'

export const INSTITUTOS_MPJ: InstitutoOption[] = [
  {
    id: 'INSTITUTO_1',
    nombre: 'Instituto 1',
    sectores: ['Sector A', 'Sector B', 'Sector C']
  },
  {
    id: 'INSTITUTO_2',
    nombre: 'Instituto 2',
    sectores: ['Sector A', 'Sector B', 'Sector C', 'Sector D']
  },
  {
    id: 'INSTITUTO_3',
    nombre: 'Instituto 3',
    sectores: ['Sector A', 'Sector B']
  },
  {
    id: 'INSTITUTO_4',
    nombre: 'Instituto 4',
    sectores: ['Sector Único']
  },
  {
    id: 'INSTITUTO_5',
    nombre: 'Instituto 5',
    sectores: ['Sector A', 'Sector B', 'Sector C']
  },
]

/**
 * Get sectores for a specific instituto
 */
export function getSectoresByInstituto(institutoId: string): string[] {
  const instituto = INSTITUTOS_MPJ.find(i => i.id === institutoId)
  return instituto?.sectores || []
}

/**
 * Get instituto name by ID
 */
export function getInstitutoName(institutoId: string): string {
  const instituto = INSTITUTOS_MPJ.find(i => i.id === institutoId)
  return instituto?.nombre || 'Sin especificar'
}
