import { buildAllMatches } from '@/logic/matches'
import { computeGroupStanding } from '@/logic/standings'
import { buildBracket, collectQualified, ROUND_ORDER } from '@/logic/bracket'
import { teamsByGroup, GROUP_IDS } from '@/logic/loadData'
import type {
  GroupScores,
  KoInputs,
  MatchScore,
  Standing,
  Team,
  TournamentFormat,
} from '@/types'

type Rng = () => number

const strength = (fifaRanking: number): number => 49 - fifaRanking

const expectedGoals = (own: number, opponent: number): number => {
  const edge = (own - opponent) / 48
  return Math.max(0.4, 1.3 + edge * 1.8)
}

const poissonish = (mean: number, rng: Rng): number => {
  const sample = (mean + rng() * mean * 1.6) * (0.5 + rng())
  return Math.min(6, Math.round(sample * 0.7))
}

const randomScore = (home: Team, away: Team, rng: Rng): MatchScore => ({
  home: poissonish(
    expectedGoals(strength(home.fifaRanking), strength(away.fifaRanking)),
    rng,
  ),
  away: poissonish(
    expectedGoals(strength(away.fifaRanking), strength(home.fifaRanking)),
    rng,
  ),
})

const generateGroupScores = (teams: Team[], rng: Rng): GroupScores => {
  const byId = new Map(teams.map(team => [team.id, team]))
  const scores: GroupScores = {}
  for (const matchup of buildAllMatches(teams)) {
    scores[matchup.id] = randomScore(
      byId.get(matchup.homeId)!,
      byId.get(matchup.awayId)!,
      rng,
    )
  }
  return scores
}

const decisiveScore = (home: Team, away: Team, rng: Rng): MatchScore => {
  let score = randomScore(home, away, rng)
  let guard = 0
  while (score.home === score.away && guard < 8) {
    score = randomScore(home, away, rng)
    guard += 1
  }
  if (score.home === score.away) {
    if (strength(home.fifaRanking) >= strength(away.fifaRanking)) {
      score = { home: score.home + 1, away: score.away }
    } else {
      score = { home: score.home, away: score.away + 1 }
    }
  }
  return score
}

const generateKoInputs = (
  groupScores: GroupScores,
  teams: Team[],
  format: TournamentFormat,
  rng: Rng,
): KoInputs => {
  const byId = new Map(teams.map(team => [team.id, team]))
  const byGroup = teamsByGroup(teams)

  const standings = {} as Record<(typeof GROUP_IDS)[number], Standing[]>
  for (const group of GROUP_IDS) {
    standings[group] = computeGroupStanding(
      byGroup[group],
      buildAllMatches(teams).filter(matchup => matchup.group === group),
      groupScores,
    )
  }

  const qualified = collectQualified(standings, format.bestThirdPlaces)
  const koInputs: KoInputs = {}

  for (const round of ROUND_ORDER) {
    const bracket = buildBracket(qualified, koInputs)
    for (const match of bracket[round]) {
      if (match.homeId === null || match.awayId === null) continue
      if (koInputs[match.id]) continue
      koInputs[match.id] = {
        score: decisiveScore(
          byId.get(match.homeId)!,
          byId.get(match.awayId)!,
          rng,
        ),
      }
    }
  }

  return koInputs
}

export interface Scenario {
  groupScores: GroupScores
  koInputs: KoInputs
}

export const generateScenario = (
  teams: Team[],
  format: TournamentFormat,
  rng: Rng = Math.random,
): Scenario => {
  const groupScores = generateGroupScores(teams, rng)
  const koInputs = generateKoInputs(groupScores, teams, format, rng)
  return { groupScores, koInputs }
}
