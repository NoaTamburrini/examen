import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GroupScores, KoResult, KoResults, PartialScore } from '@/types'

interface PredictionState {
  groupScores: GroupScores
  koResults: KoResults
  setGroupScore: (matchId: string, score: PartialScore | null) => void
  setKoResult: (matchId: string, result: KoResult | null) => void
  clearKoResults: (matchIds: string[]) => void
  reset: () => void
}

const STORAGE_KEY = 'wcp-2026'
const STORAGE_VERSION = 1

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set) => ({
      groupScores: {},
      koResults: {},

      setGroupScore: (matchId, score) =>
        set((state) => {
          const next = { ...state.groupScores }
          if (score === null || (score.home === null && score.away === null)) {
            delete next[matchId]
          } else {
            next[matchId] = score
          }
          return { groupScores: next }
        }),

      setKoResult: (matchId, result) =>
        set((state) => {
          const next = { ...state.koResults }
          if (result === null) {
            delete next[matchId]
          } else {
            next[matchId] = result
          }
          return { koResults: next }
        }),

      clearKoResults: (matchIds) =>
        set((state) => {
          if (matchIds.length === 0) return state
          const next = { ...state.koResults }
          let changed = false
          for (const id of matchIds) {
            if (id in next) {
              delete next[id]
              changed = true
            }
          }
          return changed ? { koResults: next } : state
        }),

      reset: () => set({ groupScores: {}, koResults: {} }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      partialize: (state) => ({
        groupScores: state.groupScores,
        koResults: state.koResults,
      }),
    },
  ),
)
