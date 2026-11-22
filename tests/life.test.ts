import assert from 'node:assert/strict'
import { test } from 'node:test'
import { achievements } from '../src/data/achievements'
import { careers } from '../src/data/careers'
import { eventCatalog, randomEvents } from '../src/data/events'
import { acquiredTraits, traits } from '../src/data/traits'
import { calendar, statNames } from '../src/game/config'
import { acknowledge, advance, careerOptions, choose, currentEvent, drawTraits, eligibleEvent, startLife } from '../src/game/engine'
import { chooseCareer, trackProgress } from '../src/game/journal'
import type { Life, Rarity, Stage } from '../src/game/types'
import { blankSave, localGameStorage } from '../src/services/storage'

const dates = '2026-11-23T00:00:00.000Z'
const common = ['curious','orderly','keen']
const newLife = (seed=42) => startLife('female',common,1,seed,dates)

test('content catalog has distinct stories, branches, and all requested minimums', () => {
  assert.equal(randomEvents.length,100)
  assert.equal(new Set(randomEvents.map(event=>event.id)).size,100)
  assert.equal(new Set(randomEvents.map(event=>event.title)).size,100)
  assert.equal(new Set(randomEvents.map(event=>event.description)).size,100)
  assert.deepEqual(['early','elementary','middle','high','college','graduate'].map(stage=>
    randomEvents.filter(event=>event.stages?.length===1 && event.stages[0]===stage && !['loop'].includes(event.id) && !['nari-again'].includes(event.id)).length),[10,15,15,25,15,10])
  for (const event of randomEvents) {
    assert.ok(event.choices.length>=2)
    assert.equal(new Set(event.choices.map(choice=>choice.result)).size,event.choices.length)
    assert.ok(event.choices.every(choice=>choice.effects && Object.keys(choice.effects).length>0))
  }
  assert.ok(traits.length>=30 && acquiredTraits.length>=20 && careers.length>=30 && achievements.length>=30)
})

test('all 27 rarity combinations can be drafted without duplicates and initial stats apply once', () => {
  const rarities: Rarity[] = ['common','rare','legendary']
  for (const choices of rarities.flatMap(a=>rarities.flatMap(b=>rarities.map(c=>[a,b,c])))) {
    const selected: string[] = []
    for (const rarity of choices) {
      const cards=drawTraits(selected,()=>.11)
      assert.deepEqual(cards.map(card=>card.rarity),rarities)
      assert.ok(cards.every(card=>!selected.includes(card.id)))
      selected.push(cards.find(card=>card.rarity===rarity)!.id)
    }
    assert.equal(new Set(selected).size,3)
    const female=startLife('female',selected,1,22,dates)
    const male=startLife('male',selected,1,22,dates)
    assert.deepEqual(female.stats,male.stats)
    for (const stat of Object.keys(statNames) as (keyof Life['stats'])[]) {
      assert.equal(female.stats[stat],16+traits.filter(trait=>selected.includes(trait.id)).reduce((sum,trait)=>sum+(trait.initial[stat]??0),0))
    }
  }
})

test('birth applies once and relationships retain their interaction history', () => {
  const original=newLife()
  const next=choose(original,'birth','hold')
  assert.equal(original.stats.resilience,16)
  assert.equal(next.stats.resilience,18)
  assert.equal(choose(next,'birth','hold'),next)
  assert.equal(next.relationships.family.trust,62)
  assert.equal(next.relationships.family.interactions.length,1)
  const ready=acknowledge(next)
  assert.equal(advance(ready,['read','read']),ready)
  assert.equal(advance(ready,['study']),ready)
  assert.equal(advance(ready,['read','rest','exercise']),ready)
  const period=advance(ready,['read','family'])
  assert.equal(period.tick,6)
  assert.ok(period.skills.language>0 && period.relationships.family.trust>62)
})

test('rare activity traits apply to earlier activities and retain their specializations', () => {
  const ready = acknowledge(choose(newLife(), 'birth', 'hold'))
  const plan = [
    { trait:'precise', stage:'early', activity:'read', skill:'language' },
    { trait:'precise', stage:'college', activity:'major', skill:'research' },
    { trait:'focus', stage:'elementary', activity:'study', skill:'math' },
    { trait:'focus', stage:'college', activity:'research', skill:'research' },
    { trait:'planner', stage:'middle', activity:'project', skill:'code' },
    { trait:'planner', stage:'high', activity:'work', skill:'business' },
    { trait:'mediator', stage:'elementary', activity:'friends', skill:'people' },
    { trait:'mediator', stage:'middle', activity:'club', skill:'people' },
  ] as const
  for (const {trait,stage,activity,skill} of plan) {
    const life: Life = {...ready,stage,innate:['sunny','nimble','dreamer']}
    const boosted = advance({...life,innate:[trait,'nimble','dreamer']},[activity])
    const baseline = advance(life,[activity])
    assert.ok(boosted.skills[skill]>baseline.skills[skill],trait+' / '+activity)
    assert.deepEqual(boosted.vitals,baseline.vitals)
  }
})

test('conditional and follow-up events require their stage, time, flags and choices', () => {
  const life=newLife()
  const demo=eventCatalog.get('game-demo')!
  assert.equal(eligibleEvent(life,demo),false)
  const high: Life={...life,stage:'high',tick:6,queue:[],counts:{project:2}}
  assert.equal(eligibleEvent(high,demo),false)
  high.counts.project=3
  assert.equal(eligibleEvent(high,demo),true)
  const after=eventCatalog.get('after-demo')!
  assert.equal(eligibleEvent(high,after),false)
  high.queue=[{id:'game-demo'}]
  let next=choose(high,'game-demo','0')
  assert.ok(next.acquired.includes('developer'))
  assert.equal(eligibleEvent(next,after),true)
  next={...acknowledge(next),queue:[{id:'future-letter'}]}
  assert.equal(choose(next,'future-letter','2'),next)
  next=choose(next,'future-letter','0')
  assert.equal(currentEvent(next)?.id,'missing-room')
  next=choose(acknowledge(next),'missing-room','0')
  assert.ok(next.flags.includes('fate-rebel'))
  assert.equal(eligibleEvent(next,demo),false)
})

type Plan = 'high'|'college'|'graduate'
function simulate(plan:Plan,seed:number,join: string[] = ['study','project','rest'],careerPreference?:string, examOverride?:'sit'|'skip') {
  let save=trackProgress(blankSave(),newLife(seed),dates)
  let loops=0
  while (save.life && !save.life.career && loops++<650) {
    const life=save.life
    let next=life
    const event=currentEvent(life)
    if (life.summary || life.outcome) next=acknowledge(life)
    else if (event) {
      if (eventCatalog.has(event.id)) assert.ok(eligibleEvent({...life,queue:life.queue.slice(1)},event),event.id+' '+calendar(life).label)
      const defaults: Record<string,string> = {
        csat:examOverride ?? (plan==='high'?'skip':'sit'),preparation:plan==='high'?'work':examOverride==='skip'?'school':'csat',
        explore:'tech',collegeGate:plan==='high'?'direct':'tech',
        gradGate:plan==='graduate'?'grad':'direct',researchField:'tech',professional:'skip',
      }
      const options=event.choices.filter(choice=>!choice.when||choice.when(life))
      const choice=options.find(item=>item.id===defaults[event.id]) ?? options[0]
      assert.ok(choice)
      next=choose(life,event.id,choice.id)
    } else if (life.final) {
      const options=careerOptions(life)
      assert.ok(options.some(career=>career.id==='exploring'))
      save=chooseCareer(save,options.find(item=>item.id===careerPreference)?.id ?? options[0].id,dates)
      break
    } else {
      const activity: Record<Stage,string[]> = {
        early:['read','hobby'],elementary:['study','exercise','hobby'],middle:['study','project','exercise'],
        high:join,college:['major','research','rest'],graduate:['research','major','rest'],
      }
      next=advance(life,activity[life.stage])
    }
    assert.notEqual(next,life,'blocked at '+life.stage+' '+life.tick)
    save=trackProgress(save,next,dates)
  }
  assert.ok(loops<650)
  assert.ok(save.life?.career)
  return save
}

test('36 complete deterministic runs cover all education routes, mandatory milestones, and sane values', () => {
  const paths: Plan[] = ['high','college','graduate']
  const commonMilestones=['birth','earlyGrowth','elementaryIn','elementaryOut','middleIn','middleOut','highIn','explore','preparation','csat','admission','highOut','collegeGate','final']
  const university=['collegeAccepted','collegeIn','major','course','termEval','collegeReview','collegeOut','gradGate']
  const graduate=['gradAccepted','gradIn','researchField','gradWork','gradEval','thesis','gradOut']
  for (const plan of paths) for (let seed=1;seed<=12;seed++) {
    const save=simulate(plan,seed)
    const {life,profile}=save
    assert.ok(life)
    assert.equal(life.education,plan)
    assert.equal(life.log.find(log=>log.id==='csat')?.period,'고등학교 3학년 · 11월')
    assert.equal(life.exam===undefined,plan==='high')
    commonMilestones.forEach(id=>assert.ok(life.seen[id],id))
    university.forEach(id=>assert.equal(Boolean(life.seen[id]),plan!=='high',id))
    graduate.forEach(id=>assert.equal(Boolean(life.seen[id]),plan==='graduate',id))
    assert.ok(life.log.filter(log=>eventCatalog.has(log.id)).length>0)
    assert.ok(Object.values(life.stats).every(value=>value>=0 && value<=100))
    assert.ok(life.acquired.includes('bookworm') && life.acquired.includes('developer'))
    assert.ok(profile.achievements.first && profile.achievements.common && profile.achievements.high)
    assert.equal(profile.runs.length,1)
    assert.equal(profile.runs[0].education,plan)
    assert.ok(profile.runs[0].story[0].includes('호기심'))
    assert.ok(profile.runs[0].story.at(-1)?.includes(careers.find(career=>career.id===life.career)!.title))
    for (const paragraph of profile.runs[0].story.slice(1,-1)) {
      if (paragraph.includes('「')) assert.ok(life.log.some(log=>paragraph.includes('「'+log.title+'」') && paragraph.includes(log.result)))
    }
    assert.equal(chooseCareer(save,life.career!,dates),save)
  }
})

test('profile retains independent run archives and storage recovers a pending choice from a previous snapshot', () => {
  const state=simulate('high',17)
  assert.ok(state.profile.runs[0].career)
  const storage=new Map<string,string>()
  const userStore=localGameStorage('test',()=>({
    getItem:key=>storage.get(key)??null,
    setItem:(key,value)=>{storage.set(key,value)},
  }))
  userStore.save(state)
  assert.deepEqual(userStore.load().save,JSON.parse(JSON.stringify(state)))
  const second=trackProgress(state,startLife('male',['fate','genius','versatile'],state.profile.next,17,dates),dates)
  userStore.save(second)
  const outcome=trackProgress(second,choose(second.life!,'birth','light'),dates)
  userStore.save(outcome)
  assert.equal(userStore.load().save.life?.outcome?.title,'세상에 온 날')
  assert.ok(userStore.load().save.profile.achievements.first)
  assert.equal(userStore.load().save.profile.runs.length,1)
  storage.set('life-undecided:test:v1','{broken')
  const recovered=userStore.load()
  assert.ok(recovered.notice?.includes('복구'))
  assert.equal(recovered.save.life?.queue[0].id,'birth')
  assert.equal(recovered.save.profile.runs.length,1)
  storage.set('life-undecided:test:v1:backup','null')
  assert.deepEqual(userStore.load().save,blankSave())
})

test('student-record admission works without a CSAT score and credentials gate specialist careers', () => {
  const university=simulate('college',95,['study','project','rest'],undefined,'skip')
  const life=university.life!
  assert.equal(life.education,'college')
  assert.equal(life.exam,undefined)
  assert.ok(life.seen.collegeIn)
  const professional: Life={...life,career:undefined,queue:[{id:'professional'}],major:'health',
    skills:{...life.skills,care:85},stats:{...life.stats,intelligence:85,resilience:80}}
  assert.ok(!careerOptions(professional).some(career=>career.id==='doctor'))
  const qualified=choose(professional,'professional','doctor')
  assert.ok(qualified.flags.includes('qualified:doctor'))
  assert.ok(careerOptions(qualified).some(career=>career.id==='doctor'))
  assert.ok(!careerOptions({...qualified,education:'high'}).some(career=>career.id==='doctor'))
  const done=chooseCareer({...university,life:{...acknowledge(qualified),id:life.id+'-qualified'}},'doctor',dates)
  assert.equal(done.profile.runs[0].age,28)
})
