import type {
  Confederation,
  GroupId,
  Team,
  Tournament,
} from '../types'

export class TournamentDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TournamentDataError'
  }
}

const GROUP_IDS: GroupId[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
]

const CONFEDERATIONS: Confederation[] = [
  'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC',
]

function isTeam(value: unknown): value is Team {
  if (typeof value !== 'object' || value === null) return false
  const team = value as Record<string, unknown>
  return (
    typeof team.id === 'number' &&
    typeof team.name === 'string' &&
    typeof team.code === 'string' &&
    typeof team.confederation === 'string' &&
    CONFEDERATIONS.includes(team.confederation as Confederation) &&
    typeof team.fifaRanking === 'number' &&
    typeof team.group === 'string' &&
    GROUP_IDS.includes(team.group as GroupId)
  )
}

export function parseTournament(raw: unknown): Tournament {
  if (typeof raw !== 'object' || raw === null) {
    throw new TournamentDataError('Données du tournoi illisibles.')
  }
  const data = raw as Record<string, unknown>

  if (!data.format || typeof data.format !== 'object') {
    throw new TournamentDataError('Format du tournoi manquant.')
  }
  if (!data.groups || typeof data.groups !== 'object') {
    throw new TournamentDataError('Composition des groupes manquante.')
  }
  if (!Array.isArray(data.teams)) {
    throw new TournamentDataError('Liste des équipes manquante.')
  }
  if (!data.teams.every(isTeam)) {
    throw new TournamentDataError('Une ou plusieurs équipes sont invalides.')
  }

  const teams = data.teams as Team[]
  const format = data.format as Tournament['format']

  if (teams.length !== format.totalTeams) {
    throw new TournamentDataError(
      `${teams.length} équipes trouvées, ${format.totalTeams} attendues.`,
    )
  }

  for (const groupId of GROUP_IDS) {
    const members = teams.filter((team) => team.group === groupId)
    if (members.length !== format.teamsPerGroup) {
      throw new TournamentDataError(
        `Le groupe ${groupId} contient ${members.length} équipes au lieu de ${format.teamsPerGroup}.`,
      )
    }
  }

  return data as unknown as Tournament
}

export function indexTeamsById(teams: Team[]): Map<number, Team> {
  return new Map(teams.map((team) => [team.id, team]))
}

export function teamsByGroup(teams: Team[]): Record<GroupId, Team[]> {
  const result = {} as Record<GroupId, Team[]>
  for (const groupId of GROUP_IDS) {
    result[groupId] = teams
      .filter((team) => team.group === groupId)
      .sort((a, b) => a.fifaRanking - b.fifaRanking)
  }
  return result
}

export { GROUP_IDS }
