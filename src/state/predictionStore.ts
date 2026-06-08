import type { GroupScores, KoInput, KoInputs, PartialScore } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PredictionState {
  groupScores: GroupScores
  koInputs: KoInputs
  setGroupScore: (matchId: string, score: PartialScore | null) => void
  setKoInput: (matchId: string, input: KoInput | null) => void
  clearKoInputs: (matchIds: string[]) => void
  reset: () => void
}

const STORAGE_KEY = 'wcp'
const STORAGE_VERSION = 1

function isEmptyScore(score?: PartialScore): boolean {
  return !score || (score.home === null && score.away === null)
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    set => ({
      groupScores: {},
      koInputs: {},

      setGroupScore: (matchId, score) =>
        set(state => {
          const next = { ...state.groupScores }
          if (score === null || (score.home === null && score.away === null)) {
            delete next[matchId]
          } else {
            next[matchId] = score
          }
          return { groupScores: next }
        }),

      setKoInput: (matchId, input) =>
        set(state => {
          const next = { ...state.koInputs }
          const empty =
            input === null ||
            (isEmptyScore(input.score) &&
              isEmptyScore(input.extraTime) &&
              isEmptyScore(input.penalties))
          if (empty) {
            delete next[matchId]
          } else {
            next[matchId] = input
          }
          return { koInputs: next }
        }),

      clearKoInputs: matchIds =>
        set(state => {
          if (matchIds.length === 0) return state
          const next = { ...state.koInputs }
          let changed = false
          for (const id of matchIds) {
            if (id in next) {
              delete next[id]
              changed = true
            }
          }
          return changed ? { koInputs: next } : state
        }),

      reset: () => set({ groupScores: {}, koInputs: {} }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      partialize: state => ({
        groupScores: state.groupScores,
        koInputs: state.koInputs,
      }),
    },
  ),
)
