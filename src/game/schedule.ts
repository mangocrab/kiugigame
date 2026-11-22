import { calendar, stages } from './config'
import type { Life } from './types'

export function opening(stage: Life['stage']) {
  const ids: Record<Life['stage'],string[]> = {
    early:['birth'], elementary:['elementaryIn','year','term'], middle:['middleIn','year','term'],
    high:['highIn','year','term'], college:['collegeAccepted','collegeIn','major','course'],
    graduate:['gradAccepted','gradIn','researchField','gradWork'],
  }
  return ids[stage]
}

export function scheduled(life: Life): string[] {
  const {stage,tick} = life
  const atEnd = tick>=stages[stage].months
  const { year,month } = calendar(life)
  const ids: string[] = []
  if (stage==='early') {
    if (tick===24) ids.push('earlyGrowth')
    if (!atEnd && tick%12===0) ids.push('birthday')
    return ids
  }
  if (stage==='elementary' || stage==='middle') {
    if (stage==='middle') ids.push('middleExam','finalExam')
    ids.push('grades','vacation')
    if (atEnd) ids.push(stage==='elementary'?'elementaryOut':'middleOut')
    else if (tick%12===0) ids.push('birthday','year','term')
    else ids.push('term')
    return ids
  }
  if (stage==='high') {
    if (atEnd) return ['highOut','collegeGate']
    if (month===3) ids.push('birthday','year','term')
    if (month===9) ids.push('term')
    if (month===4 || month===10) ids.push('middleExam')
    if (month===7 || month===12) ids.push('finalExam','grades')
    if (month===8 || month===1) ids.push('vacation')
    if (year===1 && month===5) ids.push('explore')
    if (year===3 && month===4) ids.push('preparation')
    if (year===3 && month===11) ids.push('csat')
    if (year===3 && month===1) ids.push('admission')
    return ids
  }
  if (stage==='college') {
    ids.push('termEval')
    if (atEnd) ids.push('collegeReview','collegeOut','gradGate')
    else if (tick%12===0) ids.push('birthday','course')
    else ids.push('course')
    return ids
  }
  ids.push('gradEval')
  if (atEnd) ids.push('thesis','gradOut')
  else if (tick%12===0) ids.push('birthday')
  return ids
}
