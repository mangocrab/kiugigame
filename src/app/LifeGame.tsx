import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '../components/ui'
import { acknowledge, advance, choose, currentEvent, drawTraits, startLife } from '../game/engine'
import { stages } from '../game/config'
import { chooseCareer, trackProgress } from '../game/journal'
import type { Gender, Life, Save, Trait } from '../game/types'
import { localGameStorage } from '../services/storage'
import type { GameStorage } from '../services/storage'
import { Home } from '../screens/Home'
import type { Archive } from '../screens/Home'
import { CharacterCreation, TraitSelection } from '../screens/Setup'
import { CareerSelection, Dashboard, EventScreen, OutcomeScreen } from '../screens/Simulation'
import type { Panel } from '../screens/Simulation'
import { Achievements, Collection, HistoryList, RunStory, SettingsScreen } from '../screens/Records'
import '../styles/game.css'

export type LifeGameOptions = {
  userId?: string
  assetBase?: string
  storage?: GameStorage
  onExit?: () => void
  onEnter?: () => void
}

type Screen = 'home' | 'character' | 'traits' | 'play' | Archive
export function LifeGame(options: LifeGameOptions) {
  return <LifeGameSession key={options.userId ?? 'guest'} {...options}/>
}

function LifeGameSession({userId,storage,assetBase = import.meta.env.BASE_URL+'assets/',onExit,onEnter}:LifeGameOptions) {
  const adapter=useMemo(()=>storage ?? localGameStorage(userId),[storage,userId])
  const [loaded] = useState(()=>adapter.load())
  const [save,setSave]=useState(loaded.save)
  const saveRef=useRef(save)
  const root=useRef<HTMLDivElement>(null)
  const [notice,setNotice]=useState(loaded.notice)
  const [screen,setScreen]=useState<Screen>('home')
  const [gender,setGender]=useState<Gender>('female')
  const [traits,setTraits]=useState<Trait[]>([])
  const [draws,setDraws]=useState<Trait[][]>([])
  const [activity,setActivity]=useState<string[]>([])
  const [panel,setPanel]=useState<Panel>('status')
  const [detail,setDetail]=useState<string|null>(null)
  const [menu,setMenu]=useState(false)
  const [confirm,setConfirm]=useState(false)

  function commit(update:(old:Save)=>Save) {
    const previous=saveRef.current
    const next=update(previous)
    if (next===previous) return
    saveRef.current=next
    setSave(next)
    try { adapter.save(next) }
    catch { setNotice('자동 저장에 실패했습니다. 이 탭에서는 계속 플레이할 수 있습니다.') }
  }
  function updateLife(update:(previous:Life)=>Life) {
    commit(previous=>{
      const old=previous.life
      if (!old) return previous
      const next=update(old)
      return old===next?previous:trackProgress(previous,next)
    })
  }
  function navigate(screen:Screen) {
    setMenu(false)
    setDetail(null)
    setScreen(screen)
  }
  function create() {
    setConfirm(false)
    setActivity([])
    setGender('female')
    setTraits([])
    setDraws([drawTraits([])])
    setPanel('status')
    navigate('character')
  }
  function begin() {
    if (save.life && !save.life.career) setConfirm(true)
    else create()
  }
  function pick(trait:Trait) {
    if (traits.some(item=>item.id===trait.id)) return
    const next=[...traits,trait]
    setTraits(next)
    if (next.length===3) {
      onEnter?.()
      commit(previous=>trackProgress(previous,startLife(gender,next.map(item=>item.id),previous.profile.next)))
      navigate('play')
    } else {
      setDraws([...draws.slice(0,next.length),drawTraits(next.map(item=>item.id))])
    }
  }
  function toggleActivity(id:string) {
    const life=save.life
    if (!life) return
    setActivity(previous=>previous.includes(id)?previous.filter(item=>item!==id):
      previous.length<stages[life.stage].slots?[...previous,id]:previous)
  }
  const life=save.life
  const event=life && currentEvent(life)
  const run=life?.career && save.profile.runs.find(item=>item.id===life.id)
  const selectedRun=screen==='history' && save.profile.runs.find(item=>item.id===detail)
  const viewKey=[screen,detail,screen==='play'&&life?.stage,screen==='play'&&life?.tick,screen==='play'&&event?.id,
    screen==='play'&&Boolean(life?.outcome),screen==='play'&&Boolean(life?.summary),screen==='play'&&Boolean(run)].join(':')
  useEffect(()=>{ root.current?.scrollIntoView?.({block:'start',behavior:'instant'}) },[viewKey])

  return <div ref={root} className={'life-undecided'+(save.settings.motion?'':' lu-no-motion')+(save.settings.text==='large'?' lu-large':'')}>
    <Header go={()=>navigate('home')} home={screen==='home'} exit={onExit} settings={()=>setMenu(!menu)}/>
    {menu&&<nav className="lu-header-menu" aria-label="빠른 메뉴">{([['collection','엔딩 도감'],['achievements','업적'],['history','인생 기록'],['settings','설정']] as const)
      .map(([key,label])=><button className="lu-plain" key={key} onClick={()=>navigate(key)}>{label}</button>)}</nav>}
    {notice&&<div className="lu-notice" role="status"><span>{notice}</span><button className="lu-plain" onClick={()=>setNotice(undefined)}>닫기</button></div>}
    <main key={viewKey} className="lu-main">
      {screen==='home'&&<Home base={assetBase} save={save} start={begin} resume={()=>{onEnter?.();navigate('play')}} open={navigate}/>}
      {screen==='character'&&<CharacterCreation base={assetBase} gender={gender} select={setGender} next={()=>navigate('traits')} back={()=>navigate('home')}/>}
      {screen==='traits'&&<TraitSelection selected={traits} cards={draws[traits.length] ?? []} pick={pick} back={()=>traits.length?setTraits(traits.slice(0,-1)):navigate('character')}/>}
      {screen==='collection'&&<Collection base={assetBase} runs={save.profile.runs} detail={detail} select={setDetail}/>}
      {screen==='achievements'&&<Achievements save={save}/>}
      {screen==='history'&&(selectedRun?<RunStory base={assetBase} run={selectedRun} back={()=>setDetail(null)}/>:<HistoryList runs={save.profile.runs} select={setDetail}/>)}
      {screen==='settings'&&<SettingsScreen settings={save.settings} change={settings=>commit(previous=>({...previous,settings}))}/>}
      {screen==='play'&&life&&(run?<RunStory base={assetBase} run={run} newGame={begin} returnHome={()=>navigate('home')}/>:
        <Dashboard base={assetBase} life={life} selected={activity} toggle={toggleActivity} panel={panel} setPanel={setPanel} advance={()=>{
          updateLife(old=>advance(old,activity))
          setActivity([])
        }}>
          {life.summary || life.outcome ? <OutcomeScreen base={assetBase} life={life} outcome={(life.summary ?? life.outcome)!} summary={Boolean(life.summary)} next={()=>updateLife(acknowledge)}/>:
            event ? <EventScreen base={assetBase} life={life} event={event} choose={(id,choice)=>updateLife(old=>choose(old,id,choice))}/>:
            life.final ? <CareerSelection base={assetBase} life={life} choose={id=>commit(previous=>chooseCareer(previous,id))}/> : undefined}
        </Dashboard>)}
    </main>
    {confirm&&<div className="lu-modal-mask" onKeyDown={event=>{if(event.key==='Escape')setConfirm(false)}}>
      <section className="lu-modal" role="alertdialog" aria-modal="true" aria-labelledby="lu-confirm-title">
        <h2 id="lu-confirm-title">새 인생을 시작할까요?</h2><p>새 주인공의 특성 선택을 마치면 진행 중인 회차를 덮어씁니다. 완료한 인생과 업적은 보관됩니다.</p>
        <div className="lu-setup-actions"><button className="lu-button lu-secondary" autoFocus onClick={()=>setConfirm(false)}>취소</button>
          <button className="lu-button lu-primary" onClick={create}>새 게임</button></div>
      </section>
    </div>}
  </div>
}
