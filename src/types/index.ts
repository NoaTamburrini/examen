export type GroupId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'

export type Confederation =
  | 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC'

export interface Team {
  id: number
  name: string
  code: string
  confederation: Confederation
  fifaRanking: number
  group: GroupId
  host?: boolean
}

export type Tiebreaker =
  | 'points' | 'goalDifference' | 'goalsScored'
  | 'headToHead' | 'fairPlay' | 'fifaRanking'

export interface TournamentFormat {
  totalTeams: number
  groupCount: number
  teamsPerGroup: number
  qualifiedPerGroup: number
  bestThirdPlaces: number
  knockoutRounds: string[]
  groupTiebreakers: Tiebreaker[]
}

export interface Tournament {
  tournament: string
  hosts: string[]
  dates: { start: string; end: string }
  format: TournamentFormat
  groups: Record<GroupId, string[]>
  teams: Team[]
}

export interface GroupFixture {
  id: string
  group: GroupId
  homeId: number
  awayId: number
}

export interface MatchScore {
  home: number
  away: number
}

export type GroupScores = Record<string, MatchScore>

export interface Standing {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  rank: number
}

export type FinishPosition = 1 | 2 | 3 | 4

export interface QualifiedTeam {
  team: Team
  group: GroupId
  position: FinishPosition
}

export type KnockoutRound = 'R32' | 'R16' | 'QF' | 'SF' | 'F'

export interface KoResult {
  score?: MatchScore
  extraTime?: MatchScore
  penalties?: MatchScore
  winnerId: number
}

export type KoResults = Record<string, KoResult>

export interface BracketMatch {
  id: string
  round: KnockoutRound
  slot: number
  homeId: number | null
  awayId: number | null
  homeSource: string
  awaySource: string
  winnerId: number | null
  result: KoResult | null
}
