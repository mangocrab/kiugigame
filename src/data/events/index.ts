import type { Event } from '../../game/types'
import { early, elementary, middle, experienced, has, toEvent } from './catalog'
import { high } from './high'
import { college, common, graduate } from './adult'

const overrides: Record<string, Partial<Event>> = {
  steps: { ages: [0,2], weight:2.4 },
  chalk: { ages: [3,7] }, duck: { ages:[2,7], weight:1.55, boosts:{warm:1.5} },
  'bird-note': { years:[1,2,3], boosts:{curious:1.6} },
  postcard: { years:[4,5,6], after:'bird-note' },
  robot: { when:experienced('club'), boosts:{versatile:1.6} },
  interval: { when:experienced('exercise',2) },
  'game-demo': { when:experienced('project',3), boosts:{maker:1.7,developer:1.6} },
  'after-demo': { after:'game-demo', when:has('demo'), weight:1.9 },
  mock: { years:[2,3] }, scholarship:{ when:life=>life.vitals.grades>=35, weight:1.3 },
  tournament:{ when:experienced('exercise',4) },
  'letter-confession':{ when:life=>life.relationships.hayun.affinity>=24, weight:1.3 },
  kiosk: { when:experienced('work',2) }, 'night-shift':{ when:experienced('work') },
  'weather-station': { when:experienced('study',3), boosts:{precise:1.35} },
  'college-farewell': { years:[4] }, registration:{ years:[1,2] },
  opensource: { when:experienced('project',4), boosts:{developer:1.8} },
  'clinic-tour': { when:life=>life.major==='health' || life.skills.care>=27 },
  offer: { years:[2] }, 'peer-review':{ when:experienced('research',2) },
  'future-letter': { ages:[12,30], boosts:{fate:2.2,afterimage:1.6} },
  'missing-room': { ages:[12,30], after:'future-letter', when:has('follow-letter') },
  loop:{ ages:[13,19], stages:['middle','high'] },
  'unmapped-street':{ ages:[13,30] }, stranger:{ ages:[12,30] },
  'log-from-future':{ ages:[16,30] }, noise:{ ages:[12,30], repeat:true, weight:.35 },
  'nari-again':{ stages:['college','graduate'], after:'duck', when:life=>life.relationships.nari.trust>=22, weight:2.0 },
}
export const randomEvents = [
  ...early.map(row=>toEvent(row,'early',overrides[row[0]])),
  ...elementary.map(row=>toEvent(row,'elementary',overrides[row[0]])),
  ...middle.map(row=>toEvent(row,'middle',overrides[row[0]])),
  ...high.map(row=>toEvent(row,'high',overrides[row[0]])),
  ...college.map(row=>toEvent(row,'college',overrides[row[0]])),
  ...graduate.map(row=>toEvent(row,'graduate',overrides[row[0]])),
  ...common.map(row=>toEvent(row,undefined,overrides[row[0]])),
]
export const eventCatalog = new Map(randomEvents.map(event=>[event.id,event]))
