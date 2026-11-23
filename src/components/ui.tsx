import { ArrowLeft, Bookmark, Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { stages } from '../game/config'
import type { Stage } from '../game/types'

export function Brand({go}:{go:()=>void}) {
  return <button type="button" className="lu-brand" onClick={go} aria-label="인생미정 홈"><span>인생미정<span className="lu-brand-dot">.</span></span></button>
}
export function Header({go,home,exit,settings}:{go:()=>void;home:boolean;exit?:()=>void;settings:()=>void}) {
  return <header className="lu-header"><div className="lu-header-inner">
    <Brand go={go}/>
    <div className="lu-header-right">{home ? <button type="button" className="lu-plain lu-header-settings" onClick={settings}><Menu size={17}/> 메뉴</button> :
      <button type="button" className="lu-plain lu-header-settings" onClick={go}><ArrowLeft size={16}/> 메인 메뉴</button>}
      {exit && <button type="button" className="lu-plain" onClick={exit}>게임 나가기</button>}
    </div>
  </div></header>
}
export function SectionHead({title,sub}:{title:string;sub?:string}) {
  return <div className="lu-section-head"><h1>{title}</h1>{sub&&<p className="lu-section-sub">{sub}</p>}</div>
}
export function Progress({stage,tick}:{stage:Stage;tick:number}) {
  return <div className="lu-progress">
    {(Object.keys(stages) as Stage[]).map(key=><span key={key} className={stages[key].chapter<stages[stage].chapter?'lu-past':key===stage?'lu-current':''}>
      <i>{key===stage && <span style={{width:100*tick/stages[stage].months+'%'}}/>}</i>{stages[key].label}
    </span>)}
  </div>
}
export function Empty({children}:{children:ReactNode}) { return <div className="lu-empty"><Bookmark size={25}/><p>{children}</p></div> }
