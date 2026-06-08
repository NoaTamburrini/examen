import type { GroupFixture, GroupId, Team } from '@/types'
import { GROUP_IDS, teamsByGroup } from '@/logic/loadData'

const PAIRINGS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [2, 3],
  [0, 2],
  [3, 1],
  [3, 0],
  [1, 2],
]

export function buildGroupFixtures(group: GroupId, teams: Team[]): GroupFixture[] {
  if (teams.length !== 4) {
    throw new Error(`Le groupe ${group} doit contenir exactement 4 équipes.`)
  }
  return PAIRINGS.map(([home, away], index) => ({
    id: `${group}-M${index + 1}`,
    group,
    homeId: teams[home].id,
    awayId: teams[away].id,
  }))
}

export function buildAllFixtures(teams: Team[]): GroupFixture[] {
  const byGroup = teamsByGroup(teams)
  return GROUP_IDS.flatMap((group) => buildGroupFixtures(group, byGroup[group]))
}
