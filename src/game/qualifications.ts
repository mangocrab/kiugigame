import type { Career, Life } from './types'

const educationRank = { high:0, college:1, graduate:2 }
export function meetCareer(life: Life, career: Career, credential = true) {
  const education = life.education
  return Boolean(education && educationRank[education]>=educationRank[career.minimum] &&
    (!career.major || life.major===career.major || (career.minimum==='graduate' && life.researchField===career.major)) &&
    (!career.track || !credential || life.flags.includes('qualified:'+career.id) || (career.id==='musician' && life.flags.includes('performance')) ||
      (career.id==='astronomer' && life.flags.includes('astronomy'))) &&
    (!career.skill || life.skills[career.skill]>=(career.level ?? 0)) &&
    (!career.stat || life.stats[career.stat]>=(career.statLevel ?? 0)))
}

