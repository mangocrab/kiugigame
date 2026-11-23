import type { Gender } from '../game/types'

export type ImagePanel = {
  left: number
  top: number
  width: number
  height: number
  aspectRatio: number
}

// Each sheet has one career per row, with the female lead on the left.
const sheets = [
  ['gamedev'],
  ['programmer', 'security', 'engineer'],
  ['uxengineer', 'research', 'astronomer'],
  ['physicist', 'chemist', 'elementaryteacher'],
  ['teacher', 'professor', 'librarian'],
  ['educator', 'doctor', 'nurse'],
  ['pharmacist', 'careworker', 'author'],
  ['illustrator', 'musician', 'designer'],
  ['broadcaster', 'accountant', 'founder'],
  ['manager', 'marketer', 'civil'],
  ['diplomat', 'firefighter', 'socialworker'],
  ['chef', 'athlete', 'farmer'],
  ['craftsman', 'worker', 'exploring'],
]

const panels = new Map(sheets.flatMap((careers, sheet) =>
  careers.map((career, row) => [career, { sheet, row, rows: careers.length }] as const)
))

export function careerEndingArt(career: string, gender: Gender) {
  const frame = panels.get(career)
  if (!frame) return undefined
  const { sheet, row, rows } = frame
  const column = gender === 'female' ? 0 : 1
  const inset = .012
  return {
    path: `endings/careers/${sheet}.png`,
    panel: {
      left: column / 2 + inset,
      top: row / rows + inset,
      width: .5 - 2 * inset,
      height: 1 / rows - 2 * inset,
      aspectRatio: 1.5,
    },
  }
}
