import { Activity as Pulse, BookOpen, BriefcaseBusiness, CalendarDays, Check, Coffee, Dumbbell, GraduationCap, Heart, House, Laptop, Lightbulb, NotebookPen, Palette, Sparkles, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Picture, Scene } from '../components/Art'
import { Empty, Progress, SectionHead } from '../components/ui'
import { npcs } from '../data/activities'
import { portraitArt } from '../data/art'
import { acquiredById, traitById } from '../data/traits'
import { balance, calendar, fieldNames, majors, skillNames, stages, statNames, vitalNames } from '../game/config'
import { availableActivities, careerOptions } from '../game/engine'
import type { Event, Life, Outcome } from '../game/types'

const activityIcons = { study:GraduationCap, read:BookOpen, exercise:Dumbbell, friends:Users, family:House, hobby:Palette, project:Laptop,
  club:Sparkles, work:BriefcaseBusiness, rest:Coffee, major:NotebookPen, research:Lightbulb, volunteer:Heart }
export type Panel = 'status'|'traits'|'bonds'|'log'
const tabs: {id:Panel;title:string;icon:typeof Pulse}[] = [
  {id:'status',title:'능력치',icon:Pulse},{id:'traits',title:'특성',icon:Sparkles},{id:'bonds',title:'관계',icon:Users},{id:'log',title:'기록',icon:NotebookPen},
]
function PanelBlock({title,children}:{title:string;children:ReactNode}) {
  return <div className="lu-panel-block"><h3>{title}</h3>{children}</div>
}

export function StatGrid({stats}:{stats:Life['stats']}) {
  return <div className="lu-bars">{(Object.keys(statNames) as (keyof Life['stats'])[]).map(key=>
    <Meter key={key} name={statNames[key]} value={stats[key]} max={balance.statMax}/>)}</div>
}
function Meter({name,value,max=100}:{name:string;value:number;max?:number}) {
  return <div className="lu-meter"><span>{name}</span><span className="lu-meter-track"><i style={{width:Math.min(100,value/max*100)+'%'}}/></span><strong>{Math.round(value)}</strong></div>
}
export function TraitList({innate,acquired}:{innate:string[];acquired:string[]}) {
  return <div className="lu-tag-list">{innate.map(id=>{
    const trait=traitById(id)
    return trait && <span className={'lu-tag lu-rarity-'+trait.rarity} title={trait.description} key={id}>{trait.title}</span>
  })}{acquired.map(id=><span className="lu-tag" title={acquiredById(id)?.description} key={id}>{acquiredById(id)?.title ?? id}</span>)}</div>
}
export function LogList({logs,limit=30}:{logs:Life['log'];limit?:number}) {
  return <ol className="lu-log">{logs.slice(-limit).reverse().map((log,index)=><li key={log.id+'-'+log.tick+'-'+index}>
    <small>{log.period}</small><strong>{log.title}</strong><p>{log.choice} · {log.result}</p>
  </li>)}</ol>
}

function Bonds({life}:{life:Life}) {
  return <div className="lu-bonds">{npcs.filter(npc=>npc.stages.includes(life.stage)||life.relationships[npc.id].interactions.length).map(npc=>{
    const bond = life.relationships[npc.id]
    const estimatedAge = npc.age + Math.max(0,calendar(life).age - stages[npc.stages[0]].age)
    return <details key={npc.id} className="lu-bond">
      <summary><strong>{npc.name}</strong><span>{npc.role} · 친밀도 {bond.affinity}</span></summary>
      <p>{estimatedAge}세 · {npc.personality}</p><p>{npc.situation}</p><p>목표 · {npc.goal}</p><p>친밀도 {bond.affinity} / 신뢰도 {bond.trust}</p>
      {bond.interactions.length>0 && <ul>{bond.interactions.slice(-4).reverse().map((source,index)=><li key={index}>{source}</li>)}</ul>}
    </details>
  })}</div>
}

export function Dashboard({base,life,selected,toggle,advance,panel,setPanel,children}:{
  base:string;life:Life;selected:string[];toggle:(key:string)=>void;advance:()=>void;panel:Panel;setPanel:(panel:Panel)=>void;children?:ReactNode
}) {
  const time = calendar(life)
  return <div className="lu-dashboard">
    <Progress stage={life.stage} tick={life.tick}/>
    <div className="lu-dashboard-grid">
      <div className="lu-play-column">
        {children ?? <>
          <div className="lu-period"><div><h1>오늘은 무엇을 할까요?</h1><p>이번 기간에 할 활동을 최대 {stages[life.stage].slots}개 선택하세요.</p></div><CalendarDays size={38}/></div>
          <section className="lu-panel lu-activities">
            <div className="lu-row-head"><h2>생활 활동</h2><span aria-live="polite">{selected.length} / {stages[life.stage].slots} 선택</span></div>
            <div className="lu-action-grid">{availableActivities(life).map(activity=>{
              const Icon = activityIcons[activity.id as keyof typeof activityIcons] ?? Sparkles
              const isSelected=selected.includes(activity.id)
              return <button className={'lu-activity '+(isSelected?'lu-selected':'')} key={activity.id} onClick={()=>toggle(activity.id)} aria-pressed={isSelected}
                disabled={!isSelected && selected.length>=stages[life.stage].slots}>
                <span className="lu-activity-icon"><Icon size={20}/></span><span><strong>{activity.title}</strong><small>{activity.description}</small></span>
                <span className="lu-check">{isSelected&&<Check size={14}/>}</span>
              </button>
            })}</div>
            <div className="lu-activity-footer"><span>{stages[life.stage].step}개월 진행</span><button className="lu-button lu-primary" disabled={!selected.length} onClick={advance}>시간 진행</button></div>
          </section>
        </>}
      </div>
      <aside className="lu-sidebar">
        <div className="lu-profile lu-panel">
          <Picture base={base} path={portraitArt(life.gender,life.stage)} alt="현재 주인공" className="lu-avatar"/>
          <div><span className="lu-kicker">{life.number}회차</span><h2>{time.age}세 <span>· {stages[life.stage].label}</span></h2><small>{life.major ? majors[life.major].title : life.aspiration ? '희망 분야 · '+fieldNames[life.aspiration] : time.label}</small></div>
        </div>
        <section className="lu-panel lu-inspector">
          <nav className="lu-tabs" aria-label="인생 정보">{tabs.map(({id,title,icon:Icon})=><button key={id} onClick={()=>setPanel(id)} aria-pressed={panel===id}><Icon size={16}/>{title}</button>)}</nav>
          {panel==='status'&&<>
            <PanelBlock title="기본 능력치"><StatGrid stats={life.stats}/></PanelBlock>
            <PanelBlock title="생활 상태"><div className="lu-vitals">{Object.entries(life.vitals).map(([key,value])=><div key={key}><span>{vitalNames[key as keyof Life['vitals']]}</span><b>{Math.round(value).toLocaleString('ko-KR')}{key==='money'?'원':''}</b></div>)}
              {life.exam!==undefined&&<div><span>수능</span><b>{life.exam}</b></div>}
              {life.stage==='college'&&<div><span>평점 · 학점</span><b>{life.gpa.toFixed(2)} · {life.credits}</b></div>}
              {life.stage==='graduate'&&<div><span>연구 진행도</span><b>{life.research}</b></div>}
            </div></PanelBlock>
            <details className="lu-skills"><summary>분야별 숙련도</summary>{(Object.keys(skillNames) as (keyof Life['skills'])[]).map(key=><Meter key={key} name={skillNames[key]} value={life.skills[key]}/>)}</details>
          </>}
          {panel==='traits'&&<><PanelBlock title="선천적 특성"><TraitList innate={life.innate} acquired={[]}/></PanelBlock><PanelBlock title="후천적 특성">{life.acquired.length?<TraitList innate={[]} acquired={life.acquired}/>:<p>생활 속에서 새로운 특성을 얻을 수 있어요.</p>}</PanelBlock></>}
          {panel==='bonds'&&<PanelBlock title="만난 사람들"><Bonds life={life}/></PanelBlock>}
          {panel==='log'&&<PanelBlock title="인생 일지">{life.log.length?<LogList logs={life.log}/>:<Empty>아직 기록이 없습니다.</Empty>}</PanelBlock>}
        </section>
      </aside>
    </div>
  </div>
}

export function EventScreen({base,life,event,choose}:{base:string;life:Life;event:Event;choose:(event:string,choice:string)=>void}) {
  return <section className="lu-panel lu-event">
    <div className="lu-event-head"><h1>{event.title}</h1></div>
    <Scene base={base} scene={event.art} gender={life.gender} stage={life.stage} id={event.id}/>
    <div className="lu-event-body"><p>{event.description}</p>
      <div className="lu-decisions">{event.choices.map((choice,index)=>{
        const disabled = choice.when ? !choice.when(life) : false
        const isGate = event.id==='collegeGate'||event.id==='gradGate'
        if (disabled && !isGate) return null
        return <button key={choice.id} disabled={disabled} onClick={()=>choose(event.id,choice.id)}>
          <span aria-hidden="true">{String.fromCharCode(65+index)}</span><strong>{choice.label}</strong>{disabled&&<small>조건 미충족</small>}
        </button>
      })}</div>
    </div>
  </section>
}

export function OutcomeScreen({base,life,outcome,next,summary=false}:{base:string;life:Life;outcome:Outcome;next:()=>void;summary?:boolean}) {
  const recorded = life.log.at(-1)
  const art: Record<Life['stage'],'home'|'elementary'|'classroom'|'campus'|'lab'> = {early:'home',elementary:'elementary',middle:'classroom',high:'classroom',college:'campus',graduate:'lab'}
  return <section className="lu-panel lu-event lu-outcome" aria-live="polite">
    <div className="lu-event-head"><h1>{outcome.title}</h1></div>
    <Scene base={base} scene={art[life.stage]} gender={life.gender} stage={life.stage} id={summary?'activity':recorded?.id ?? 'result'}/>
    <div className="lu-event-body"><p>{outcome.text}</p>
      <div className="lu-changes">{outcome.changes.map((line,index)=><span key={index}>{line}</span>)}</div>
      <button className="lu-button lu-primary" onClick={next}>{life.queue.length?'다음 사건 보기':'계속하기'}</button>
    </div>
  </section>
}

export function CareerSelection({life,base,choose}:{life:Life;base:string;choose:(id:string)=>void}) {
  const careerList=careerOptions(life)
  return <section className="lu-panel lu-event">
    <div className="lu-event-head"><SectionHead title="당신이 고를 다음 장" sub="지금까지의 경험으로 시작할 수 있는 일입니다."/></div>
    <Scene base={base} scene="street" id="career" gender={life.gender} stage={life.stage}/>
    <div className="lu-event-body lu-decisions">{careerList.map((career,index)=><button onClick={()=>choose(career.id)} key={career.id}>
      <span><BriefcaseBusiness size={18}/></span><strong>{career.title}<small>{career.description}</small></strong>{index===0 && career.score>0 && <small>적합도 1순위</small>}
    </button>)}</div>
  </section>
}
