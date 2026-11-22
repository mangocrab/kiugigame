import type { Field, Skill, Stage, Stat, Vitals } from './types'

export const stages: Record<Stage, { label: string; chapter: number; months: number; step: number; slots: number; age: number }> = {
  early: { label: '유아기', chapter: 1, months: 84, step: 6, slots: 2, age: 0 },
  elementary: { label: '초등학교', chapter: 2, months: 72, step: 6, slots: 3, age: 7 },
  middle: { label: '중학교', chapter: 3, months: 36, step: 6, slots: 3, age: 13 },
  high: { label: '고등학교', chapter: 4, months: 36, step: 1, slots: 3, age: 16 },
  college: { label: '대학교', chapter: 5, months: 48, step: 6, slots: 3, age: 19 },
  graduate: { label: '대학원', chapter: 6, months: 24, step: 6, slots: 3, age: 23 },
}
export const statNames: Record<Stat, string> = {
  intelligence: '지능', social: '사회성', fitness: '체력', creativity: '창의성',
  resilience: '정신력', diligence: '성실함', luck: '행운',
}
export const vitalNames: Record<Vitals, string> = { health: '건강', mood: '행복도', stress: '스트레스', money: '소지금', grades: '학업 성취도' }
export const skillNames: Record<Skill, string> = {
  language: '국어·언어', math: '수리', science: '과학', code: '개발', art: '예술', sports: '스포츠',
  people: '소통', business: '경제', research: '연구', care: '돌봄', craft: '생활기술',
}
export const fieldNames: Record<Field, string> = {
  tech: 'IT·기술', science: '과학·연구', education: '교육', health: '보건·의료',
  art: '문화·예술', business: '경제·경영', public: '공공·사회', practical: '생활·체육',
}
export const majors: Record<Field, { title: string; skill: Skill; track: string; minimum: number }> = {
  tech: { title: '컴퓨터공학', skill: 'code', track: '공학 계열', minimum: 35 },
  science: { title: '자연과학', skill: 'science', track: '자연과학 계열', minimum: 39 },
  education: { title: '교육학', skill: 'people', track: '교육 계열', minimum: 42 },
  health: { title: '보건과학', skill: 'care', track: '보건 계열', minimum: 44 },
  art: { title: '예술·디자인', skill: 'art', track: '예술 계열', minimum: 32 },
  business: { title: '경영학', skill: 'business', track: '사회과학 계열', minimum: 35 },
  public: { title: '행정·국제학', skill: 'language', track: '사회과학 계열', minimum: 36 },
  practical: { title: '생활·체육학', skill: 'sports', track: '실무 계열', minimum: 32 },
}
export const balance = {
  statMax: 100, skillMax: 100, moneyMax: 10000000, randomChance: .34, specialChance: .047,
  graduateAdmission: 46, collegeMin: 32, creditMinimum: 104, thesisMinimum: 40,
}
export const stageYear = (life: { stage: Stage; tick: number }) => Math.min(Math.ceil(stages[life.stage].months / 12), 1 + Math.floor(life.tick / 12))
export function calendar(life: { stage: Stage; tick: number }) {
  const stage = stages[life.stage]
  const tick = Math.min(life.tick, stage.months)
  const age = stage.age + Math.floor(tick / 12)
  const year = stageYear(life)
  const month = (tick + 2) % 12 + 1
  const term = tick % 12 < 6 ? 1 : 2
  if (life.stage === 'early') return { age, year, month, term, label: age === 0 ? '태어난 지 ' + tick + '개월' : age + '세 · ' + (term === 1 ? '상반기' : '하반기') }
  const label = tick === stage.months ? stage.label + ' 과정 마무리' :
    stage.label + ' ' + year + '학년 · ' + (life.stage === 'high' ? month + '월' : term + '학기')
  return { age, year, month, term, label }
}
export const rarityNames = { common: '일반', rare: '희귀', legendary: '전설' } as const
export const allStages = Object.keys(stages) as Stage[]
