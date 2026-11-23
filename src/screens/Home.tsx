import { BookOpen, ChevronRight, History, Play, Settings2, Sparkles, Trophy } from 'lucide-react'
import { artSource } from '../data/art'
import { calendar } from '../game/config'
import type { Save } from '../game/types'

export type Archive = 'collection'|'achievements'|'history'|'settings'
export function Home({base,save,start,resume,open}:{base:string;save:Save;start:()=>void;resume:()=>void;open:(page:Archive)=>void}) {
  const tiles = [
    {page:'collection',icon:BookOpen,title:'엔딩 도감'},
    {page:'achievements',icon:Trophy,title:'업적'},
    {page:'history',icon:History,title:'인생 기록'},
    {page:'settings',icon:Settings2,title:'설정'},
  ] as const
  return <div className="lu-home">
    <section className="lu-hero" style={{backgroundImage:'url("'+artSource(base,'backgrounds/menu.jpg')+'")'}}>
      <div className="lu-hero-content">
        <h1>인생미정<span>.</span></h1>
        <p className="lu-hero-tagline">당신의 미래는<br className="lu-mobile-break"/> 아직 정해지지 않았습니다.</p>
        <div className="lu-hero-actions">
          <button className="lu-button lu-primary" onClick={start}><Sparkles size={18}/> 새 게임</button>
          <button className="lu-button lu-hero-secondary" onClick={resume} disabled={!save.life}><Play size={17}/> 이어하기</button>
        </div>
        {save.life && <p className="lu-hero-save">{save.life.number}회차 · {save.life.career ? '완료된 인생' : calendar(save.life).label}</p>}
      </div>
    </section>
    <nav className="lu-home-links" aria-label="게임 메뉴">{tiles.map(({page,icon:Icon,title})=>
      <button key={page} onClick={()=>open(page)} className={'lu-home-link lu-tile-'+page}><span className="lu-tile-icon"><Icon size={22}/></span><strong>{title}</strong><ChevronRight size={16} className="lu-tile-chevron"/></button>)}</nav>
  </div>
}
