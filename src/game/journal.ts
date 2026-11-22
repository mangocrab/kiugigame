import { achievements } from '../data/achievements'
import { npcs } from '../data/activities'
import { careerById } from '../data/careers'
import { traitById } from '../data/traits'
import { majors, stages } from './config'
import { careerOptions, endingAge } from './engine'
import type { Life, Profile, Run, Save } from './types'

export const educationNames = {high:'고등학교 졸업',college:'대학교 졸업',graduate:'대학원 졸업'}
export function trackProgress(save: Save, life: Life, now = new Date().toISOString()): Save {
  const profile: Profile = { ...save.profile, achievements:{...save.profile.achievements},
    experienced:[...new Set([...save.profile.experienced,...life.innate])] }
  const next = {...life, newAchievements:[...(life.newAchievements ?? [])]}
  for (const achievement of achievements) {
    if (!profile.achievements[achievement.id] && achievement.check(next,profile)) {
      profile.achievements[achievement.id] = now
      next.newAchievements.push(achievement.id)
    }
  }
  return {...save, life:next, profile:{...profile,next:Math.max(profile.next,next.number+1)}}
}

export function importantBonds(relationships: Life['relationships']) {
  return npcs.map(npc=>({npc,bond:relationships[npc.id]}))
    .filter(({bond})=>bond && bond.interactions.length)
    .sort((a,b)=>(b.bond.affinity+b.bond.trust)-(a.bond.affinity+a.bond.trust))
}

export function writeStory(life: Life, careerId: string) {
  const career = careerById(careerId)
  const early = life.log.find(log=>log.id==='birth')
  const named = life.innate.map(id=>traitById(id)?.title).filter(Boolean).join(', ')
  const story = ['당신의 인생은 '+named+' 특성과 함께 시작됐습니다.'+(early?' '+early.result:'')]
  const grouped = new Map<Life['stage'],Life['log']>()
  for (const log of life.log) {
    if (!log.record || log.id==='birth' || log.id==='final') continue
    const entries = grouped.get(log.stage) ?? []
    entries.push(log)
    grouped.set(log.stage,entries)
  }
  for (const [stage,entries] of grouped) {
    const featured = entries.find(log=>log.category==='특수') ??
      entries.find(log=>log.category==='진로' || log.category==='관계') ??
      entries.find(log=>log.id.startsWith('earned:')) ?? entries.at(-1)
    if (featured) story.push(stages[stage].label+'의 한 장면은 「'+featured.title+'」이었습니다. 당신은 ‘'+featured.choice+'’라는 선택을 했습니다. '+featured.result)
  }
  const bond = importantBonds(life.relationships)[0]
  if (bond) story.push(bond.npc.name+' 님과 쌓아 온 기억에는 ‘'+bond.bond.interactions.at(-1)+'’도 남아 있습니다.')
  const education = educationNames[life.education ?? 'high']
  story.push((life.major ? majors[life.major].title+'을 전공했고, ' : '')+education+' 후 '+endingAge(life,careerId)+'세에 '+(career?.title ?? '')+'의 길을 골랐습니다. '+(career?.description ?? ''))
  return story
}

export function chooseCareer(save: Save, id: string, date = new Date().toISOString()): Save {
  const life = save.life
  if (!life?.final || life.career || life.queue.length || life.outcome || !careerOptions(life).some(career=>career.id===id)) return save
  const next = trackProgress(save,{ ...life,career:id },date)
  const finished = next.life!
  const run: Run = {
    id:life.id,number:life.number,gender:life.gender,age:endingAge(life,id),career:id,date,
    education:life.education ?? 'high',major:life.major,stats:life.stats,innate:life.innate,acquired:life.acquired,
    relationships:life.relationships,log:life.log,story:writeStory(life,id),achievements:finished.newAchievements,
  }
  return { ...next,profile:{...next.profile,runs:[run,...next.profile.runs.filter(item=>item.id!==run.id)]} }
}
