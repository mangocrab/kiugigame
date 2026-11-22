import { activities, npcs } from '../data/activities'
import { careers } from '../data/careers'
import { eventCatalog, randomEvents } from '../data/events'
import { fixedEvent } from '../data/events/fixed'
import { meetCareer } from './qualifications'
import { opening, scheduled } from './schedule'
import { acquiredById, acquiredTraits, traitById, traits } from '../data/traits'
import { balance, calendar, majors, skillNames, stages, statNames, vitalNames } from './config'
import type { Category, Changes, Event, Gender, Life, Outcome, Rarity, Stage } from './types'

const clamp = (number: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, number))
const round = (number: number) => Math.round(number * 10) / 10
const dictionary = <K extends string>(keys: K[], value: number) => Object.fromEntries(keys.map(key => [key, value])) as Record<K, number>
const statKeys = Object.keys(statNames) as (keyof typeof statNames)[]
const skillKeys = Object.keys(skillNames) as (keyof typeof skillNames)[]

export function drawTraits(selected: string[], rng = Math.random) {
  const rarities: Rarity[] = ['common','rare','legendary']
  return rarities.map(rarity => {
    const pool = traits.filter(item => item.rarity === rarity && !selected.includes(item.id))
    return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))]
  })
}

export function startLife(gender: Gender, innate: string[], number: number, seed = Math.floor(Math.random()*0xffffffff), date = new Date().toISOString()): Life {
  if (innate.length !== 3 || new Set(innate).size !== 3 || innate.some(id=>!traitById(id))) throw new Error('서로 다른 선천적 특성 세 개가 필요합니다.')
  const life: Life = {
    id:date+'-'+number+'-'+seed, number, gender, born:date, seed:seed>>>0 || 1,
    stage:'early', tick:0, total:0, stats:dictionary(statKeys,16), skills:dictionary(skillKeys,0),
    vitals:{health:76,mood:66,stress:10,money:0,grades:20}, innate:[...innate], acquired:[], counts:{},
    relationships:Object.fromEntries(npcs.map(npc=>[npc.id,{ affinity:npc.affinity,trust:npc.trust,interactions:[] }])),
    flags:[], log:[], seen:{}, queue:opening('early').map(id=>({id})),
    newAchievements:[],education:null,gpa:0,credits:0,research:0,terms:0,final:false,
  }
  for (const id of innate) apply(life,{stats:traitById(id)?.initial})
  return life
}

function nextRandom(life: Life) {
  let seed = life.seed
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  life.seed = seed >>> 0
  return life.seed / 0x100000000
}

function apply(life: Life, effects: Changes = {}, scale = 1, source = '', category: Category = '일상') {
  const applyValues = <K extends string>(values: Partial<Record<K,number>> | undefined, target: Record<K,number>, labels: Record<K,string>, maximum: (key: K) => number, scaled = true) => {
    const lines: string[] = []
    for (const key of Object.keys(values ?? {}) as K[]) {
      const before = target[key]
      target[key] = round(clamp(before + (values?.[key] ?? 0) * (scaled ? scale : 1), 0, maximum(key)))
      const delta = round(target[key] - before)
      if (delta) lines.push(labels[key] + ' ' + (delta>0?'+':'') + delta.toLocaleString('ko-KR') + (String(key)==='money'?'원':''))
    }
    return lines
  }
  const changes = [
    ...applyValues(effects.stats,life.stats,statNames,()=>balance.statMax),
    ...applyValues(effects.vitals,life.vitals,vitalNames,key=>key==='money'?balance.moneyMax:100,false),
    ...applyValues(effects.skills,life.skills,skillNames,()=>balance.skillMax),
  ]
  for (const relationship of [effects.relationship ?? []].flat()) {
    const {id,affinity,trust} = relationship
    const npc = npcs.find(person=>person.id===id)
    const bond = life.relationships[id]
    if (npc && bond) {
      const warmth = life.innate.reduce((sum,id)=>sum+(traitById(id)?.bond ?? 0),0)
      const fit = npc.values.includes(category) ? 1 : 0
      const closeness = bond.affinity
      const confidence = bond.trust
      bond.affinity = clamp(bond.affinity + affinity + (affinity>0 ? fit+warmth : 0))
      bond.trust = clamp(bond.trust + trust + (trust>0 && affinity>0 ? fit : 0))
      if (source) bond.interactions.push(source)
      const diff = (n: number) => n>0 ? '+'+n : String(n)
      changes.push(npc.name+' · 친밀도 '+diff(bond.affinity-closeness)+' / 신뢰 '+diff(bond.trust-confidence))
    }
  }
  if (effects.flag && !life.flags.includes(effects.flag)) life.flags.push(effects.flag)
  if (effects.trait && !life.acquired.includes(effects.trait)) {
    life.acquired.push(effects.trait)
    changes.push('후천적 특성 · '+(acquiredById(effects.trait)?.title ?? effects.trait))
  }
  return changes
}

export function availableActivities(life: Life) { return activities.filter(activity=>activity.stages.includes(life.stage)) }
export function currentEvent(life: Life) {
  const id = life.queue[0]?.id
  return id ? eventCatalog.get(id) ?? fixedEvent(life,id) : undefined
}

export function eligibleEvent(life: Life,event: Event) {
  const time = calendar(life)
  return (!event.stages || event.stages.includes(life.stage)) &&
    (!event.ages || (time.age>=event.ages[0] && time.age<=event.ages[1])) &&
    (!event.years || event.years.includes(time.year)) &&
    (!event.after || Boolean(life.seen[event.after])) &&
    (!life.seen[event.id] || (Boolean(event.repeat) && life.total-(life.log.slice().reverse().find(item=>item.id===event.id)?.tick ?? 0)>=24)) &&
    !life.queue.some(item=>item.id===event.id) && (event.when?.(life) ?? true) &&
    event.choices.some(choice=>!choice.when || choice.when(life))
}
function drawEvent(life: Life) {
  const luck = life.stats.luck
  const specialBonus = life.innate.reduce((sum,id)=>sum+(traitById(id)?.special ?? 0),0)
  const special = nextRandom(life) < balance.specialChance + luck*.0006 + specialBonus
  if (!special && nextRandom(life) >= balance.randomChance + luck*.002) return undefined
  const pool = randomEvents.filter(event=> (event.category==='특수')===special && eligibleEvent(life,event))
  if (!pool.length) return undefined
  const weights = pool.map(event=>(event.weight ?? 1) * (event.category==='특수' ? 1 : 1+((life.stats[event.category==='관계'?'social':event.category==='학교'?'intelligence':'creativity'])/250)) *
    [...life.innate,...life.acquired].reduce((sum,id)=>sum*(event.boosts?.[id] ?? 1),1))
  let needle = nextRandom(life)*weights.reduce((a,b)=>a+b,0)
  return pool.find((_,index)=>(needle-=weights[index])<0) ?? pool.at(-1)
}

const append = (life: Life, ids: string[]) => life.queue.push(...ids.map(id=>({id})))

function enterStage(life: Life, stage: Stage) {
  life.stage = stage
  life.tick = 0
  append(life,opening(stage))
  const reunion = eventCatalog.get('nari-again')
  if (stage==='college' && life.flags.includes('duck-help') && reunion && eligibleEvent(life,reunion)) append(life,[reunion.id])
}

function finishStage(life: Life) {
  if (life.pendingStage) {
    const stage = life.pendingStage
    delete life.pendingStage
    enterStage(life,stage)
    return
  }
  if (life.tick<stages[life.stage].months) return
  const next: Partial<Record<Stage,Stage>> = {early:'elementary',elementary:'middle',middle:'high'}
  const stage = next[life.stage]
  if (stage) enterStage(life,stage)
  if (life.stage==='graduate' && life.education!=='graduate' && life.tick>=stages.graduate.months) {
    life.education = 'graduate'
    prepareFinal(life)
  }
}

function prepareFinal(life: Life) {
  if (fixedEvent(life,'professional')) append(life,['professional'])
  append(life,['final'])
}

function updateAdmission(life: Life) {
  const transcript = life.vitals.grades*.55 + life.stats.intelligence*.18 + life.stats.diligence*.15 + life.skills.people*.08 +
    Math.min(8,((life.counts.project ?? 0)+(life.counts.club ?? 0)+(life.counts.volunteer ?? 0))*.45)
  const testBased = life.exam===undefined ? 0 : life.exam*.75 + life.vitals.grades*.23 + (life.route==='csat'?4:0)
  life.admission = Math.round(clamp(Math.max(transcript+(life.route==='school'?5:0),testBased)))
}

function updateGradAdmission(life: Life) {
  life.graduateAdmission = Math.round(clamp(life.gpa/4.5*37+life.skills.research*.36+
    (life.major ? life.skills[majors[life.major].skill]*.16 : 0)+life.relationships.prof.trust*.10))
}

function activityScale(life: Life, id: string) {
  const uses = life.counts[id] ?? 0
  const innate = life.innate.reduce((sum,key)=>{
    const trait = traitById(key)
    return sum+(trait?.activityRates[id] ?? 0)
  },0)
  return (1+innate+life.stats.diligence*.0025) * Math.max(.38,1/(1+uses*.045)) *
    Math.max(.56,1-life.vitals.stress*.0035-(100-life.vitals.health)*.0018)
}

export function advance(life: Life, ids: string[]): Life {
  if (life.queue.length || life.outcome || life.summary || life.final || life.tick>=stages[life.stage].months) return life
  if (new Set(ids).size!==ids.length || ids.length===0 || ids.length>stages[life.stage].slots) return life
  const picked = ids.map(id=>availableActivities(life).find(activity=>activity.id===id))
  if (picked.some(item=>!item)) return life
  const next = structuredClone(life)
  const changes: string[] = []
  for (const activity of picked) {
    if (!activity) continue
    const { id,title,effects } = activity
    const current = structuredClone(effects)
    const scale = activityScale(next,id)
    if (id==='friends' || id==='club') {
      const friend: Partial<Record<Stage,string>> = {elementary:'yujin',middle:'jun',high:'hayun',college:'mina',graduate:'sol'}
      const contact = friend[next.stage]
      if (contact) current.relationship = { id:contact,affinity:id==='friends'?4:2,trust:id==='friends'?3:2 }
    }
    if ((id==='research' || id==='major') && next.major) {
      const subject = majors[(id==='research' ? next.researchField : undefined) ?? next.major].skill
      current.skills = { ...current.skills, [subject]:(current.skills?.[subject] ?? 0)+(id==='major'?6:3) }
      if (next.stage==='graduate' && id==='research') next.research += 10
      if (next.stage==='college' && id==='major') next.credits += 2
    }
    if (current.skills) for (const key of Object.keys(current.skills) as (keyof Life['skills'])[]) {
      const rate = next.acquired.reduce((sum,traitId)=>{
        const trait = acquiredById(traitId)
        return sum+(trait?.skill===key ? trait.rate : 0)
      },0)
      current.skills[key] = (current.skills[key] ?? 0)*(1+rate)
    }
    changes.push(...apply(next,current,scale,title,id==='friends'?'관계':id==='work'?'경제':'일상'))
    next.counts[id] = (next.counts[id] ?? 0)+1
    for (const trait of acquiredTraits) {
      if (trait.activity!==id || next.counts[id]<trait.count || next.acquired.includes(trait.id)) continue
      changes.push(...apply(next,{trait:trait.id}))
      next.log.push({id:'earned:'+trait.id,stage:next.stage,tick:next.total,age:calendar(next).age,period:calendar(next).label,
        title:trait.title,choice:title,result:trait.description,category:'성장',important:true,record:true})
    }
  }
  if (next.vitals.stress>=70) changes.push(...apply(next,{vitals:{health:-3,mood:-2}}))
  if (next.vitals.money===0 && next.stage==='early') changes.push(...apply(next,{vitals:{money:5000}}))
  const step = Math.min(stages[next.stage].step,stages[next.stage].months-next.tick)
  next.tick += step
  next.total += step
  const fixed = scheduled(next)
  if (fixed.includes('admission')) updateAdmission(next)
  if (fixed.includes('collegeGate')) updateAdmission(next)
  append(next,fixed)
  if (next.tick<stages[next.stage].months) {
    const random = drawEvent(next)
    if (random) append(next,[random.id])
  }
  next.summary = {title:'이번 기간의 변화',text:picked.map(item=>item?.title).join(' · '),changes}
  return next
}

export function acknowledge(life: Life): Life {
  if (!life.summary && !life.outcome) return life
  const next = structuredClone(life)
  if (next.summary) delete next.summary
  else delete next.outcome
  if (!next.queue.length) finishStage(next)
  return next
}

function applyAction(life: Life, action: string | undefined): string[] {
  if (!action) return []
  const [verb,value] = action.split(':')
  if (verb==='aspiration') life.aspiration = value==='none' ? undefined : value as Life['aspiration']
  if (verb==='major') life.major = value as Life['major']
  if (verb==='researchField') life.researchField = value as Life['researchField']
  if (verb==='route') life.route = value
  if (verb==='exam' && value==='sit') {
    const preparation = Math.min(16,(life.counts.study ?? 0)*.8)
    const subject = (life.skills.math + life.skills.language + life.skills.science)/3
    life.exam = Math.round(clamp(life.vitals.grades*.33+life.stats.intelligence*.17+subject*.26+preparation+
      life.stats.resilience*.11+life.vitals.health*.09-life.vitals.stress*.16+(nextRandom(life)-.5)*9))
    apply(life,{vitals:{stress:6}})
    return ['수능 성적 '+life.exam+'점','스트레스 증가']
  }
  if (verb==='exam' && value==='skip') delete life.exam
  if (verb==='assessment') {
    const test = clamp(life.vitals.grades*.56+life.stats.intelligence*.22+(life.skills.math+life.skills.language)*.12+
      life.stats.resilience*.09-life.vitals.stress*.14+(value==='calm'?3:1))
    return ['시험 성취 '+Math.round(test)+'점',...apply(life,{vitals:{grades:round(clamp((test-35)*.09,-3,6))}})]
  }
  if (verb==='term') {
    const gpa = round(clamp(1.25+life.vitals.grades*.024+(life.major ? life.skills[majors[life.major].skill]*.012 : 0)+
      life.stats.diligence*.006-life.vitals.stress*.009+(value==='review'?.15:.035),0,4.5))
    life.gpa = Number(((life.gpa*life.terms+gpa)/(life.terms+1)).toFixed(2))
    life.terms++
    const credits = gpa>=2 ? 12 : 9
    life.credits += credits
    updateGradAdmission(life)
    return ['이번 학기 평점 '+gpa.toFixed(2)+' / 4.50','이수 학점 +'+credits]
  }
  if (verb==='credits') { life.credits += Number(value); return ['이수 학점 +'+value] }
  if (verb==='research') { life.research += Number(value); return ['연구 진행도 +'+value] }
  if (verb==='college') {
    life.major = value as Life['major']
    life.education = 'high'
    life.pendingStage = 'college'
  }
  if (verb==='graduate') {
    life.education = 'college'
    life.pendingStage = 'graduate'
  }
  if (verb==='direct') {
    life.education = value as Life['education']
    prepareFinal(life)
  }
  if (verb==='qualify') {
    life.aspiration = careers.find(career=>career.id===value)?.field ?? life.aspiration
    if (!life.flags.includes('qualification-time:'+value)) life.flags.push('qualification-time:'+value)
  }
  if (verb==='final') life.final = true
  return []
}

export function choose(life: Life, eventId: string, choiceId: string): Life {
  if (life.outcome || life.summary) return life
  const event = currentEvent(life)
  if (!event || event.id!==eventId) return life
  const choice = event.choices.find(item=>item.id===choiceId)
  if (!choice || (choice.when && !choice.when(life))) return life
  const next = structuredClone(life)
  next.queue.shift()
  next.seen[event.id] = (next.seen[event.id] ?? 0)+1
  const {age,label} = calendar(next)
  const outcome: Outcome = {title:event.title,text:choice.result,changes:[
    ...apply(next,choice.effects,1,event.title+' · '+choice.label,event.category),
    ...applyAction(next,choice.action),
  ]}
  next.outcome = outcome
  next.log.push({ id:event.id, stage:next.stage,tick:next.total,age,period:label,title:event.title,choice:choice.label,
    result:choice.result,category:event.category,important:event.importance>=3,record:event.record })
  if (choice.effects?.follows) {
    const follow = eventCatalog.get(choice.effects.follows)
    if (follow && eligibleEvent(next,follow)) next.queue.unshift({id:follow.id})
  }
  return next
}

export function careerOptions(life: Life) {
  return careers.filter(career=>meetCareer(life,career)).map(career=>{
    const skill = career.skill ? life.skills[career.skill] : 0
    const stat = career.stat ? life.stats[career.stat] : 0
    const traitsMatch = life.innate.filter(id=>traitById(id)?.field===career.field).length+
      life.acquired.filter(id=>acquiredById(id)?.field===career.field).length
    const eventsMatch: Record<string,string[]> = { gamedev:['demo','released'],security:['device-fix','data-recovery'],illustrator:['exhibition','classroom-photo'],founder:['market'],educator:['tutor'],research:['conference','thesis'],professor:['doctoral-interest'] }
    const record = (eventsMatch[career.id] ?? []).filter(flag=>life.flags.includes(flag)).length
    const score = skill*.52+stat*.22+traitsMatch*2.5+record*6+ (life.aspiration===career.field?13:0)+
      (life.major===career.field?6:0)+(life.researchField===career.field?3:0)+(life.flags.includes('qualified:'+career.id)?14:0)
    return { ...career, score:career.skill?score:-1 }
  }).sort((a,b)=>b.score-a.score)
}

export function endingAge(life: Life, id: string) {
  const credentialYears: Record<string,number> = {doctor:5,pharmacist:2,professor:4,elementaryteacher:1,teacher:1,nurse:1,accountant:1,diplomat:1,firefighter:1}
  const extension = life.flags.includes('qualification-time:'+id) ? credentialYears[id] ?? 0 : 0
  return calendar(life).age+extension
}
