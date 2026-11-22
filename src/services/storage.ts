import { npcs } from '../data/activities'
import { careerById } from '../data/careers'
import { acquiredById, traitById } from '../data/traits'
import { calendar, fieldNames, skillNames, stages, statNames, vitalNames } from '../game/config'
import { currentEvent } from '../game/engine'
import type { Life, Save } from '../game/types'

export interface GameStorage {
  load(): { save: Save; notice?: string }
  save(value: Save): void
}

export const blankSave = (): Save => ({
  version:1, life:null, profile:{next:1,runs:[],achievements:{},experienced:[]},settings:{motion:true,text:'normal'},
})

function object(input: unknown): input is Record<string,unknown> {
  return typeof input==='object' && input!==null && !Array.isArray(input)
}
const listOfText = (input: unknown) => Array.isArray(input) && input.every(value=>typeof value==='string')
const numbers = (input: unknown, keys: string[]) => object(input) && keys.every(key=>typeof input[key]==='number' && Number.isFinite(input[key]))
const numeric = (input: unknown) => typeof input==='number' && Number.isFinite(input)
const texts = (input: unknown, keys: string[]) => object(input) && keys.every(key=>typeof input[key]==='string')
const validBonds = (input: unknown) => object(input) && npcs.every(npc=> {
  const bond = input[npc.id]
  return numbers(bond,['affinity','trust']) && listOfText((bond as Record<string,unknown>).interactions)
})
const validLog = (input: unknown) => Array.isArray(input) && input.every(log=>texts(log,['id','stage','period','title','choice','result','category']) && numbers(log,['tick','age']))
const validOutcome = (input: unknown) => input===undefined || (texts(input,['title','text']) && listOfText((input as Record<string,unknown>).changes))
const validEducation = (input: unknown) => input==='high' || input==='college' || input==='graduate'
const optionalField = (value: unknown) => value===undefined || (typeof value==='string' && Object.hasOwn(fieldNames,value))
const validGender = (value: unknown) => value==='male' || value==='female'
const validTraits = (input: unknown, lookup: (id:string)=>unknown) => Array.isArray(input) && input.every(id=>typeof id==='string' && lookup(id))
function validRun(run: unknown) {
  return object(run) && texts(run,['id','career','date']) && numbers(run,['number','age']) &&
    validEducation(run.education) && validGender(run.gender) && optionalField(run.major) && Boolean(careerById(String(run.career))) &&
    numbers(run.stats,Object.keys(statNames)) && validBonds(run.relationships) && validLog(run.log) &&
    ['story','achievements'].every(key=>listOfText(run[key])) && validTraits(run.innate,traitById) && validTraits(run.acquired,acquiredById)
}
function validLife(input: unknown): input is Life {
  if (!object(input) || !texts(input,['id','stage','born']) || !validGender(input.gender) ||
    !Object.hasOwn(stages,String(input.stage)) || !numbers(input,['number','tick','total','seed','gpa','credits','research','terms']) ||
    !(input.education===null || validEducation(input.education)) || typeof input.final!=='boolean' ||
    !['major','aspiration','researchField'].every(key=>optionalField(input[key])) ||
    !['exam','admission','graduateAdmission'].every(key=>input[key]===undefined || numeric(input[key])) ||
    (input.pendingStage!==undefined && !Object.hasOwn(stages,String(input.pendingStage))) ||
    (input.career!==undefined && !careerById(String(input.career))) ||
    !numbers(input.stats,Object.keys(statNames)) || !numbers(input.vitals,Object.keys(vitalNames)) || !numbers(input.skills,Object.keys(skillNames)) ||
    !object(input.counts) || !Object.values(input.counts).every(numeric) || !object(input.seen) || !Object.values(input.seen).every(numeric) ||
    !validBonds(input.relationships) || !validLog(input.log) || !validOutcome(input.summary) || !validOutcome(input.outcome) ||
    !validTraits(input.innate,traitById) || !validTraits(input.acquired,acquiredById) ||
    !['flags','newAchievements'].every(key=>listOfText(input[key])) || !Array.isArray(input.queue)) return false
  const life = input as unknown as Life
  try {
    calendar(life)
    return life.tick>=0 && life.tick<=stages[life.stage].months && life.innate.length===3 && new Set(life.innate).size===3 &&
      life.queue.every(item=>texts(item,['id']) && Boolean(currentEvent({...life,queue:[item]})))
  } catch {
    return false
  }
}

function parse(raw: string): Save {
  const input: unknown = JSON.parse(raw)
  if (!object(input) || input.version!==1 || !object(input.profile) || !object(input.settings)) throw new Error('저장 버전 또는 형식 오류')
  const { profile,settings,life } = input
  if (!Number.isSafeInteger(profile.next) || Number(profile.next)<1 || !Array.isArray(profile.runs) || !profile.runs.every(validRun) ||
    !object(profile.achievements) || !Object.values(profile.achievements).every(value=>typeof value==='string') ||
    !listOfText(profile.experienced) || typeof settings.motion!=='boolean' || !['normal','large'].includes(String(settings.text)) ||
    !(life===null || validLife(life))) throw new Error('저장 데이터 손상')
  if (validLife(life) && life.career && !profile.runs.some(run=>run.id===life.id && run.career===life.career)) throw new Error('완료 기록 누락')
  return input as unknown as Save
}

export function localGameStorage(userId = 'guest', getStore: () => Pick<Storage,'getItem'|'setItem'> = ()=>window.localStorage): GameStorage {
  const key = 'life-undecided:'+encodeURIComponent(userId)+':v1'
  const backup = key+':backup'
  return {
    load() {
      try {
        const storage = getStore()
        const raw = storage.getItem(key)
        if (!raw) return {save:blankSave()}
        try { return {save:parse(raw)} }
        catch {
          const previous = storage.getItem(backup)
          if (previous) {
            try { return {save:parse(previous),notice:'이전 정상 저장 지점으로 복구했습니다.'} }
            catch { /* Both snapshots are damaged. */ }
          }
          return {save:blankSave(),notice:'저장 데이터가 손상되어 새 기록으로 시작합니다.'}
        }
      } catch {
        return {save:blankSave(),notice:'브라우저 저장소를 사용할 수 없습니다.'}
      }
    },
    save(value) {
      const storage = getStore()
      const previous = storage.getItem(key)
      if (previous) {
        try { parse(previous) } catch { storage.setItem(key,JSON.stringify(value)); return }
        storage.setItem(backup,previous)
      }
      storage.setItem(key,JSON.stringify(value))
    },
  }
}
